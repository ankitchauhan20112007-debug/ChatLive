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


// ========================================
// ELEMENTS
// ========================================

const friendName = document.getElementById("friendName");
const friendPhoto = document.getElementById("friendPhoto");
const friendStatus = document.getElementById("friendStatus");

const messagesDiv = document.getElementById("messages");

const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

const chatPhoto = document.getElementById("chatPhoto");


// ========================================
// FRIEND DATA
// ========================================