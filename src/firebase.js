// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// IMPORTANT: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKis_Pw_6P6WOMKf2-gOj9XRBXTQj1HBU",
  authDomain: "tripnexus-798e1.firebaseapp.com",
  projectId: "tripnexus-798e1",
  storageBucket: "tripnexus-798e1.firebasestorage.app",
  messagingSenderId: "187890203797",
  appId: "1:187890203797:web:1fe6a26057e276f36f2f9c",
  measurementId:"G-QB84VX9HZP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider(); // Create Google provider instance

export { auth, googleProvider };
