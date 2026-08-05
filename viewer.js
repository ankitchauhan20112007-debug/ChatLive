import { db } from "./firebase.js";

import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const storyImg = document.getElementById("storyImg");

const q = query(
  collection(db, "stories"),
  orderBy("time", "desc")
);

let stories = [];
let index = 0;

onSnapshot(q, (snapshot) => {

  stories = [];

  snapshot.forEach((doc) => {
    stories.push(doc.data());
  });

  if (stories.length > 0) {
    storyImg.src = stories[0].image;
  }

});

setInterval(() => {

  if (stories.length === 0) return;

  index++;

  if (index >= stories.length) {
    window.location.href = "home.html";
    return;
  }

  storyImg.src = stories[index].image;

}, 5000);