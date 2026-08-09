import { auth } from "./firebase.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";


const logoutBtn =
  document.getElementById("logoutBtn");

const logoutMsg =
  document.getElementById("logoutMsg");


if (!logoutBtn) {

  console.error(
    "Logout button नहीं मिला"
  );

} else {


  logoutBtn.addEventListener(
    "click",
    async () => {


      logoutBtn.style.pointerEvents =
        "none";


      logoutBtn.style.opacity =
        "0.6";


      logoutMsg.textContent =
        "Logging out...";


      try {


        await signOut(auth);


        logoutMsg.textContent =
          "Logout successful ✅";


        setTimeout(
          () => {

            window.location.replace(
              "index.html"
            );

          },
          500
        );


      } catch (error) {


        console.error(
          "Logout error:",
          error
        );


        logoutBtn.style.pointerEvents =
          "auto";


        logoutBtn.style.opacity =
          "1";


        logoutMsg.textContent =
          "Logout failed ❌";


        alert(
          "Logout नहीं हुआ:\n" +
          error.message
        );

      }

    }
  );

}