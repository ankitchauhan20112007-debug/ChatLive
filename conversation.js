
import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  getDoc,
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


// ==================================================
// FRIEND DATA
// ==================================================

const friendUid =
  localStorage.getItem("chatFriendUid");

const savedFriendName =
  localStorage.getItem("chatFriendName");


let currentUser = null;


// ==================================================
// CHECK FRIEND
// ==================================================

if (!friendUid) {

  window.location.href = "chat.html";

}


// ==================================================
// INITIAL FRIEND NAME
// ==================================================

if (friendName) {

  friendName.textContent =
    savedFriendName || "Friend";

}


// ==================================================
// LOGIN
// ==================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "index.html";

      return;

    }


    currentUser = user;


    // Friend profile
    await loadFriendProfile();


    // Online / offline
    loadFriendStatus();


    // Messages
    loadMessages();

  }
);


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
// LOAD FRIEND PROFILE
// ==================================================

async function loadFriendProfile() {

  try {

    const friendRef =
      doc(
        db,
        "users",
        friendUid
      );


    const snapshot =
      await getDoc(friendRef);


    if (!snapshot.exists()) {

      if (friendName) {
        friendName.textContent =
          savedFriendName || "Friend";
      }

      if (friendStatus) {

        friendStatus.innerHTML = `
          <span
            style="
              display:inline-block;
              width:6px;
              height:6px;
              border-radius:50%;
              background:#d3d3d3;
            "
          ></span>
        `;

      }

      return;

    }


    const data =
      snapshot.data();


    // NAME
    if (friendName) {

      friendName.textContent =
        data.name ||
        data.username ||
        data.displayName ||
        savedFriendName ||
        "Friend";

    }


    // PHOTO
    if (friendPhoto) {

      if (data.photo) {

        friendPhoto.src =
          data.photo;

      } else {

        friendPhoto.src =
          "https://via.placeholder.com/100";

      }

    }


  } catch (error) {

    console.error(
      "Friend profile error:",
      error
    );


    if (friendName) {

      friendName.textContent =
        savedFriendName ||
        "Friend";

    }

  }

}


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
        "Messages error:",
        error
      );


      messagesDiv.innerHTML = `

        <div
          style="
            color:#b00000;
            background:#ffe5e5;
            padding:15px;
            border-radius:12px;
          "
        >

          ❌ Chat load नहीं हुई।

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


  box.classList.add(
    "message-box"
  );


  box.classList.add(
    isMine
      ? "my-message"
      : "friend-message"
  );


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


    img.alt =
      "Photo";


    img.className =
      "message-image";


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


    if (data.image) {

      text.style.marginTop =
        "8px";

    }


    box.appendChild(
      text
    );

  }


  // ==================================================
  // TICKS
  // ==================================================

  if (isMine) {

    const ticks =
      document.createElement("span");


    ticks.textContent =
      "✓✓";


    ticks.className =
      "ticks";


    box.appendChild(
      ticks
    );

  }


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

    alert(
      "Please login first"
    );

    return;

  }


  if (!friendUid) {

    alert(
      "Friend select नहीं है"
    );

    return;

  }


  // ==================================================
  // SHOW MESSAGE IMMEDIATELY
  // ==================================================

  const tempBox =
    document.createElement("div");


  tempBox.className =
    "message-box my-message";


  tempBox.style.opacity =
    "0.8";


  tempBox.textContent =
    text + " ✓";


  messagesDiv.appendChild(
    tempBox
  );


  messagesDiv.scrollTop =
    messagesDiv.scrollHeight;


  // Input तुरंत खाली
  messageInput.value =
    "";


  messageInput.focus();


  // ==================================================
  // SEND TO FIRESTORE
  // ==================================================

  try {

    sendBtn.disabled =
      true;


    sendBtn.textContent =
      "Sending...";


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
      "Message sent ✅"
    );


    // Temporary message remove
    tempBox.remove();


  } catch (error) {

    console.error(
      "MESSAGE ERROR:",
      error
    );


    tempBox.textContent =
      text + " ❌";


    tempBox.style.background =
      "#ffd6d6";


    alert(
      "Message send नहीं हुआ:\n\n" +
      error.message
    );

  }


  sendBtn.disabled =
    false;


  sendBtn.textContent =
    "Send";

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

    alert(
      "Please login first"
    );

    return;

  }


  // 10 MB LIMIT
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


  try {

    alert(
      "Photo uploading..."
    );


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

          method:
            "POST",

          body:
            formData

        }

      );


    const result =
      await response.json();


    console.log(
      "Cloudinary:",
      result
    );


    if (
      !result.secure_url
    ) {

      throw new Error(

        result.error?.message ||
        "Photo upload failed"

      );

    }


    // ==================================================
    // SAVE PHOTO MESSAGE
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


    chatPhoto.value =
      "";


    alert(
      "Photo sent ✅"
    );


  } catch (error) {

    console.error(
      "PHOTO ERROR:",
      error
    );


    alert(
      "Photo send नहीं हुई:\n\n" +
      error.message
    );

  }

}