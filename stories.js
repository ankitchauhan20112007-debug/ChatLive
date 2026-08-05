import { auth, db } from "./firebase.js";

import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const storyImage = document.getElementById("storyImage");
const uploadStory = document.getElementById("uploadStory");
const stories = document.getElementById("stories");

uploadStory.onclick = async () => {

  if (!storyImage.files[0]) {
    alert("Select Image");
    return;
  }

  const formData = new FormData();
  formData.append("file", storyImage.files[0]);
  formData.append("upload_preset", "swlqxqgn");

  const upload = await fetch(
    "https://api.cloudinary.com/v1_1/rmt792pr/image/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const img = await upload.json();

  await addDoc(collection(db, "stories"), {
    email: auth.currentUser.email,
    image: img.secure_url,
    time: serverTimestamp()
  });

  alert("Story Uploaded!");
};

onSnapshot(collection(db, "stories"), (snapshot) => {

  stories.innerHTML = "";

  snapshot.forEach((story) => {

    const data = story.data();

    stories.innerHTML += `
      <img
        src="${data.image}"
        style="
          width:100px;
          height:180px;
          object-fit:cover;
          border-radius:15px;
          margin:10px;
        ">
    `;

  });

});