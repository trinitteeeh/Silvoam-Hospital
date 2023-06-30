import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzVZ0hpPPlHc5tSni-1UECYM3rvCipBJU",
  authDomain: "silvoam-hospital-2a591.firebaseapp.com",
  projectId: "silvoam-hospital-2a591",
  storageBucket: "silvoam-hospital-2a591.appspot.com",
  messagingSenderId: "81531634493",
  appId: "1:81531634493:web:c2380032315bcb6f1a7b54",
  measurementId: "G-MMPBCES7XL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
