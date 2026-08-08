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


const friendUid =
  localStorage.getItem("chatFriendUid");

const savedFriendName =
  localStorage.getItem("chatFriendName");


let currentUser = null;


if (!friendUid) {

  window.location.href = "chat.html";

}


friendName.textContent =
  "💬 " + (savedFriendName || "Friend");


onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href = "index.html";
    return;

  }

  currentUser = user;

  loadMessages();

});


function getChatId(uid1, uid2) {

  return [uid1, uid2]
    .sort()
    .join("_");

}


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
      orderBy("time", "asc")
    );


  onSnapshot(
    messagesQuery,

    (snapshot) => {

      messagesDiv.innerHTML = "";


      snapshot.forEach((messageDoc) => {

        const data =
          messageDoc.data();


        const isMine =
          data.sender ===
          currentUser.uid;


        const box =
          document.createElement("div");


        box.style.cssText = `
          margin:8px 0;
          padding:10px 14px;
          border-radius:15px;
          max-width:75%;
          word-wrap:break-word;
          background:${isMine ? "#dcf8c6" : "#ffffff"};
          margin-left:${isMine ? "auto" : "0"};
          box-shadow:0 1px 3px rgba(0,0,0,.15);
        `;


        box.textContent =
          data.text || "";


        messagesDiv.appendChild(box);

      });


      messagesDiv.scrollTop =
        messagesDiv.scrollHeight;

    },

    (error) => {

      console.error(
        "Chat error:",
        error
      );


      messagesDiv.innerHTML = `
        <p style="color:red;">
          Chat load नहीं हुई।
          <br><br>
          ${error.message}
        </p>
      `;

    }

  );

}


sendBtn.addEventListener(
  "click",
  sendMessage
);


messageInput.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {

      sendMessage();

    }

  }
);


async function sendMessage() {

  const text =
    messageInput.value.trim();


  if (!text) return;


  if (!currentUser) {

    alert("Login required");
    return;

  }


  const chatId =
    getChatId(
      currentUser.uid,
      friendUid
    );


  try {

    await addDoc(

      collection(
        db,
        "chats",
        chatId,
        "messages"
      ),

      {
        text: text,

        sender:
          currentUser.uid,

        senderEmail:
          currentUser.email,

        receiver:
          friendUid,

        time:
          serverTimestamp()
      }

    );


    messageInput.value = "";

    messageInput.focus();


  } catch (error) {

    console.error(
      "Send message error:",
      error
    );


    alert(
      "Message send नहीं हुआ:\n" +
      error.message
    );

  }

}