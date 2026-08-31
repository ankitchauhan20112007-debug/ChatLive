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
  document.getElementById("messageInput");

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

  window.location.href =
    "chat.html";
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


    loadFriend(user);

    loadMessages(user);

  }
);


// ===============================
// FRIEND INFO
// ===============================

async function loadFriend(currentUser) {

  friendName.textContent =
    savedFriendName || "User";


  // Default status

  friendStatus.textContent =
    "offline";


  // Firestore realtime listener

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
          "#ccc";

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
            messageDoc.id,
            currentUser.uid
          );


          // Friend ka message read

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


      // Bottom par scroll

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
  messageId,
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

  const time =
    document.createElement("div");


  time.className =
    "message-time";


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

    } catch (e) {

      timeText = "";

    }

  }


  time.textContent =
    timeText;


  // ===============================
  // TICKS
  // ===============================

  if (
    data.sender === currentUid
  ) {

    const ticks =
      document.createElement("span");


    ticks.textContent =
      data.read
        ? " ✓✓"
        : " ✓";


    ticks.style.marginLeft =
      "4px";


    time.appendChild(
      ticks
    );

  }


  box.appendChild(
    time
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
    return;
  }


  const text =
    messageInput.value.trim();


  // Empty message

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

    // Button disable

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


    // Input clear

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
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendMessage();

      }

    }
  );

}


// ===============================
// MARK MESSAGE READ
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