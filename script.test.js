const { guardarNota, initDB } = require('./public/script.js');
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
        expect.assertions(2);
        
        // Setup
        const testNote = "Test note";
        document.getElementById('nota').value = testNote;
        
        // Execute
        await guardarNota();
        
        // Assert
        return new Promise((resolve) => {
            const transaction = db.transaction(['notas'], 'readonly');
            const store = transaction.objectStore('notas');
            const request = store.getAll();
            
            request.onsuccess = () => {
                expect(request.result.length).toBe(1);
                expect(request.result[0].texto).toBe(testNote);
                resolve();
            };
        });
    });
});
