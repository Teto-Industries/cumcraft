import { renderToString } from "@solidjs/web";
import { marked } from "marked";
import type { JSX } from "@solidjs/web";
import sanitizeHtml from "sanitize-html";
import { copy, russianProfiles, type Locale } from "./copy";
import { mods, type Mod } from "./mods";

type Section = "home" | "editions" | "mods" | "releases";

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
const assetFor = (release: Release, profile: Profile) => {
  const basename = `cumcraft-${profile.id}`;
  const findAsset = (name: string) =>
    release.assets.find(
      (asset) => asset.name === name && safeUrl(asset.browser_download_url),
    );
  return (
    findAsset(`${basename}-${release.tag_name}.mrpack`) ??
    findAsset(`${basename}.mrpack`)
  );
};
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
    <details class="header-menu" id={props.id} name="header-menus" data-drag="">
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
        <button type="button" value={option.value} lang={option.lang} data-drag="">
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

function Navigation(props: { locale: Locale; home: string; section?: Section; inline?: boolean }) {
  const t = copy[props.locale];

  return (
    <nav class={props.inline ? "inline-nav" : undefined} aria-label={t.nav}>
      <a href={`${props.home}editions/`} data-route="editions" data-drag="" aria-current={props.section === "editions" ? "page" : undefined}>{t.editions}</a>
      <a href={`${props.home}mods/`} data-route="mods" data-drag="" aria-current={props.section === "mods" ? "page" : undefined}>{t.mods}</a>
      <a href={`${props.home}releases/`} data-route="releases" data-drag="" aria-current={props.section === "releases" ? "page" : undefined}>{t.releases}</a>
    </nav>
  );
}

export function Header(props: { locale: Locale; home: string; icon: string; section?: Section }) {
  return (
    <header class="top" data-drag="landmark">
      <div class="wrap nav">
        <a class="brand" data-drag="" href={props.home} data-route="home" aria-label="Cumcraft" aria-current={props.section === "home" ? "page" : undefined}>
          <img src={props.icon} alt="" width="40" height="40" />
          <span>Cumcraft</span>
        </a>
        <Navigation locale={props.locale} home={props.home} section={props.section} inline />
        <div class="header-controls">
          <HeaderMenu
            id="compact-nav"
            label={copy[props.locale].nav}
            icon="M4 6h16M4 12h16M4 18h16"
          >
            <Navigation locale={props.locale} home={props.home} section={props.section} />
          </HeaderMenu>
          <Preferences locale={props.locale} />
        </div>
      </div>
    </header>
  );
}

export function Footer(props: { locale: Locale }) {
  const t = copy[props.locale];

  return (
    <footer data-drag="landmark">
      <div class="wrap footer">
        <a href="https://github.com/Teto-Industries/cumcraft" data-drag="">
          GitHub <span aria-hidden="true">↗</span>
        </a>
        <a href="https://github.com/Teto-Industries/cumcraft/issues" data-drag="">
          {t.issue} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </footer>
  );
}

