const { guardarNota, initDB } = require('./public/script.js');
require('fake-indexeddb/auto');

describe('Note Taking App', () => {
    let db;

    beforeEach(async () => {
        document.body.innerHTML = `
            <textarea id="nota"></textarea>
            <ul id="listaNotas"></ul>
        `;
        db = await initDB();
    });

    test('guardarNota should save a note to IndexedDB', async () => {
        // Setup
        const testNote = "Test note";
        document.getElementById('nota').value = testNote;
        
        // Execute
        await guardarNota();
        
        // Assert
        return new Promise((resolve, reject) => {
            try {
                const transaction = db.transaction(['notas'], 'readonly');
                const store = transaction.objectStore('notas');
                const request = store.getAll();
                
                request.onsuccess = () => {
                    try {
                        expect(request.result.length).toBe(1);
                        expect(request.result[0].texto).toBe(testNote);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                };
                
                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        });
    });
});
