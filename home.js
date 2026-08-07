import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const storiesDiv = document.getElementById("stories");

onSnapshot(collection(db, "stories"), (snapshot) => {

  if (!storiesDiv) return;

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
          data-image="${data.image}">
        <p>${data.email.split("@")[0]}</p>
      </div>
    `;

  });


  document.querySelectorAll(".story-img").forEach((img)=>{

    img.onclick = () => {

      localStorage.setItem(
        "storyImage",
        img.dataset.image
      );

      window.location.href = "viewer.html";

    };

  });

});