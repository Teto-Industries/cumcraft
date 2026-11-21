import { renderToString } from "@solidjs/web";
import { marked } from "marked";
import type { JSX } from "@solidjs/web";
import sanitizeHtml from "sanitize-html";
import { copy, russianProfiles, type Locale } from "./copy";

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
  server: { address: string };
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
const date = (value: string, locale: Locale) =>
  new Date(value).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

function Preferences(props: { locale: Locale }) {
  const t = copy[props.locale];

  return (
    <div class="preferences" id="preferences" hidden>
      <label class="preference">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18zm0 0v18m0-15 6 6m-6-2 7 7m-7-3 5 5" />
        </svg>
        <select id="theme" aria-label={t.theme}>
          <option value="system">{t.automaticTheme}</option>
          <option value="light">{t.light}</option>
          <option value="dark">{t.dark}</option>
        </select>
      </label>
      <label class="preference">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18" />
        </svg>
        <select id="language" aria-label={t.language}>
          <option value="browser">{t.automaticLanguage}</option>
          <option value="en" lang="en">
            English
          </option>
          <option value="ru" lang="ru">
            Русский
          </option>
        </select>
      </label>
    </div>
  );
}

function Header(props: { locale: Locale; home: string; icon: string }) {
  const t = copy[props.locale];

  return (
    <header class="top">
      <div class="wrap nav">
        <a class="brand" href={props.home}>
          <img class="mark" src={props.icon} alt="" width="32" height="32" />
          Cumcraft
        </a>
        <nav aria-label={t.nav}>
          <a href={`${props.home}#editions`}>{t.editions}</a>
          <a href={`${props.home}releases/`}>{t.releases}</a>
          <a href="https://github.com/Teto-Industries/cumcraft">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </nav>
        <Preferences locale={props.locale} />
      </div>
    </header>
  );
}

function Layout(props: {
  locale: Locale;
  section: "home" | "releases";
  children: JSX.Element;
}) {
  const t = copy[props.locale];
  const onReleases = props.section === "releases";
  const home = onReleases ? "../" : "./";
  const root = props.locale === "ru" ? `${home}../` : home;
  const alternate = `${root}${props.locale === "en" ? "ru/" : ""}${onReleases ? "releases/" : ""}`;
  const icon = `${root}server-icon.png`;

  return (
    <html lang={props.locale}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={t.description} />
        <title>{onReleases ? t.releasesTitle : t.homeTitle}</title>
        <link
          rel="alternate"
          hreflang={props.locale === "en" ? "ru" : "en"}
          href={alternate}
        />
        <script src={`${root}preferences.js`}></script>
        <link rel="icon" type="image/png" href={icon} />
        <link rel="stylesheet" href={`${root}style.css`} />
      </head>
      <body>
        <a class="skip" href="#main">
          {t.skip}
        </a>
        <Header locale={props.locale} home={home} icon={icon} />
        <main id="main">{props.children}</main>
        <footer>
          <div class="wrap footer">
            <a href="https://github.com/Teto-Industries/cumcraft/issues">
              {t.issue} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}

function Edition(props: {
  profile: Profile;
  number: number;
  asset?: Asset;
  locale: Locale;
}) {
  const t = copy[props.locale];
  const profile =
    (props.locale === "ru" && russianProfiles.get(props.profile.id)) ||
    props.profile;

  return (
    <article class="card">
      <div class="card-top">
        <span class="number">
          0{props.number} / {props.profile.renderer}
        </span>
        {props.profile.id === "dh-vulkan" && (
          <span class="badge">{t.experimental}</span>
        )}
      </div>
      <h3>{profile.name}</h3>
      <p>{profile.description}</p>
      <p class="recommendation">{profile.recommendation}</p>
      {props.asset && (
        <a
          class="download"
          href={props.asset.browser_download_url}
          aria-label={`${t.download}: ${profile.name}`}
        >
          {t.download} <span aria-hidden="true">↓</span>
        </a>
      )}
    </article>
  );
}

function Hero(props: { minecraft: string; locale: Locale }) {
  const t = copy[props.locale];

  return (
    <section class="hero">
      <div>
        <div class="eyebrow">
          <span class="dot" /> MINECRAFT {props.minecraft} · FABRIC
        </div>
        <h1>{t.headline}</h1>
        <p class="lede">{t.introduction}</p>
        <div class="actions">
          <a class="button primary" href="#editions">
            {t.chooseEdition} <span aria-hidden="true">↓</span>
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

function Home(props: { pack: Pack; latest?: Release; locale: Locale }) {
  const t = copy[props.locale];
  const profiles = props.pack.profiles ?? [];

  return (
    <Layout locale={props.locale} section="home">
      <div class="wrap">
        <Hero minecraft={props.pack.minecraft} locale={props.locale} />
        <div class="facts">
          <div>
            <span>{t.loader}</span>
            <strong>Fabric {props.pack.fabricLoader}</strong>
          </div>
          <div>
            <span>{t.server}</span>
            <strong>{props.pack.server.address}</strong>
          </div>
          <div>
            <span>{t.latest}</span>
            <strong>{props.latest?.tag_name ?? t.unpublished}</strong>
          </div>
        </div>
        <section id="editions" class="section">
          <div class="section-head">
            <h2>{t.chooseEdition}</h2>
          </div>
          {!props.latest && (
            <p class="notice">
              {t.noPack} <a href="./releases/">{t.checkReleases}</a>.
            </p>
          )}
          <div class="cards">
            {profiles.map((profile, index) => (
              <Edition
                profile={profile}
                locale={props.locale}
                number={index + 1}
                asset={props.latest && assetFor(props.latest, profile)}
              />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

function Releases(props: { releases: Release[]; locale: Locale }) {
  const t = copy[props.locale];

  return (
    <Layout locale={props.locale} section="releases">
      <div class="wrap">
        <section class="release-hero">
          <div class="eyebrow">{t.archive}</div>
          <h1>
            {t.changelog}
            <span class="accent">.</span>
          </h1>
          <p class="lede">{t.archiveIntroduction}</p>
        </section>
        <section class="release-list" aria-label={t.published}>
          {props.releases.length === 0 ? (
            <p class="notice">{t.noReleases}</p>
          ) : (
            props.releases.map((release) => (
              <article class="release">
                <div class="release-meta">
                  <time class="eyebrow" datetime={release.published_at}>
                    {date(release.published_at, props.locale)}
                  </time>
                  <h2>{release.name || release.tag_name}</h2>
                  <span class="tag">{release.tag_name}</span>
                  {release.prerelease && (
                    <span class="tag">{t.prerelease}</span>
                  )}
                </div>
                <div class="release-content">
                  {release.body ? (
                    <div
                      class="markdown"
                      innerHTML={sanitizeHtml(
                        marked.parse(release.body, { async: false }),
                      )}
                    />
                  ) : (
                    <p>{t.noNotes}</p>
                  )}
                  {release.assets.filter(
                    (asset) =>
                      asset.name.endsWith(".mrpack") &&
                      safeUrl(asset.browser_download_url),
                  ).length > 0 && (
                    <div class="asset-list">
                      <h3>{t.downloads}</h3>
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
                      {t.viewSource} <span aria-hidden="true">↗</span>
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

export function pages(pack: Pack, input: Release[], locale: Locale) {
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
    home: `<!doctype html>${renderToString(() => <Home pack={pack} latest={latest} locale={locale} />)}`,
    releases: `<!doctype html>${renderToString(() => <Releases releases={releases} locale={locale} />)}`,
  };
}
