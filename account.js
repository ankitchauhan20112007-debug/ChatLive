import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


const accountName =
  document.getElementById("accountName");

const accountEmail =
  document.getElementById("accountEmail");


onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href =
      "index.html";

    return;

  }


  // Email
  accountEmail.textContent =
    user.email || "No email";


  try {

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );


    const snapshot =
      await getDoc(userRef);


    if (snapshot.exists()) {

      const data =
        snapshot.data();


      accountName.textContent =
        data.name || "User";

    } else {

      accountName.textContent =
        "User";

    }


  } catch (error) {

    console.error(
      "Account error:",
      error
    );

    accountName.textContent =
      "User";

  }

});