import { transformFileAsync } from "@babel/core";
import { mkdir, rm, copyFile } from "node:fs/promises";

Bun.plugin({
  name: "solid-ssr",
  setup(build) {
    build.onLoad({ filter: /\/page\.tsx$/ }, async ({ path }) => {
      const compiled = await transformFileAsync(path, {
        presets: [
          ["babel-preset-solid", { generate: "ssr", hydratable: false }],
          "@babel/preset-typescript",
        ],
      });
      return { contents: compiled!.code!, loader: "js" };
    });
  },
});

const { pages } = await import("./page");
const client = await Bun.file("../client/pack.json").json();
const metadata = await Bun.file("../server.json").json();
const { host, port } = metadata.server;
const pack = { ...client, ...metadata, server: { address: `${host}:${port}` } };
const releases = process.env.CUMCRAFT_RELEASES_FILE
  ? await Bun.file(process.env.CUMCRAFT_RELEASES_FILE).json()
  : [];
const configuredMap = process.env.CUMCRAFT_MAP_URL?.trim();
const mapUrl = configuredMap ? new URL(configuredMap) : undefined;
if (
  mapUrl &&
  mapUrl.protocol !== "https:" &&
  !(mapUrl.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(mapUrl.hostname))
) {
  throw new Error("CUMCRAFT_MAP_URL must use HTTPS (HTTP is allowed for localhost previews)");
}
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await Promise.all([
  ...(["en", "ru"] as const).map(async (locale) => {
    const root = locale === "en" ? "dist" : "dist/ru";
    const output = pages(pack, releases, locale, mapUrl?.href);
    await mkdir(`${root}/releases`, { recursive: true });
    await Bun.write(`${root}/index.html`, output.home);
    await Bun.write(`${root}/releases/index.html`, output.releases);
  }),
  copyFile("style.css", "dist/style.css"),
  copyFile("preferences.js", "dist/preferences.js"),
  copyFile("map.js", "dist/map.js"),
  copyFile("../server-icon.png", "dist/server-icon.png"),
]);
