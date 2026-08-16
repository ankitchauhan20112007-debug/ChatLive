import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  collection,
  addDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


// =========================
// ELEMENTS
// =========================

const friendPhoto =
  document.getElementById("friendPhoto");

const friendName =
  document.getElementById("friendName");

const friendStatus =
  document.getElementById("friendStatus");

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


    currentUser =
      user;


    loadFriendProfile();

    loadMessages();

  }
);


// =========================
// CHAT ID
// =========================

function getChatId(
  uid1,
  uid2
) {

  return [
    uid1,
    uid2
  ]
    .sort()
    .join("_");

}


// =========================
// FRIEND PROFILE
// =========================

function loadFriendProfile() {

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
        return;
      }


      const data =
        snapshot.data();


      const name =
        data.name ||
        data.username ||
        data.displayName ||
        "Friend";


      if (friendName) {

        friendName.textContent =
          name;

      }


      // Photo

      if (
        friendPhoto &&
        data.photo
      ) {

        friendPhoto.src =
          data.photo;

      }


      // Online dot

      if (friendStatus) {

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

      }

    },

    (error) => {

      console.error(
        "Friend profile