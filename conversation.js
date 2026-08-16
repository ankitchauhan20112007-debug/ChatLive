import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


// =====================================
// ELEMENTS
// =====================================

const friendPhoto =
  document.getElementById("friendPhoto");

const friendName =
  document.getElementById("friendName");

const friendStatus =
  document.getElementById("friendStatus");

const messages =
  document.getElementById("messages");

const messageInput =
  document.getElementById("message");

const sendBtn =
  document.getElementById("sendBtn");

const chatPhoto =
  document.getElementById("chatPhoto");


// =====================================
// FRIEND
// =====================================

const friendUid =
  localStorage.getItem("chatFriendUid");

const savedName =
  localStorage.getItem("chatFriendName");


let currentUser = null;


// =====================================
// CHECK FRIEND
// =====================================

if (!friendUid){

  window.location.href =
    "chat.html";

}


// =====================================
// CHAT ID
// =====================================

function chatId(){

  return [
    currentUser.uid,
    friendUid
  ]
  .sort()
  .join("_");

}


// =====================================
// LOGIN
// =====================================

onAuthStateChanged(
  auth,
  async (user)=>{

    if(!user){

      window.location.href =
        "index.html";

      return;

    }


    currentUser =
      user;


    console.log(
      "LOGIN OK:",
      user.uid
    );


    await loadFriend();


    loadStatus();


    loadMessages();

  }
);


// =====================================
// FRIEND INFO
// =====================================

async function loadFriend(){

  try{

    const ref =
      doc(
        db,
        "users",
        friendUid
      );


    const snap =
      await getDoc(ref);


    if(!snap.exists()){

      friendName.textContent =
        savedName || "User";

      return;

    }


    const data =
      snap.data();


    friendName.textContent =
      data.name ||
      data.username ||
      data.displayName ||
      savedName ||
      "User";


    if(data.photo){

      friendPhoto.src =
        data.photo;

    }


  }catch(error){

    console.error(
      "FRIEND ERROR:",
      error
    );


    friendName.textContent =
      savedName ||
      "User";

  }

}


// =====================================
// STATUS
// =====================================

function loadStatus(){

  const ref =
    doc(
      db,
      "users",
      friendUid
    );


  onSnapshot(
    ref,
    snap=>{

      if(!snap.exists()){

        friendStatus.textContent =
          "offline";

        return;

      }


      const data =
        snap.data();


      if(data.online === true){

        friendStatus.innerHTML =
          "🟢 online";

      }else{

        friendStatus.innerHTML =
          "⚪ offline";

      }

    }
  );

}


// =====================================
// LOAD MESSAGES
// =====================================

function loadMessages(){

  const ref =
    collection(
      db,
      "chats",
      chatId(),
      "messages"
    );


  const q =
    query(
      ref,
      orderBy(
        "time",
        "asc"
      )
    );


  onSnapshot(

    q,

    snapshot=>{

      messages.innerHTML =
        "";


      snapshot.forEach(
        messageDoc=>{

          showMessage(
            messageDoc.data()
          );

        }
      );


      messages.scrollTop =
        messages.scrollHeight;

    },

    error=>{

      console.error(
        "MESSAGE ERROR:",
        error
      );


      messages.innerHTML = `

        <div style="
          color:red;
          text-align:center;
          padding:20px;
        ">

          Chat load नहीं हुई।

          <br><br>

          ${error.message}

        </div>

      `;

    }

  );

}


// =====================================
// SHOW MESSAGE
// =====================================

function showMessage(data){

  const box =
    document.createElement("div");


  const mine =
    data.sender ===
    currentUser.uid;


  box.className =
    mine
      ? "message mine"
      : "message friend";


  // PHOTO

  if(data.image){

    const img =
      document.createElement("img");


    img.src =
      data.image;


    box.appendChild(img);

  }


  // TEXT

  if(data.text){

    const text =
      document.createElement("div");


    text.textContent =
      data.text;


    box.appendChild(text);

  }


  // TIME

  const time =
    document.createElement("div");


  time.className =
    "time";


  let timeText = "";


  if(
    data.time &&
    data.time.toDate
  ){

    timeText =
      data.time
      .toDate()
      .toLocaleTimeString(
        [],
        {
          hour:"2-digit",
          minute:"2-digit"
        }
      );

  }


  time.innerHTML =
    timeText +
    (
      mine
        ? " ✓✓"
        : ""
    );


  box.appendChild(time);


  messages.appendChild(
    box
  );

}


// =====================================
// SEND BUTTON
// =====================================

sendBtn.addEventListener(
  "click",
  sendMessage
);


// =====================================
// ENTER
// =====================================

messageInput.addEventListener(
  "keydown",
  event=>{

    if(
      event.key ===
      "Enter"
    ){

      event.preventDefault();

      sendMessage();

    }

  }
);


// =====================================
// SEND MESSAGE
// =====================================

async function sendMessage(){

  const text =
    messageInput.value.trim();


  if(!text){

    return;

  }


  if(!currentUser){

    alert(
      "Please login first"
    );

    return;

  }


  // Save text

  const originalText =
    text;


  // =================================
  // SHOW TEMP MESSAGE
  // =================================

  const temp =
    document.createElement("div");


  temp.className =
    "message mine";


  temp.innerHTML = `

    <div>
      ${escapeText(originalText)}
    </div>

    <div class="time">
      Sending...
    </div>

  `;


  messages.appendChild(
    temp
  );


  messages.scrollTop =
    messages.scrollHeight;


  // Disable button

  sendBtn.disabled =
    true;


  try{

    await addDoc(

      collection(
        db,
        "chats",
        chatId(),
        "messages"
      ),

      {

        text:
          originalText,

        sender:
          currentUser.uid,

        receiver:
          friendUid,

        time:
          serverTimestamp()

      }

    );


    // Clear input
    messageInput.value =
      "";


    messageInput.focus();


    // Remove temporary
    temp.remove();


    console.log(
      "MESSAGE SENT ✅"
    );


  }catch(error){

    console.error(
      "SEND ERROR:",
      error
    );


    temp.innerHTML = `

      <div>
        ${escapeText(originalText)}
      </div>

      <div
        class="time"
        style="color:red;"
      >
        Failed ❌
      </div>

    `;


    alert(
      "Message send नहीं हुआ:\n\n" +
      error.message
    );

  }


  sendBtn.disabled =
    false;

}


// =====================================
// ESCAPE TEXT
// =====================================

function escapeText(text){

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}


// =====================================
// PHOTO SELECT
// =====================================

chatPhoto.addEventListener(
  "change",
  sendPhoto
);


// =====================================
// SEND PHOTO
// =====================================

async function sendPhoto(){

  const file =
    chatPhoto.files[0];


  if(!file){

    return;

  }


  if(!currentUser){

    alert(
      "Please login first"
    );

    return;

  }


  if(
    file.size >
    10 * 1024 * 1024
  ){

    alert(
      "Photo 10 MB से छोटी होनी चाहिए।"
    );

    chatPhoto.value =
      "";

    return;

  }


  sendBtn.disabled =
    true;


  try{

    // =================================
    //