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
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


/* =========================
   ELEMENTS
========================= */

const messagesDiv =
  document.getElementById("messages");

const messageInput =
  document.getElementById("message");

const sendBtn =
  document.getElementById("sendBtn");

const friendName =
  document.getElementById("friendName");

const friendPhoto =
  document.getElementById("friendPhoto");

const friendStatus =
  document.getElementById("friendStatus");

const menuBtn =
  document.getElementById("menuBtn");

const chatMenu =
  document.getElementById("chatMenu");

const searchBtn =
  document.getElementById("searchBtn");

const searchBox =
  document.getElementById("searchBox");

const searchInput =
  document.getElementById("searchInput");

const mediaBtn =
  document.getElementById("mediaBtn");

const muteBtn =
  document.getElementById("muteBtn");

const clearChatBtn =
  document.getElementById("clearChatBtn");

const chatPhoto =
  document.getElementById("chatPhoto");


/* =========================
   FRIEND DATA
========================= */

const friendUid =
  localStorage.getItem("chatFriendUid");

const savedFriendName =
  localStorage.getItem("chatFriendName");


if (!friendUid) {

  alert("Friend select नहीं हुआ।");

  window.location.href = "chat.html";
}


/* =========================
   CHAT ID
========================= */

function getChatId(uid1, uid2) {

  return [uid1, uid2]
    .sort()
    .join("_");

}


/* =========================
   AUTH
========================= */

onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href = "index.html";

    return;
  }

  loadFriend();

  loadMessages(user);

});


/* =========================
   FRIEND INFO
========================= */

function loadFriend() {

  friendName.textContent =
    savedFriendName || "User";

  friendStatus.textContent =
    "Checking...";


  const friendRef =
    doc(db, "users", friendUid);


  onSnapshot(friendRef, (snap) => {

    if (!snap.exists()) return;


    const data =
      snap.data();


    friendName.textContent =
      data.name ||
      data.username ||
      data.displayName ||
      savedFriendName ||
      "User";


    if (data.photo) {

      friendPhoto.src =
        data.photo;

    }


    if (data.online === true) {

      friendStatus.textContent =
        "online";

      friendStatus.style.color =
        "#25D366";

    } else {

      friendStatus.textContent =
        "offline";

      friendStatus.style.color =
        "#ddd";

    }

  });

}


/* =========================
   LOAD MESSAGES
========================= */

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
      orderBy("createdAt", "asc")
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
            currentUser.uid
          );


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


      applySearch();


      setTimeout(() => {

        messagesDiv.scrollTop =
          messagesDiv.scrollHeight;

      }, 50);

    },

    (error) => {

      console.error(
        "Messages error:",
        error
      );

    }

  );

}


/* =========================
   CREATE MESSAGE
========================= */

