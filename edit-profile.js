import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


const nameInput =
  document.getElementById("name");

const photoInput =
  document.getElementById("profilePhoto");

const preview =
  document.getElementById("profilePreview");

const saveBtn =
  document.getElementById("saveBtn");

const status =
  document.getElementById("status");


let currentUser = null;


// =========================
// LOGIN
// =========================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href =
      "index.html";

    return;

  }


  currentUser = user;


  // Load existing profile
  try {

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );


    const snapshot =
      await getDoc(userRef);


    if (snapshot.exists()) {

      const data =
        snapshot.data();


      nameInput.value =
        data.name ||
        data.username ||
        data.displayName ||
        "";


      if (data.photo) {

        preview.src =
          data.photo;

      }

    }


  } catch (error) {

    console.error(
      "Profile loading error:",
      error
    );

  }

});


// =========================
// PREVIEW PHOTO
// =========================

photoInput.addEventListener(
  "change",
  () => {

    const file =
      photoInput.files[0];


    if (!file) {
      return;
    }


    const imageUrl =
      URL.createObjectURL(file);


    preview.src =
      imageUrl;

  }
);


// =========================
// SAVE PROFILE
// =========================

saveBtn.addEventListener(
  "click",
  async () => {

    if (!currentUser) {

      alert(
        "Please login first"
      );

      return;

    }


    const name =
      nameInput.value.trim();