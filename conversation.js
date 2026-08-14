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


// ==================================================
// ELEMENTS
// ==================================================

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


// ==================================================
// FRIEND DATA
// ==================================================

const friendUid =
  localStorage.getItem("chatFriendUid");

const savedFriendName =
  localStorage.getItem("chatFriendName");

const savedFriendPhoto =
  localStorage.getItem("chatFriendPhoto");


let currentUser = null;


// ==================================================
// CHECK FRIEND
// ==================================================

if (!friendUid) {

  window.location.href = "chat.html";

}


// ==================================================
// FRIEND NAME
// ==================================================

if (friendName) {

  friendName.textContent =
    savedFriendName || "Friend";

}


// ==================================================
// FRIEND PHOTO
// ==================================================

if (
  friendPhoto &&
  savedFriendPhoto
) {

  friendPhoto.src =
    savedFriendPhoto;

}


// ==================================================
// CHAT ID
// ==================================================

function getChatId(uid1, uid2) {

  return [
    uid1,
    uid2
  ]
  .sort()
  .join("_");

}


// ==================================================
// LOGIN
// ==================================================

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


    loadFriendStatus();

    loadMessages();

  }
);


// ==================================================
// FRIEND ONLINE STATUS
// ==================================================

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
          `<span style="color:#ccc;">●</span> offline`;

        return;

      }


      const data =
        snapshot.data();


      if (data.online === true) {

        friendStatus.innerHTML =
          `<span style="color:#00d000;">●</span> online`;

      } else {

        friendStatus.innerHTML =
          `<span style="color:#ccc;">●</span> offline`;

      }

    },

    (error) => {

      console.error(
        "STATUS ERROR:",
        error
      );

    }
  );

}


// ==================================================
// LOAD MESSAGES
// ==================================================

function loadMessages() {

  if (!currentUser) {
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

      messagesDiv.innerHTML = "";


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
        "MESSAGES ERROR:",
        error
      );


      messagesDiv.innerHTML = `

        <div
          style="
            color:red;
            padding:15px;
          "
        >

          Chat load नहीं हुई।

          <br><br>

          ${error.message}

        </div>

      `;

    }

  );

}


// ==================================================
// SHOW MESSAGE
// ==================================================

function showMessage(
  data,
  messageId
) {

  const box =
    document.createElement("div");


  const isMine =
    data.sender ===
    currentUser.uid;


  box.className =
    isMine
      ? "message-box my-message"
      : "message-box friend-message";


  box.dataset.messageId =
    messageId;


  // ==================================================
  // PHOTO
  // ==================================================

  if (data.image) {

    const img =
      document.createElement("img");


    img.src =
      data.image;


    img.className =
      "message-image";


    img.alt =
      "Photo";


    box.appendChild(
      img
    );

  }


  // ==================================================
  // TEXT
  // ==================================================

  if (data.text) {

    const text =
      document.createElement("div");


    text.textContent =
      data.text;


    box.appendChild(
      text
    );

  }


  // ==================================================
  // TIME
  // ==================================================

  const bottom =
    document.createElement("div");


  bottom.className =
    "message-time";


  let timeText =
    "";


  if (
    data.time &&
    data.time.toDate
  ) {

    timeText =
      data.time
        .toDate()
        .toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        );

  } else {

    timeText =
      new Date()
        .toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        );

  }


  bottom.textContent =
    timeText;


  // ==================================================
  // TICKS
  // ==================================================

  if (isMine) {

    const ticks =
      document.createElement("span");


    ticks.className =
      "ticks";


    ticks.textContent =
      "✓✓";


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


// ==================================================
// SEND BUTTON
// ==================================================

if (sendBtn) {

  sendBtn.addEventListener(
    "click",
    sendMessage
  );

}


// ==================================================
// ENTER KEY
// ==================================================

if (messageInput) {

  messageInput.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();

        sendMessage();

      }

    }
  );

}


// ==================================================
// SEND TEXT MESSAGE
// ==================================================

