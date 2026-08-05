import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const usersDiv = document.getElementById("users");
const logoutBtn = document.getElementById("logoutBtn");

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

});logoutBtn.onclick = async () => {

  await signOut(auth);

  window.location.href = "index.html";

};const feed = document.getElementById("feed");

onSnapshot(collection(db, "posts"), (snapshot) => {

  feed.innerHTML = "";

  snapshot.forEach((post) => {

    const data = post.data();

    feed.innerHTML += `
    <div class="post-card">

      <div class="post-header">
        <b>${data.email}</b>
      </div>

      <img
      src="${data.image}"
      class="post-image">

      <div class="post-actions">
        ❤️ 💬 📤
      </div>

      <div class="post-caption">
        <b>${data.email}</b><br>
        ${data.caption || ""}
      </div>

    </div>
    `;

  });

});window.likePost = async (id) => {

  try {

    await updateDoc(
      doc(db, "posts", id),
      {
        likes: increment(1)
      }
    );

  } catch (e) {
    console.log(e);
  }

};