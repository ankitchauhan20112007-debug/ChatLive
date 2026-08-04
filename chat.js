import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

const messages = document.getElementById("messages");
const message = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const chatUser = document.getElementById("chatUser");

const chatWith = localStorage.getItem("chatUser");

chatUser.innerHTML = "💬 " + chatWith;

onAuthStateChanged(auth, (user) => {

  if (!user) {
    location.href = "index.html";
    return;
  }

  sendBtn.onclick = async () => {

    if (message.value.trim() == "") return;

    await addDoc(collection(db, "messages"), {
      from: user.email,
      to: chatWith,
      text: message.value,
      time: serverTimestamp()
    });

    message.value = "";

  };

});const q = query(
  collection(db, "messages"),
  orderBy("time", "asc")
);

onSnapshot(q, (snapshot) => {

  messages.innerHTML = "";

  snapshot.forEach((doc) => {

    const data = doc.data();

    if (
      (data.from === auth.currentUser.email && data.to === chatWith) ||
      (data.from === chatWith && data.to === auth.currentUser.email)
    ) {

      const mine = data.from === auth.currentUser.email;

      messages.innerHTML += `
      <div style="
      display:flex;
      justify-content:${mine ? "flex-end" : "flex-start"};
      margin:8px 0;
      ">

        <div style="
        background:${mine ? "#0095f6" : "#e5e5ea"};
        color:${mine ? "#fff" : "#000"};
        padding:10px 15px;
        border-radius:18px;
        max-width:70%;
        word-wrap:break-word;
        ">
          ${data.text}
        </div>

      </div>
      `;
    }

  });

  messages.scrollTop = messages.scrollHeight;

});