// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAw5-NaW_6s-JhfH_ETw4DSWF2xUg9r4bg",
  authDomain: "pokemonpockettracker.firebaseapp.com",
  projectId: "pokemonpockettracker",
  storageBucket: "pokemonpockettracker.firebasestorage.app",
  messagingSenderId: "309966768255",
  appId: "1:309966768255:web:1c779db5ba427a7bb7974a",
  measurementId: "G-733KM84TPN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

console.log('Firebase app:', app);
console.log('Firebase auth:', auth);
console.log('Firebase db:', db);