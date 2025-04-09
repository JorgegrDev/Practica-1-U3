const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "pwa-notas-2c422.firebaseapp.com",
    projectId: "pwa-notas-2c422",
    storageBucket: "pwa-notas-2c422.appspot.com",
    messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
    appId: "YOUR_ACTUAL_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();