importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');
// // Initialize the Firebase app in the service worker by passing the generated config

const firebaseConfig = {
    apiKey: "AIzaSyCbIFrHznceNatjL0OxOKju-7jxHo7TYRA",
    authDomain: "doctor-project-77bcf.firebaseapp.com",
    projectId: "doctor-project-77bcf",
    storageBucket: "doctor-project-77bcf.firebasestorage.app",
    messagingSenderId: "1004545577806",
    appId: "1:1004545577806:web:f78266c916472f0e7c441f"
};

firebase?.initializeApp(firebaseConfig)

// Retrieve firebase messaging
const messaging = firebase.messaging();

self.addEventListener('install', function (event) {
    console.log('Hello world from the Service Worker :call_me_hand:');
});