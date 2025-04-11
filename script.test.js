const { guardarNota, initDB } = require('./public/script.js');
require('fake-indexeddb/auto');

describe('Note Taking App', () => {
    beforeEach(async () => {
        // Clear DOM
        document.body.innerHTML = `
            <textarea id="nota"></textarea>
            <ul id="listaNotas"></ul>
        `;
        
        // Initialize DB
        await initDB();
    });

    afterEach(() => {
        // Clean up
        document.body.innerHTML = '';
        indexedDB.deleteDatabase('NotasDB');
    });

    it('should save a note to IndexedDB', async () => {
        // Setup
        const testNote = "Test note";
        document.getElementById('nota').value = testNote;
        
        // Execute
        const result = await guardarNota();
        
        // Assert
        expect(result).toBeDefined();
        
        const db = await initDB();
        const notes = await getAllNotes(db);
        expect(notes.length).toBe(1);
        expect(notes[0].texto).toBe(testNote);
    });
});

// Helper function to get all notes
function getAllNotes(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['notas'], 'readonly');
        const store = transaction.objectStore('notas');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
