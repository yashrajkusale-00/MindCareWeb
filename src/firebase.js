// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBjqoeE8eyziMKD2b_P7R73uUsItysZOw",
  authDomain: "mentalhealthapp-a3a5b.firebaseapp.com",
  projectId: "mentalhealthapp-a3a5b",
  storageBucket: "mentalhealthapp-a3a5b.firebasestorage.app",
  messagingSenderId: "588081979285",
  appId: "1:588081979285:web:4257e8c9aea0a9da4f209c",
  measurementId: "G-YTRFC5Q5WB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);