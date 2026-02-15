// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAW1A8-uiE4oKYcNvopW8_nY8T-mymvoHo",
  authDomain: "trustledger-a1ca1.firebaseapp.com",
  projectId: "trustledger-a1ca1",
  storageBucket: "trustledger-a1ca1.firebasestorage.app",
  messagingSenderId: "696142795555",
  appId: "1:696142795555:web:b709f8d0b8e5593ffd3296"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
