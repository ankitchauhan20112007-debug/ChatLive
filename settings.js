import { auth } from "./firebase.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

  logoutBtn.onclick = async function () {

    try {

      alert("Logout button working ✅");

      await signOut(auth);

      alert("Logout successful ✅");

      window.location.href = "index.html";

    } catch (error) {

      console.error(error);

      alert(
        "Logout error:\n" +
        error.message
      );

    }

  };

}