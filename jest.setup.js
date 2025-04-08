require('fake-indexeddb/auto');

// Add structuredClone polyfill
if (typeof structuredClone !== 'function') {
    global.structuredClone = obj => JSON.parse(JSON.stringify(obj));
}