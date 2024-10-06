// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSy5_Gc7dYdPUyrxZKHDM5lCMZ1HU4rUw",
  authDomain: "lesmash-3bbd8.firebaseapp.com",
  databaseURL: "https://lesmash-3bbd8-default-rtdb.firebaseio.com",
  projectId: "lesmash-3bbd8",
  storageBucket: "lesmash-3bbd8.appspot.com",
  messagingSenderId: "869629062926",
  appId: "1:869629062926:web:b1f681fe4b42b24ec3315f",
  measurementId: "G-4K9YM2MJTF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);
export default app;