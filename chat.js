alert("chat.js loaded");
import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const chatUser = document.getElementById("chatUser");
const emojiBtn = document.getElementById("emojiBtn");

let currentUser = null;

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  chatUser.textContent = user.email;
});// ===== SEND TEXT MESSAGE =====

sendBtn.addEventListener("click", async () => {

  const text = messageInput.value.trim();

  if (!text) return;
  if (!currentUser) return;

  try {

    await addDoc(collection(db, "messages"), {
      text: text,
      sender: currentUser.email,
      time: serverTimestamp()
    });

    messageInput.value = "";

  } catch (error) {

    console.error("Message error:", error);
    alert("Message send नहीं हुआ");

  }

});


// ===== ENTER KEY =====

messageInput.addEventListener("keydown", (event) => {

  if (event.key === "Enter") {
    sendBtn.click();
  }

});


// ===== EMOJI =====

emojiBtn.addEventListener("click", () => {

  messageInput.value += " 😊";
  messageInput.focus();

});// ===== SHOW MESSAGES =====

const messagesQuery = query(
  collection(db, "messages"),
  orderBy("time", "asc")
);

onSnapshot(messagesQuery, (snapshot) => {

  messagesDiv.innerHTML = "";

  snapshot.forEach((messageDoc) => {

    const data = messageDoc.data();

    const isMine =
      currentUser &&
      data.sender === currentUser.email;

    const div = document.createElement("div");

    div.style.marginBottom = "8px";
    div.style.padding = "8px";
    div.style.borderRadius = "10px";
    div.style.background = isMine ? "#dcf8c6" : "#ffffff";
    div.style.textAlign = isMine ? "right" : "left";

    div.innerHTML = `
      <small>
        <b>${data.sender || ""}</b>
      </small>
      <br>
      ${data.text || ""}
    `;

    messagesDiv.appendChild(div);
  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;

});