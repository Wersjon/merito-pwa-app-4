document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

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
