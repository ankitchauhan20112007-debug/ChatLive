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


// ===============================
// ELEMENTS
// ===============================

const friendPhoto = document.getElementById("friendPhoto");
const friendName = document.getElementById("friendName");
const friendStatus = document.getElementById("friendStatus");

const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const chatPhoto = document.getElementById("chatPhoto");


// ===============================
// FRIEND
// ===============================

const friendUid =
  localStorage.getItem("chatFriendUid");

const savedFriendName =
  localStorage.getItem("chatFriendName");


let currentUser = null;


if (!friendUid) {
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

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "index.html";
    return;

  }

  currentUser = user;

  await loadFriendProfile();

  loadFriendStatus();

  loadMessages();

});


// ===============================
// FRIEND PROFILE
// ===============================

async function loadFriendProfile() {

  try {

    const userRef =
      doc(db, "users", friendUid);

    const snapshot =
      await getDoc(userRef);


    if (!snapshot.exists()) {

      friendName.textContent =
        savedFriendName || "Friend";

      return;

    }


    const data =
      snapshot.data();


    friendName.textContent =
      data.name ||
      data.username ||
      data.displayName ||
      savedFriendName ||
      "Friend";


    if (data.photo) {

      friendPhoto.src =
        data.photo;

    }

  } catch (error) {

    console.error(
      "Profile error:",
      error
    );

    friendName.textContent =
      savedFriendName || "Friend";

  }

}


// ===============================
// ONLINE STATUS
// ===============================

function loadFriendStatus() {

  const friendRef =
    doc(db, "users", friendUid);


  onSnapshot(
    friendRef,

    (snapshot) => {

      if (!snapshot.exists()) {
        return;
      }


      const data =
        snapshot.data();


      const color =
        data.online === true
          ? "#00c853"
          : "#bdbdbd";


      friendStatus.innerHTML = `

        <span
          style="
            display:inline-block;
            width:6px;
            height:6px;
            border-radius:50%;
            background:${color};
            margin-right:4px;
          "
        ></span>

        ${data.online === true ? "online" : "offline"}

      `;

    },

    (error) => {

      console.error(
        "Status error:",
        error
      );

    }
  );

}


// ===============================
// LOAD MESSAGES
// ===============================

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


        showMessage(data);

      });


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
            padding:15px;
            color:#b00000;
            background:#ffe5e5;
            border-radius:10px;
          "
        >

          ❌ Messages load नहीं हुए।

          <br><br>

          ${error.message}

        </div>

      `;

    }

  );

}


// ===============================
// SHOW MESSAGE
// ===============================

function showMessage(data) {

  const box =
    document.createElement("div");


  const isMine =
    data.sender === currentUser.uid;


  box.className =
    "message-box " +
    (isMine
      ? "my-message"
      : "friend-message");


  // ===============================
  // PHOTO
  // ===============================

  if (data.image) {

    const img =
      document.createElement("img");


    img.src =
      data.image;

    img.className =
      "message-image";


    img.onload = () => {

      messagesDiv.scrollTop =
        messagesDiv.scrollHeight;

    };


    box.appendChild(img);

  }


  // ===============================
  // TEXT
  // ===============================

  if (data.text) {

    const text =
      document.createElement("div");


    text.textContent =
      data.text;


    if (data.image) {

      text.style.marginTop =
        "6px";

    }


    box.appendChild(text);

  }


  // ===============================
  // TIME + TICKS
  // ===============================

  const bottom =
    document.createElement("div");


  bottom.className =
    "message-time";


  let timeText = "";

  if (data.time && data.time.toDate) {

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


  bottom.textContent =
    timeText;


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


// ===============================
// SEND BUTTON
// ===============================

sendBtn.addEventListener(
  "click",
  sendMessage
);


// ===============================
// ENTER TO SEND
// ===============================

messageInput.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {

      event.preventDefault();

      sendMessage();

    }

  }
);


// ===============================
// SEND MESSAGE
// ===============================

async function sendMessage() {

  const text =
    messageInput.value.trim();


  if (!text) {
    return;
  }


  if (!currentUser) {

    alert("Please login first");
    return;

  }


  try {

    sendBtn.disabled =
      true;


    // Text पहले ही input में दिखाई देता है
    // इसलिए save होने तक input को खाली नहीं करेंगे


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

        text: text,

        sender:
          currentUser.uid,

        receiver:
          friendUid,

        time:
          serverTimestamp()

      }

    );


    // Save होने के बाद input clear
    messageInput.value = "";

    messageInput.focus();


  } catch (error) {

    console.error(
      "MESSAGE ERROR:",
      error
    );


    alert(
      "Message send नहीं हुआ:\n\n" +
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

      const file = chatPhoto.files[0];

      if (!file) {
        return;
      }

      if (!currentUser) {
        alert("Please login first");
        chatPhoto.value = "";
        return;
      }

      // 10 MB limit
      if (file.size > 10 * 1024 * 1024) {

        alert("Photo 10 MB से छोटी होनी चाहिए।");

        chatPhoto.value = "";

        return;
      }

      try {

        // =========================
        // SEND BUTTON LOADING
        // =========================

        if (sendBtn) {

          sendBtn.disabled = true;

          sendBtn.textContent = "⏳";

        }


        // =========================
        // CLOUDINARY
        // =========================

        const formData = new FormData();

        formData.append(
          "file",
          file
        );

        formData.append(
          "upload_preset",
          "swlqxqgn"
        );


        const response = await fetch(
          "https://api.cloudinary.com/v1_1/rmt792pr/image/upload",
          {
            method: "POST",
            body: formData
          }
        );


        const result =
          await response.json();


        console.log(
          "Cloudinary:",
          result
        );


        if (!result.secure_url) {

          throw new Error(
            result.error?.message ||
            "Photo upload failed"
          );

        }


        // =========================
        // FIRESTORE
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


        // Clear selected photo
        chatPhoto.value = "";


        console.log(
          "Photo sent successfully ✅"
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

      } finally {

        // =========================
        // RESTORE SEND ARROW
        // =========================

        if (sendBtn) {

          sendBtn.disabled = false;

          sendBtn.textContent = "➤";

        }

      }

    }
  );

}