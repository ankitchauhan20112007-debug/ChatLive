const storyImg = document.getElementById("storyImg");

const savedStory = localStorage.getItem("storyImage");

if (savedStory) {
  storyImg.src = savedStory;
} else {
  alert("No Story Found");
  window.location.href = "home.html";
}

// 5 सेकंड बाद Home पर वापस
setTimeout(() => {
  window.location.href = "home.html";
}, 5000);