import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
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
const db = getFirestore(app);

const messages = document.getElementById("messages");
const input = document.getElementById("message");
const send = document.getElementById("send");
const emoji = document.getElementById("emoji");
const darkMode = document.getElementById("darkMode");

darkMode.onclick = () => {
  document.body.classList.toggle("dark");
};

emoji.onclick = () => {
  input.value += "😀";
  input.focus();
};

send.onclick = async () => {
  if (input.value.trim() === "") return;

 await addDoc(collection(db, "messages"), {
  text: input.value,
  time: serverTimestamp(),
  createdAt: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })
});

  input.value = "";
};

const q = query(collection(db, "messages"), orderBy("time"));

onSnapshot(q, (snapshot) => {
  messages.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();

messages.innerHTML += `
<div style="margin-bottom:10px">
  <p>${data.text}</p>
  <small style="color:gray">${data.createdAt || ""}</small>
</div>`;
  });
  messages.scrollTop = messages.scrollHeight;
});
