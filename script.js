let db;

function initDB() {
    return new Promise((resolve, reject) => {
        // Primero borramos la base de datos existente
        const deleteRequest = indexedDB.deleteDatabase("NotasDB");
        
        deleteRequest.onsuccess = () => {
            // Creamos una nueva base de datos
            const request = indexedDB.open("NotasDB", 1);
            
            request.onerror = () => {
                reject(request.error);
            };

            request.onupgradeneeded = (event) => {
                db = event.target.result;
                if (!db.objectStoreNames.contains('notas')) {
                    db.createObjectStore("notas", { keyPath: "id", autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };
        };
    });
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
            texto: document.getElementById('nota').value,
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

        if (!db) {
            await initDB();
        }
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

async function cargarNotas() {
    if (!db) {
        await initDB();
    }
    const lista = document.getElementById("listaNotas");
    lista.innerHTML = "";
    const transaction = db.transaction(["notas"], "readonly");
    const store = transaction.objectStore("notas");
    store.openCursor().onsuccess = event => {
        const cursor = event.target.result;
        if (cursor) {
            const li = document.createElement("li");
            li.className = "list-group-item list-group-item-action mb-2 shadow-sm";
            const nota = cursor.value;
            let texto = nota.texto;
            if (nota.ubicacion) {
                texto += `<small class="text-muted d-block mt-2">
                    📍 ${nota.ubicacion.ciudad}, ${nota.ubicacion.estado}, ${nota.ubicacion.pais}
                </small>`;
            }
            li.innerHTML = texto;
            lista.appendChild(li);
            cursor.continue();
        }
    };
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

// For testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { guardarNota, initDB };
}