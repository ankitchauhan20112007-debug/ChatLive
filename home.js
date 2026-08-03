import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
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

const usersDiv = document.getElementById("users");
const logoutBtn = document.getElementById("logout");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }await setDoc(doc(db, "users", user.uid), {
  email: user.email,
  online: true
}, { merge: true });

  const snapshot = await getDocs(collection(db, "users"));
  usersDiv.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (data.email !== user.email) {
      const div = document.createElement("div");div.innerHTML = data.name || data.email;
div.style.padding = "12px";
div.style.borderBottom = "1px solid #ccc";
div.style.cursor = "pointer";

div.onclick = () => {
  localStorage.setItem("chatUser", data.email);
  window.location.href = "chat.html";
};

usersDiv.appendChild(div);
    }
  });
});

logoutBtn.onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};
