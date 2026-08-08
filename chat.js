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

  onSnapshot(collection(db, "users"), (snapshot) => {

    friendsDiv.innerHTML = "";

    let foundFriend = false;

    snapshot.forEach((userDoc) => {

      const data = userDoc.data();

      // खुद को Friend List में नहीं दिखाना
      if (
        currentUser &&
        userDoc.id === currentUser.uid
      ) {
        return;
      }

      foundFriend = true;

      const friend = document.createElement("div");

      friend.style.cssText = `
        background:white;
        padding:15px;
        margin:10px 0;
        border-radius:12px;
        cursor:pointer;
        box-shadow:0 2px 6px rgba(0,0,0,.15);
      `;

      friend.innerHTML = `
        <b>👤 ${data.name || "User"}</b>
        <br>
        <small>${data.email || ""}</small>
        <br>
        <span>
          ${data.online ? "🟢 Online" : "⚪ Offline"}
        </span>
      `;

      friend.addEventListener("click", () => {

        localStorage.setItem(
          "chatFriendUid",
          userDoc.id
        );

        localStorage.setItem(
          "chatFriendName",
          data.name || data.email || "User"
        );

        localStorage.setItem(
          "chatFriendEmail",
          data.email || ""
        );

        window.location.href = "conversation.html";

      });

      friendsDiv.appendChild(friend);

    });

    if (!foundFriend) {

      friendsDiv.innerHTML = `
        <p style="text-align:center;">
          अभी कोई दूसरा registered user नहीं है।
        </p>
      `;

    }

  });

}