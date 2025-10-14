// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7OVBdqL5DxdT1_wvINSAiounsZ5exnDc",
  authDomain: "mi-inventario-77dd0.firebaseapp.com",
  projectId: "mi-inventario-77dd0",
  storageBucket: "mi-inventario-77dd0.firebasestorage.app",
  messagingSenderId: "623238293649",
  appId: "1:623238293649:web:a75bb631ba2c8e1d6eb730"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);