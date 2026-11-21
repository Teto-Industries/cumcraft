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

  document.addEventListener("DOMContentLoaded", () => {
    const themeSelect = document.getElementById("theme");
    const languageSelect = document.getElementById("language");
    themeSelect.value = theme;
    languageSelect.value = language;

    themeSelect.addEventListener("change", () => {
      storage.write("theme", themeSelect.value);
      applyTheme(themeSelect.value);
    });
    languageSelect.addEventListener("change", () => {
      storage.write("language", languageSelect.value);
      const url = languageUrl(languageSelect.value);
      if (url) location.replace(url);
    });
    document.getElementById("preferences").hidden = false;
  });
})();
