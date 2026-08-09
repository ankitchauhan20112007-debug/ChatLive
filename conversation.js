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

const messagesDiv =
  document.getElementById("messages");

const messageInput =
  document.getElementById("message");

const sendBtn =
  document.getElementById("sendBtn");

const photoBtn =
  document.getElementById("photoBtn");

const chatPhoto =
  document.getElementById("chatPhoto");


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
          padding:10px;
          border-radius:15px;
          max-width:75%;
          margin-left:${isMine ? "auto" : "0"};
          background:${isMine ? "#dcf8c6" : "#ffffff"};
          box-shadow:0 1px 3px rgba(0,0,0,.15);
        `;


        // PHOTO MESSAGE
        if (data.image) {

          const img =
            document.createElement("img");


          img.src =
            data.image;


          img.style.cssText = `
            width:100%;
            max-width:280px;
            border-radius:12px;
            display:block;
          `;


          box.appendChild(img);

        }


        // TEXT MESSAGE
        if (data.text) {

          const text =
            document.createElement("div");


          text.textContent =
            data.text;


          text.style.marginTop =
            data.image ? "7px" : "0";


          box.appendChild(text);

        }


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


// =========================
// SEND TEXT
// =========================

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


  if (!currentUser) return;


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
        sender: currentUser.uid,
        receiver: friendUid,
        time: serverTimestamp()
      }

    );


    messageInput.value = "";

    messageInput.focus();

  } catch (error) {

    console.error(error);

    alert(
      "Message send नहीं हुआ:\n" +
      error.message
    );

  }

}


// =========================
// PHOTO BUTTON
// =========================

photoBtn.addEventListener(
  "click",
  () => {

    chatPhoto.click();

  }
);


// =========================
// PHOTO SELECT
// =========================

chatPhoto.addEventListener(
  "change",
  async () => {

    const file =
      chatPhoto.files[0];


    if (!file) return;


    if (!currentUser) {
      alert("Please login first");
      return;
    }


    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {

      alert(
        "Photo 10 MB से छोटी होनी चाहिए।"
      );

      chatPhoto.value = "";

      return;
    }


    try {

      photoBtn.textContent =
        "⏳";


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


      const upload =
        await fetch(
          "https://api.cloudinary.com/v1_1/rmt792pr/image/upload",
          {
            method: "POST",
            body: formData
          }
        );


      const image =
        await upload.json();


      if (!image.secure_url) {

        throw new Error(
          "Photo upload failed"
        );

      }


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
          image: image.secure_url,
          sender: currentUser.uid,
          receiver: friendUid,
          time: serverTimestamp()
        }

      );


      chatPhoto.value = "";


    } catch (error) {

      console.error(
        "Photo error:",
        error
      );


      alert(
        "Photo send नहीं हुई:\n" +
        error.message
      );


    } finally {

      photoBtn.textContent =
        "📷";

    }

  }
);