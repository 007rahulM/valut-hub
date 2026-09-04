export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] ServiceWorker registered:", registration.scope);
        })
        .catch((error) => {
          console.log("[PWA] ServiceWorker registration failed:", error);
        });
    });
  }
}