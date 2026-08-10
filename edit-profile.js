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


// ===============================
// CHECK LOGIN
// ===============================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "index.html";

    return;
  }

  currentUser = user;

  status.textContent = "Loading profile...";

  await loadProfile();

});


// ===============================
// LOAD SAVED PROFILE
// ===============================

async function loadProfile() {

  try {

    const userRef = doc(
      db,
      "users",
      currentUser.uid
    );

    const snapshot =
      await getDoc(userRef);


    if (!snapshot.exists()) {

      status.textContent =
        "Profile data नहीं मिली";

      return;
    }


    const data =
      snapshot.data();


    // Name
    nameInput.value =
      data.name || "User";


    // Photo
    if (data.photo) {

      preview.src =
        data.photo;

    }


    status.textContent = "";

  } catch (error) {

    console.error(
      "LOAD PROFILE ERROR:",
      error
    );

    status.textContent =
      "❌ " + error.message;

  }

}


// ===============================
// PHOTO PREVIEW
// ===============================

photoInput.addEventListener(
  "change",
  () => {

    const file =
      photoInput.files[0];


    if (!file) return;


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


    const imageURL =
      URL.createObjectURL(file);


    preview.src =
      imageURL;

  }
);


// ===============================
// SAVE PROFILE
// ===============================

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

      saveBtn.disabled = true;

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


      // ===============================
      // NEW PHOTO UPLOAD
      // ===============================

      if (photoInput.files[0]) {

        status.textContent =
          "Photo uploading...";


        const file =
          photoInput.files[0];


        const formData =
          new FormData();


        formData.append(
          "file",
          file
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
          "Cloudinary result:",
          result
        );


        if (!result.secure_url) {

          throw new Error(
            result.error?.message ||
            "Photo upload failed"
          );

        }


        photoURL =
          result.secure_url;

      }


      // ===============================
      // SAVE TO FIRESTORE
      // ===============================

      await setDoc(
        userRef,
        {
          uid:
            currentUser.uid,

          name:
            name,

          email:
            currentUser.email || "",

          photo:
            photoURL,

          online:
            true
        },
        {
          merge: true
        }
      );


      // Update screen
      nameInput.value =
        name;


      if (photoURL) {

        preview.src =
          photoURL;

      }


      photoInput.value =
        "";


      status.textContent =
        "✅ Profile Saved";


      saveBtn.disabled =
        false;


      // Go back after save
      setTimeout(
        () => {

          window.location.href =
            "profile.html";

        },
        1000
      );


    } catch (error) {

      console.error(
        "SAVE PROFILE ERROR:",
        error
      );


      status.textContent =
        "❌ " + error.message;


      saveBtn.disabled =
        false;

    }

  }
);