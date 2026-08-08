import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const friendsDiv = document.getElementById("friends");

let currentUser = null;

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  loadFriends();

});


function loadFriends() {

  onSnapshot(
    collection(db, "users"),

    (snapshot) => {

      friendsDiv.innerHTML = "";

      let foundFriend = false;

      snapshot.forEach((userDoc) => {

        const data = userDoc.data();

        // खुद को list में नहीं दिखाना
        if (
          currentUser &&
          userDoc.id === currentUser.uid
        ) {
          return;
        }

        foundFriend = true;

        const friend =
          document.createElement("div");

        friend.style.cssText = `
          background:white;
          padding:12px;
          margin:10px 0;
          border-radius:15px;
          cursor:pointer;
          box-shadow:0 2px 7px rgba(0,0,0,.15);
          display:flex;
          align-items:center;
          gap:12px;
        `;


        const photo =
          data.photo ||
          "https://via.placeholder.com/60";


        friend.innerHTML = `

          <img
            src="${photo}"
            style="
              width:60px;
              height:60px;
              border-radius:50%;
              object-fit:cover;
              border:2px solid #075E54;
            "
          >

          <div style="flex:1;">

            <div style="
              font-size:17px;
              font-weight:bold;
            ">
              ${data.name || "User"}
            </div>

            friend.innerHTML = `

  <img
    src="${photo}"
    style="
      width:60px;
      height:60px;
      border-radius:50%;
      object-fit:cover;
      border:2px solid #075E54;
    "
  >

  <div style="flex:1;">

    <div style="
      font-size:17px;
      font-weight:bold;
    ">
      ${data.name || "User"}
    </div>

    <div style="
      font-size:13px;
      margin-top:3px;
    ">
      ${
        data.online
        ? "🟢 Online"
        : "⚪ Offline"
      }
    </div>

  </div>

  <div style="font-size:20px;">
    💬
  </div>

`;

            <div style="
              font-size:13px;
              margin-top:3px;
            ">
           <span style="
  display:inline-block;
  width:9px;
  height:9px;
  border-radius:50%;
  background:${data.online ? "green" : "gray"};
"></span>
            </div>

          </div>

          <div style="
            font-size:20px;
          ">
            💬
          </div>

        `;


        friend.addEventListener(
          "click",
          () => {

            localStorage.setItem(
              "chatFriendUid",
              userDoc.id
            );

            localStorage.setItem(
              "chatFriendName",
              data.name ||
              data.email ||
              "User"
            );

            localStorage.setItem(
              "chatFriendEmail",
              data.email || ""
            );

            window.location.href =
              "conversation.html";

          }
        );


        friendsDiv.appendChild(friend);

      });


      if (!foundFriend) {

        friendsDiv.innerHTML = `
          <p style="
            text-align:center;
            color:#777;
          ">
            अभी कोई दूसरा registered user नहीं है।
          </p>
        `;

      }

    },

    (error) => {

      console.error(
        "Friends error:",
        error
      );

      friendsDiv.innerHTML = `
        <div style="
          background:#ffe5e5;
          color:#b00000;
          padding:15px;
          border-radius:10px;
        ">
          ❌ Friends load नहीं हुए।
          <br><br>
          ${error.message}
        </div>
      `;

    }

  );

}