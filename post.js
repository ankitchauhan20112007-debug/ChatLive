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
    alert("Please select an image");
    return;
  }

  const formData = new FormData();
  formData.append("file", postImage.files[0]);
  formData.append("upload_preset", "swlqxqgn");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/rmt792pr/image/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  await addDoc(collection(db, "posts"), {
    image: data.secure_url,
    caption: caption.value,
    email: auth.currentUser.email,
    time: serverTimestamp()
  });

  caption.value = "";
  postImage.value = "";

  alert("Post Uploaded!");
};

const q = query(
  collection(db, "posts"),
  orderBy("time", "desc")
);

onSnapshot(q, (snapshot) => {

  posts.innerHTML = "";

  snapshot.forEach((doc) => {

    const data = doc.data();

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

<img src="${data.image}"
style="
width:45px;
height:45px;
border-radius:50%;
object-fit:cover;
margin-right:10px;
">

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

<div style="font-size:24px;">
❤️ 🤍 💬 📤
</div>

<p style="margin-top:10px;">
<b>${data.email}</b>
${data.caption}
</p>

</div>

</div>
`;

  });

});