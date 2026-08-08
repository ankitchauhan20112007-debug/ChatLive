import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


const friendsDiv = document.getElementById("friends");


if (!friendsDiv) {
  console.error("friends element नहीं मिला");
}


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


        // अपना account hide करो
        if (
          auth.currentUser &&
          userDoc.id === auth.currentUser.uid
        ) {
          return;
        }


        count++;


        const card =
          document.createElement("div");


        card.style.cssText = `
          background:white;
          margin:12px 0;
          padding:15px;
          border-radius:18px;
          display:flex;
          align-items:center;
          gap:12px;
          box-shadow:0 2px 8px rgba(0,0,0,0.12);
          cursor:pointer;
        `;


        const photo =
          data.photo ||
          "https://via.placeholder.com/60";


        const dot =
          data.online === true
          ? "green"
          : "#d3d3d3";


        card.innerHTML = `

          <img
            src="${photo}"
            style="
              width:60px;
              height:60px;
              border-radius:50%;
              object-fit:cover;
            "
          >


          <div style="flex:1;">

            <div style="
              font-size:18px;
              font-weight:bold;
            ">
              ${data.name || "User"}
            </div>


            <div style="margin-top:6px;">

              <span
                style="
                  display:inline-block;
                  width:10px;
                  height:10px;
                  border-radius:50%;
                  background:${dot};
                "
              ></span>

            </div>

          </div>


          <div style="
            font-size:24px;
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
          padding:15px;
          border-radius:12px;
          color:#b00000;
        ">
          ❌ Friends load नहीं हुए।
          <br><br>
          ${error.message}
        </div>
      `;

    }

  );

}