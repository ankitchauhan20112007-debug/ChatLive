import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


const friendsDiv = document.getElementById("friends");


// Login check
onAuthStateChanged(auth, (user) => {

  if (!user) {
    friendsDiv.innerHTML = `
      <p style="text-align:center;">
        Please login first.
      </p>
    `;
    return;
  }

  loadFriends();

});


// Load friends
function loadFriends() {

  onSnapshot(
    collection(db, "users"),

    (snapshot) => {

      friendsDiv.innerHTML = "";

      let count = 0;


      snapshot.forEach((userDoc) => {

        const data = userDoc.data();


        // अपना account hide
        if (
          auth.currentUser &&
          userDoc.id === auth.currentUser.uid
        ) {
          return;
        }


        count++;


        const card = document.createElement("div");

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
        `;


        // Profile photo
        const photo = data.photo || "";


        let avatar = "";

        if (photo) {

          avatar = `
            <img
              src="${photo}"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
              style="
                width:60px;
                height:60px;
                border-radius:50%;
                object-fit:cover;
                flex-shrink:0;
              "
            >

            <div style="
              display:none;
              width:60px;
              height:60px;
              border-radius:50%;
              background:#ddd;
              align-items:center;
              justify-content:center;
              font-size:28px;
              flex-shrink:0;
            ">
              👤
            </div>
          `;

        } else {

          avatar = `
            <div style="
              width:60px;
              height:60px;
              border-radius:50%;
              background:#ddd;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:28px;
              flex-shrink:0;
            ">
              👤
            </div>
          `;

        }


        // सिर्फ dot
        const dotColor =
          data.online === true
            ? "#00a000"
            : "#d3d3d3";


        card.innerHTML = `

          ${avatar}


          <div style="flex:1;">

            <div style="
              font-size:18px;
              font-weight:bold;
              color:#222;
            ">
              ${data.name || "User"}
            </div>


            <div style="
              margin-top:7px;
              height:10px;
            ">

              <span style="
                display:inline-block;
                width:10px;
                height:10px;
                border-radius:50%;
                background:${dotColor};
              "></span>

            </div>

          </div>


          <div style="
            font-size:25px;
          ">
            💬
          </div>

        `;


        // Friend पर click
        card.onclick = () => {

          localStorage.setItem(
            "chatFriendUid",
            userDoc.id
          );


          localStorage.setItem(
            "chatFriendName",
            data.name || "User"
          );


          window.location.href =
            "conversation.html";

        };


        friendsDiv.appendChild(card);

      });


      // कोई friend नहीं
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
        ">
          ❌ Friends load नहीं हुए।
          <br><br>
          ${error.message}
        </div>
      `;

    }

  );

}