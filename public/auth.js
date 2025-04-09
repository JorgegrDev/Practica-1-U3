async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        sessionStorage.setItem('currentUser', JSON.stringify({
            email: user.email,
            uid: user.uid
        }));
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login error:', error);
        alert('Error al iniciar sesión: ' + error.message);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const name = document.getElementById('registerName').value;

    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        await user.updateProfile({ displayName: name });
        alert('Registro exitoso! Por favor inicia sesión.');
        document.querySelector('[href="#login"]').click();
    } catch (error) {
        console.error('Registration error:', error);
        alert('Error al registrar: ' + error.message);
    }
}

function handleLogout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        firebase.auth().signOut().then(() => {
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Logout error:', error);
        });
    }
}

// Listen for auth state changes
firebase.auth().onAuthStateChanged((user) => {
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

window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
