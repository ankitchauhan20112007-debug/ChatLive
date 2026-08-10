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

  await loadProfile();

});


// =========================
// LOAD PROFILE
// =========================

async function loadProfile() {

  try {

    const userRef =
      doc(
        db,
        "users",
        currentUser.uid
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

    status.textContent =
      "Profile load नहीं हुई ❌";

  }

}


// =========================
// PHOTO PREVIEW
// =========================

photoInput.addEventListener(
  "change",
  () => {

    const file =
      photoInput.files[0];


    if (!file) {
      return;
    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {

      alert(
        "Photo 10 MB से छोटी होनी चाहिए।"
      );

      photoInput.value = "";

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


    if (!name) {

      alert(
        "Name enter करो"
      );

      return;

    }


    try {

      saveBtn.disabled =
        true;

      status.textContent =
        "Saving...";


      const userRef =
        doc(
          db,
          "users",
          currentUser.uid
        );


      // Existing profile
      const oldSnapshot =
        await getDoc(userRef);


      let photoURL = "";


      if (oldSnapshot.exists()) {

        const oldData =
          oldSnapshot.data();


        photoURL =
          oldData.photo || "";

      }


      // =========================
      // UPLOAD NEW PHOTO
      // =========================

      if (photoInput.files[0]) {

        status.textContent =
          "Photo uploading...";


        const formData =
          new FormData();


        formData.append(
          "file",
          photoInput.files[0]
        );


        formData.append(
          "upload_preset",
          "swlqxqgn"
        );


        const response =
          await fetch(
            "https://api.cloudinary.com/v1_1/rmt792pr/image/upload",
            {
              method: "POST",
              body: formData
            }
          );


        const result =
          await response.json();


        console.log(
          "Cloudinary:",
          result
        );


        if (!result.secure_url) {