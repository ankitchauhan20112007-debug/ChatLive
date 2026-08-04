import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "chatlive-bac03.firebaseapp.com",
  projectId: "chatlive-bac03",
  storageBucket: "chatlive-bac03.firebasestorage.app",
  messagingSenderId: "1097708548558",
  appId: "1:1097708548558:web:32a13c6cf0b624a2eafb9f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);