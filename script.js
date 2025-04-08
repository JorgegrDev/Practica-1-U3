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
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const notaObj = {
            texto: document.getElementById('nota').value,
            fecha: new Date().toISOString(),
            ubicacion: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }
        };

        if (!db) {
            await initDB();
        }
        const transaction = db.transaction(['notas'], 'readwrite');
        const store = transaction.objectStore('notas');
        await store.add(notaObj);
        
        cargarNotas(); // Refresh the notes list
    } catch (error) {
        console.error('Error al obtener la ubicación:', error);
        alert('No se pudo acceder a la ubicación. Por favor, verifica los permisos.');
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
                    📍 Ubicación: ${nota.ubicacion.latitude.toFixed(4)}, ${nota.ubicacion.longitude.toFixed(4)}
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
        await new Promise((resolve) => {
            const deleteRequest = indexedDB.deleteDatabase("NotasDB");
            deleteRequest.onsuccess = () => {
                db = null;
                document.getElementById('listaNotas').innerHTML = '';
                initDB();
                resolve();
            };
        });
    }
}

// For testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { guardarNota, initDB };
}