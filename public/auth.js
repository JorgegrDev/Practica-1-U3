import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginButton = event.target.querySelector('button[type="submit"]');
    
    loginButton.disabled = true;
    loginButton.innerHTML = 'Iniciando sesión...';

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            sessionStorage.setItem('currentUser', JSON.stringify({
                email: user.email,
                uid: user.uid,
                name: user.displayName
            }));
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Login error:', error);
            let errorMessage = 'Error al iniciar sesión';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Usuario no encontrado';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Contraseña incorrecta';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido';
                    break;
                default:
                    errorMessage = error.message;
            }
            alert(errorMessage);
        })
        .finally(() => {
            loginButton.disabled = false;
            loginButton.innerHTML = 'Iniciar Sesión';
        });
}

function handleRegister(event) {
    event.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const name = document.getElementById('registerName').value;
    const registerButton = event.target.querySelector('button[type="submit"]');
    
    registerButton.disabled = true;
    registerButton.innerHTML = 'Registrando...';

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return userCredential.user.updateProfile({
                displayName: name
            }).then(() => {
                alert('Registro exitoso! Por favor inicia sesión.');
                document.querySelector('[href="#login"]').click();
            });
        })
        .catch((error) => {
            console.error('Registration error:', error);
            let errorMessage = 'Error al registrar';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'El email ya está en uso';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La contraseña debe tener al menos 6 caracteres';
                    break;
                default:
                    errorMessage = error.message;
            }
            alert(errorMessage);
        })
        .finally(() => {
            registerButton.disabled = false;
            registerButton.innerHTML = 'Registrar';
        });
}

function handleLogout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        const auth = window.auth;
        signOut(auth).then(() => {
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Logout error:', error);
        });
    }
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});

// Check authentication state
firebase.auth().onAuthStateChanged((user) => {
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
});
