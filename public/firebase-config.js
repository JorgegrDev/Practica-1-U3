// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();