import { renderToString } from "@solidjs/web";
import { marked } from "marked";
import type { JSX } from "@solidjs/web";
import sanitizeHtml from "sanitize-html";

type Profile = {
  id: string;
  name: string;
  renderer: string;
  description: string;
  recommendation: string;
};
type Pack = {
  minecraft: string;
  fabricLoader: string;
  server: { name: string; address: string };
  profiles?: Profile[];
};
type Asset = { name: string; browser_download_url: string };
type Release = {
  tag_name: string;
  name: string;
  body: string | null;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
  html_url: string;
  assets: Asset[];
};

const safeUrl = (url: string) => (/^https:\/\//i.test(url) ? url : "");
const assetFor = (release: Release, profile: Profile) =>
  release.assets.find(
    (asset) =>
      asset.name === `cumcraft-${profile.id}.mrpack` &&
      safeUrl(asset.browser_download_url),
  );
const date = (value: string) =>
  new Date(value).toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

function Layout(props: { title: string; root: string; children: JSX.Element }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="A ready-to-play Minecraft client for Cumcraft."
        />
        <title>{props.title}</title>
        <link rel="stylesheet" href={`${props.root}style.css`} />
      </head>
      <body>
        <a class="skip" href="#main">
          Skip to content
        </a>
        <header class="top">
          <div class="wrap nav">
            <a class="brand" href={props.root}>
              <span class="mark">C</span> Cumcraft{" "}
              <span class="brand-sub">/ client</span>
            </a>
            <nav aria-label="Main navigation">
              <a href={`${props.root}#editions`}>Editions</a>
              <a href={`${props.root}releases/`}>Releases</a>
              <a href="https://github.com/Teto-Industries/cumcraft">
                GitHub ↗
              </a>
            </nav>
          </div>
        </header>
        <main id="main">{props.children}</main>
        <footer>
          <div class="wrap footer">
            <span>
              Shaders:{" "}
              <a href="https://www.complementary.dev/shaders/">
                Complementary Reimagined
              </a>
              . Report shader issues in this pack to Cumcraft.
            </span>
            <a href="https://github.com/Teto-Industries/cumcraft/issues">
              Report an issue ↗
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}

function Edition(props: { profile: Profile; number: number; asset?: Asset }) {
  return (
    <article class="card">
      <div class="card-top">
        <span class="number">
          0{props.number} / {props.profile.renderer}
        </span>
        {props.profile.id === "dh-vulkan" && (
          <span class="badge">Experimental</span>
        )}
      </div>
      <h3>{props.profile.name}</h3>
      <p>{props.profile.description}</p>
      <p class="recommendation">{props.profile.recommendation}</p>
      {props.asset && (
        <a
          class="download"
          href={props.asset.browser_download_url}
          aria-label={`Download ${props.profile.name}`}
        >
          Download <span aria-hidden="true">↓</span>
        </a>
      )}
    </article>
  );
}

function GettingStarted(props: { serverName: string }) {
  return (
    <section class="section getting-started">
      <div class="section-head">
        <div>
          <h2>Install, join, update</h2>
        </div>
      </div>
      <div class="steps">
        <article>
          <span>01</span>
          <h3>Import the pack</h3>
          <p>
            Download an edition and import the .mrpack into a compatible
            launcher, such as Prism Launcher, as a new instance.
          </p>
        </article>
        <article>
          <span>02</span>
          <h3>Launch &amp; join</h3>
          <p>
            Start the instance and choose {props.serverName} from the
            multiplayer list. The server is already configured.
          </p>
        </article>
        <article>
          <span>03</span>
          <h3>Update safely</h3>
          <p>
            Import updates as a new instance. Don’t overwrite personal files;
            copy your saves or keybinds if you want to keep them.
          </p>
        </article>
      </div>
      <p class="extra">
        Want inventory sorting or shortcuts? In Prism, open{" "}
        <strong>Edit → Mods</strong> and enable Inventory Profiles Next or
        Inventory Essentials.
      </p>
    </section>
  );
}

function Hero(props: { minecraft: string }) {
  return (
    <section class="hero">
      <div>
        <div class="eyebrow">
          <span class="dot" /> MINECRAFT {props.minecraft} · FABRIC
        </div>
        <h1>Get Cumcraft.</h1>
        <p class="lede">
          Four editions for one server. All include controller support and
          connected textures.
        </p>
        <div class="actions">
          <a class="button primary" href="#editions">
            Choose your edition <span>↓</span>
          </a>
        </div>
      </div>
      <div class="hero-panel" aria-hidden="true">
        <div class="terrain">
          <div class="sun" />
          <div class="mountain back" />
          <div class="mountain front" />
          <div class="horizon" />
        </div>
      </div>
    </section>
  );
}

function Home(props: { pack: Pack; latest?: Release }) {
  const profiles = props.pack.profiles ?? [];

  return (
    <Layout title="Cumcraft — Downloads" root="./">
      <div class="wrap">
        <Hero minecraft={props.pack.minecraft} />
        <div class="facts">
          <div>
            <span>MOD LOADER</span>
            <strong>Fabric {props.pack.fabricLoader}</strong>
          </div>
          <div>
            <span>SERVER</span>
            <strong>{props.pack.server.address}</strong>
          </div>
          <div>
            <span>LATEST RELEASE</span>
            <strong>
              {props.latest ? props.latest.tag_name : "Not published yet"}
            </strong>
          </div>
        </div>
        <section id="editions" class="section">
          <div class="section-head">
            <div>
              <h2>Choose an edition</h2>
            </div>
          </div>
          {!props.latest && (
            <p class="notice">
              No complete stable download has been published yet. Check{" "}
              <a href="./releases/">releases</a> for updates.
            </p>
          )}
          <div class="cards">
            {profiles.map((profile, index) => (
              <Edition
                profile={profile}
                number={index + 1}
                asset={props.latest && assetFor(props.latest, profile)}
              />
            ))}
          </div>
        </section>
        <GettingStarted serverName={props.pack.server.name} />
      </div>
    </Layout>
  );
}

function Releases(props: { releases: Release[] }) {
  return (
    <Layout title="Releases — Cumcraft" root="../">
      <div class="wrap">
        <section class="release-hero">
          <div class="eyebrow">CHANGELOG / ARCHIVE</div>
          <h1>
            What’s new<span class="accent">.</span>
          </h1>
          <p class="lede">
            Changes, improvements, and downloads from each published release.
          </p>
        </section>
        <section class="release-list" aria-label="Published releases">
          {props.releases.length === 0 ? (
            <p class="notice">No releases published yet. Check back soon.</p>
          ) : (
            props.releases.map((release) => (
              <article class="release">
                <div class="release-meta">
                  <span class="eyebrow">{date(release.published_at)}</span>
                  <h2>{release.name || release.tag_name}</h2>
                  <span class="tag">{release.tag_name}</span>
                  {release.prerelease && <span class="tag">Pre-release</span>}
                </div>
                <div class="release-content">
                  <div
                    class="markdown"
                    innerHTML={sanitizeHtml(
                      marked.parse(release.body || "No release notes.", {
                        async: false,
                      }),
                    )}
                  />
                  {release.assets.filter(
                    (asset) =>
                      asset.name.endsWith(".mrpack") &&
                      safeUrl(asset.browser_download_url),
                  ).length > 0 && (
                    <div class="asset-list">
                      <h3>Downloads</h3>
                      {release.assets
                        .filter(
                          (asset) =>
                            asset.name.endsWith(".mrpack") &&
                            safeUrl(asset.browser_download_url),
                        )
                        .map((asset) => (
                          <a href={asset.browser_download_url}>
                            {asset.name} <span>↗</span>
                          </a>
                        ))}
                    </div>
                  )}
                  {safeUrl(release.html_url) && (
                    <a class="source-link" href={release.html_url}>
                      View on GitHub ↗
                    </a>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </Layout>
  );
}

export function pages(pack: Pack, input: Release[]) {
  const releases = input
    .filter((release) => !release.draft && release.published_at)
    .sort((a, b) => b.published_at.localeCompare(a.published_at));
  const profiles = pack.profiles ?? [];
  const latest = releases.find(
    (release) =>
      !release.prerelease &&
      profiles.length > 0 &&
      profiles.every((profile) => assetFor(release, profile)),
  );
  return {
    home: `<!doctype html>${renderToString(() => <Home pack={pack} latest={latest} />)}`,
    releases: `<!doctype html>${renderToString(() => <Releases releases={releases} />)}`,
  };
}
