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


// Friend selected नहीं है
if (!friendUid) {
  window.location.href = "chat.html";
}


// Friend nameif (friendName) {
  friendName.textContent =
    savedFriendName || "Friend";
}

// =========================
// LOGIN
// =========================

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

 currentUser = user;

loadFriendStatus();
async function loadFriendStatus() {

  if (!friendStatus) return;

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
        friendStatus.innerHTML = "";
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

      friendStatus.innerHTML = "";

    }
  );

}

loadMessages();

});


// =========================
// CHAT ID
// =========================

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


          box.appendChild(img);

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
            margin-top:${data.image ? "8px" : "0"};
            word-break:break-word;
          `;


          box.appendChild(text);

        }


        messagesDiv.appendChild(box);

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

  const text = messageInput.value.trim();

  if (!text) {
    alert("Message लिखो");
    return;
  }

  if (!currentUser) {
    alert("Please login first");
    return;
  }

  if (!friendUid) {
    alert("Friend select नहीं है");
    return;
  }

  try {

    sendBtn.disabled = true;
    sendBtn.textContent = "Sending...";

    const chatId = getChatId(
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
        sender: currentUser.uid,
        receiver: friendUid,
        time: serverTimestamp()
      }
    );

    messageInput.value = "";

    messageInput.focus();

    console.log("Message sent successfully");

  } catch (error) {

    console.error("MESSAGE ERROR:", error);

    alert(
      "Message send नहीं हुआ:\n\n" +
      error.message
    );

  } finally {

    sendBtn.disabled = false;
    sendBtn.textContent = "Send";

  }

}


    messageInput.value = "";

    messageInput.focus();


  } catch (error) {

    console.error(
      "Message error:",
      error
    );


    alert(
      "Message send नहीं हुआ:\n" +
      error.message
    );

  }

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

        alert("Please login first");

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

        chatPhoto.value = "";

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

          console.error(result);

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


        chatPhoto.value = "";


        alert(
          "Photo sent ✅"
        );


      } catch (error) {

        console.error(
          "PHOTO ERROR:",
          error
        );


        alert(
          "Photo send नहीं हुई:\n" +
          error.message
        );


      }

    }
  );

}