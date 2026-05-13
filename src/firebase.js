// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcB9uCNq944JG9rv2e1DTOiffXL-fF4RU",
  authDomain: "mymovie-app-f55c2.firebaseapp.com",
  projectId: "mymovie-app-f55c2",
  storageBucket: "mymovie-app-f55c2.firebasestorage.app",
  messagingSenderId: "343301624790",
  appId: "1:343301624790:web:4cf52b63fda44b21830a77"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)