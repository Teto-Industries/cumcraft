import { transformFileAsync } from "@babel/core";
import { mkdir, rm, copyFile } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/releases", { recursive: true });
const compiled = await transformFileAsync("page.tsx", {
  presets: [["babel-preset-solid", { generate: "ssr", hydratable: false }], "@babel/preset-typescript"],
});
await Bun.write("node_modules/.cumcraft-page.mjs", compiled!.code!);
const { pages } = await import("./node_modules/.cumcraft-page.mjs");
const pack = await Bun.file("../client/pack.json").json();
const releases = process.env.CUMCRAFT_RELEASES_FILE
  ? await Bun.file(process.env.CUMCRAFT_RELEASES_FILE).json()
  : [];
const output = pages(pack, releases);
await Promise.all([
  Bun.write("dist/index.html", output.home),
  Bun.write("dist/releases/index.html", output.releases),
  copyFile("style.css", "dist/style.css"),
]);
