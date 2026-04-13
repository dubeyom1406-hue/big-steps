import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your real web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgPhE3bXmJr6ThV0uaV7K51QW9uSibqeo",
  authDomain: "big-steps-8b32a.firebaseapp.com",
  projectId: "big-steps-8b32a",
  storageBucket: "big-steps-8b32a.firebasestorage.app",
  messagingSenderId: "388093205443",
  appId: "1:388093205443:web:b3d363613d819fe1d53b76",
  measurementId: "G-YEZJMD20YK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
