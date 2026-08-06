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
const storiesDiv = document.getElementById("stories");
const feed = document.getElementById("feed");
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    online: true
  }, { merge: true });

});// Online Users
onSnapshot(collection(db, "users"), (snapshot) => {

  usersDiv.innerHTML = "";

  snapshot.forEach((userDoc) => {

    const data = userDoc.data();

    if (currentUser && data.email !== currentUser.email) {

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

// Stories
onSnapshot(collection(db, "stories"), (snapshot) => {

  storiesDiv.innerHTML = `
    <div class="story">
      <a href="stories.html" style="text-decoration:none;color:black">
        <div class="story-ring">➕</div>
        <p>Your Story</p>
      </a>
    </div>
  `;

  snapshot.forEach((story) => {

    const data = story.data();

    storiesDiv.innerHTML += `
      <div class="story">
        <img
          src="${data.image}"
        class="story-img"
data-image="${data.image}"
          style="
            width:65px;
            height:65px;
            border-radius:50%;
            object-fit:cover;
            border:3px solid #ff0066;
            cursor:pointer;
          ">
        <p>${data.email.split("@")[0]}</p>
      </div>
    `;

  });
document.querySelectorAll(".story-img").forEach((img) => {
  img.addEventListener("click", () => {
    localStorage.setItem("storyImage", img.dataset.image);
    window.location.href = "viewer.html";
  });
});

});// Feed
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
          <button onclick="likePost('${post.id}')">
            ❤️ ${data.likes || 0}
          </button>

          💬 📤
        </div>

        <div class="post-caption">
          <b>${data.email}</b><br>
          ${data.caption || ""}
        </div>

      </div>
    `;

  });

});// Like
window.likePost = async (postId) => {

  try {

    await updateDoc(
      doc(db, "posts", postId),
      {
        likes: increment(1)
      }
    );

  } catch (err) {
    console.log(err);
  }

};// Story Open
window.openStory = (image) => {

  localStorage.setItem("storyImage", image);

  window.location.href = "viewer.html";

};

// Logout
if (logoutBtn) {

  logoutBtn.onclick = async () => {

    await signOut(auth);

    window.location.href = "index.html";

  };

}// Online / Offline Status
window.addEventListener("beforeunload", async () => {

  if (!currentUser) return;

  await setDoc(
    doc(db, "users", currentUser.uid),
    {
      online: false
    },
    { merge: true }
  );

});

document.addEventListener("visibilitychange", async () => {

  if (!currentUser) return;

  await setDoc(
    doc(db, "users", currentUser.uid),
    {
      online: !document.hidden
    },
    { merge: true }
  );

});