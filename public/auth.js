import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

let db;

function initAuthDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("AuthDB", 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('users')) {
                const store = db.createObjectStore('users', { keyPath: 'email' });
                store.createIndex('email', 'email', { unique: true });
            }
        };
    });
}

// async function handleLogin(event) {
//     event.preventDefault();
    
//     const email = document.getElementById('loginEmail').value;
//     const password = document.getElementById('loginPassword').value;

//     try {
//         await initAuthDB();
//         const transaction = db.transaction(['users'], 'readonly');
//         const store = transaction.objectStore('users');
//         const user = await new Promise((resolve, reject) => {
//             const request = store.get(email);
//             request.onsuccess = () => resolve(request.result);
//             request.onerror = () => reject(request.error);
//         });

//         if (user && user.password === password) {
//             sessionStorage.setItem('currentUser', JSON.stringify(user));
//             window.location.href = 'index.html';
//         } else {
//             alert('Invalid credentials');
//         }
//     } catch (error) {
//         console.error('Login error:', error);
//         alert('Login failed');
//     }
// }

async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;

    const password = document.getElementById('registerPassword').value;

    try {
        await initAuthDB();
        const transaction = db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        await new Promise((resolve, reject) => {
            const request = store.add({
                name,
                email,
                password,
                createdAt: new Date().toISOString()
            });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        alert('Registration successful! Please login.');
        //document.querySelector('[href="#login"]').click();
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Email might already be in use.');
    }
}

document.addEventListener('DOMContentLoaded', initAuthDB);