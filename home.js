import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const storiesDiv = document.getElementById("stories");
const feed = document.getElementById("feed");

let currentUser = null;

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      online: true
    },
    { merge: true }
  );

});// ===== STORIES =====
onSnapshot(collection(db, "stories"), (snapshot) => {

  storiesDiv.innerHTML = `
    <div class="story">
      <a href="post.html" style="text-decoration:none;color:black">
        <div class="story-ring">➕</div>
        <p>Your Story</p>
      </a>
    </div>
  `;

  snapshot.forEach((storyDoc) => {

    const data = storyDoc.data();

    storiesDiv.innerHTML += `
      <div class="story">
        <img
          src="${data.image}"
          class="story-img"
          data-image="${data.image}"
          style="width:65px;height:65px;border-radius:50%;object-fit:cover;border:3px solid #ff0066;">
        <p>${data.email.split("@")[0]}</p>
      </div>
    `;

  });

  document.querySelectorAll(".story-img").forEach((img) => {

    img.onclick = () => {

      localStorage.setItem("storyImage", img.dataset.image);

      window.location.href = "viewer.html";

    };

  });

});

// ===== POSTS =====
onSnapshot(collection(db, "posts"), (snapshot) => {

  feed.innerHTML = "";

  snapshot.forEach((post) => {

    const data = post.data();

    feed.innerHTML += `
      <div class="post-card">

        <img src="${data.image}" class="post-image">

        <div class="post-caption">
          <b>${data.email}</b><br>
          ${data.caption || ""}
        </div>

        <button onclick="likePost('${post.id}')">
          ❤️ ${data.likes || 0}
        </button>

      </div>
    `;

  });

});// Like Post
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
    alert("Like failed");

  }

};

// Logout Function (अगर logout button हो)
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

  logoutBtn.onclick = async () => {

    await signOut(auth);

    window.location.href = "index.html";

  };

}

// Online / Offline Status
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