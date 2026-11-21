(() => {
  const links = [...document.querySelectorAll("a[data-route]")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  const headerLinks = document.querySelectorAll("header a[data-route]");
  const alternate = document.querySelector('link[rel="alternate"]');
  const initialSection = panels.find((panel) => !panel.hidden).dataset.panel;
  const alternateHome = new URL(initialSection === "home" ? "./" : "../", alternate.href);
  const routes = {};

  for (const link of links) {
    const url = new URL(link.href);
    routes[link.dataset.route] = url.pathname;
    link.href = url.href;
  }

  function showSection(section) {
    window.dispatchEvent(new Event("site:sectionchange"));
    for (const panel of panels) panel.hidden = panel.dataset.panel !== section;
    for (const link of headerLinks) {
      if (link.dataset.route === section) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    const panel = panels.find((item) => item.dataset.panel === section);
    document.title = panel.dataset.title;
    alternate.href = new URL(section === "home" ? "./" : `${section}/`, alternateHome).href;
    const heading = panel.querySelector("h1");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-route]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.href === link.href) return;
    history.pushState(null, "", link.href);
    showSection(link.dataset.route);
  });

  window.addEventListener("popstate", () => {
    const path = location.pathname.replace(/\/index\.html$/, "/");
    const section = Object.keys(routes).find((key) => routes[key] === path);
    if (section && panels.some((panel) => panel.dataset.panel === section && panel.hidden)) {
      showSection(section);
    }
  });
})();
