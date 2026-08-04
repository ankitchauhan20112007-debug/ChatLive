import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
const db = getFirestore(app);

const profilePic = document.getElementById("profilePic");
const profileImage = document.getElementById("profileImage");
const uploadBtn = document.getElementById("uploadBtn");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const logout = document.getElementById("logout");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  userName.textContent = user.displayName || "ChatLive User";
  userEmail.textContent = user.email;

  const snap = await getDoc(doc(db, "users", user.uid));

  if (snap.exists()) {
    const data = snap.data();

    if (data.photo) {
      profilePic.src = data.photo;
    }
  }

});uploadBtn.onclick = async () => {
  try {

    if (!profileImage.files[0]) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("file", profileImage.files[0]);
    formData.append("upload_preset", "swlqxqgn");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/rmt792pr/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    if (!data.secure_url) {
      alert("Upload Failed");
      console.log(data);
      return;
    }

    profilePic.src = data.secure_url;

    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      {
        photo: data.secure_url
      },
      { merge: true }
    );

    alert("Profile photo uploaded successfully!");

  } catch (err) {
    console.log(err);
    alert("Error: " + err.message);
  }
};

logout.onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};