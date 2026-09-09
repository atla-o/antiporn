document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["antiporn"], (res) => {
    const s = res.antiporn || {};
    const p = document.createElement("p");
    p.textContent = `Severity ${s.severity ?? 35}`;
    document.body.appendChild(p);
  });
});
