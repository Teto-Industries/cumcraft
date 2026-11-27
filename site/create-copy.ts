import type { Locale } from "./copy";

export type RiskLevel = "high" | "medium" | "low";

export type VideoItem = {
  id: string;
  title: string;
  tag: string;
  caption: string;
};

export type SellingPoint = {
  title: string;
  summary: string;
};

export type ImpactMetric = {
  label: string;
  baseline: number;
  proposed: number;
  note: string;
};

export type PlayerGroupImpact = {
  group: string;
  verdict: string;
  level: "positive" | "mixed" | "caution";
  summary: string;
};

export type RiskPoint = {
  id: number;
  title: string;
  likelihood: number; // 1–5
  severity: number; // 1–5
  level: RiskLevel;
  detail: string;
};

export type PathOption = {
  name: string;
  tag: string;
  recommended?: boolean;
  summary: string;
  points: readonly string[];
};

export type CreateProposalCopy = {
  title: string;
  description: string;
  kicker: string;
  heading: string;
  lead: string;
  showcaseHeading: string;
  watchOnYoutube: string;
  videos: readonly VideoItem[];
  sellingHeading: string;
  sellingIntro: string;
  sellingPoints: readonly SellingPoint[];
  oneWayHeading: string;
  oneWayParagraphs: readonly string[];
  impactHeading: string;
  impactIntro: string;
  impactLegendBaseline: string;
  impactLegendProposed: string;
  impactChartCaption: string;
  impactMetrics: readonly ImpactMetric[];
  groupsHeading: string;
  groups: readonly PlayerGroupImpact[];
  risksHeading: string;
  risksIntro: string;
  riskAxisX: string;
  riskAxisY: string;
  riskAxisLow: string;
  riskAxisHigh: string;
  riskChartCaption: string;
  riskLevelLabels: Record<RiskLevel, string>;
  risks: readonly RiskPoint[];
  pathsHeading: string;
  pathsIntro: string;
  paths: readonly PathOption[];
  worldDetailsSummary: string;
  worldDetails: readonly string[];
  questionsHeading: string;
  questionsIntro: string;
  questions: readonly string[];
  sourceLink: string;
  backHome: string;
};

