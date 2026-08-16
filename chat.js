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

const friendsDiv =
  document.getElementById("friends");


if (!friendsDiv) {

  console.error(
    "friends element नहीं मिला"
  );

}


// =========================
// LOGIN
// =========================

onAuthStateChanged(
  auth,
  (user) => {

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

  }
);


// =========================
// LOAD FRIENDS
// =========================

function loadFriends(currentUser) {

  onSnapshot(
    collection(db, "users"),

    (snapshot) => {

      friendsDiv.innerHTML = "";

      let friendCount = 0;


      snapshot.forEach(
        (userDoc) => {

          const friendUid =
            userDoc.id;


          // अपना account hide

          if (
            friendUid ===
            currentUser.uid
          ) {

            return;

          }


          friendCount++;


          const data =
            userDoc.data();


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
              0 2px 8px
              rgba(0,0,0,.12);

            cursor:pointer;
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


            avatar.style.cssText = `
              width:58px;
              height:58px;

              border-radius:50%;

              object-fit:cover;

              background:#ddd;

              flex-shrink:0;
            `;


            avatar.onerror =
              () => {

               