function createMessage(
  data,
  currentUid
) {

  const box =
    document.createElement("div");


  box.className =
    data.sender === currentUid
      ? "message-box my-message"
      : "message-box friend-message";


  if (data.text) {

    const text =
      document.createElement("div");

    text.textContent =
      data.text;

    box.appendChild(text);

  }


  if (data.image) {

    const image =
      document.createElement("img");

    image.src =
      data.image;

    image.className =
      "message-image";

    image.loading =
      "lazy";

    box.appendChild(image);

  }


  const bottom =
    document.createElement("div");

  bottom.className =
    "message-bottom";


  let timeText = "";


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

    } catch (error) {

      timeText = "";

    }

  }


  bottom.textContent =
    timeText;


  if (data.sender === currentUid) {

    const ticks =
      document.createElement("span");


    ticks.className =
      "ticks";


    ticks.textContent =
      data.read
        ? "✓✓"
        : "✓";


    ticks.style.color =
      data.read
        ? "#128CDB"
        : "#777";


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


/* =========================
   SEND TEXT MESSAGE
========================= */

async function sendMessage() {

  const currentUser =
    auth.currentUser;


  if (!currentUser) {

    alert("Please login first.");

    return;
  }


  const text =
    messageInput.value.trim();


  if (!text) return;


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


/* =========================
   SEND BUTTON
========================= */

if (sendBtn) {

  sendBtn.addEventListener(
    "click",
    sendMessage
  );

}


/* =========================
   ENTER SEND
========================= */

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


/* =========================
   MARK AS READ
========================= */

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

/* =========================
   THREE DOT MENU
========================= */

if (menuBtn && chatMenu) {

  menuBtn.addEventListener("click", (event) => {

    event.preventDefault();
    event.stopPropagation();

    chatMenu.classList.toggle("show");

  });

}


/* =========================
   CLOSE MENU
========================= */

document.addEventListener("click", (event) => {

  if (
    chatMenu &&
    !chatMenu.contains(event.target) &&
    event.target !== menuBtn
  ) {

    chatMenu.classList.remove("show");

  }

});


/* =========================
   SEARCH BUTTON
========================= */

if (searchBtn) {

  searchBtn.addEventListener("click", () => {

    if (chatMenu) {
      chatMenu.classList.remove("show");
    }

    if (!searchBox || !searchInput) return;

    if (searchBox.style.display === "block") {

      searchBox.style.display = "none";
      searchInput.value = "";

      applySearch();

    } else {

      searchBox.style.display = "block";
      searchInput.focus();

    }

  });

}


/* =========================
   SEARCH
========================= */

if (searchInput) {

  searchInput.addEventListener("input", () => {

    applySearch();

  });

}


function applySearch() {

  if (!messagesDiv || !searchInput) return;

  const search =
    searchInput.value.trim().toLowerCase();

  const allMessages =
    document.querySelectorAll(".message-box");

  allMessages.forEach((message) => {

    const text =
      message.textContent.toLowerCase();

    message.style.display =
      search === "" || text.includes(search)
        ? ""
        : "none";

  });

}


/* =========================
   MEDIA
========================= */

if (mediaBtn) {

  mediaBtn.addEventListener("click", () => {

    if (chatMenu) {
      chatMenu.classList.remove("show");
    }

    const images =
      document.querySelectorAll(".message-image");

    if (images.length === 0) {

      alert("इस chat में अभी कोई photo नहीं है।");
      return;

    }

    images[0].scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  });

}


/* =========================
   MUTE
========================= */

let isMuted =
  localStorage.getItem("chatMuted_" + friendUid) === "true";


function updateMuteButton() {

  if (!muteBtn) return;

  muteBtn.textContent =
    isMuted ? "🔔 Unmute" : "🔕 Mute";

}


if (muteBtn) {

  updateMuteButton();

  muteBtn.addEventListener("click", () => {

    isMuted = !isMuted;

    localStorage.setItem(
      "chatMuted_" + friendUid,
      isMuted
    );

    updateMuteButton();

    if (chatMenu) {
      chatMenu.classList.remove("show");
    }

  });

}


/* =========================
   CLEAR CHAT
========================= */

if (clearChatBtn) {

  clearChatBtn.addEventListener("click", async () => {

    if (chatMenu) {
      chatMenu.classList.remove("show");
    }

    const currentUser = auth.currentUser;

    if (!currentUser) return;

    const confirmClear = confirm(
      "क्या आप इस chat के सारे messages हटाना चाहते हैं?"
    );

    if (!confirmClear) return;

    const chatId =
      getChatId(currentUser.uid, friendUid);

    const messagesRef =
      collection(
        db,
        "chats",
        chatId,
        "messages"
      );

    try {

      const snapshot =
        await new Promise((resolve, reject) => {

          const unsubscribe = onSnapshot(
            messagesRef,
            (snap) => {
              unsubscribe();
              resolve(snap);
            },
            reject
          );

        });

      for (const messageDoc of snapshot.docs) {

        await deleteDoc(
          doc(
            db,
            "chats",
            chatId,
            "messages",
            messageDoc.id
          )
        );

      }

    } catch (error) {

      console.error(
        "Clear chat error:",
        error
      );

      alert(
        "Chat clear नहीं हुई:\n" +
        error.message
      );

    }

  });

}