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
    window.location.href = "index.html";
    return;
  }

  // Email
  accountEmail.textContent =
    user.email || "";


  let name = "";


  // Firebase Authentication का नाम
  if (user.displayName) {
    name = user.displayName;
  }


  // Firestore से नाम
  try {

    const userRef =
      doc(db, "users", user.uid);

    const snap =
      await getDoc(userRef);


    if (snap.exists()) {

      const data = snap.data();

      name =
        data.name ||
        data.username ||
        data.displayName ||
        data.fullName ||
        name;

    }

  } catch (error) {

    console.error(
      "Name loading error:",
      error
    );

  }


  accountName.textContent =
    name || "User";

});