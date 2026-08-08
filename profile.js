
import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
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


// Login check
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  emailText.textContent =
    user.email;

  await loadProfile();

});


// Profile load
async function loadProfile() {

  try {

    const userRef =
      doc(db, "users", currentUser.uid);

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

    console.error(error);

    msg.textContent =
      "Profile load नहीं हुई";

  }

}


// Photo preview
photoInput.addEventListener(
  "change",
  () => {

    const file =
      photoInput.files[0];

    if (!file) return;

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


// Save profile
saveProfile.addEventListener(
  "click",
  async () => {

    msg.textContent =
      "Saving...";

    try {

      let photoURL =
        profilePhoto.src;


      // New photo selected
      if (photoInput.files[0]) {

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


        const upload =
          await fetch(
            "https://api.cloudinary.com/v1_1/rmt792pr/image/upload",
            {
              method: "POST",
              body: formData
            }
          );


        const image =
          await upload.json();


        if (!image.secure_url) {

          throw new Error(
            "Photo upload failed"
          );

        }


        photoURL =
          image.secure_url;

      }


      const userRef =
        doc(
          db,
          "users",
          currentUser.uid
        );


      await setDoc(
        userRef,
        {
          uid: currentUser.uid,

          name:
            nameInput.value.trim() ||
            "User",

          email:
            currentUser.email,

          photo:
            photoURL,

          online: true
        },
        {
          merge: true
        }
      );


      profilePhoto.src =
        photoURL;


      msg.textContent =
        "✅ Profile Saved";


      photoInput.value = "";


    } catch (error) {

      console.error(error);

      msg.textContent =
        "❌ " + error.message;

    }

  }
);