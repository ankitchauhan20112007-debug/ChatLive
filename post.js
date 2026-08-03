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

const firebaseConfig = {
  apiKey: "AIzaSyCQW8TYFy1G6cXeGyYyscnWnh9Kqk5g6o",
  authDomain: "chatlive-bac03.firebaseapp.com",
  projectId: "chatlive-bac03",
  storageBucket: "chatlive-bac03.firebasestorage.app",
  messagingSenderId: "1097708548558",
  appId: "1:1097708548558:web:32a13c6cf0b624a2eafb9f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const caption = document.getElementById("caption");
const postBtn = document.getElementById("postBtn");
const posts = document.getElementById("posts");


postBtn.onclick = async () => {

  if(caption.value.trim() === "") return;

  await addDoc(collection(db,"posts"),{
    text: caption.value,
    time: serverTimestamp()
  });

  caption.value = "";

};


// Show Posts

const q = query(
  collection(db,"posts"),
  orderBy("time","desc")
);


onSnapshot(q,(snapshot)=>{

  posts.innerHTML="";

  snapshot.forEach((doc)=>{

    const data = doc.data();

    posts.innerHTML += `
    <div style="
    background:white;
    padding:15px;
    margin:10px;
    border-radius:10px;
    ">
    
    📝 ${data.text}

    </div>
    `;

  });

});