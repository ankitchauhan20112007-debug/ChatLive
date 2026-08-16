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


// =====================================
// ELEMENTS
// =====================================

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


// =====================================
// FRIEND DATA
// =====================================

const friendUid =
  localStorage.getItem("chatFriendUid");

const savedFriendName =
  localStorage.getItem("chatFriendName");


let currentUser = null;


// =====================================
// CHECK FRIEND
// =====================================

if (!friendUid) {

  alert("Friend select नहीं है");

  window.location.href =
    "chat.html";

}


// =====================================
// CHAT ID
// =====================================

function getChatId(uid1, uid2) {

  return [uid1, uid2]
    .sort()
    .join("_");

}


// =====================================
// LOGIN
// =====================================

onAuthStateChanged(
  auth,
  async (user) => {

    console.log("AUTH:", user);

    if (!user) {

      window.location.href =
        "index.html";

      return;

    }

    currentUser = user;

    console.log(
      "Current UID:",
      currentUser.uid
    );


    // Friend information
    await loadFriend();


    // Online status
    loadFriendStatus();


    // Messages
    loadMessages();

  }
);


// =====================================
// LOAD FRIEND
// =====================================

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

      if (friendName) {
        friendName.textContent =
          savedFriendName || "User";
      }

      if (friendStatus) {
        friendStatus.textContent =
          "offline";
      }

      return;

    }


    const data =
      snapshot.data();


    const name =
      data.name ||
      data.username ||
      data.displayName ||
      savedFriendName ||
      "User";


    // NAME
    if (friendName) {

      friendName.textContent =
        name;

    }


    // PHOTO
    if (
      friendPhoto &&
      data.photo
    ) {

      friendPhoto.src =
        data.photo;

    }


    // PHOTO ERROR
    if (friendPhoto) {

      friendPhoto.onerror =
        () => {

          friendPhoto.src =
            "https://via.placeholder.com/100";

        };

    }

  } catch (error) {

    console.error(
      "FRIEND ERROR:",
      error
    );


    if (friendName) {

      friendName.textContent =
        savedFriendName ||
        "User";

    }

  }

}


// =====================================
// FRIEND ONLINE STATUS
// =====================================

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
          "offline";

        return;

      }


      const data =
        snapshot.data();


      if (data.online === true) {

        friendStatus.innerHTML =
          `<span style="
            color:#25D366;
            font-size:13px;
          ">●</span> online`;

      } else {

        friendStatus.innerHTML =
          `<span style="
            color:#d3d3d3;
            font-size:13px;
          ">●</span> offline`;

      }

    },

    (error) => {

      console.error(
        "STATUS ERROR:",
        error
      );

      friendStatus.textContent =
        "offline";

    }

  );

}


// =====================================
// LOAD MESSAGES
// =====================================

function loadMessages() {

  if (!messagesDiv) {
    return;
  }


  const chatId =
    getChatId(
      currentUser.uid,
      friendUid
    );


  console.log(
    "CHAT ID:",
    chatId
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


      messagesDiv.scrollTop =
        messagesDiv.scrollHeight;

    },

    (error) => {

      console.error(
        "MESSAGES ERROR:",
        error
      );


      messagesDiv.innerHTML = `
        <div style="
          padding:20px;
          color:red;
          text-align:center;
        ">
          Chat load नहीं हुई।
          <br><br>
          ${error.message}
        </div>
      `;

    }

  );

}


// =====================================
// SHOW MESSAGE
// =====================================

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


  // ===================================
  // IMAGE
  // ===================================

  if (data.image) {

    const img =
      document.createElement("img");


    img.src =
      data.image;


    img.className =
      "message-image";


    img.alt =
      "Photo";


    box.appendChild(img);

  }


  // ===================================
  // TEXT
  // ===================================

  if (data.text) {

    const text =
      document.createElement("div");


    text.textContent =
      data.text;


    box.appendChild(text);

  }


  // ===================================
  // TIME + TICKS
  // ===================================

  const bottom =
    document.createElement("div");


  bottom.className =
    "message-time";


  let timeText = "";


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

  }


  bottom.innerHTML =
    timeText +
    (
      isMine
        ? ` <span class="ticks">✓✓</span>`
        : ""
    );


  box.appendChild(
    bottom
  );


  messagesDiv.appendChild(
    box
  );

}


// =====================================
// SEND BUTTON
// =====================================

if (sendBtn) {

  sendBtn.addEventListener(
    "click",
    () => {

      sendMessage();

    }
  );

}


// =====================================
// ENTER KEY
// =====================================

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


// =====================================
// SEND MESSAGE
// =====================================

async function sendMessage() {

  if (!messageInput) {
    return;
  }


  const text =
    messageInput.value.trim();


  // खाली message नहीं
  if (!text) {
    return;
  }


  // Login check
  if (!currentUser) {

    alert(
      "Please login first"
    );

    return;

  }


  // Friend check
  if (!friendUid) {

    alert(
      "Friend select नहीं है"
    );

    return;

  }


  // ===================================
  // SAVE ORIGINAL TEXT
  // ===================================

  const originalText =
    text;


  // ===================================
  // BUTTON LOCK
  // ===================================

  if (sendBtn) {

    sendBtn.disabled =
      true;

    sendBtn.style.opacity =
      "0.6";

  }


  // ===================================
  // TEMP MESSAGE
  // ===================================

  const tempBox =
    document.createElement("div");


  tempBox.className =
    "message-box my-message";


  tempBox.innerHTML = `

    <div>
      ${escapeHTML(originalText)}
    </div>

    <div
      class="message-time"
      style="opacity:.6;"
    >
      Sending...
    </div>

  `;


  messagesDiv.appendChild(
    tempBox
  );


  messagesDiv.scrollTop =
    messagesDiv.scrollHeight;


  try {

    const chatId =
      getChatId(
        currentUser.uid,
        friendUid
      );


    console.log(
      "Sending to:",
      chatId
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
          originalText,

        sender:
          currentUser.uid,

        receiver:
          friendUid,

        time:
          serverTimestamp()

      }

    );


    // =================================
    // SUCCESS
    // =================================

    messageInput.value =
      "";


    messageInput.focus();


    tempBox.remove();


    console.log(
      "MESSAGE SENT ✅"
    );

  } catch (error) {

    console.error(
      "MESSAGE SEND ERROR:",
      error
    );


    // Sending box को failed दिखाओ
    tempBox.innerHTML = `

      <div>
        ${escapeHTML(originalText)}
      </div>

      <div
        class="message-time"
        style="color:red;"
      >
        Failed ❌
      </div>

    `;


    alert(
      "Message send नहीं हुआ:\n\n" +
      error.message
    );

  }


  // ===================================
  // BUTTON UNLOCK
  // ===================================

  if (sendBtn) {

    sendBtn.disabled =
      false;

    sendBtn.style.opacity =
      "1";

  }

}


// =====================================
// HTML ESCAPE
// =====================================

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}


// =====================================
// SEND PHOTO
// =====================================

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


  // 10 MB limit
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


  // ===================================
  // BUTTON DISABLE
  // ===================================

  if (sendBtn) {

    sendBtn.disabled =
      true;

    sendBtn.style.opacity =
      "0.6";

  }


  try {

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


    // =================================
    // CLOUDINARY
    // =================================

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


    // =================================
    // FIRESTORE
    // =================================

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
      "PHOTO SENT ✅"
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


  if (sendBtn) {

    sendBtn.disabled =
      false;

    sendBtn.style.opacity =
      "1";

  }

}