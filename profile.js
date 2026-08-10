import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


const profilePhoto =
  document.getElementById("profilePhoto");

const photoInput =
  document.getElementById("photoInput");

const nameInput =
  document.getElementById("nameInput");

const emailText =
  document.getElementById("emailText");

const saveProfile =
  document.getElementById("saveProfile");

const msg =
  document.getElementById("msg");


let currentUser = null;


// =========================
// LOGIN CHECK
// =========================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href =
      "index.html";

    return;

  }

  currentUser = user;

  emailText.textContent =
    user.email || "";

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


    const snap =
      await getDoc(userRef);


    if (snap.exists()) {

      const data =
        snap.data();


      nameInput.value =
        data.name || "";


      if (data.photo) {

        profilePhoto.src =
          data.photo;

      }

    }


  } catch (error) {

    console.error(
      "Load error:",
      error
    );

    msg.textContent =
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


    const reader =
      new FileReader();


    reader.onload =
      (event) => {

        profilePhoto.src =
          event.target.result;

      };


    reader.readAsDataURL(file);

  }
);


// =========================
// SAVE PROFILE
// =========================

saveProfile.addEventListener(
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

      saveProfile.disabled =
        true;

      msg.textContent =
        "Saving...";


      let photoURL =
        profilePhoto.src;


      // =========================
      // UPLOAD NEW PHOTO
      // =========================

      if (photoInput.files[0]) {

        msg.textContent =
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


      // =========================
      // FIRESTORE
      // =========================

      const userRef =
        doc(
          db,
          "users",
          currentUser.uid
        );


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


      // =========================
      // SUCCESS
      // =========================

      profilePhoto.src =
        photoURL;


      photoInput.value =
        "";


      msg.textContent =
        "✅ Profile Saved";


    } catch (error) {

      console.error(
        "Save error:",
        error
      );


      msg.textContent =
        "❌ " + error.message;


    } finally {

      saveProfile.disabled =
        false;

    }

  }
);