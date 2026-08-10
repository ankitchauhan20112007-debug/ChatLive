import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


const friendsDiv =
  document.getElementById("friends");


// =========================
// LOGIN CHECK
// =========================

onAuthStateChanged(auth, (user) => {

  if (!user) {

    friendsDiv.innerHTML = `
      <p style="
        text-align:center;
        color:#777;
      ">
        Please login first.
      </p>
    `;

    return;
  }


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
          auth.currentUser &&
          userDoc.id ===
          auth.currentUser.uid
        ) {

          return;

        }


        count++;


        // =========================
        // CARD
        // =========================

        const card =
          document.createElement("div");


        card.style.cssText = `
          background:#fff;
          margin:12px 0;
          padding:14px;
          border-radius:18px;
          display:flex;
          align-items:center;
          gap:12px;
          box-shadow:0 2px 8px rgba(0,0,0,.12);
          cursor:pointer;
          user-select:none;
        `;


        // =========================
        // PHOTO
        // =========================

        const photo =
          data.photo || "";


        let avatar = "";


        if (photo) {

          avatar = `

            <img
              src="${photo}"
              style="
                width:60px;
                height:60px;
                border-radius:50%;
                object-fit:cover;
                flex-shrink:0;
              "
              onerror="
                this.style.display='none';
                this.nextElementSibling.style.display='flex';
              "
            >

            <div
              style="
                display:none;
                width:60px;
                height:60px;
                border-radius:50%;
                background:#ddd;
                align-items:center;
                justify-content:center;
                font-size:28px;
                flex-shrink:0;
              "
            >
              👤
            </div>

          `;

        } else {

          avatar = `

            <div
              style="
                width:60px;
                height:60px;
                border-radius:50%;
                background:#ddd;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:28px;
                flex-shrink:0;
              "
            >
              👤
            </div>

          `;

        }


        // =========================
        // NAME
        // =========================

        const name =
          data.name ||