const en: CreateProposalCopy = {
  title: "Add Create to Cumcraft?",
  description:
    "Should we add Create to Cumcraft? Trains, crop & kitchen automation, videos, and trade-offs.",
  kicker: "Server discussion · Minecraft 26.3",
  heading: "Should we add Create?",
  lead: "Create adds windmills, waterwheels, visual farm & kitchen automation, and trains between bases.",
  showcaseHeading: "Create",
  watchOnYoutube: "Watch on YouTube",
  videos: [
    {
      id: "rR8W-f9YhYA",
      title: "This is Create.",
      tag: "Main trailer · 5 min",
      caption: "Windmills, harvesters, bakery belts, moving doors, whatever.",
    },
    {
      id: "dtPl8w5gtG4",
      title: "Trains in Create",
      tag: "Overworld transport",
      caption: "Curved tracks, custom passenger & cargo trains, and stations.",
    },
    {
      id: "FGVkC8ZVHHw",
      title: "Create 6.0: Post-Production",
      tag: "Ziplines & delivery",
      caption: "Chain ziplines, package delivery, and shared storage.",
    },
  ],
  sellingHeading: "How Create fits our server",
  sellingIntro:
    "We have tons of Nether train roads, crop farms, and cooking—Create helps with roads, moving resources around, and automation.",
  sellingPoints: [
    {
      title: "Trains between bases & farms",
      summary:
        "In Create you can build trains with stations and schedules—they even run through unloaded chunks and portals, haul tons of items, and load/unload automatically.",
    },
    {
      title: "Crop farms & Farmer’s Delight kitchens",
      summary:
        "With Create we could in theory automate harvesting and cooking, and build on top of our existing farms.",
    },
    {
      title: "Relatively easy(?)",
      summary:
        "We can already automate plenty right now, but building vanilla redstone takes a genius—with Create we can actually design stuff ourselves without copying YouTube guides.",
    },
    {
      title: "Ziplines and other cool stuff",
      summary:
        "We can string ziplines (like in the third video) between places and use Create’s moving parts in builds.",
    },
  ],
  oneWayHeading: "We won’t be able to drop Create later",
  oneWayParagraphs: [
    "If like a year from now a massive Minecraft update drops that breaks everything but adds sex, we’ll want to update—and we’ll always have to wait on Create. If its dev stops working on it (right now it’s 1 person), we’d have to port it ourselves.",
    "If we ever decide to drop Create, all its machines and blocks would probably have to become air, or we’d have to write a mod that +- replaces it or lets us phase it out gradually. Basically it’s gonna hurt.",
  ],
  impactHeading: "Vanilla+ now vs. with Create",
  impactIntro: "Rough 1–10 score (higher = better).",
  impactLegendBaseline: "Vanilla+ now",
  impactLegendProposed: "With Create",
  impactChartCaption: "Gains vs. vanilla farm balance, spawn FPS, and rollback pain.",
  impactMetrics: [
    {
      label: "Overworld travel between bases & farms",
      baseline: 3,
      proposed: 9,
      note: "Trains and ziplines are cool.",
    },
    {
      label: "Plantations, kitchens & animal farms",
      baseline: 4,
      proposed: 9,
      note: "Auto-harvesting, cooking, and delivery for Farmer’s Delight.",
    },
    {
      label: "Automation without complex redstone",
      baseline: 3,
      proposed: 9,
      note: "Visual machines + built-in 3D guide (hold W) + Sleroq & Sakanai can help.",
    },
    {
      label: "Vanilla farm relevance",
      baseline: 10,
      proposed: 6,
      note: "Wood, crops, stone, and some ores get way easier to farm.",
    },
    {
      label: "Spawn FPS (shaders & lighter PCs)",
      baseline: 9,
      proposed: 6,
      note: "Piling spinning factories right inside spawn will drop FPS.",
    },
    {
      label: "Dropping the mod later",
      baseline: 9,
      proposed: 2,
      note: "Going back to pure vanilla later will hurt.",
    },
  ],
  groupsHeading: "How it hits different players",
  groups: [
    {
      group: "Plantations, cooking & animals",
      verdict: "Big upside",
      level: "positive",
      summary:
        "Automate big fields, Farmer’s Delight cooking, and animal-feed delivery without ugly redstone.",
    },
    {
      group: "Roads & builders",
      verdict: "Big upside",
      level: "positive",
      summary:
        "Trains, stations, bridges, elevators, and ziplines—actual Overworld transport alongside our Nether roads.",
    },
    {
      group: "Vanilla-farm builders",
      verdict: "Agree on rules",
      level: "mixed",
      summary:
        "Create can overshadow some classic farms (like iron, wood, or mining) unless we set a few limits. Mob farms still matter.",
    },
    {
      group: "Never played Create",
      verdict: "Not hard",
      level: "positive",
      summary:
        "Nobody has to use it, and if you want to try—the in-game 3D guide plus Sleroq and Sakanai can walk you through.",
    },
  ],
  risksHeading: "Real downsides",
  risksIntro: "Main drawbacks by how likely they are and how annoying they get.",
  riskAxisX: "Likelihood",
  riskAxisY: "Impact",
  riskAxisLow: "Low",
  riskAxisHigh: "High",
  riskChartCaption: "Five player-facing risks by likelihood and impact.",
  riskLevelLabels: {
    high: "High",
    medium: "Medium",
    low: "Low",
  },
  risks: [
    {
      id: 1,
      title: "Spawn FPS drops if factories pile up there",
      likelihood: 4,
      severity: 4,
      level: "high",
      detail:
        "Almost all our bases are at spawn, and dense factories hit FPS (especially with shaders or lighter PCs). Fix: put big factories further out and run a train.",
    },
    {
      id: 2,
      title: "Going back to vanilla later will hurt",
      likelihood: 2,
      severity: 5,
      level: "medium",
      detail:
        "If we ever cut Create out, all mod blocks and machines turn into air and anything left in Create vaults disappears.",
    },
    {
      id: 3,
      title: "Slower major Minecraft updates",
      likelihood: 3,
      severity: 3,
      level: "medium",
      detail:
        "Create Fly is maintained by 1 person, so big updates can lag behind. We can port regular quarterly updates ourselves if needed, though we’ll still wait a bit.",
    },
    {
      id: 4,
      title: "Probably losing Vulkan",
      likelihood: 4,
      severity: 2,
      level: "medium",
      detail:
        "The experimental Vulkan edition probably won’t work with Create—you’d switch to Recommended, Voxy, or Performance.",
    },
    {
      id: 5,
      title: "Zinc only spawns in new chunks",
      likelihood: 5,
      severity: 1,
      level: "low",
      detail:
        "Early stuff uses iron; for Brass later we just reset empty outer chunks or walk further out.",
    },
  ],
  pathsHeading: "Two options",
  pathsIntro: "Stay as-is, or add Create with a couple simple rules.",
  paths: [
    {
      name: "Stay Vanilla+",
      tag: "As-is",
      summary: "Keep everything as it is: fast Minecraft updates, Vulkan, and vanilla farms.",
      points: [
        "Vanilla farms and Nether roads keep their exact value.",
        "Nothing new to install or learn.",
        "Overworld travel stays on foot, boats, horses, or elytra.",
      ],
    },
    {
      name: "Add Create",
      tag: "With rules",
      recommended: true,
      summary: "Add Create + recipe viewer (+ Farmer’s Delight recipes) and agree on a few things.",
      points: [
        "Trains, ziplines, auto-harvesting, and cooking.",
        "Keep big factories outside spawn (with a train line) so FPS stays fine.",
        "Optionally limit cheesy stuff like giant tunnel bores or infinite lava.",
      ],
    },
  ],
  worldDetailsSummary: "What about our existing world & web map?",
  worldDetails: [
    "All bases, farms, roads, and chests stay untouched. Zinc spawns in fresh (or safely reset empty) chunks.",
    "Stations and Create blocks show up fine on the web map; trains only disappear while moving.",
    "Before rolling it out we’ll move to roomier hardware, test locally, and take a full backup.",
  ],
  questionsHeading: "What do you think?",
  questionsIntro: "Drop it in chat:",
  questions: [
    "Do you even want trains, ziplines, and auto-farms/cooking?",
    "Okay with Create being long-term and painful to drop later?",
    "Down to keep big factories outside spawn and maybe cap giant tunnel bores?",
    "If you use Vulkan—fine switching to Recommended, Voxy, or Performance?",
  ],
  sourceLink: "Create Fly on Modrinth",
  backHome: "Back to Cumcraft",
};

