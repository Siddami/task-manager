import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyClZF6XsEPTZQCU9eTFo6DsX_ZGLKBUJAQ",
  authDomain: "ys-task-go.firebaseapp.com",
  projectId: "ys-task-go",
  storageBucket: "ys-task-go.firebasestorage.app",
  messagingSenderId: "531713133924",
  appId: "1:531713133924:web:32056fe06aa8261dc47e71",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  doc,
  setDoc,
  getDoc,
  onAuthStateChanged,
};
