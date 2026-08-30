import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


// ===============================
// ELEMENTS
// ===============================

const messagesDiv =
  document.getElementById("messages");

const messageInput =
  document.getElementById("message");

const sendBtn =
  document.getElementById("sendBtn");

const friendName =
  document.getElementById("friendName");

const friendPhoto =
  document.getElementById("friendPhoto");

const friendStatus =
  document.getElementById("friendStatus");


// ===============================
// FRIEND DATA
// ===============================

const friendUid =
  localStorage.getItem("chatFriendUid");

const savedFriendName =
  localStorage.getItem("chatFriendName");


// ===============================
// CHECK FRIEND
// ===============================

if (!friendUid) {

  alert("Friend select नहीं हुआ।");

  window.location.href = "chat.html";
}


// ===============================
// CHAT ID
// ===============================

function getChatId(uid1, uid2) {

  return [uid1, uid2]
    .sort()
    .join("_");

}


// ===============================
// LOGIN
// ===============================

onAuthStateChanged(
  auth,
  (user) => {

    if (!user) {

      window.location.href =
        "index.html";

      return;
    }

    loadFriend();

    loadMessages(user);

  }
);


// ===============================
// FRIEND INFO
// ===============================

function loadFriend() {

  friendName.textContent =
    savedFriendName || "User";

  friendStatus.textContent =
    "Checking...";


  const friendRef =
    doc(
      db,
      "users",
      friendUid
    );


  onSnapshot(
    friendRef,
    (snap) => {

      if (!snap.exists()) {
        return;
      }


      const data =
        snap.data();


      // NAME

      friendName.textContent =
        data.name ||
        data.username ||
        data.displayName ||
        savedFriendName ||
        "User";


      // PHOTO

      if (data.photo) {

        friendPhoto.src =
          data.photo;

      }


      // ONLINE

      if (data.online === true) {

        friendStatus.textContent =
          "online";

        friendStatus.style.color =
          "#25D366";

      } else {

        friendStatus.textContent =
          "offline";

        friendStatus.style.color =
          "#ddd";

      }

    }
  );

}


// ===============================
// LOAD MESSAGES
// ===============================

function loadMessages(currentUser) {

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
        "createdAt",
        "asc"
      )
    );


  onSnapshot(
    messagesQuery,
    (snapshot) => {

      messagesDiv.innerHTML = "";


      snapshot.forEach(
        (messageDoc) => {

          const data =
            messageDoc.data();


          createMessage(
            data,
            currentUser.uid
          );


          // Friend message read

          if (
            data.sender === friendUid &&
            data.receiver === currentUser.uid &&
            data.read === false
          ) {

            markAsRead(
              chatId,
              messageDoc.id
            );

          }

        }
      );


      // Scroll bottom

      setTimeout(
        () => {

          messagesDiv.scrollTop =
            messagesDiv.scrollHeight;

        },
        50
      );

    },


    (error) => {

      console.error(
        "Messages error:",
        error
      );

    }
  );

}


// ===============================
// CREATE MESSAGE
// ===============================

function createMessage(
  data,
  currentUid
) {

  const box =
    document.createElement("div");


  box.className =
    data.sender === currentUid
      ? "message-box my-message"
      : "message-box friend-message";


  // ===============================
  // TEXT
  // ===============================

  if (data.text) {

    const text =
      document.createElement("div");


    text.textContent =
      data.text;


    box.appendChild(text);

  }


  // ===============================
  // IMAGE
  // ===============================

  if (data.image) {

    const image =
      document.createElement("img");


    image.src =
      data.image;

    image.className =
      "message-image";

    image.loading =
      "lazy";


    box.appendChild(
      image
    );

  }


  // ===============================
  // TIME
  // ===============================

  const bottom =
    document.createElement("div");


  bottom.className =
    "message-bottom";


  let timeText =
    "";


  if (data.createdAt) {

    try {

      const date =
        data.createdAt.toDate();


      timeText =
        date.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        );

    } catch (error) {

      timeText = "";

    }

  }


  bottom.textContent =
    timeText;


  // ===============================
  // TICKS
  // ===============================

  if (
    data.sender === currentUid
  ) {

    const ticks =
      document.createElement("span");


    ticks.className =
      "ticks";


    ticks.textContent =
      data.read
        ? "✓✓"
        : "✓";


    ticks.style.color =
      data.read
        ? "#128CDB"
        : "#777";


    bottom.appendChild(
      ticks
    );

  }


  box.appendChild(
    bottom
  );


  messagesDiv.appendChild(
    box
  );

}


// ===============================
// SEND MESSAGE
// ===============================

async function sendMessage() {

  const currentUser =
    auth.currentUser;


  if (!currentUser) {

    alert("Please login first.");

    return;

  }


  const text =
    messageInput.value.trim();


  if (!text) {
    return;
  }


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


  try {

    sendBtn.disabled =
      true;


    await addDoc(
      messagesRef,
      {

        sender:
          currentUser.uid,

        receiver:
          friendUid,

        text:
          text,

        image:
          "",

        read:
          false,

        createdAt:
          serverTimestamp()

      }
    );


    messageInput.value =
      "";


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


  sendBtn.disabled =
    false;

}


// ===============================
// SEND BUTTON
// ===============================

if (sendBtn) {

  sendBtn.addEventListener(
    "click",
    sendMessage
  );

}


// ===============================
// ENTER TO SEND
// ===============================

if (messageInput) {

  messageInput.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter"
      ) {

        event.preventDefault();

        sendMessage();

      }

    }
  );

}


// ===============================
// MARK AS READ
// ===============================

async function markAsRead(
  chatId,
  messageId
) {

  try {

    const messageRef =
      doc(
        db,
        "chats",
        chatId,
        "messages",
        messageId
      );


    await updateDoc(
      messageRef,
      {
        read: true
      }
    );

  } catch (error) {

    console.error(
      "Read update error:",
      error
    );

  }

}