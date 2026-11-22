const en = {
  description: "A ready-to-play Minecraft client for Cumcraft.",
  homeTitle: "Cumcraft — Downloads",
  releasesTitle: "Releases — Cumcraft",
  skip: "Skip to content",
  nav: "Main navigation",
  editions: "Editions",
  mods: "Mods",
  releases: "Releases",
  issue: "Whine",
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
  noPack: "No stable download yet.",
  checkReleases: "Check releases for updates",
  experimental: "Experimental",
  download: "Download",
  modsIntro: "See what the Cumcraft pack brings to Minecraft. Each link opens the mod’s page on Modrinth.",
  modGameplay: "Gameplay & controls",
  modGraphics: "Graphics & sound",
  modInventory: "Optional inventory tools",
  modInventoryIntro: "Want inventory sorting? Enable either of these in your launcher’s mod list.",
  modTechnical: "Performance & server tools",
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
    mods: "Моды",
    releases: "Релизы",
    issue: "Поныть",
    theme: "Тема",
    language: "Язык",
    automaticTheme: "Системная",
    automaticLanguage: "Как в браузере",
    light: "Светлая",
    dark: "Тёмная",
    headline: "Cumcraft",
    worldMap: "Карта мира Cumcraft",
    exploreMap: "Исследовать карту",
    closeMap: "Вернуться к обзору",
    chooseEdition: "Выбрать сборку",
    noPack: "Стабильной сборки пока нет.",
    checkReleases: "Следить за релизами",
    experimental: "Эксперимент",
    download: "Скачать",
    modsIntro: "Что добавляет сборка Cumcraft. Все ссылки ведут на страницы модов на Modrinth.",
    modGameplay: "Игровой процесс и управление",
    modGraphics: "Графика и звук",
    modInventory: "Дополнения для инвентаря",
    modInventoryIntro: "Хочешь сортировать предметы? Включи один из этих модов в списке модов лаунчера.",
    modTechnical: "Производительность и серверные инструменты",
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
