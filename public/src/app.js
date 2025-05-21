document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

function updateStatus() {
  const statusText = document.getElementById("status-text");
  if (navigator.onLine) {
    statusText.textContent = "Online";
    statusText.style.color = "#000";
    statusText.parentElement.style.color = "#000";
    statusText.parentElement.style.background = "#ffd600";
  } else {
    statusText.textContent = "Offline";
    statusText.style.color = "#f00";
    statusText.parentElement.style.color = "#f22";
    statusText.parentElement.style.background = "#111";
  }
}
window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);
window.addEventListener("DOMContentLoaded", updateStatus);

// Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("src/service-worker.js")
    .then(() => console.log("Service Worker działa poprawnie."))
    .catch((error) =>
      console.error(
        "Serwice Worker wziął sobie dzisiaj wolne :( taki oto błąd:",
        error
      )
    );
}