async function sendMessage() {

  if (!messageInput) {
    return;
  }


  const text =
    messageInput.value.trim();


  if (!text) {
    return;
  }


  if (!currentUser) {
    return;
  }


  if (!friendUid) {
    return;
  }


  // ==================================================
  // SHOW MESSAGE IMMEDIATELY
  // ==================================================

  const temporary =
    document.createElement("div");


  temporary.className =
    "message-box my-message";


  temporary.textContent =
    text + "  ✓";


  messagesDiv.appendChild(
    temporary
  );


  messagesDiv.scrollTop =
    messagesDiv.scrollHeight;


  // Clear input immediately
  messageInput.value = "";

  messageInput.focus();


  try {

    sendBtn.disabled =
      true;


    const chatId =
      getChatId(
        currentUser.uid,
        friendUid
      );


    await addDoc(

      collection(
        db,
        "chats",
        chatId,
        "messages"
      ),

      {

        text:
          text,

        sender:
          currentUser.uid,

        receiver:
          friendUid,

        time:
          serverTimestamp()

      }

    );


    console.log(
      "MESSAGE SENT ✅"
    );


  } catch (error) {

    console.error(
      "MESSAGE ERROR:",
      error
    );


    temporary.textContent =
      text + "  ❌";


    temporary.style.background =
      "#ffd6d6";


    // Input वापस डाल दें
    messageInput.value =
      text;

  }


  sendBtn.disabled =
    false;

}


// ==================================================
// SEND PHOTO
// ==================================================

if (chatPhoto) {

  chatPhoto.addEventListener(
    "change",
    sendPhoto
  );

}


async function sendPhoto() {

  const file =
    chatPhoto.files[0];


  if (!file) {
    return;
  }


  if (!currentUser) {

    chatPhoto.value =
      "";

    return;

  }


  // ==================================================
  // FILE SIZE
  // ==================================================

  if (
    file.size >
    10 * 1024 * 1024
  ) {

    alert(
      "Photo 10 MB से छोटी होनी चाहिए।"
    );

    chatPhoto.value =
      "";

    return;

  }


  // ==================================================
  // TEMP PHOTO PREVIEW
  // ==================================================

  const previewUrl =
    URL.createObjectURL(file);


  const tempBox =
    document.createElement("div");


  tempBox.className =
    "message-box my-message";


  const preview =
    document.createElement("img");


  preview.src =
    previewUrl;


  preview.className =
    "message-image";


  tempBox.appendChild(
    preview
  );


  const loadingText =
    document.createElement("div");


  loadingText.className =
    "message-time";


  loadingText.textContent =
    "Sending...";


  tempBox.appendChild(
    loadingText
  );


  messagesDiv.appendChild(
    tempBox
  );


  messagesDiv.scrollTop =
    messagesDiv.scrollHeight;


  // Clear file input
  chatPhoto.value =
    "";


  try {

    // ==================================================
    // CLOUDINARY
    // ==================================================

    const formData =
      new FormData();


    formData.append(
      "file",
      file
    );


    formData.append(
      "upload_preset",
      "swlqxqgn"
    );


    const response =
      await fetch(

        "https://api.cloudinary.com/v1_1/rmt792pr/image/upload",

        {
          method: "POST",
          body: formData
        }

      );


    const result =
      await response.json();


    console.log(
      "CLOUDINARY:",
      result
    );


    if (!result.secure_url) {

      throw new Error(
        result.error?.message ||
        "Photo upload failed"
      );

    }


    // ==================================================
    // FIRESTORE
    // ==================================================

    const chatId =
      getChatId(
        currentUser.uid,
        friendUid
      );


    await addDoc(

      collection(
        db,
        "chats",
        chatId,
        "messages"
      ),

      {

        image:
          result.secure_url,

        sender:
          currentUser.uid,

        receiver:
          friendUid,

        time:
          serverTimestamp()

      }

    );


    // ==================================================
    // REMOVE TEMP PREVIEW
    // ==================================================

    tempBox.remove();

    URL.revokeObjectURL(
      previewUrl
    );


    console.log(
      "PHOTO SENT ✅"
    );


  } catch (error) {

    console.error(
      "PHOTO ERROR:",
      error
    );


    loadingText.textContent =
      "Photo failed ❌";


    tempBox.style.background =
      "#ffd6d6";


  }

}