const { guardarNota, initDB } = require('./public/script');
require('fake-indexeddb/auto');

describe('Note Taking App', () => {
    beforeEach(async () => {
        // Setup DOM elements
        document.body.innerHTML = `
            <textarea id="nota"></textarea>
            <ul id="listaNotas"></ul>
        `;
        // Initialize IndexedDB
        await initDB();
    });

    test('guardarNota should save a note to IndexedDB', async () => {
        // Setup
        const testNote = "Test note";
        document.getElementById('nota').value = testNote;
        
        // Execute
        await guardarNota();
        
        // Assert
        const db = await initDB();
        const transaction = db.transaction(['notas'], 'readonly');
        const store = transaction.objectStore('notas');
        const request = store.getAll();
        
        return new Promise((resolve) => {
            request.onsuccess = () => {
                expect(request.result.length).toBe(1);
                expect(request.result[0].texto).toBe(testNote);
                resolve();
            };
        });
    });
});
