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


       