import { auth, db } from "./firebase.js";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const messages = document.getElementById("messages");
const message = document.getElementById("message");
const emojiBtn = document.getElementById("emojiBtn");
const sendBtn = document.getElementById("sendBtn");
const chatImage = document.getElementById("chatImage");
const sendImage = document.getElementById("sendImage");
const chatUser = document.getElementById("chatUser");

const chatWith = localStorage.getItem("chatUser");

chatUser.innerHTML = "💬 " + chatWith;

onAuthStateChanged(auth, (user) => {

  if (!user) {
    location.href = "index.html";
    return;
  }

});sendBtn.onclick = async () => {

  if (message.value.trim() == "") return;

  await addDoc(collection(db, "messages"), {
    from: user.email,
    to: chatWith,
    text: message.value,
    time: serverTimestamp()
  });

  message.value = "";

};

sendImage.onclick = async () => {

  if (!chatImage.files[0]) {
    alert("Please select image");
    return;
  }

  const formData = new FormData();
  formData.append("file", chatImage.files[0]);
  formData.append("upload_preset", "swlqxqgn");

  const upload = await fetch(
    "https://api.cloudinary.com/v1_1/rmt792pr/image/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const img = await upload.json();

  if (!img.secure_url) {
    alert("Image upload failed");
    return;
  }

  await addDoc(collection(db, "messages"), {
    from: user.email,
    to: chatWith,
    image: img.secure_url,
    text: "",
    time: serverTimestamp()
  });

  chatImage.value = "";
};const q = query(
  collection(db, "messages"),
  orderBy("time", "asc")
);

onSnapshot(q, (snapshot) => {

  messages.innerHTML = "";

  snapshot.forEach((msg) => {

    const data = msg.data();

    if (
      (data.from === auth.currentUser.email && data.to === chatWith) ||
      (data.from === chatWith && data.to === auth.currentUser.email)
    ) {

      const mine = data.from === auth.currentUser.email;

      messages.innerHTML += `
      <div style="
        display:flex;
        justify-content:${mine ? "flex-end" : "flex-start"};
        margin:8px 0;
      ">
        <div style="
          background:${mine ? "#0095f6" : "#e5e5ea"};
          color:${mine ? "#fff" : "#000"};
          padding:10px;
          border-radius:15px;
          max-width:75%;
        ">

        ${
          data.image
            ? `<img src="${data.image}" style="max-width:220px;border-radius:10px;display:block;">`
            : ""
        }

        ${data.text || ""}

        </div>
      </div>
      `;
    }

  });

  messages.scrollTop = messages.scrollHeight;

});

emojiBtn.onclick = () => {

  const emoji = prompt("Enter Emoji 😊");

  if (emoji) {
    message.value += emoji;
  }

};