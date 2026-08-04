import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
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

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const logout = document.getElementById("logout");const profileImage = document.getElementById("profileImage");
const uploadBtn = document.getElementById("uploadBtn");
const profilePic = document.getElementById("profilePic");

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  userName.textContent = user.displayName || "ChatLive User";
  userEmail.textContent = user.email;

});

logout.onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};uploadBtn.onclick = async () => {

  if (!profileImage.files[0]) {
    alert("Please select an image");
    return;
  }

  const formData = new FormData();
  formData.append("file", profileImage.files[0]);
  formData.append("upload_preset", "swlqxqgn");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/rmt792pr/image/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  profilePic.src = data.secure_url;

  alert("Photo uploaded successfully!");
};