import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQW8TYSFy1G6cXeGyYyscnWnh9Kqk5g6o",
  authDomain: "chatlive-bac03.firebaseapp.com",
  projectId: "chatlive-bac03",
  storageBucket: "chatlive-bac03.firebasestorage.app",
  messagingSenderId: "1097708548558",
  appId: "1:1097708548558:web:32a13c6cf0b624a2eafb9f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const usersDiv = document.getElementById("users");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    online: true
  }, { merge: true });

  onSnapshot(collection(db, "users"), (snapshot) => {

    usersDiv.innerHTML = "";

    snapshot.forEach((userDoc) => {

      const data = userDoc.data();

      if (data.email !== user.email) {

        usersDiv.innerHTML += `
<div class="card">

<h3>${data.name || data.email}</h3>

<p class="${data.online ? "online" : "offline"}">

${data.online ? "🟢 Online" : "⚪ Offline"}

</p>

</div>
`;

      }

    });

  });

});window.addEventListener("beforeunload", async () => {

  const user = auth.currentUser;

  if (user) {
    await setDoc(doc(db, "users", user.uid), {
      online: false
    }, { merge: true });
  }

});

document.addEventListener("visibilitychange", async () => {

  const user = auth.currentUser;

  if (!user) return;

  if (document.hidden) {

    await setDoc(doc(db, "users", user.uid), {
      online: false
    }, { merge: true });

  } else {

    await setDoc(doc(db, "users", user.uid), {
      online: true
    }, { merge: true });

  }

});