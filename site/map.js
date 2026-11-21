(() => {
  const page = document.body;
  const frame = document.getElementById("world-map");
  const toggle = document.querySelector(".map-actions button");
  const { origin } = new URL(frame.dataset.src);
  let exploring = false;

  function syncViewer() {
    frame.contentWindow.postMessage({ type: "cumcraft:map-mode", interactive: exploring }, origin);
  }

  window.addEventListener("message", (event) => {
    if (event.origin !== origin || event.source !== frame.contentWindow) return;
    if (event.data?.type !== "cumcraft:map-ready") return;
    page.dataset.ready = "";
    syncViewer();
  });

  function setExploring(value) {
    exploring = value;
    page.toggleAttribute("data-exploring", exploring);
    toggle.setAttribute("aria-expanded", String(exploring));
    toggle.textContent = exploring ? toggle.dataset.close : toggle.dataset.explore;
    frame.tabIndex = exploring ? 0 : -1;
    syncViewer();
  }

  toggle.addEventListener("click", () => setExploring(!exploring));
  window.addEventListener("site:sectionchange", () => {
    if (exploring) setExploring(false);
  });

  toggle.hidden = false;
  page.dataset.enhanced = "";
  frame.src = frame.dataset.src;
})();
