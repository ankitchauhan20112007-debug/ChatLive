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


    // Online status
    loadFriendStatus();


    // Messages
    loadMessages();


    // पुरानी unread messages को read करना
    markMessagesAsRead();

  }
);


// =====================================================
// LOAD FRIEND
// =====================================================

function loadFriend() {

  if (!friendUid) {
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
        return;
      }


      const data =
        snapshot.data();


      // NAME
      const name =
        data.name ||
        data.username ||
        data.displayName ||
        savedFriendName ||
        "User";


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


    },
    (error) => {

      console.error(
        "Friend error:",
        error
      );

    }
  );

}


// =====================================================
// FRIEND ONLINE STATUS
// =====================================================

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

        friendStatus.innerHTML = `
          <span style="
            display:inline-block;
            width:8px;
            height:8px;
            border-radius:50%;
            background:#25D366;
            margin-right:5px;
          "></span>
          online
        `;

      } else {

        friendStatus.innerHTML = `
          <span style="
            display:inline-block;
            width:8px;
            height:8px;
            border-radius:50%;
            background:#ccc;
            margin-right:5px;
          "></span>
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


// =====================================================
// LOAD MESSAGES
// =====================================================

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


// =====================================================
// SHOW MESSAGE
// =====================================================

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


  // ===================================================
  // TEXT
  // ===================================================

  if (data.text) {

    const text =
      document.createElement("div");


    text.textContent =
      data.text;


    text.style.cssText = `
      font-size:17px;
      word-break:break-word;
    `;


    box.appendChild(
      text
    );

  }


  // ===================================================
  // IMAGE
  // ===================================================

  if (data.image) {

    const img =
      document.createElement("img");


    img.src =
      data.image;


    img.alt =
      "Photo";


    img.className =
      "message-image";


    img.style.cssText = `
      display:block;
      width:100%;
      max-width:300px;
      border-radius:10px;
      margin-top:${data.text ? "7px" : "0"};
    `;


    box.appendChild(
      img
    );

  }


  // ===================================================
  // BOTTOM INFO
  // ===================================================

  const bottom =
    document.createElement("div");


  bottom.style.cssText = `
    display:flex;
    justify-content:flex-end;
    align-items:center;
    gap:3px;
    margin-top:5px;
  `;


  // TIME

  const time =
    document.createElement("span");


  let timeText =
    "";


  if (
    data.time &&
    data.time.toDate
  ) {

    const date =
      data.time.toDate();


    timeText =
      date.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      );

  }


  time.textContent =
    timeText;


  time.style.cssText = `
    font-size:10px;
    color:#777;
  `;


  bottom.appendChild(
    time
  );


  // ===================================================
  // TICKS
  // ===================================================

  if (isMine) {

    const ticks =
      document.createElement("span");


    ticks.textContent =
      "✓✓";


    ticks.style.cssText = `
      font-size:13px;
      color:#777;
    `;


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


// =====================================================
// MARK MESSAGES AS READ
// =====================================================

async function markMessagesAsRead() {

  if (!currentUser || !friendUid) {
    return;
  }


  try {

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


    const snapshot =
      await getDocs(
        messagesRef
      );


    const updates = [];


    snapshot.forEach(
      (messageDoc) => {

        const data =
          messageDoc.data();


        // Friend के messages को read करना
        if (
          data.sender === friendUid &&
          data.receiver === currentUser.uid &&
          data.read === false
        ) {

          updates.push(

            updateDoc(
              messageDoc.ref,
              {
                read: true
              }
            )

          );

        }

      }
    );


    await Promise.all(
      updates
    );


    console.log(
      "Messages marked as read ✅"
    );

  } catch (error) {

    console.error(
      "Read error:",
      error
    );

  }

}


// =====================================================
// SEND BUTTON
// =====================================================

if (sendBtn) {

  sendBtn.addEventListener(
    "click",
    sendMessage
  );

}


// =====================================================
// ENTER SEND
// =====================================================

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


// =====================================================
// SEND TEXT MESSAGE
// =====================================================

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


  // ===================================================
  // TEMPORARY MESSAGE
  // ===================================================

  const tempBox =
    document.createElement("div");


  tempBox.className =
    "message-box my-message";


  tempBox.style.cssText = `
    align-self:flex-end;
    background:#d9fdd3;
    opacity:.9;
  `;


  tempBox.innerHTML = `
    <div style="
      font-size:17px;
      word-break:break-word;
    ">
      ${escapeHTML(text)}
    </div>

    <div style="
      text-align:right;
      font-size:11px;
      color:#777;
      margin-top:4px;
    ">
      sending...
    </div>
  `;


  messagesDiv.appendChild(
    tempBox
  );


  messagesDiv.scrollTop =
    messagesDiv.scrollHeight;


  // Input खाली
  messageInput.value =
    "";


  messageInput.focus();


  try {

    sendBtn.disabled =
      true;


    const chatId =
      getChatId(
        currentUser.uid,
        friendUid
      );


    // =================================================
    // SAVE TO FIRESTORE
    // =================================================

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

        // IMPORTANT
        // नया message unread रहेगा
        read:
          false,

        time:
          serverTimestamp()

      }

    );


    console.log(
      "Message sent ✅"
    );


    // Firestore snapshot आने के बाद
    // temporary message हट जाएगा
    tempBox.remove();


  } catch (error) {

    console.error(
      "MESSAGE ERROR:",
      error
    );


    tempBox.innerHTML = `
      <div style="
        color:#b00000;
      ">
        ${escapeHTML(text)}
      </div>

      <div style="
        text-align:right;
        font-size:11px;
        color:red;
        margin-top:4px;
      ">
        ❌ Failed
      </div>
    `;


    alert(
      "Message send नहीं हुआ:\n\n" +
      error.message
    );

  }


  sendBtn.disabled =
    false;

}


// =====================================================
// SEND PHOTO
// =====================================================

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

    chatPhoto.value =
      "";

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

    // =================================================
    // UPLOADING
    // =================================================

    const tempBox =
      document.createElement("div");


    tempBox.className =
      "message-box my-message";


    tempBox.textContent =
      "📷 Uploading...";


    tempBox.style.cssText = `
      align-self:flex-end;
      background:#d9fdd3;
    `;


    messagesDiv.appendChild(
      tempBox
    );


    messagesDiv.scrollTop =
      messagesDiv.scrollHeight;


    // =================================================
    // CLOUDINARY
    // =================================================

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


    // =================================================
    // SAVE PHOTO MESSAGE
    // =================================================

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

        // IMPORTANT
        read:
          false,

        time:
          serverTimestamp()

      }

    );


    tempBox.remove();


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


    chatPhoto.value =
      "";

  }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(text) {

  const div =
    document.createElement("div");


  div.textContent =
    text;


  return div.innerHTML;

}