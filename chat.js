import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


const friendsDiv =
  document.getElementById("friends");


let currentUser = null;


// =========================
// CHAT ID
// =========================

function getChatId(uid1, uid2) {

  return [uid1, uid2]
    .sort()
    .join("_");

}


// =========================
// LOGIN
// =========================

onAuthStateChanged(auth, (user) => {

  if (!user) {

    friendsDiv.innerHTML = `
      <p style="
        text-align:center;
        color:#777;
        margin-top:30px;
      ">
        Please login first.
      </p>
    `;

    return;

  }

  currentUser = user;

  loadFriends();

});


// =========================
// LOAD FRIENDS
// =========================

function loadFriends() {

  onSnapshot(
    collection(db, "users"),

    (snapshot) => {

      friendsDiv.innerHTML = "";

      let count = 0;


      snapshot.forEach((userDoc) => {

        const data =
          userDoc.data();


        // अपना account hide
        if (
          userDoc.id === currentUser.uid
        ) {
          return;
        }


        count++;


        createFriendCard(
          userDoc.id,
          data
        );

      });


      if (count === 0) {

        friendsDiv.innerHTML = `
          <p style="
            text-align:center;
            color:#777;
            margin-top:30px;
          ">
            कोई friend नहीं मिला।
          </p>
        `;

      }

    },

    (error) => {

      console.error(
        "Users error:",
        error
      );

      friendsDiv.innerHTML = `
        <div style="
          background:#ffe5e5;
          color:#b00000;
          padding:15px;
          border-radius:12px;
          margin-top:20px;
        ">
          ❌ Friends load नहीं हुए।
          <br><br>
          ${error.message}
        </div>
      `;

    }

  );

}


// =========================
// FRIEND CARD
// =========================

function createFriendCard(
  friendUid,
  data
) {

  const card =
    document.createElement("div");


  card.style.cssText = `
    background:white;
    margin:10px 0;
    padding:12px;
    border-radius:18px;

    display:flex;
    align-items:center;

    gap:12px;

    box-shadow:
      0 2px 8px rgba(0,0,0,.12);

    cursor:pointer;
  `;


  // =========================
  // PHOTO
  // =========================

  const photo =
    data.photo || "";


  let avatar;


  if (photo) {

    avatar =
      document.createElement("img");

    avatar.src =
      photo;

    avatar.style.cssText = `
      width:58px;
      height:58px;

      border-radius:50%;

      object-fit:cover;

      flex-shrink:0;

      background:#ddd;
    `;


    avatar.onerror = () => {

      avatar.src =
        "https://via.placeholder.com/60";

    };

  } else {

    avatar =
      document.createElement("div");

    avatar.textContent =
      "👤";

    avatar.style.cssText = `
      width:58px;
      height:58px;

      border-radius:50%;

      background:#ddd;

      display:flex;

      align-items:center;
      justify-content:center;

      font-size:27px;

      flex-shrink:0;
    `;

  }


  // =========================
  // NAME
  // =========================

  const name =
    data.name ||
    data.username ||
    data.displayName ||
    "User";


  // =========================
  // INFO
  // =========================

  const info =
    document.createElement("div");


  info.style.cssText = `
    flex:1;
    min-width:0;
  `;


  const nameDiv =
    document.createElement("div");


  nameDiv.textContent =
    name;


  nameDiv.style.cssText = `
    font-size:17px;
    font-weight:bold;

    color:#222;

    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  `;


  // =========================
  // LAST MESSAGE
  // =========================

  const lastMessage =
    document.createElement("div");


  lastMessage.textContent =
    "No messages yet";


  lastMessage.style.cssText = `
    font-size:14px;
    color:#777;

    margin-top:5px;

    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  `;


  info.appendChild(nameDiv);

  info.appendChild(lastMessage);


  // =========================
  // RIGHT SIDE
  // =========================

  const right =
    document.createElement("div");


  right.style.cssText = `
    display:flex;

    flex-direction:column;

    align-items:flex-end;

    gap:7px;

    flex-shrink:0;
  `;


  // Online dot

  const dot =
    document.createElement("span");


  dot.style.cssText = `
    width:6px;
    height:6px;

    border-radius:50%;

    background:${
      data.online === true
        ? "#00a000"
        : "#d3d3d3"
    };
  `;


  // =========================
  // UNREAD COUNT
  // =========================

  const unread =
    document.createElement("span");


  unread.style.cssText = `
    display:none;

    min-width:20px;
    height:20px;

    padding:0 5px;

    border-radius:50%;

    background:#25D366;

    color:white;

    font-size:12px;
    font-weight:bold;

    align-items:center;
    justify-content:center;
  `;


  right.appendChild(dot);

  right.appendChild(unread);


  card.appendChild(avatar);

  card.appendChild(info);

  card.appendChild(right);


  // =========================
  // LOAD CHAT PREVIEW
  // =========================

  loadChatPreview(
    friendUid,
    lastMessage,
    unread
  );


  // =========================
  // OPEN CHAT
  // =========================

  card.addEventListener(
    "click",
    () => {

      localStorage.setItem(
        "chatFriendUid",
        friendUid
      );


      localStorage.setItem(
        "chatFriendName",
        name
      );


      window.location.href =
        "conversation.html";

    }
  );


  friendsDiv.appendChild(card);

}


// =========================
// LOAD CHAT PREVIEW
// =========================

function loadChatPreview(
  friendUid,
  lastMessage,
  unread
) {

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
      orderBy("time", "desc")
    );


  onSnapshot(
    messagesQuery,

    (snapshot) => {

      if (snapshot.empty) {

        lastMessage.textContent =
          "No messages yet";

        unread.style.display =
          "none";

        return;

      }


      // =========================
      // LAST MESSAGE
      // =========================

      const latest =
        snapshot.docs[0].data();


      if (latest.image) {

        lastMessage.textContent =
          "📷 Photo";

      } else {

        lastMessage.textContent =
          latest.text ||
          "Message";

      }


      // =========================
      // UNREAD
      // =========================

      let unreadCount = 0;


      snapshot.forEach(
        (messageDoc) => {

          const message =
            messageDoc.data();


          if (
            message.sender !==
              currentUser.uid &&
            message.read !== true
          ) {

            unreadCount++;

          }

        }
      );


      if (unreadCount > 0) {

        unread.textContent =
          unreadCount > 99
            ? "99+"
            : unreadCount;

        unread.style.display =
          "flex";

      } else {

        unread.style.display =
          "none";

      }

    },

    (error) => {

      console.error(
        "Chat preview error:",
        error
      );

      lastMessage.textContent =
        "Unable to load";

    }

  );

}