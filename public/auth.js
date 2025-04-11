import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';

async function handleLogin(event) {
    event.preventDefault();
    
    const loginButton = event.target.querySelector('button[type="submit"]');
    const originalText = loginButton.innerHTML;
    loginButton.disabled = true;
    loginButton.innerHTML = 'Iniciando sesión...';
    
    try {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const auth = window.auth;
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        sessionStorage.setItem('currentUser', JSON.stringify({
            email: user.email,
            uid: user.uid,
            name: user.displayName
        }));
        
        window.location.href = 'index.html';
    } catch (error) {
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
    } finally {
        loginButton.disabled = false;
        loginButton.innerHTML = originalText;
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const name = document.getElementById('registerName').value;

    try {
        const auth = window.auth;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });
        alert('Registro exitoso! Por favor inicia sesión.');
        document.querySelector('[href="#login"]').click();
    } catch (error) {
        console.error('Registration error:', error);
        alert('Error al registrar: ' + error.message);
    }
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

// Make functions available globally
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;

// Listen for auth state changes
const auth = window.auth;
onAuthStateChanged(auth, (user) => {
    if (user) {
        sessionStorage.setItem('currentUser', JSON.stringify({
            email: user.email,
            uid: user.uid,
            name: user.displayName
        }));
    } else {
        sessionStorage.removeItem('currentUser');
    }
});
