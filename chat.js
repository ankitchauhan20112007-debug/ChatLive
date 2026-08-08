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


// Login check
onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  loadFriends();

});


// Friends load
function loadFriends() {

  onSnapshot(
    collection(db, "users"),

    (snapshot) => {

      friendsDiv.innerHTML = "";

      let foundFriend = false;


      snapshot.forEach((userDoc) => {

        const data = userDoc.data();


        // खुद को नहीं दिखाना
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


        // Profile photo
        const photo =
          data.photo ||
          "https://via.placeholder.com/60";


        // Online dot
        const dotColor =
          data.online === true
          ? "green"
          : "lightgray";


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
              font-size:18px;
              font-weight:bold;
            ">
              ${data.name || "User"}
            </div>


            <div style="
              margin-top:5px;
            ">

              <span
                style="
                  display:inline-block;
                  width:10px;
                  height:10px;
                  border-radius:50%;
                  background:${dotColor};
                "
              ></span>

            </div>

          </div>


          <div style="
            font-size:22px;
          ">
            💬
          </div>

        `;


        // Friend click
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
              "User"
            );


            window.location.href =
              "conversation.html";

          }
        );


        friendsDiv.appendChild(friend);

      });


      // No friends
      if (!foundFriend) {

        friendsDiv.innerHTML = `
          <p style="
            text-align:center;
            color:#777;
          ">
            अभी कोई friend नहीं है।
          </p>
        `;

      }

    },


    (error) => {