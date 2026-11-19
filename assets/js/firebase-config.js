// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCO62IfBYLDG35Av2QxTYEpFBA0VvY0Szw",
  authDomain: "pin-panda.firebaseapp.com",
  projectId: "pin-panda",
  storageBucket: "pin-panda.firebasestorage.app",
  messagingSenderId: "1028681507881",
  appId: "1:1028681507881:web:9dd3bfb3063ca0623fe838",
  measurementId: "G-0VM39SRJKH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);