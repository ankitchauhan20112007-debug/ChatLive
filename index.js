import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const name = document.getElementById("name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const signup = document.getElementById("signup");
const login = document.getElementById("login");
const msg = document.getElementById("msg");

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "home.html";
  }
});signup.onclick = async () => {

  try {

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );

    await setDoc(
      doc(db, "users", userCredential.user.uid),
      {
        uid: userCredential.user.uid,
        name: name.value,
        email: email.value,
        online: true
      }
    );

    window.location.href = "home.html";

  } catch (error) {

    msg.innerHTML = error.message;

  }

};

login.onclick = async () => {

  try {

    await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    window.location.href = "home.html";

  } catch (error) {

    msg.innerHTML = error.message;

  }

};