import type { Locale } from "./copy";

type Mod = readonly [
  slug: string,
  name: string,
  description?: Record<Locale, string>,
  editions?: readonly string[],
];

export const mods = {
  gameplay: [
    ["traverse", "Traverse", {
      en: "Explore new biomes, from autumn woods to lush swamps. Cumcraft ships its own port.",
      ru: "Исследуй новые биомы: от осенних лесов до пышных болот. В сборке — порт для Cumcraft.",
    }],
    ["farmers-delight-refabricated", "Farmer’s Delight Refabricated", {
      en: "Grow new crops and cook meals with kitchen tools like the cooking pot and cutting board.",
      ru: "Выращивай новые культуры и готовь блюда в кастрюле или на разделочной доске.",
    }],
    ["fallingtree", "FallingTree", {
      en: "Cut one log to bring down the whole tree.",
      ru: "Сруби один блок ствола, чтобы свалить всё дерево.",
    }],
    ["do-a-barrel-roll", "Do a Barrel Roll", {
      en: "Bank and roll when flying with an elytra.",
      ru: "Летай на элитрах с креном и делай бочки.",
    }],
    ["patpat", "PatPat", {
      en: "Give your favorite mobs a pat.",
      ru: "Гладь любимых мобов.",
    }],
    ["shulkerboxtooltip", "Shulker Box Tooltip", {
      en: "See what’s in a shulker box without placing it.",
      ru: "Смотри, что лежит в шалкере, не ставя его на землю.",
    }],
    ["controlify", "Controlify", {
      en: "Play Java Edition with a controller, including the Steam Deck’s built-in controls.",
      ru: "Играй в Java Edition с геймпадом или встроенным управлением Steam Deck.",
    }],
    ["better-mount-hud", "Better Mount HUD"],
    ["cape-provider", "Cape Provider"],
    ["controlling", "Controlling"],
    ["minecraft-cursor", "Cursors Extended"],
    ["language-reload", "Language Reload"],
    ["modmenu", "Mod Menu"],
    ["morechathistory", "More Chat History"],
    ["no-chat-reports", "No Chat Reports"],
    ["ok-zoomer", "Ok Zoomer"],
    ["paginatedadvancements", "Paginated Advancements & Custom Frames"],
    ["puzzle", "Puzzle"],
    ["sound-controller", "Sound Controller"],
  ],
  graphics: [
    ["distanthorizons", "Distant Horizons", {
      en: "See terrain far beyond the normal render distance.",
      ru: "Смотри далеко за пределы обычной дальности прорисовки.",
    }, ["dh-opengl", "dh-vulkan"]],
    ["voxy", "Voxy", {
      en: "A lighter alternative for rendering distant terrain.",
      ru: "Менее требовательная альтернатива для прорисовки дальних пейзажей.",
    }, ["voxy-opengl"]],
    ["iris", "Iris Shaders", {
      en: "Run shader packs on OpenGL.",
      ru: "Запускай шейдерпаки на OpenGL.",
    }, ["dh-opengl", "voxy-opengl"]],
    ["vitrail-shaders", "Vitrail Shaders", {
      en: "Run shader packs on Minecraft’s Vulkan renderer.",
      ru: "Запускай шейдерпаки на Vulkan-рендерере Minecraft.",
    }, ["dh-vulkan"]],
    ["euphoria-patches", "Euphoria Patches", {
      en: "Add more effects and settings to Complementary Shaders.",
      ru: "Больше эффектов и настроек для шейдеров Complementary.",
    }, ["dh-opengl", "voxy-opengl"]],
    ["lambdynamiclights", "LambDynamicLights", {
      en: "Light your way with a torch in hand.",
      ru: "Освещай дорогу факелом прямо в руке.",
    }],
    ["presence-footsteps", "Presence Footsteps", {
      en: "Hear different footsteps on wood, stone, grass, and other surfaces.",
      ru: "Слушай, как по-разному звучат шаги по дереву, камню, траве и другим поверхностям.",
    }],
    ["animaticarefabricated", "Animatica Refabricated"],
    ["bettergrassify", "BetterGrassify"],
    ["continuity", "Continuity"],
    ["coolrain", "Cool Rain"],
    ["entity-model-features", "Entity Model Features"],
    ["entitytexturefeatures", "Entity Texture Features"],
    ["no-gaps-in-yo-items", "No Gaps in Yo Items"],
    ["not-enough-animations", "Not Enough Animations"],
    ["optigui", "OptiGUI"],
    ["real-arrow-tip", "Real Arrow Tip"],
    ["skyboxify", "Skyboxify"],
    ["sodium-shadowy-path-blocks", "Sodium Shadowy Path Blocks"],
  ],
  inventory: [
    ["inventory-essentials", "Inventory Essentials", {
      en: "Sort items and move stacks with shortcuts.",
      ru: "Сортируй предметы и перемещай стаки быстрыми клавишами.",
    }],
    ["inventory-profiles-next", "Inventory Profiles Next", {
      en: "Sort items, lock slots, and save gear layouts.",
      ru: "Сортируй предметы, закрепляй слоты и сохраняй раскладки снаряжения.",
    }],
  ],
  technical: [
    ["sodium", "Sodium", {
      en: "Improves frame rates and reduces stutter.",
      ru: "Повышает FPS и уменьшает подтормаживания.",
    }],
    ["bluemap", "BlueMap", {
      en: "Renders the server world as a 3D map you can explore in your browser.",
      ru: "Создаёт 3D-карту мира сервера, которую можно исследовать в браузере.",
    }],
    ["better-block-entities", "Better Block Entities"],
    ["c2me-fabric", "C2ME"],
    ["carpet", "Carpet"],
    ["chunky", "Chunky"],
    ["clumps", "Clumps"],
    ["configmanager", "Config Manager"],
    ["debugify", "Debugify"],
    ["dynamic-fps", "Dynamic FPS"],
    ["easyauth", "EasyAuth"],
    ["entityculling", "Entity Culling"],
    ["fabricexporter", "FabricExporter"],
    ["fastback", "Fast Backups"],
    ["ferrite-core", "FerriteCore"],
    ["immediatelyfast", "ImmediatelyFast"],
    ["ixeris", "Ixeris"],
    ["lithium", "Lithium"],
    ["moreculling", "More Culling"],
    ["pulsenet", "PulseNet"],
    ["servercore", "ServerCore"],
    ["skinrestorer", "Skin Restorer"],
    ["sodium-extra", "Sodium Extra"],
    ["vmp-fabric", "Very Many Players"],
  ],
} satisfies Record<string, readonly Mod[]>;

export type { Mod };
