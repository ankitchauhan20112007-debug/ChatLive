import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQW8TYSFy1G6cXeGyYyscnWnh9Kqk5g6o",
  authDomain: "chatlive-bac03.firebaseapp.com",
  projectId: "chatlive-bac03",
  storageBucket: "chatlive-bac03.firebasestorage.app",
  messagingSenderId: "1097708548558",
  appId: "1:1097708548558:web:32a13c6cf0b624a2eafb9f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const email = document.getElementById("email");
const password = document.getElementById("password");
const signup = document.getElementById("signup");
const login = document.getElementById("login");
const msg = document.getElementById("msg");

signup.onclick = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      msg.innerHTML = "✅ Account Created Successfully";
    })
    .catch((error) => {
      msg.innerHTML = error.message;
    });
};

login.onclick = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      msg.innerHTML = "✅ Login Successful";
    })
    .catch((error) => {
      msg.innerHTML = error.message;
    });
