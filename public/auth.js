// ...existing code...

function handleLogout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Make handleLogout available globally
window.handleLogout = handleLogout;
