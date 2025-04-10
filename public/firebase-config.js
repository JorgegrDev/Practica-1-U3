const firebaseConfig = {
    apiKey: "AIzaSyDxY2UGYMShQXTyIeowYQXXWg1YEm9UZjI",
    authDomain: "pwa-notas-2c422.firebaseapp.com",
    projectId: "pwa-notas-2c422",
    storageBucket: "pwa-notas-2c422.firebasestorage.app",
    messagingSenderId: "215526248771",
    appId: "1:215526248771:web:d976e7af8e4bbcfc585ff6",
    measurementId: "G-N56DLGWL9S"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();