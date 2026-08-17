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
  serverTimestamp,
  updateDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


// =====================================================
// ELEMENTS
// =====================================================

const friendStatus =
  document.getElementById("friendStatus");

const friendName =
  document.getElementById("friendName");

const friendPhoto =
  document.getElementById("friendPhoto");

const messagesDiv =
  document.getElementById("messages");

const messageInput =
  document.getElementById("message");

const sendBtn =
  document.getElementById("sendBtn");

const chatPhoto =
  document.getElementById("chatPhoto");


// =====================================================
// FRIEND DATA
// =====================================================

const friendUid =
  localStorage.getItem("chatFriendUid");

const savedFriendName =
  localStorage.getItem("chatFriendName");


let currentUser = null;


// =====================================================
// CHECK FRIEND
// =====================================================

if (!friendUid) {

  window.location.href =
    "chat.html";

}


// =====================================================
// FRIEND NAME
// =====================================================

if (friendName) {

  friendName.textContent =
    savedFriendName || "User";

}


// =====================================================
// CHAT ID
// =====================================================

function getChatId(uid1, uid2) {

  return [uid1, uid2]
    .sort()
    .join("_");

}


// =====================================================
// LOGIN
// =====================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "index.html";

      return;

    }


    currentUser = user;


    // Friend information
    loadFriend();


    // Online