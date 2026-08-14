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


// ======================================
// ELEMENTS
// ======================================

const friendName =
  document.getElementById("friendName");

const friendPhoto =
  document.getElementById("friendPhoto");

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


// ======================================
// FRIEND
// ======================================

const friendUid =
  localStorage.getItem("chatFriendUid");

const savedFriendName =
  localStorage.getItem("chatFriendName");


let currentUser = null;


// ======================================
// CHECK FRIEND
// ======================================

if (!friendUid) {

  window.location.href =
    "chat.html";

}


// ======================================
// FRIEND NAME
// ======================================

if (friendName) {

  friendName.textContent =
    savedFriendName || "Friend";

}


// ======================================
// CHAT ID
// ======================================

function getChatId(uid1, uid2) {

  return [uid1, uid2]
    .sort()
    .join("_");

}


// ======================================
// LOGIN
// ======================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "index.html";

      return;

    }


    currentUser =
      user;


    await loadFriend();


    loadFriendStatus();


    loadMessages();

  }
);


// ======================================
// LOAD FRIEND PROFILE
// ======================================

async function loadFriend() {

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

      return;

    }


    const data =
      snapshot.data();


    if (friendName) {

      friendName.textContent =
        data.name || "Friend";

    }


    if (friendPhoto && data.photo) {

      friendPhoto.src =
        data.photo;

    }

  } catch (error) {

    console.error(
      "Friend profile error:",
      error
    );

  }

}


// ======================================
// FRIEND ONLINE STATUS
// ======================================

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

        friendStatus.textContent =
          "";

        return;

      }


      const data =
        snapshot.data();


      if (data.online === true) {

        friendStatus.innerHTML = `
          <span style="
            color:#25D366;
            font-size:11px;
          ">●</span>
          online
        `;

      } else {

        friendStatus.innerHTML = `
          <span style="
            color:#ccc;
            font-size:11px;
          ">●</span>
          offline
        `;

      }

    },

    (error) => {

      console.error(
        "Status error:",
        error
      );

    }

  );

}


// ======================================
// LOAD MESSAGES
// ======================================

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
            data
          );

        }
      );


      scrollToBottom();

    },

    (error) => {

      console.error(
        "Messages error:",
        error
      );


      messagesDiv.innerHTML = `
        <p style="
          color:red;
          padding:15px;
        ">
          ❌ Chat load नहीं हुई।
          <br><br>
          ${error.message}
        </p>
      `;

    }

  );

}


// ======================================
// SHOW MESSAGE
// ======================================

function showMessage(data) {

  const box =
    document.createElement("div");


  const isMine =
    data.sender ===
    currentUser.uid;


  box.className =
    "message-box " +
    (
      isMine
        ? "my-message"
        : "friend-message"
    );


  // ==================================
  // TEXT
  // ==================================

  if (data.text) {

    const text =
      document.createElement("div");


    text.textContent =
      data.text;


    box.appendChild(
      text
    );

  }


  // ==================================
  // IMAGE
  // ==================================

  if (data.image) {

    const img =
      document.createElement("img");


    img.src =
      data.image;


    img.className =
      "message-image";


    img.alt =
      "Photo";


    if (data.text) {

      img.style.marginTop =
        "8px";

    }


    box.appendChild(
      img
    );

  }


  // ==================================
  // TIME
  // ==================================

  const bottom =
    document.createElement("div");


  bottom.className =
    "message-time";


  let timeText =
    "";


  if (data.time) {

    try {

      const date =
        data.time.toDate();


      timeText =
        date.toLocaleTimeString(
          [],
          {
            hour: "numeric",
            minute: "2-digit"
          }
        );

    } catch (e) {

      timeText =
        "";

    }

  }


  bottom.textContent =
    timeText;


  // ==================================
  // DOUBLE TICK
  // ==================================

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


// ======================================
// SCROLL BOTTOM
// ======================================

function scrollToBottom() {

  setTimeout(
    () => {

      messagesDiv.scrollTop =
        messagesDiv.scrollHeight;

    },
    50
  );

}


// ======================================
// SEND BUTTON
// ======================================

sendBtn.addEventListener(
  "click",
  sendMessage
);


// ======================================
// ENTER TO SEND
// ======================================

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


// ======================================
// SEND TEXT MESSAGE
// ======================================

async function sendMessage() {

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


  // ==================================
  // SAVE ORIGINAL TEXT
  // ==================================

  const originalText =
    text;


  try {

    sendBtn.disabled =
      true;


    sendBtn.textContent =
      "Sending...";


    // ==================================
    // CLEAR INPUT ONLY AFTER CLICK
    // ==================================

    messageInput.value =
      "";


    const chatId =
      getChatId(
        currentUser.uid,
        friendUid
      );


    // ==================================
    // FIRESTORE
    // ==================================

    await addDoc(

      collection(
        db,
        "chats",
        chatId,
        "messages"
      ),

      {

        text:
          originalText,

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


    messageInput.focus();


  } catch (error) {

    console.error(
      "MESSAGE ERROR:",
      error
    );


    // Message failed तो वापस input में
    messageInput.value =
      originalText;


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


// ======================================
// SEND PHOTO
// ======================================

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


  // ==================================
  // SIZE LIMIT
  // ==================================

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

    // ==================================
    // CLOUDINARY
    // ==================================

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


    if (!result.secure_url) {

      throw new Error(

        result.error?.message ||
        "Photo upload failed"

      );

    }


    // ==================================
    // SAVE IMAGE MESSAGE
    // ==================================

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


    console.log(
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