const ru: CreateProposalCopy = {
  title: "Ставим Create на Cumcraft?",
  description:
    "Стоит ли добавлять Create на Cumcraft: поезда, фермы и готовка, видосы и минусы.",
  kicker: "Обсуждение · Minecraft 26.3",
  heading: "Ставим Create на сервер?",
  lead: "Create добавляет ветряки, водяные колёса, наглядную автоматизацию ферм и кухонь и нормальные поезда между базами в обычном мире.",
  showcaseHeading: "Create",
  watchOnYoutube: "Открыть на YouTube",
  videos: [
    {
      id: "rR8W-f9YhYA",
      title: "This is Create.",
      tag: "Главный трейлер · 5 мин",
      caption: "Ветряки, комбайны, пекарни на лентах, подвижные ворота и всё такое.",
    },
    {
      id: "dtPl8w5gtG4",
      title: "Поезда в Create",
      tag: "Транспорт по миру",
      caption: "Плавные пути, свои пассажирские и грузовые составы и станции.",
    },
    {
      id: "FGVkC8ZVHHw",
      title: "Create 6.0: Post-Production",
      tag: "Зиплайны и доставка",
      caption: "Цепные зиплайны, доставка посылок и общие склады.",
    },
  ],
  sellingHeading: "Как впишется к нам Create",
  sellingIntro:
    "У нас куча дорог для поездов в незере, мы строим механизмы по сбору урожая и готовим всякую еду, Create поможет с дорогами, доставкой ресурсов и автоматизацией.",
  sellingPoints: [
    {
      title: "Нормальные поезда между базами и фермами",
      summary:
        "В Create можно собрать поезда со станциями и расписанием — причём они едут даже через непрогруженные чанки и порталы, могут перевозить кучу предметов и автоматически нагружаться/разгружаться.",
    },
    {
      title: "Ветряные комбайны и кухни для Farmer’s Delight",
      summary:
        "С Create в теории мы сможем автоматизировать сбор урожая и готовку, дополнить текущие фермы.",
    },
    {
      title: "Относительно легко(?)",
      summary:
        "Мы сейчас тоже можем много всего автоматизировать, но чтобы строить ванильный редстоун нужно быть гением, с Create это можно будет делать самим, не копируя гайды с ютуба.",
    },
    {
      title: "Зиплайны и другие крутые штуки",
      summary:
        "Можно будет натянуть зиплайны (как на третьем видосе) между местами и в принципе использовать подвижные штуки, которые даёт Create, в постройках.",
    },
  ],
  oneWayHeading: "Мы потом не сможем отказаться от Create",
  oneWayParagraphs: [
    "Если типа через год выйдет огромное обновление майна, которое всё сломает, но добавит секс, мы захотим обновляться — нам придётся всегда ждать Create. Если у него умрёт разработка (сейчас 1 человек), то придётся портировать самим.",
    "Если захотим отказаться от Create, то все механизмы, блоки и т.д. вероятно придётся заменить на воздух, либо написать мод, который +- заменяет нам его или даёт возможность постепенно уйти. Короче, это больно будет.",
  ],
  impactHeading: "Vanilla+ сейчас vs. с Create",
  impactIntro: "Примерно по шкале 1–10 (чем выше — тем лучше).",
  impactLegendBaseline: "Vanilla+ сейчас",
  impactLegendProposed: "С Create",
  impactChartCaption: "Плюсы против баланса ферм, FPS на спавне и боли при откате.",
  impactMetrics: [
    {
      label: "Транспорт между базами и фермами в обычном мире",
      baseline: 3,
      proposed: 9,
      note: "Поезда и зиплайны — круто.",
    },
    {
      label: "Плантации, готовка и фермы животных",
      baseline: 4,
      proposed: 9,
      note: "Авто-сбор урожая, готовка и доставка под Farmer’s Delight.",
    },
    {
      label: "Автоматизация без сложного редстоуна",
      baseline: 3,
      proposed: 9,
      note: "Наглядные механизмы + встроенный 3D-гайд (зажать W) + Sleroq и Sakanai помогут.",
    },
    {
      label: "Актуальность ванильных ферм",
      baseline: 10,
      proposed: 6,
      note: "Дерево, урожай, камень и часть руд добывать станет сильно проще.",
    },
    {
      label: "FPS на спавне (шейдеры и ноутбуки)",
      baseline: 9,
      proposed: 6,
      note: "Если настроить кучу крутящихся заводов прямо на спавне — FPS просядет.",
    },
    {
      label: "Отказаться от мода потом",
      baseline: 9,
      proposed: 2,
      note: "Убрать мод потом без боли не выйдет.",
    },
  ],
  groupsHeading: "Как это повлияет на разных игроков",
  groups: [
    {
      group: "Плантации, готовка и животные",
      verdict: "Большой плюс",
      level: "positive",
      summary:
        "Можно автоматизировать сбор больших полей, готовку для Farmer’s Delight и доставку еды к животным без страшного редстоуна.",
    },
    {
      group: "Дороги и стройка",
      verdict: "Большой плюс",
      level: "positive",
      summary:
        "Поезда, станции, мосты, лифты и зиплайны — нормальный транспорт в обычном мире в пару к незерским дорогам.",
    },
    {
      group: "Ванильные фермы",
      verdict: "Обсудить рамки",
      level: "mixed",
      summary:
        "Create может затмить часть классических ферм (типа железа, дерева или шахты), если не ввести пару ограничений. Моб-фермы всё равно нужны.",
    },
    {
      group: "Кто не играл с Create",
      verdict: "Несложно",
      level: "positive",
      summary:
        "Никто не заставляет им пользоваться, а если захочется — встроенный 3D-гайд плюс Sleroq и Sakanai всё покажут.",
    },
  ],
  risksHeading: "Реальные минусы",
  risksIntro: "Основные минусы — по вероятности и тому, насколько мешают.",
  riskAxisX: "Вероятность",
  riskAxisY: "Влияние",
  riskAxisLow: "Низкое",
  riskAxisHigh: "Высокое",
  riskChartCaption: "Пять рисков для игроков по вероятности и влиянию.",
  riskLevelLabels: {
    high: "Высокий",
    medium: "Средний",
    low: "Низкий",
  },
  risks: [
    {
      id: 1,
      title: "FPS на спавне, если настроить там заводов",
      likelihood: 4,
      severity: 4,
      level: "high",
      detail:
        "Почти все базы рядом со спавном, а плотные заводы бьют по FPS (особенно с шейдерами и на слабых ПК). Просто выносим большие заводы подальше и кидаем поезд.",
    },
    {
      id: 2,
      title: "Откатиться в ваниллу потом будет больно",
      likelihood: 2,
      severity: 5,
      level: "medium",
      detail:
        "Если когда-нибудь решим вырезать Create, все модовые блоки и механизмы станут воздухом, а вещи в хранилищах Create пропадут.",
    },
    {
      id: 3,
      title: "Задержки на крупных апдейтах майна",
      likelihood: 3,
      severity: 3,
      level: "medium",
      detail:
        "Create Fly делает один человек, так что новые версии могут выходить с задержкой. Обычные квартальные апдейты, если что, портируем сами, но ждать придётся.",
    },
    {
      id: 4,
      title: "Скорее всего потеряем Vulkan",
      likelihood: 4,
      severity: 2,
      level: "medium",
      detail:
        "Экспериментальная сборка Vulkan с Create вряд ли заведётся — придётся перейти на Рекомендуемую, Voxy или Производительность.",
    },
    {
      id: 5,
      title: "Цинк только в новых чанках",
      likelihood: 5,
      severity: 1,
      level: "low",
      detail:
        "Стартовые штуки делаются из железа, а для латуни потом просто сбросим пустые дальние чанки или сходим дальше.",
    },
  ],
  pathsHeading: "Два варианта",
  pathsIntro: "Остаёмся как есть или ставим Create с парой простых правил.",
  paths: [
    {
      name: "Оставить Vanilla+",
      tag: "Как сейчас",
      summary: "Всё остаётся как сейчас: быстрые апдейты майна, Vulkan и привычные фермы.",
      points: [
        "Ванильные фермы и незерские дороги не теряют смысла.",
        "Ничего нового ставить и учить не надо.",
        "По обычному миру дальше пешком, на лодках, конях или элитрах.",
      ],
    },
    {
      name: "Поставить Create",
      tag: "С правилами",
      recommended: true,
      summary: "Ставим Create + просмотр рецептов (+ рецепты для Farmer’s Delight) и договариваемся о паре вещей.",
      points: [
        "Поезда, зиплайны, авто-фермы урожая и готовки.",
        "Крупные заводы выносим за спавн (с веткой поезда), чтобы не убить FPS.",
        "Если захотим — ограничим имбовые штуки типа гигантских буров или бесконечной лавы.",
      ],
    },
  ],
  worldDetailsSummary: "Что со старым миром и картой?",
  worldDetails: [
    "Все базы, фермы, дороги и сундуки останутся на месте. Цинк появится в новых (или сброшенных пустых) чанках.",
    "На веб-карте станции и блоки Create видны нормально; пропадают только поезда, пока едут.",
    "Перед этим переедем на другое железо, всё проверим и сделаем полный бэкап.",
  ],
  questionsHeading: "Что думаешь?",
  questionsIntro: "Напиши в чат:",
  questions: [
    "Тебе вообще интересны поезда, зиплайны и авто-фермы с готовкой?",
    "Ок ли, что Create — это надолго и отказаться от него потом будет больно?",
    "Договоримся выносить большие заводы за спавн и при желании чуть ограничить буры?",
    "Если сидишь на Vulkan — норм перейти на Рекомендуемую, Voxy или Производительность?",
  ],
  sourceLink: "Create Fly на Modrinth",
  backHome: "На главную Cumcraft",
};

export const createProposalCopy = {
  en,
  ru,
} satisfies Record<Locale, CreateProposalCopy>;
