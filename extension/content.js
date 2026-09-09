const overlayMap = new WeakMap();

function loadSettings() {
  return new Promise((resolve) => {
    const fallback = { severity: 35, vaultActive: false, capReached: false };
    try {
      const raw = localStorage.getItem("antiporn.v1.state");
      if (raw) {
        const s = JSON.parse(raw);
        resolve({
          severity: s.severity ?? 35,
          vaultActive: Boolean(s.vault?.active),
          capReached: Boolean(
            s.vault?.active &&
              s.vault.dailyCapMinutes != null &&
              s.usage?.usedMs >= s.vault.dailyCapMinutes * 60000,
          ),
        });
        return;
      }
    } catch {
      /* ignore */
    }
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["antiporn"], (res) => resolve(res.antiporn || fallback));
    } else {
      resolve(fallback);
    }
  });
}

function ensureOverlay(el) {
  let box = overlayMap.get(el);
  if (box && box.isConnected) return box;
  const parent = el.parentElement;
  if (!parent) return null;
  if (getComputedStyle(parent).position === "static") parent.style.position = "relative";
  box = document.createElement("div");
  box.setAttribute("data-antiporn-overlay", "1");
  box.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:2147483646;overflow:hidden;";
  parent.appendChild(box);
  overlayMap.set(el, box);
  return box;
}

function paint(el, boxes) {
  const layer = ensureOverlay(el);
  if (!layer) return;
  layer.innerHTML = "";
  const w = el.clientWidth || 1;
  const h = el.clientHeight || 1;
  for (const b of boxes) {
    const sq = document.createElement("div");
    sq.style.cssText = [
      "position:absolute",
      `left:${b.x}px`,
      `top:${b.y}px`,
      `width:${b.size}px`,
      `height:${b.size}px`,
      "background:rgba(10,10,12,0.95)",
      `outline:2px solid ${b.kind === "explicit" ? "#ef4444" : "#52525b"}`,
    ].join(";");
    layer.appendChild(sq);
  }
  layer.style.width = w + "px";
  layer.style.height = h + "px";
}

async function scan(el, severity) {
  if (el.dataset.antipornSkip === "1") return;
  const raster = rasterFromElement(el, 120);
  if (!raster) return;
  const { boxes } = detectNudity(raster.image, severity, raster.width, raster.height);
  if (boxes.length) paint(el, boxes);
}

async function run() {
  const settings = await loadSettings();
  if (settings.capReached) {
    if (!document.getElementById("antiporn-cap")) {
      const wall = document.createElement("div");
      wall.id = "antiporn-cap";
      wall.style.cssText =
        "position:fixed;inset:0;z-index:2147483647;background:#09090b;color:#fafafa;display:flex;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:24px";
      wall.textContent = "Antiporn daily cap reached. Returns at midnight. Factory reset is the abort.";
      document.documentElement.appendChild(wall);
    }
    return;
  }
  const nodes = [...document.querySelectorAll("img, video")];
  for (const el of nodes.slice(0, 40)) {
    if (el.complete === false) continue;
    await scan(el, settings.severity);
  }
}

run();
const mo = new MutationObserver(() => {
  clearTimeout(run._t);
  run._t = setTimeout(run, 400);
});
mo.observe(document.documentElement, { childList: true, subtree: true });
setInterval(run, 4000);
