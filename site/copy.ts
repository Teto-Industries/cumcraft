const en = {
  description: "A ready-to-play Minecraft client for Cumcraft.",
  homeTitle: "Cumcraft — Downloads",
  releasesTitle: "Releases — Cumcraft",
  skip: "Skip to content",
  nav: "Main navigation",
  editions: "Editions",
  releases: "Releases",
  issue: "Report an issue",
  theme: "Theme",
  language: "Language",
  automaticTheme: "System",
  automaticLanguage: "Browser",
  light: "Light",
  dark: "Dark",
  headline: "Join Cumcraft.",
  worldMap: "Cumcraft world map",
  exploreMap: "Explore the map",
  closeMap: "Back to overview",
  chooseEdition: "Choose an edition",
  loader: "Mod loader",
  server: "Server",
  latest: "Latest release",
  unpublished: "Not published yet",
  noPack: "No stable download yet.",
  checkReleases: "Check releases for updates",
  experimental: "Experimental",
  download: "Download",
  archive: "Changelog / Archive",
  changelog: "What’s new",
  archiveIntroduction: "Changes and downloads from each published release.",
  published: "Published releases",
  noReleases: "No releases published yet. Check back soon.",
  prerelease: "Pre-release",
  noNotes: "No release notes.",
  downloads: "Downloads",
  viewSource: "View on GitHub",
};

type Copy = typeof en;
export type Locale = "en" | "ru";

export const copy = {
  en,
  ru: {
    description: "Готовая сборка Minecraft для игры на Cumcraft.",
    homeTitle: "Cumcraft — Загрузки",
    releasesTitle: "Релизы — Cumcraft",
    skip: "Перейти к содержимому",
    nav: "Главное меню",
    editions: "Сборки",
    releases: "Релизы",
    issue: "Сообщить о проблеме",
    theme: "Тема",
    language: "Язык",
    automaticTheme: "Системная",
    automaticLanguage: "Как в браузере",
    light: "Светлая",
    dark: "Тёмная",
    headline: "Присоединяйся к Cumcraft.",
    worldMap: "Карта мира Cumcraft",
    exploreMap: "Исследовать карту",
    closeMap: "Вернуться к обзору",
    chooseEdition: "Выбрать сборку",
    loader: "Загрузчик модов",
    server: "Сервер",
    latest: "Последний релиз",
    unpublished: "Пока нет",
    noPack: "Стабильной сборки пока нет.",
    checkReleases: "Следить за релизами",
    experimental: "Эксперимент",
    download: "Скачать",
    archive: "История изменений / Архив",
    changelog: "Что нового",
    archiveIntroduction:
      "Изменения и файлы для скачивания из всех опубликованных релизов.",
    published: "Опубликованные релизы",
    noReleases: "Релизов пока нет. Загляни позже.",
    prerelease: "Предрелиз",
    noNotes: "Нет списка изменений.",
    downloads: "Загрузки",
    viewSource: "Открыть на GitHub",
  },
} satisfies Record<Locale, Copy>;

type ProfileCopy = {
  name: string;
  description: string;
};

export const russianProfiles = new Map(
  Object.entries({
    low: {
      name: "Производительность",
      description: "Профиль, оптимизированный для слабых ПК или Steam Deck.",
    },
    "dh-opengl": {
      name: "Рекомендуемая",
      description: "Основной вариант с шейдерами для ПК средней мощности.",
    },
    "dh-vulkan": {
      name: "Vulkan",
      description:
        "Попробуй, если твоя видеокарта поддерживает Vulkan: FPS может быть выше.",
    },
    "voxy-opengl": {
      name: "Voxy",
      description:
        "Как рекомендуемая сборка, но с Voxy вместо Distant Horizons. Voxy менее требователен к ресурсам и может подойти лучше.",
    },
  } satisfies Record<string, ProfileCopy>),
);
