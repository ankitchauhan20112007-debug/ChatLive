import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


// =========================
// FRIENDS ELEMENT
// =========================

const friendsDiv = document.getElementById("friends");

if (!friendsDiv) {
  console.error("friends element नहीं मिला");
}


// =========================
// LOGIN
// =========================

onAuthStateChanged(auth, (user) => {

  console.log("Auth user:", user);

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

  loadFriends(user);

});


// =========================
// LOAD FRIENDS
// =========================

function loadFriends(currentUser) {

  console.log("Loading friends...");

  onSnapshot(

    collection(db, "users"),

    (snapshot) => {

      console.log(
        "Users received:",
        snapshot.size
      );

      friendsDiv.innerHTML = "";

      let friendCount = 0;


      // =========================
      // EACH USER
      // =========================

      snapshot.forEach((userDoc) => {

        const friendUid = userDoc.id;


        // अपना account hide
        if (friendUid === currentUser.uid) {
          return;
        }


        friendCount++;


        const data = userDoc.data();


        // =========================
        // NAME
        // =========================

        const name =
          data.name ||
          data.username ||
          data.displayName ||
          "User";


        // =========================
        // CARD
        // =========================

        const card =
          document.createElement("div");


        card.style.cssText = `
          position:relative;

          background:#ffffff;

          margin:10px 0;

          padding:12px;

          border-radius:18px;

          display:flex;

          align-items:center;

          gap:12px;

          box-shadow:
            0 2px 8px rgba(0,0,0,.12);

          cursor:pointer;

          min-height:82px;
        `;


        // =========================
        // PROFILE PHOTO
        // =========================

        let avatar;


        if (data.photo) {

          avatar =
            document.createElement("img");


          avatar.src =
            data.photo;


          avatar.alt =
            "Profile";


          avatar.style.cssText = `
            width:58px;
            height:58px;

            border-radius:50%;

            object-fit:cover;

            background:#ddd;

            flex-shrink:0;
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

            font-size:28px;

            flex-shrink:0;
          `;

        }


        // =========================
        // INFO
        // =========================

        const info =
          document.createElement("div");


        info.style.cssText = `
          flex:1;
          min-width:0;
        `;


        // =========================
        // NAME
        // =========================

        const nameDiv =
          document.createElement("div");


        nameDiv.textContent =
          name;


        nameDiv.style.cssText = `
          font-size:18px;

          font-weight:bold;

          color:#222;

          white-space:nowrap;

          overflow:hidden;

          text-overflow:ellipsis;
        `;


        info.appendChild(nameDiv);


        // =========================
        // ONLINE STATUS
        // =========================

        const statusDiv =
          document.createElement("div");


        statusDiv.style.cssText = `
          display:flex;

          align-items:center;

          gap:5px;

          margin-top:5px;

          font-size:12px;

          color:#777;
        `;


        const onlineDot =
          document.createElement("span");


        onlineDot.style.cssText = `
          width:7px;

          height:7px;

          border-radius:50%;

          display:inline-block;

          background:${
            data.online === true
              ? "#00a000"
              : "#ccc"
          };
        `;


        const statusText =
          document.createElement("span");


        statusText.textContent =
          data.online === true
            ? "online"
            : "offline";


        statusDiv.appendChild(
          onlineDot
        );


        statusDiv.appendChild(
          statusText
        );


        info.appendChild(
          statusDiv
        );


        // =========================
        // CHAT ICON
        // =========================

        const chatIcon =
          document.createElement("div");


        chatIcon.textContent =
          "💬";


        chatIcon.style.cssText = `
          font-size:25px;

          flex-shrink:0;
        `;


        // =========================
        // UNREAD BADGE
        // =========================

        const unreadBadge =
          document.createElement("span");


        unreadBadge.style.cssText = `
          position:absolute;

          right:12px;

          top:10px;

          min-width:21px;

          height:21px;

          padding:0 6px;

          border-radius:20px;

          background:#25D366;

          color:white;

          font-size:12px;

          font-weight:bold;

          display:none;

          align-items:center;

          justify-content:center;
        `;


        card.appendChild(
          unreadBadge
        );


        // =========================
        // ADD ELEMENTS
        // =========================

        card.appendChild(
          avatar
        );


        card.appendChild(
          info
        );


        card.appendChild(
          chatIcon
        );


        friendsDiv.appendChild(
          card
        );


        // =========================
        // UNREAD MESSAGES
        // =========================

        loadUnreadCount(
          currentUser.uid,
          friendUid,
          unreadBadge
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

      });


      // =========================
      // NO FRIEND
      // =========================

      if (friendCount === 0) {

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


    // =========================
    // FIRESTORE ERROR
    // =========================

    (error) => {

      console.error(
        "Firestore error:",
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
// CHAT ID
// =========================

function getChatId(uid1, uid2) {

  return [uid1, uid2]
    .sort()
    .join("_");

}


// =========================
// UNREAD COUNT
// =========================

function loadUnreadCount(
  currentUid,
  friendUid,
  badge
) {

  const chatId =
    getChatId(
      currentUid,
      friendUid
    );


  const messagesRef =
    collection(
      db,
      "chats",
      chatId,
      "messages"
    );


  onSnapshot(

    messagesRef,

    (snapshot) => {

      let unreadCount = 0;


      snapshot.forEach(
        (messageDoc) => {

          const data =
            messageDoc.data();


          // सिर्फ friend के unread messages
          if (
            data.sender === friendUid &&
            data.receiver === currentUid &&
            data.read === false
          ) {

            unreadCount++;

          }

        }
      );


      // =========================
      // SHOW BADGE
      // =========================

      if (unreadCount > 0) {

        badge.textContent =
          unreadCount > 99
            ? "99+"
            : unreadCount;


        badge.style.display =
          "flex";

      } else {

        badge.style.display =
          "none";

      }

    },


    (error) => {

      console.error(
        "Unread error:",
        error
      );

    }

  );

}