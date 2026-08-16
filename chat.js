import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


const friendsDiv =
  document.getElementById("friends");


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

  loadFriends(user);

});


// =========================
// LOAD FRIENDS
// =========================

function loadFriends(currentUser) {

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
          userDoc.id ===
          currentUser.uid
        ) {
          return;
        }


        count++;


        const friendUid =
          userDoc.id;


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
          background:white;
          margin:12px 0;
          padding:14px;
          border-radius:18px;
          display:flex;
          align-items:center;
          gap:12px;
          box-shadow:0 2px 8px rgba(0,0,0,.12);
          cursor:pointer;
          position:relative;
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
            width:60px;
            height:60px;
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
            width:60px;
            height:60px;
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


        info.appendChild(
          nameDiv
        );


        // =========================
        // ONLINE DOT
        // =========================

        const dot =
          document.createElement("span");


        dot.style.cssText = `
          display:block;
          width:6px;
          height:6px;
          border-radius:50%;
          background:${
            data.online === true
              ? "#00a000"
              : "#d3d3d3"
          };
          margin-top:7px;
        `;


        info.appendChild(
          dot
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


        card.appendChild(
          avatar
        );


        card.appendChild(
          info
        );


        card.appendChild(
          chatIcon
        );


        // =========================
        // UNREAD COUNT
        // =========================

        const unread =
          document.createElement("span");


        unread.style.cssText = `
          position:absolute;
          right:10px;
          top:10px;

          min-width:20px;
          height:20px;

          padding:0 6px;

          border-radius:10px;

          background:#25D366;
          color:white;

          display:none;

          align-items:center;
          justify-content:center;

          font-size:11px;
          font-weight:bold;
        `;


        card.appendChild(
          unread
        );


        // =========================
        // LOAD UNREAD
        // =========================

        loadUnreadCount(
          currentUser.uid,
          friendUid,
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


        friendsDiv.appendChild(
          card
        );

      });


      // =========================
      // NO FRIEND
      // =========================

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
// UNREAD COUNT
// =========================

function loadUnreadCount(
  myUid,
  friendUid,
  unreadElement
) {

  const chatId =
    getChatId(
      myUid,
      friendUid
    );


  const messagesRef =
    collection(
      db,
      "chats",
      chatId,
      "messages"
    );


  const unreadQuery =
    query(
      messagesRef,

      where(
        "receiver",
        "==",
        myUid
      ),

      where(
        "read",
        "==",
        false
      )
    );


  onSnapshot(
    unreadQuery,

    (snapshot) => {

      const count =
        snapshot.size;


      if (count > 0) {

        unreadElement.style.display =
          "flex";


        unreadElement.textContent =
          count > 99
            ? "99+"
            : count;

      } else {

        unreadElement.style.display =
          "none";

      }

    },

    (error) => {

      console.error(
        "Unread count error:",
        error
      );

      unreadElement.style.display =
        "none";

    }

  );

}


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