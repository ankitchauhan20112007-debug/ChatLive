// ===============================
// FIREBASE APP
// ===============================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";


// ===============================
// FIREBASE AUTH
// ===============================

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";


// ===============================
// FIRESTORE
// ===============================

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


// ===============================
// FIREBASE CONFIG
// ===============================c 
const firebaseConfig = {
  apiKey: "AIzaSyCQW8TYSFy1G6cXeGyYyscnWnh9Kqk5g6o",
  authDomain: "chatlive-bac03.firebaseapp.com",
  projectId: "chatlive-bac03",
  storageBucket: "chatlive-bac03.firebasestorage.app",
  messagingSenderId: "1097708548558",
  appId: "1:1097708548558:web:32a13c6cf0b624a2eafb9f"
};


// ===============================
// INITIALIZE FIREBASE
// ===============================

const app =
  initializeApp(firebaseConfig);


// ===============================
// AUTH
// ===============================

const auth =
  getAuth(app);


// ===============================
// FIRESTORE
// ===============================

const db =
  getFirestore(app);


// ===============================
// EXPORT
// ===============================

export {
  auth,
  db
};