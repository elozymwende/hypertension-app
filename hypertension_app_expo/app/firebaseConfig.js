// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyAq08mBzxxNC-IrpzIq1vuHjmIAGmPYrGg",
  authDomain: "hypertension-app-dfcf5.firebaseapp.com",
  projectId: "hypertension-app-dfcf5",
  storageBucket: "hypertension-app-dfcf5.firebasestorage.app",
  messagingSenderId: "461065530132",
  appId: "1:461065530132:web:4916d5c75e0fe0cf667001"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;