import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


// =========================
// ELEMENTS
// =========================

const friendStatus =
  document.getElementById("friendStatus");

const friendName =
  document.getElementById("friendName");

const messagesDiv =
  document.getElementById("messages");

const messageInput =
  document.getElementById("message");

const sendBtn =
  document.getElementById("sendBtn");

const chatPhoto =
  document.getElementById("chatPhoto");


// =========================
// FRIEND
// =========================

const friendUid =
  localStorage.getItem("chatFriendUid");

const savedFriendName =
  localStorage.getItem("chatFriendName");

let currentUser = null;


// =========================
// CHECK FRIEND
// =========================

if (!friendUid) {

  window.location.href =
    "chat.html";

}


// =========================
// FRIEND NAME
// =========================

if (friendName) {

  friendName.textContent =
    savedFriendName || "Friend";

}


// =========================
// LOGIN
// =========================

onAuthStateChanged(
  auth,
  (user) => {

    if (!user) {

      window.location.href =
        "index.html";

      return;

    }

    currentUser = user;

    loadFriendStatus();

    loadMessages();

  }
);


// =========================
// CHAT ID
// =========================

function getChatId(uid1, uid2) {

  return [
    uid1,
    uid2
  ]
    .sort()
    .join("_");

}


// =========================
// FRIEND STATUS
// =========================

function loadFriendStatus() {

  if (!friendStatus) {
    return;
  }

  const friendRef =
    doc(
      db,
      "users",
      friendUid
    );

  onSnapshot(
    friendRef,

    (snapshot) => {

      if (!snapshot.exists()) {

        friendStatus.innerHTML =
          "";

        return;

      }

      const data =
        snapshot.data();

      const color =
        data.online === true
          ? "#00a000"
          : "#d3d3d3";

      friendStatus.innerHTML = `
        <span
          style="
            display:inline-block;
            width:6px;
            height:6px;
            border-radius:50%;
            background:${color};
          "
        ></span>
      `;

    },

    (error) => {

      console.error(
        "Status error:",
        error
      );

      friendStatus.innerHTML =
        "";

    }

  );

}


// =========================
// LOAD MESSAGES
// =========================

function loadMessages() {

  const chatId =
    getChatId(
      currentUser.uid,
      friendUid
    );

  const messagesRef =
    collection(
      db,
      "chats",
      chatId,
      "messages"
    );

  const messagesQuery =
    query(
      messagesRef,
      orderBy(
        "time",
        "asc"
      )
    );

  onSnapshot(

    messagesQuery,

    (snapshot) => {

      messagesDiv.innerHTML =
        "";

      snapshot.forEach(
        (messageDoc) => {

          const data =
            messageDoc.data();

          showMessage(
            data,
            messageDoc.id
          );

        }
      );

      messagesDiv.scrollTop =
        messagesDiv.scrollHeight;

    },

    (error) => {

      console.error(
        "Messages error:",
        error
      );

      messagesDiv.innerHTML = `
        <p
          style="
            color:red;
            padding:10px;
          "
        >
          ❌ Chat load नहीं हुई।
          <br><br>
          ${error.message}
        </p>
      `;

    }

  );

}


// =========================
// SHOW MESSAGE
// =========================

function showMessage(
  data,
  messageId
) {

  const box =
    document.createElement("div");

  const isMine =
    data.sender ===
    currentUser.uid;

  box.dataset.messageId =
    messageId;

  box.style.cssText = `
    margin:8px 0;
    padding:10px;
    border-radius:15px;
    max-width:75%;
    margin-left:${isMine ? "auto" : "0"};
    background:${isMine ? "#dcf8c6" : "#ffffff"};
    box-shadow:0 1px 3px rgba(0,0,0,.15);
    word-break:break-word;
  `;


  // =========================
  // PHOTO
  // =========================

  if (data.image) {

    const img =
      document.createElement("img");

    img.src =
      data.image;

    img.alt =
      "Photo";

    img.style.cssText = `
      width:100%;
      max-width:280px;
      border-radius:12px;
      display:block;
      object-fit:cover;
    `;

    box.appendChild(img);

  }


  // =========================
  // TEXT
  // =========================

  if (data.text) {

    const text =
      document.createElement("div");

    text.textContent =
      data.text;

    text