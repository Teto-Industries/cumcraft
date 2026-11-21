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

function HeaderMenu(props: {
  id: string;
  label: string;
  icon: string;
  children: JSX.Element;
}) {
  return (
    <details class="header-menu" id={props.id} name="header-menus">
      <summary aria-label={props.label}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d={props.icon} />
        </svg>
        <span>{props.label}</span>
      </summary>
      <div class="menu-options">{props.children}</div>
    </details>
  );
}

function Picker(props: {
  id: string;
  label: string;
  icon: string;
  options: { value: string; label: string; lang?: Locale }[];
}) {
  return (
    <HeaderMenu id={props.id} label={props.label} icon={props.icon}>
      {props.options.map((option) => (
        <button type="button" value={option.value} lang={option.lang}>
          {option.label}
        </button>
      ))}
    </HeaderMenu>
  );
}

function Preferences(props: { locale: Locale }) {
  const t = copy[props.locale];

  return (
    <div class="preferences" id="preferences" hidden>
      <Picker
        id="theme"
        label={t.theme}
        icon="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18Zm0 0v18m0-15 6 6m-6-2 7 7m-7-3 5 5"
        options={[
          { value: "system", label: t.automaticTheme },
          { value: "light", label: t.light },
          { value: "dark", label: t.dark },
        ]}
      />
      <Picker
        id="language"
        label={t.language}
        icon="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18Zm0 0c-5 0-5 18 0 18s5-18 0-18ZM3 12h18"
        options={[
          { value: "browser", label: t.automaticLanguage },
          { value: "en", label: "English", lang: "en" },
          { value: "ru", label: "Русский", lang: "ru" },
        ]}
      />
    </div>
  );
}

function Navigation(props: { locale: Locale; home: string; inline?: boolean }) {
  const t = copy[props.locale];

  return (
    <nav class={props.inline ? "inline-nav" : undefined} aria-label={t.nav}>
      <a href={`${props.home}#editions`}>{t.editions}</a>
      <a href={`${props.home}releases/`}>{t.releases}</a>
      <a href="https://github.com/Teto-Industries/cumcraft">
        GitHub <span aria-hidden="true">↗</span>
      </a>
    </nav>
  );
}

function Header(props: { locale: Locale; home: string; icon: string }) {
  return (
    <header class="top">
      <div class="wrap nav">
        <a class="brand" href={props.home} aria-label="Cumcraft">
          <img src={props.icon} alt="" width="40" height="40" />
          <span>Cumcraft</span>
        </a>
        <Navigation locale={props.locale} home={props.home} inline />
        <div class="header-controls">
          <HeaderMenu
            id="compact-nav"
            label={copy[props.locale].nav}
            icon="M4 6h16M4 12h16M4 18h16"
          >
            <Navigation locale={props.locale} home={props.home} />
          </HeaderMenu>
          <Preferences locale={props.locale} />
        </div>
      </div>
    </header>
  );
}

function Layout(props: {
  locale: Locale;
  section: "home" | "releases";
  mapUrl?: string;
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
        {props.mapUrl && <script src={`${root}map.js`} defer></script>}
        <link rel="icon" type="image/png" href={icon} />
        <link rel="stylesheet" href={`${root}style.css`} />
      </head>
      <body class={props.mapUrl ? "map-page" : undefined}>
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
        {props.mapUrl && (
          <iframe
            id="world-map"
            data-src={props.mapUrl}
            title={t.worldMap}
            tabindex="-1"
            referrerpolicy="no-referrer"
          />
        )}
      </body>
    </html>
  );
}

function Edition(props: {
  profile: Profile;
  asset?: Asset;
  locale: Locale;
}) {
  const t = copy[props.locale];
  const profile =
    (props.locale === "ru" && russianProfiles.get(props.profile.id)) ||
    props.profile;

  return (
    <article class="edition">
      <h3>{profile.name}</h3>
      <div class="meta">
        {props.profile.renderer}
        {props.profile.id === "dh-vulkan" && ` · ${t.experimental}`}
      </div>
      <p lang={props.profile.id === "voxy-opengl" ? "en" : undefined}>
        {profile.description}
      </p>
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

function MapActions(props: { url: string; locale: Locale }) {
  const t = copy[props.locale];

  return (
    <div class="map-actions">
      <button
        type="button"
        aria-controls="world-map"
        aria-expanded="false"
        data-explore={t.exploreMap}
        data-close={t.closeMap}
        hidden
      >
        {t.exploreMap}
      </button>
      <a href={props.url}>{t.exploreMap}</a>
    </div>
  );
}

function Home(props: {
  pack: Pack;
  latest?: Release;
  locale: Locale;
  mapUrl?: string;
}) {
  const t = copy[props.locale];
  const profiles = props.pack.profiles ?? [];

  return (
    <Layout locale={props.locale} section="home" mapUrl={props.mapUrl}>
      <div class="wrap">
        <div class="home-intro">
          <section class="hero">
            <h1>{t.headline}</h1>
            <p>Minecraft {props.pack.minecraft} · Fabric</p>
          </section>
          {props.mapUrl && <MapActions url={props.mapUrl} locale={props.locale} />}
        </div>
        <dl class="facts">
          <div>
            <dt>{t.loader}</dt>
            <dd>Fabric {props.pack.fabricLoader}</dd>
          </div>
          <div>
            <dt>{t.server}</dt>
            <dd>{props.pack.server.address}</dd>
          </div>
          <div>
            <dt>{t.latest}</dt>
            <dd>
              {props.latest?.tag_name ?? t.unpublished}
              {props.latest?.prerelease && ` · ${t.prerelease}`}
            </dd>
          </div>
        </dl>
        <section id="editions">
          <h2>{t.chooseEdition}</h2>
          {!props.latest && (
            <p class="notice">
              {t.noPack} <a href="./releases/">{t.checkReleases}</a>.
            </p>
          )}
          {profiles.map((profile) => (
            <Edition
              profile={profile}
              locale={props.locale}
              asset={props.latest && assetFor(props.latest, profile)}
            />
          ))}
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
        <section class="hero">
          <div class="meta">{t.archive}</div>
          <h1>{t.changelog}.</h1>
          <p>{t.archiveIntroduction}</p>
        </section>
        <section aria-label={t.published}>
          {props.releases.length === 0 ? (
            <p class="notice">{t.noReleases}</p>
          ) : (
            props.releases.map((release) => (
              <article class="release">
                <h2>{release.name || release.tag_name}</h2>
                <div class="meta">
                  <time datetime={release.published_at}>
                    {date(release.published_at, props.locale)}
                  </time>
                  {release.name &&
                    release.name !== release.tag_name &&
                    ` · ${release.tag_name}`}
                  {release.prerelease && ` · ${t.prerelease}`}
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

export function pages(
  pack: Pack,
  input: Release[],
  locale: Locale,
  mapUrl?: string,
) {
  const releases = input
    .filter((release) => !release.draft && release.published_at)
    .sort((a, b) => b.published_at.localeCompare(a.published_at));
  const profiles = pack.profiles ?? [];
  const latest = releases.find(
    (release) =>
      profiles.length > 0 &&
      profiles.every((profile) => assetFor(release, profile)),
  );
  return {
    home: `<!doctype html>${renderToString(() => <Home pack={pack} latest={latest} locale={locale} mapUrl={mapUrl} />)}`,
    releases: `<!doctype html>${renderToString(() => <Releases releases={releases} locale={locale} />)}`,
  };
}
