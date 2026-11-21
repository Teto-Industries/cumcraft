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

function Picker(props: {
  id: string;
  label: string;
  options: { value: string; label: string; lang?: Locale }[];
}) {
  return (
    <details class="preference" id={props.id} name="preferences">
      <summary>
        <span>
          {props.label}: <span data-selection />
        </span>
        <span aria-hidden="true">▾</span>
      </summary>
      <div class="preference-options">
        {props.options.map((option) => (
          <button type="button" value={option.value} lang={option.lang}>
            {option.label}
          </button>
        ))}
      </div>
    </details>
  );
}

function Preferences(props: { locale: Locale }) {
  const t = copy[props.locale];

  return (
    <div class="preferences" id="preferences" hidden>
      <Picker
        id="theme"
        label={t.theme}
        options={[
          { value: "system", label: t.automaticTheme },
          { value: "light", label: t.light },
          { value: "dark", label: t.dark },
        ]}
      />
      <Picker
        id="language"
        label={t.language}
        options={[
          { value: "browser", label: t.automaticLanguage },
          { value: "en", label: "English", lang: "en" },
          { value: "ru", label: "Русский", lang: "ru" },
        ]}
      />
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

function Hero(props: { minecraft: string; locale: Locale }) {
  const t = copy[props.locale];

  return (
    <section class="hero">
      <h1>{t.headline}</h1>
      <p>Minecraft {props.minecraft} · Fabric</p>
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
            <dd>{props.latest?.tag_name ?? t.unpublished}</dd>
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
