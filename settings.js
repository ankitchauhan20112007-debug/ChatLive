import { auth } from "./firebase.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";


const logoutBtn =
  document.getElementById("logoutBtn");


if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      const confirmLogout =
        confirm("क्या आप Logout करना चाहते हैं?");

      if (!confirmLogout) {
        return;
      }

      try {

        await signOut(auth);

        window.location.href =
          "index.html";

      } catch (error) {

        console.error(error);

        alert(
          "Logout नहीं हुआ:\n" +
          error.message
        );

      }

    }
  );

}