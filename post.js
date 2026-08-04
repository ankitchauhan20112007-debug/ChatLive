import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQW8TYSFy1G6cXeGyYyscnWnh9Kqk5g6o",
  authDomain: "chatlive-bac03.firebaseapp.com",
  projectId: "chatlive-bac03",
  storageBucket: "chatlive-bac03.firebasestorage.app",
  messagingSenderId: "1097708548558",
  appId: "1:1097708548558:web:32a13c6cf0b624a2eafb9f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const postImage = document.getElementById("postImage");
const caption = document.getElementById("caption");
const postBtn = document.getElementById("postBtn");
const posts = document.getElementById("posts");

postBtn.onclick = async () => {

  if (!postImage.files[0]) {
    alert("Please select image");
    return;
  }

  const formData = new FormData();
  formData.append("file", postImage.files[0]);
  formData.append("upload_preset", "swlqxqgn");

  const upload = await fetch(
    "https://api.cloudinary.com/v1_1/rmt792pr/image/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const image = await upload.json();

  if (!image.secure_url) {
    alert("Upload Failed");
    return;
  }

  await addDoc(collection(db, "posts"), {
    image: image.secure_url,
    caption: caption.value,
    email: auth.currentUser.email,
    likes: 0,
    time: serverTimestamp()
  });

  postImage.value = "";
  caption.value = "";

  alert("Post Uploaded");

};const q = query(
  collection(db, "posts"),
  orderBy("time", "desc")
);

onSnapshot(q, (snapshot) => {

  posts.innerHTML = "";

  snapshot.forEach((post) => {

    const data = post.data();

    posts.innerHTML += `

<div style="
background:#fff;
margin:15px 0;
border-radius:15px;
overflow:hidden;
box-shadow:0 2px 8px rgba(0,0,0,.15);
">

<div style="
display:flex;
align-items:center;
padding:12px;
">

<div style="
width:45px;
height:45px;
border-radius:50%;
background:#ddd;
display:flex;
align-items:center;
justify-content:center;
font-size:20px;
margin-right:10px;
">
👤
</div>

<div>
<b>${data.email}</b>
<br>
<small style="color:gray;">
ChatLive
</small>
</div>

</div>

<img
src="${data.image}"
style="
width:100%;
display:block;
max-height:500px;
object-fit:cover;
">

<div style="padding:12px;">

<div style="
font-size:24px;
margin-bottom:10px;
">
❤️ ${data.likes || 0}
</div>

<p>
<b>${data.email}</b><br>
${data.caption}
</p>

</div>

</div>

`;

  });

});