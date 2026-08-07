import { auth, db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const postImage = document.getElementById("postImage");
const caption = document.getElementById("caption");
const postBtn = document.getElementById("postBtn");
const storyBtn = document.getElementById("storyBtn");
const posts = document.getElementById("posts");// Upload image to Cloudinary
async function uploadImage(file) {

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "swlqxqgn");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/rmt792pr/image/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  return data.secure_url;

}

// Upload Post
postBtn.addEventListener("click", async () => {

  if (!postImage.files.length) {
    alert("Please select an image");
    return;
  }

  try {

    const imageUrl = await uploadImage(postImage.files[0]);

    await addDoc(collection(db, "posts"), {
      image: imageUrl,
      caption: caption.value,
      email: auth.currentUser.email,
      likes: 0,
      time: serverTimestamp()
    });

    alert("✅ Post Uploaded");

    postImage.value = "";
    caption.value = "";

  } catch (err) {
    alert("Upload Failed");
    console.log(err);
  }

});// Upload Story
storyBtn.addEventListener("click", async () => {

  if (!postImage.files.length) {
    alert("Please select an image");
    return;
  }

  try {

    const imageUrl = await uploadImage(postImage.files[0]);

    await addDoc(collection(db, "stories"), {
      image: imageUrl,
      email: auth.currentUser.email,
      time: serverTimestamp()
    });

    alert("✅ Story Uploaded");

    postImage.value = "";
    caption.value = "";

  } catch (err) {
    alert("Story Upload Failed");
    console.log(err);
  }

});