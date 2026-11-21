(() => {
  const root = document.documentElement;
  const alternate = document.querySelector('link[rel="alternate"]');
  const storage = {
    read(name) {
      try {
        return localStorage.getItem(`cumcraft:${name}`);
      } catch {
        return null;
      }
    },
    write(name, value) {
      try {
        localStorage.setItem(`cumcraft:${name}`, value);
      } catch {
        // The theme can still change when storage is unavailable.
      }
    },
  };

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") root.dataset.theme = theme;
    else delete root.dataset.theme;
  }

  function languageUrl(preference) {
    const locale =
      preference === "browser"
        ? (navigator.languages
            .map((language) => language.toLowerCase().split("-")[0])
            .find((language) => language === "en" || language === "ru") ?? "en")
        : preference;
    if (locale !== alternate.hreflang) return;

    const url = new URL(alternate.href);
    url.search = location.search;
    url.hash = location.hash;
    return url;
  }

  const savedTheme = storage.read("theme");
  const savedLanguage = storage.read("language");
  const theme =
    savedTheme === "light" || savedTheme === "dark" ? savedTheme : "system";
  const language =
    savedLanguage === "en" || savedLanguage === "ru"
      ? savedLanguage
      : "browser";
  applyTheme(theme);

  const url = languageUrl(language);
  if (url) {
    location.replace(url);
    return;
  }

  function setupPicker(id, initialValue, apply) {
    const picker = document.getElementById(id);
    const summary = picker.querySelector("summary");
    const selection = picker.querySelector("[data-selection]");
    const options = picker.querySelectorAll("button");

    function select(value) {
      for (const option of options) {
        const selected = option.value === value;
        option.setAttribute("aria-pressed", String(selected));
        if (selected) {
          selection.textContent = option.textContent.trim();
          selection.lang = option.lang || root.lang;
        }
      }
    }

    function close() {
      picker.open = false;
      summary.focus();
    }

    function dismiss(event) {
      if (!picker.contains(event.target)) picker.open = false;
    }

    for (const option of options) {
      option.addEventListener("click", () => {
        select(option.value);
        close();
        storage.write(id, option.value);
        apply(option.value);
      });
    }
    picker.addEventListener("keydown", (event) => {
      if (picker.open && event.key === "Escape") {
        event.preventDefault();
        close();
      }
    });
    document.addEventListener("click", dismiss);
    document.addEventListener("focusin", dismiss);
    select(initialValue);
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupPicker("theme", theme, applyTheme);
    setupPicker("language", language, (value) => {
      const url = languageUrl(value);
      if (url) location.replace(url);
    });
    document.getElementById("preferences").hidden = false;
  });
})();