function Layout(props: {
  locale: Locale;
  section: Section;
  mapUrl?: string;
  pack: Pack;
  profiles: Profile[];
  latest?: Release;
  releases: Release[];
}) {
  const t = copy[props.locale];
  const route = props.section === "home" ? "" : `${props.section}/`;
  const home = route ? "../" : "./";
  const root = props.locale === "ru" ? `${home}../` : home;
  const alternate = `${root}${props.locale === "en" ? "ru/" : ""}${route}`;
  const title = {
    home: t.homeTitle,
    editions: t.editionsTitle,
    mods: t.modsTitle,
    releases: t.releasesTitle,
  };
  const icon = `${root}server-icon.png`;

  return (
    <html lang={props.locale}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={t.description} />
        <title>{title[props.section]}</title>
        <link
          rel="alternate"
          hreflang={props.locale === "en" ? "ru" : "en"}
          href={alternate}
        />
        <script src={`${root}preferences.js`}></script>
        <script src={`${root}tabs.js`} defer></script>
        <script src={`${root}drag.js`} defer></script>
        {props.mapUrl && <script src={`${root}map.js`} defer></script>}
        <link rel="icon" type="image/png" href={icon} />
        <link rel="stylesheet" href={`${root}style.css`} />
      </head>
      <body class={props.mapUrl ? "map-page" : undefined}>
        <a class="skip" href="#main">
          {t.skip}
        </a>
        <Header locale={props.locale} home={home} icon={icon} section={props.section} />
        <main id="main" data-drag="landmark">
          <div class="wrap" data-panel="home" data-title={title.home} hidden={props.section !== "home"}>
            <Home pack={props.pack} locale={props.locale} mapUrl={props.mapUrl} home={home} />
          </div>
          <div class="wrap" data-panel="editions" data-title={title.editions} hidden={props.section !== "editions"}>
            <Editions profiles={props.profiles} latest={props.latest} locale={props.locale} home={home} />
          </div>
          <div class="wrap" data-panel="mods" data-title={title.mods} hidden={props.section !== "mods"}>
            <Mods profiles={props.profiles} locale={props.locale} />
          </div>
          <div class="wrap" data-panel="releases" data-title={title.releases} hidden={props.section !== "releases"}>
            <Releases releases={props.releases} locale={props.locale} />
          </div>
        </main>
        <Footer locale={props.locale} />
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

const localizedProfile = (profile: Profile, locale: Locale) =>
  (locale === "ru" && russianProfiles.get(profile.id)) || profile;

function Edition(props: {
  profile: Profile;
  asset?: Asset;
  locale: Locale;
}) {
  const t = copy[props.locale];
  const profile = localizedProfile(props.profile, props.locale);

  return (
    <article class="edition" data-drag="">
      <h2>{profile.name}</h2>
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
          data-drag=""
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
        data-drag=""
        hidden
      >
        {t.exploreMap}
      </button>
      <a href={props.url} data-drag="">{t.exploreMap}</a>
    </div>
  );
}

function GettingStarted(props: { locale: Locale; home: string }) {
  const t = copy[props.locale];

  return (
    <section aria-labelledby="getting-started" data-drag="">
      <h2 id="getting-started">{t.gettingStarted}</h2>
      <ol class="join-steps">
        <li data-drag="">
          <h3>{t.installLauncher}</h3>
          <p>
            {t.ownsMinecraft}{" "}
            <a href="https://prismlauncher.org">{t.downloadPrism}</a>
          </p>
          <p>
            {t.noAccount}{" "}
            <a href="https://github.com/Diegiwg/PrismLauncher-Cracked/releases/latest">
              {t.downloadCrackedPrism}
            </a>
          </p>
        </li>
        <li data-drag="">
          <h3>{t.downloadEdition}</h3>
          <a class="editions-link" data-drag="" href={`${props.home}editions/`} data-route="editions">{t.chooseEdition}</a>
        </li>
        <li data-drag="">
          <h3>{t.importPack}</h3>
          <p>{t.importPackHint}</p>
        </li>
      </ol>
    </section>
  );
}

function ModList(props: {
  entries: readonly Mod[];
  locale: Locale;
  profiles?: Profile[];
}) {
  return (
    <ul class="mod-list" role="list">
      {props.entries.map(([slug, name, description, editions]) => {
        const names = props.profiles
          ?.filter((profile) => editions?.includes(profile.id))
          .map((profile) => localizedProfile(profile, props.locale).name);

        return (
          <li class={description ? "mod-feature" : undefined} data-drag="">
            <a href={`https://modrinth.com/mod/${slug}`}>
              {name} <span aria-hidden="true">↗</span>
            </a>
            {description && <p>{description[props.locale]}</p>}
            {names && names.length > 0 && (
              <p class="mod-editions">{names.join(" · ")}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Mods(props: { locale: Locale; profiles: Profile[] }) {
  const t = copy[props.locale];

  return (
    <>
      <section class="hero" data-drag="">
        <h1>{t.mods}</h1>
      </section>
      <section aria-label={t.mods} data-drag="">
        <div class="mod-group" data-drag="">
          <h2>{t.modGameplay}</h2>
          <ModList entries={mods.gameplay} locale={props.locale} />
        </div>
        <div class="mod-group" data-drag="">
          <h2>{t.modGraphics}</h2>
          <ModList entries={mods.graphics} locale={props.locale} profiles={props.profiles} />
        </div>
        <div class="mod-group" data-drag="">
          <h2>{t.modInventory}</h2>
          <p class="mod-hint">{t.modInventoryIntro}</p>
          <ModList entries={mods.inventory} locale={props.locale} />
        </div>
        <details class="mod-group mod-technical" data-drag="">
          <summary>{t.modTechnical}</summary>
          <ModList entries={mods.technical} locale={props.locale} />
        </details>
      </section>
    </>
  );
}

function Home(props: {
  pack: Pack;
  locale: Locale;
  mapUrl?: string;
  home: string;
}) {
  const t = copy[props.locale];

  return (
    <>
      <div class="home-intro" data-drag="">
        <section class="hero" data-drag="">
          <h1>{t.headline}</h1>
          <p>Minecraft {props.pack.minecraft} · Fabric</p>
        </section>
        {props.mapUrl && <MapActions url={props.mapUrl} locale={props.locale} />}
      </div>
      <GettingStarted locale={props.locale} home={props.home} />
    </>
  );
}

function Editions(props: {
  profiles: Profile[];
  latest?: Release;
  locale: Locale;
  home: string;
}) {
  const t = copy[props.locale];
  const profiles = props.profiles.toSorted(
    (a, b) => Number(b.id === "dh-opengl") - Number(a.id === "dh-opengl"),
  );

  return (
    <>
      <section class="hero" data-drag="">
        <h1>{t.chooseEdition}</h1>
        {props.latest && (
          <p class="meta">
            {props.latest.tag_name}
            {props.latest.prerelease && ` · ${t.prerelease}`}
          </p>
        )}
      </section>
      {!props.latest && (
        <p class="notice" data-drag="">
          {t.noPack} <a href={`${props.home}releases/`} data-route="releases">{t.checkReleases}</a>.
        </p>
      )}
      <div>
        {profiles.map((profile) => (
          <Edition
            profile={profile}
            locale={props.locale}
            asset={props.latest && assetFor(props.latest, profile)}
          />
        ))}
      </div>
    </>
  );
}

function Releases(props: { releases: Release[]; locale: Locale }) {
  const t = copy[props.locale];

  return (
    <>
      <section class="hero" data-drag="">
        <div class="meta">{t.archive}</div>
        <h1>{t.changelog}.</h1>
        <p>{t.archiveIntroduction}</p>
      </section>
      <section aria-label={t.published} data-drag="">
        {props.releases.length === 0 ? (
          <p class="notice">{t.noReleases}</p>
        ) : (
          props.releases.map((release) => (
            <article class="release" data-drag="">
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
                        <a href={asset.browser_download_url} data-drag="">
                          {asset.name} <span>↗</span>
                        </a>
                      ))}
                  </div>
                )}
                {safeUrl(release.html_url) && (
                  <a class="source-link" href={release.html_url} data-drag="">
                    {t.viewSource} <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </>
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
  const render = (section: Section) =>
    `<!doctype html>${renderToString(() => (
      <Layout locale={locale} section={section} mapUrl={mapUrl} pack={pack} profiles={profiles} latest={latest} releases={releases} />
    ))}`;
  return {
    home: render("home"),
    editions: render("editions"),
    mods: render("mods"),
    releases: render("releases"),
  };
}
