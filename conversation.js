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


// =========================
// ELEMENTS
// =========================

const friendStatus =
  document.getElementById("friendStatus");

const friendName =
  document.getElementById("friendName");

const messagesDiv =
  document.getElementById("messages");

const messageInput =
  document.getElementById("message");

const sendBtn =
  document.getElementById("sendBtn");

const chatPhoto =
  document.getElementById("chatPhoto");


// =========================
// FRIEND
// =========================

const friendUid =
  localStorage.getItem("chatFriendUid");

const savedFriendName =
  localStorage.getItem("chatFriendName");


let currentUser = null;


// =========================
// CHECK FRIEND
// =========================

if (!friendUid) {

  window.location.href =
    "chat.html";

}


// =========================
// FRIEND NAME
// =========================

if (friendName) {

  friendName.textContent =
    savedFriendName || "Friend";

}


// =========================
// LOGIN
// =========================

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


// =========================
// CHAT ID
// =========================

function getChatId(
  uid1,
  uid2
) {

  return [
    uid1,
    uid2
  ]
    .sort()
    .join("_");

}


// =========================
// FRIEND STATUS
// =========================

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


// =========================
// LOAD MESSAGES
// =========================

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

        <p
          style="
            color:red;
            padding:10px;
          "
        >

          ❌ Chat load नहीं हुई।

          <br><br>

          ${error.message}

        </p>

      `;

    }

  );

}


// =========================
// SHOW MESSAGE
// =========================

function showMessage(
  data,
  messageId
) {

  const box =
    document.createElement("div");


  const isMine =
    data.sender ===
    currentUser.uid;


  box.dataset.messageId =
    messageId;


  box.style.cssText = `

    margin:8px 0;

    padding:10px;

    border-radius:15px;

    max-width:75%;

    margin-left:
      ${isMine ? "auto" : "0"};

    background:
      ${isMine
        ? "#dcf8c6"
        : "#ffffff"};

    box-shadow:
      0 1px 3px
      rgba(0,0,0,.15);

    word-break:break-word;

  `;


  // =========================
  // PHOTO
  // =========================

  if (data.image) {

    const img =
      document.createElement("img");


    img.src =
      data.image;


    img.alt =
      "Photo";


    img.style.cssText = `

      width:100%;

      max-width:280px;

      border-radius:12px;

      display:block;

      object-fit:cover;

    `;


    box.appendChild(
      img
    );

  }


  // =========================
  // TEXT
  // =========================

  if (data.text) {

    const text =
      document.createElement("div");


    text.textContent =
      data.text;


    text.style.cssText = `

      margin-top:
        ${data.image
          ? "8px"
          : "0"};

    `;


    box.appendChild(
      text
    );

  }


  // =========================
  // TICK
  // =========================

  if (isMine) {

    const tick =
      document.createElement("span");


    tick.textContent =
      " ✓✓";


    tick.style.cssText = `

      float:right;

      font-size:11px;

      color:#777;

      margin-top:5px;

    `;


    box.appendChild(
      tick
    );

  }


  messagesDiv.appendChild(
    box
  );

}


// =========================
// SEND BUTTON
// =========================

if (sendBtn) {

  sendBtn.addEventListener(
    "click",
    sendMessage
  );

}


// =========================
// ENTER SEND
// =========================

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


// =========================
// SEND MESSAGE
// =========================

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


  // =========================
  // SHOW IMMEDIATELY
  // =========================

  const tempBox =
    document.createElement("div");


  tempBox.style.cssText = `

    margin:8px 0;

    padding:10px;

    border-radius:15px;

    max-width:75%;

    margin-left:auto;

    background:#dcf8c6;

    box-shadow:
      0 1px 3px
      rgba(0,0,0,.15);

    word-break:break-word;

  `;


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


    // Temporary message हटाओ
    tempBox.remove();


    console.log(
      "Message saved ✅"
    );


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
      "Message save नहीं हुआ:\n\n" +
      error.message
    );

  }


  sendBtn.disabled =
    false;

}


// =========================
// SEND PHOTO
// =========================

if (chatPhoto) {

  chatPhoto.addEventListener(
    "change",
    async () => {

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


      // 10 MB
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


        // =========================
        // CLOUDINARY
        // =========================

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


        // =========================
        // SAVE PHOTO MESSAGE
        // =========================

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
  );

}