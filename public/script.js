let db = null;

async function initDB() {
    if (db) return db;
    
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("NotasDB", 1);
        
        request.onerror = () => {
            console.error("Database error:", request.error);
            reject(request.error);
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("Database initialized successfully");
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains('notas')) {
                database.createObjectStore('notas', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
            }
        };
    });
}

function sanitizeInput(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function solicitarUbicacion() {
    try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            throw new Error('La geolocalización no está soportada en este navegador.');
        }

        // Check geolocation permission status
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        console.log('Geolocation permission status:', permissionStatus.state);

        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                (error) => {
                    console.error('Geolocation error:', error);
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            reject('Permiso de ubicación denegado. Por favor, habilita el acceso a la ubicación en tu navegador.');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            reject('La información de ubicación no está disponible.');
                            break;
                        case error.TIMEOUT:
                            reject('Se agotó el tiempo de espera para obtener la ubicación.');
                            break;
                        default:
                            reject('Error al obtener la ubicación: ' + error.message);
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });

        const geocoder = new google.maps.Geocoder();
        const latlng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        const locationData = await new Promise((resolve, reject) => {
            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === "OK") {
                    if (results[0]) {
                        console.log("Location found:", results[0].formatted_address);
                        resolve(results[0]);
                    } else {
                        console.error("No results found");
                        reject("No results found");
                    }
                } else {
                    console.error("Geocoder failed due to:", status);
                    reject("Geocoder failed: " + status);
                }
            });
        });

        const addressComponents = locationData.address_components;
        const country = addressComponents.find(c => c.types.includes("country"))?.long_name || "";
        const state = addressComponents.find(c => c.types.includes("administrative_area_level_1"))?.long_name || "";
        const city = addressComponents.find(c => c.types.includes("locality"))?.long_name || "";

        const notaObj = {
            texto: sanitizeInput(document.getElementById('nota').value),
            fecha: new Date().toISOString(),
            ubicacion: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                direccion: locationData.formatted_address,
                ciudad: city,
                estado: state,
                pais: country
            }
        };

        const db = await initDB();
        const transaction = db.transaction(['notas'], 'readwrite');
        const store = transaction.objectStore('notas');
        await store.add(notaObj);
        
        document.getElementById('nota').value = '';
        cargarNotas();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'No se pudo obtener la ubicación. Por favor, verifica los permisos.');
        return;
    }
}

async function guardarNota() {
    try {
        const db = await initDB();
        const nota = document.getElementById('nota').value;
        
        if (!nota.trim()) {
            throw new Error('Note cannot be empty');
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['notas'], 'readwrite');
            const store = transaction.objectStore('notas');
            
            const request = store.add({
                texto: nota,
                fecha: new Date().toISOString()
            });

            request.onsuccess = () => {
                console.log("Note saved:", request.result);
                document.getElementById('nota').value = '';
                cargarNotas();
                resolve(request.result);
            };

            request.onerror = () => {
                console.error("Save error:", request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error("Error in guardarNota:", error);
        throw error;
    }
}

const NOTAS_POR_PAGINA = 10; // Number of notes to load at once
let ultimoCursor = null;
let cargandoNotas = false;

async function cargarNotas() {
    try {
        const db = await initDB();

        const lista = document.getElementById("listaNotas");
        lista.innerHTML = "";
        
        const transaction = db.transaction(["notas"], "readonly");
        const store = transaction.objectStore("notas");
        const request = store.getAll();

        request.onsuccess = () => {
            const notas = request.result;
            console.log("Notes loaded:", notas);
            
            notas.forEach(nota => {
                const li = document.createElement("li");
                li.className = "list-group-item";
                li.textContent = nota.texto;
                lista.appendChild(li);
            });
        };

        request.onerror = (event) => {
            console.error("Error loading notes:", event.target.error);
        };
    } catch (error) {
        console.error('Error in cargarNotas:', error);
    }
}

async function limpiarNotas() {
    if (confirm('¿Estás seguro de que quieres borrar todas las notas?')) {
        try {
            // First close the database connection
            if (db) {
                db.close();
            }
            
            // Delete the database
            await new Promise((resolve, reject) => {
                const deleteRequest = indexedDB.deleteDatabase("NotasDB");
                deleteRequest.onsuccess = () => {
                    console.log("Database deleted successfully");
                    resolve();
                };
                deleteRequest.onerror = () => {
                    reject("Error deleting database");
                };
            });
            
            // Clear the UI
            document.getElementById('listaNotas').innerHTML = '';
            
            // Reinitialize the database
            db = null;
            await initDB();
            
            console.log("Database reinitialized");
        } catch (error) {
            console.error("Error clearing notes:", error);
            alert("Error al limpiar las notas. Por favor, intenta de nuevo.");
        }
    }
}

function setupInfiniteScroll() {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !cargandoNotas) {
                cargarNotas(true);
            }
        });
    }, options);

    // Add a sentinel element at the bottom of the list
    const sentinel = document.createElement('div');
    sentinel.className = 'sentinel';
    document.getElementById('listaNotas').after(sentinel);
    observer.observe(sentinel);
}

// Initialize database when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDB();
        await cargarNotas();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

// Make functions available globally
window.guardarNota = guardarNota;
window.cargarNotas = cargarNotas;
window.initDB = initDB;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { guardarNota, initDB };
}