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
      en: "New biomes, ported to the current Minecraft version.",
      ru: "Новые биомы. В сборке порт на новую версию.",
    }],
    ["farmers-delight-refabricated", "Farmer’s Delight Refabricated", {
      en: "New crops, recipes, and cooking tools.",
      ru: "Новые культуры, рецепты и кухонная утварь.",
    }],
    ["fallingtree", "FallingTree", {
      en: "The whole tree falls when you chop one log.",
      ru: "Дерево падает целиком, если срубить один блок ствола.",
    }],
    ["do-a-barrel-roll", "Do a Barrel Roll", {
      en: "Banking and rolls for elytra flight.",
      ru: "Крен и бочки при полёте на элитрах.",
    }],
    ["patpat", "PatPat", {
      en: "Lets you pet mobs.",
      ru: "Мобов можно гладить.",
    }],
    ["shulkerboxtooltip", "Shulker Box Tooltip", {
      en: "Shows what’s inside shulker boxes in your inventory.",
      ru: "Показывает содержимое шалкеров прямо в инвентаре.",
    }],
    ["controlify", "Controlify", {
      en: "Makes Minecraft easier to play with a controller.",
      ru: "Для комфортной игры с контроллера.",
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
      en: "Renders terrain well beyond the normal view distance.",
      ru: "Увеличивает дальность прорисовки.",
    }, ["dh-opengl", "dh-vulkan"]],
    ["voxy", "Voxy", {
      en: "An alternative to Distant Horizons for longer view distances.",
      ru: "Альтернатива Distant Horizons для увеличения дальности прорисовки.",
    }, ["voxy-opengl"]],
    ["iris", "Iris Shaders", {
      en: "Shader support on OpenGL.",
      ru: "Шейдеры на OpenGL.",
    }, ["dh-opengl", "voxy-opengl"]],
    ["vitrail-shaders", "Vitrail Shaders", {
      en: "Shader support on Vulkan.",
      ru: "Шейдеры на Vulkan.",
    }, ["dh-vulkan"]],
    ["lambdynamiclights", "LambDynamicLights", {
      en: "Torches light up the area even when held.",
      ru: "Факелы светят даже в руке.",
    }],
    ["presence-footsteps", "Presence Footsteps", {
      en: "Footsteps sound different on different blocks.",
      ru: "Звук шагов зависит от блока под ногами.",
    }],
    ["coolrain", "Cool Rain", {
      en: "Rain sounds different depending on what it lands on.",
      ru: "Дождь по-разному звучит на разных поверхностях.",
    }],
    ["continuity", "Continuity", {
      en: "Connects textures so adjacent glass blocks look seamless.",
      ru: "Соединяет текстуры, чтобы между блоками стекла не было швов.",
    }],
    ["not-enough-animations", "Not Enough Animations", {
      en: "Eating, reading maps, and other actions get third-person animations.",
      ru: "Добавляет анимации еды, чтения карты и других действий от третьего лица.",
    }],
    ["animaticarefabricated", "Animatica Refabricated"],
    ["bettergrassify", "BetterGrassify"],
    ["entity-model-features", "Entity Model Features"],
    ["entitytexturefeatures", "Entity Texture Features"],
    ["euphoria-patches", "Euphoria Patches"],
    ["no-gaps-in-yo-items", "No Gaps in Yo Items"],
    ["optigui", "OptiGUI"],
    ["real-arrow-tip", "Real Arrow Tip"],
    ["skyboxify", "Skyboxify"],
    ["sodium-shadowy-path-blocks", "Sodium Shadowy Path Blocks"],
  ],
  inventory: [
    ["inventory-essentials", "Inventory Essentials", {
      en: "Item sorting and shortcuts for moving stacks.",
      ru: "Сортировка предметов и быстрый перенос стаков.",
    }],
    ["inventory-profiles-next", "Inventory Profiles Next", {
      en: "Item sorting, slot locking, and saved gear layouts.",
      ru: "Сортировка предметов, блокировка слотов и сохранение раскладок снаряжения.",
    }],
  ],
  technical: [
    ["sodium", "Sodium", {
      en: "Improves frame rates and reduces stutter.",
      ru: "Повышает FPS и уменьшает подтормаживания.",
    }],
    ["better-block-entities", "Better Block Entities"],
    ["bluemap", "BlueMap"],
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
