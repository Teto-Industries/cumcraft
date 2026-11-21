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
  introduction:
    "Four editions for one server. All include controller support and connected textures.",
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
    introduction:
      "Четыре сборки для одного сервера. Во всех есть поддержка геймпада и соединённые текстуры.",
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
  recommendation: string;
};

export const russianProfiles = new Map(
  Object.entries({
    low: {
      name: "Производительность",
      description:
        "Дальность прорисовки — 8 чанков, без шейдеров и отрисовки далёкого ландшафта.",
      recommendation:
        "Для Steam Deck, старых ноутбуков и устройств со встроенной графикой.",
    },
    "dh-opengl": {
      name: "Distant Horizons",
      description:
        "Отрисовка далёкого ландшафта и шейдеры Complementary Reimagined.",
      recommendation: "Основной вариант с шейдерами для дискретной видеокарты.",
    },
    "dh-vulkan": {
      name: "Distant Horizons · Vulkan",
      description:
        "Далёкий ландшафт и шейдеры Complementary Reimagined на экспериментальном рендерере Vulkan.",
      recommendation:
        "Попробуй, если твоя видеокарта поддерживает Vulkan и тебе интересен новый рендерер.",
    },
    "voxy-opengl": {
      name: "Voxy",
      description:
        "Voxy строит далёкий ландшафт из чанков, которые ты посетил. Включены шейдеры Complementary Reimagined.",
      recommendation:
        "Для тех, кто хочет Voxy вместо Distant Horizons и может запустить OpenGL 4.6.",
    },
  } satisfies Record<string, ProfileCopy>),
);
