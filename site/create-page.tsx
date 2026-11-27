import { renderToString } from "@solidjs/web";
import { For } from "solid-js";
import { copy, type Locale } from "./copy";
import {
  createProposalCopy,
  type CreateProposalCopy,
  type ImpactMetric,
  type RiskPoint,
  type VideoItem,
} from "./create-copy";
import { Footer, Header } from "./page";

function VideoCard(props: { video: VideoItem; watchLabel: string }) {
  const watchUrl = () => `https://www.youtube.com/watch?v=${props.video.id}`;
  const embedUrl = () =>
    `https://www.youtube-nocookie.com/embed/${props.video.id}?rel=0`;

  return (
    <figure class="video-card" data-drag="">
      <div class="video-frame">
        <iframe
          src={embedUrl()}
          title={props.video.title}
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
      <figcaption class="video-meta">
        <div class="video-head">
          <h3>{props.video.title}</h3>
          <span class="video-tag">{props.video.tag}</span>
        </div>
        <p>{props.video.caption}</p>
        <a
          class="video-link"
          href={watchUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          {props.watchLabel} <span aria-hidden="true">↗</span>
        </a>
      </figcaption>
    </figure>
  );
}

function ImpactRow(props: {
  metric: ImpactMetric;
  t: CreateProposalCopy;
}) {
  const delta = () => props.metric.proposed - props.metric.baseline;
  const deltaLabel = () => (delta() > 0 ? `+${delta()}` : `${delta()}`);

  return (
    <div class="impact-row">
      <div class="impact-head">
        <span class="impact-label">{props.metric.label}</span>
        <span class={`impact-delta ${delta() > 0 ? "delta-up" : "delta-down"}`}>
          {deltaLabel()}
        </span>
      </div>
      <div
        class="impact-bars"
        role="img"
        aria-label={`${props.metric.label}: ${props.t.impactLegendBaseline} ${props.metric.baseline}/10, ${props.t.impactLegendProposed} ${props.metric.proposed}/10`}
      >
        <div class="bar-line">
          <div class="bar-track">
            <div
              class="bar-fill bar-baseline"
              style={{ width: `${props.metric.baseline * 10}%` }}
            />
          </div>
          <span class="bar-value">{props.metric.baseline}/10</span>
        </div>
        <div class="bar-line">
          <div class="bar-track">
            <div
              class="bar-fill bar-proposed"
              style={{ width: `${props.metric.proposed * 10}%` }}
            />
          </div>
          <span class="bar-value">{props.metric.proposed}/10</span>
        </div>
      </div>
      <p class="impact-note">{props.metric.note}</p>
    </div>
  );
}

function ImpactChart(props: {
  metrics: readonly ImpactMetric[];
  t: CreateProposalCopy;
}) {
  return (
    <figure class="proposal-figure" data-drag="">
      <div class="chart-legend" aria-hidden="true">
        <span class="legend-item">
          <span class="swatch swatch-baseline" />
          {props.t.impactLegendBaseline}
        </span>
        <span class="legend-item">
          <span class="swatch swatch-proposed" />
          {props.t.impactLegendProposed}
        </span>
      </div>
      <div class="impact-chart">
        <For each={props.metrics}>
          {(metric) => <ImpactRow metric={metric} t={props.t} />}
        </For>
      </div>
      <figcaption>{props.t.impactChartCaption}</figcaption>
    </figure>
  );
}

function RiskMatrixChart(props: {
  risks: readonly RiskPoint[];
  t: CreateProposalCopy;
}) {
  const plotLeft = 58;
  const plotTop = 20;
  const plotWidth = 340;
  const plotHeight = 190;
  const plotBottom = plotTop + plotHeight;
  const plotRight = plotLeft + plotWidth;

  const toX = (likelihood: number) =>
    plotLeft + ((likelihood - 0.5) / 5) * plotWidth;
  const toY = (severity: number) =>
    plotBottom - ((severity - 0.5) / 5) * plotHeight;

  return (
    <figure class="proposal-figure" data-drag="">
      <svg
        class="risk-svg"
        viewBox="0 0 420 250"
        role="img"
        aria-labelledby="risk-matrix-title"
      >
        <title id="risk-matrix-title">{props.t.riskChartCaption}</title>
        <rect
          x={plotLeft}
          y={plotTop}
          width={plotWidth}
          height={plotHeight}
          class="risk-plot-bg"
        />
        <rect
          x={plotLeft + plotWidth * 0.5}
          y={plotTop}
          width={plotWidth * 0.5}
          height={plotHeight * 0.5}
          class="risk-hot-zone"
        />
        <For each={[1, 2, 3, 4]}>
          {(step) => {
            const x = plotLeft + (step / 5) * plotWidth;
            const y = plotTop + (step / 5) * plotHeight;
            return (
              <>
                <line
                  x1={x}
                  y1={plotTop}
                  x2={x}
                  y2={plotBottom}
                  class="risk-grid-line"
                />
                <line
                  x1={plotLeft}
                  y1={y}
                  x2={plotRight}
                  y2={y}
                  class="risk-grid-line"
                />
              </>
            );
          }}
        </For>
        <line
          x1={plotLeft + plotWidth * 0.5}
          y1={plotTop}
          x2={plotLeft + plotWidth * 0.5}
          y2={plotBottom}
          class="risk-mid-line"
        />
        <line
          x1={plotLeft}
          y1={plotTop + plotHeight * 0.5}
          x2={plotRight}
          y2={plotTop + plotHeight * 0.5}
          class="risk-mid-line"
        />
        <text
          x={plotLeft}
          y={plotBottom + 16}
          class="risk-axis-tick"
          text-anchor="start"
        >
          {props.t.riskAxisLow}
        </text>
        <text
          x={plotLeft + plotWidth * 0.5}
          y={plotBottom + 32}
          class="risk-axis-name"
          text-anchor="middle"
        >
          {props.t.riskAxisX} →
        </text>
        <text
          x={plotRight}
          y={plotBottom + 16}
          class="risk-axis-tick"
          text-anchor="end"
        >
          {props.t.riskAxisHigh}
        </text>
        <text
          x={plotLeft - 8}
          y={plotTop + 10}
          class="risk-axis-tick"
          text-anchor="end"
        >
          {props.t.riskAxisHigh}
        </text>
        <text
          x={plotLeft - 8}
          y={plotBottom - 2}
          class="risk-axis-tick"
          text-anchor="end"
        >
          {props.t.riskAxisLow}
        </text>
        <text
          x={16}
          y={plotTop + plotHeight * 0.5}
          class="risk-axis-name"
          text-anchor="middle"
          transform={`rotate(-90 16 ${plotTop + plotHeight * 0.5})`}
        >
          {props.t.riskAxisY} →
        </text>
        <For each={props.risks}>
          {(risk) => {
            const cx = toX(risk.likelihood);
            const cy = toY(risk.severity);
            return (
              <g class={`risk-point risk-level-${risk.level}`}>
                <circle cx={cx} cy={cy} r="13" />
                <text x={cx} y={cy + 4} text-anchor="middle">
                  {risk.id}
                </text>
              </g>
            );
          }}
        </For>
      </svg>
      <figcaption>{props.t.riskChartCaption}</figcaption>
    </figure>
  );
}

function CreateProposalLayout(props: { locale: Locale }) {
  const site = () => copy[props.locale];
  const t = () => createProposalCopy[props.locale];
  const home = "../";
  const root = () => (props.locale === "ru" ? "../../" : "../");
  const alternate = () =>
    `${root()}${props.locale === "en" ? "ru/" : ""}create/`;
  const icon = () => `${root()}server-icon.png`;

  return (
    <html lang={props.locale}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <meta name="description" content={t().description} />
        <title>{t().title}</title>
        <link
          rel="alternate"
          hreflang={props.locale === "en" ? "ru" : "en"}
          href={alternate()}
        />
        <script src={`${root()}preferences.js`}></script>
        <script src={`${root()}drag.js`} defer></script>
        <link rel="icon" type="image/png" href={icon()} />
        <link rel="stylesheet" href={`${root()}style.css`} />
      </head>
      <body>
        <a class="skip" href="#main">
          {site().skip}
        </a>
        <Header locale={props.locale} home={home} icon={icon()} />
        <main id="main" data-drag="landmark">
          <div class="wrap proposal">
            <section class="hero" data-drag="">
              <div class="meta">{t().kicker}</div>
              <h1>{t().heading}</h1>
              <p>{t().lead}</p>
            </section>

            <section aria-labelledby="showcase" data-drag="">
              <h2 id="showcase">{t().showcaseHeading}</h2>
              <div class="video-grid">
                <For each={t().videos}>
                  {(video) => (
                    <VideoCard
                      video={video}
                      watchLabel={t().watchOnYoutube}
                    />
                  )}
                </For>
              </div>
            </section>

            <section aria-labelledby="selling-points" data-drag="">
              <h2 id="selling-points">{t().sellingHeading}</h2>
              <p class="section-intro">{t().sellingIntro}</p>
              <div class="selling-grid">
                <For each={t().sellingPoints}>
                  {(point) => (
                    <article class="selling-card" data-drag="">
                      <h3>{point.title}</h3>
                      <p>{point.summary}</p>
                    </article>
                  )}
                </For>
              </div>
            </section>

            <section aria-labelledby="one-way" data-drag="">
              <h2 id="one-way">{t().oneWayHeading}</h2>
              <div class="one-way-box" data-drag="">
                <For each={t().oneWayParagraphs}>
                  {(line) => <p>{line}</p>}
                </For>
              </div>
            </section>

            <section aria-labelledby="impact" data-drag="">
              <h2 id="impact">{t().impactHeading}</h2>
              <p class="section-intro">{t().impactIntro}</p>
              <ImpactChart metrics={t().impactMetrics} t={t()} />
            </section>

            <section aria-labelledby="playstyles" data-drag="">
              <h2 id="playstyles">{t().groupsHeading}</h2>
              <div class="group-list">
                <For each={t().groups}>
                  {(item) => (
                    <article class="group-row" data-drag="">
                      <div class="group-head">
                        <h3>{item.group}</h3>
                        <span class={`status-tag status-${item.level}`}>
                          {item.verdict}
                        </span>
                      </div>
                      <p>{item.summary}</p>
                    </article>
                  )}
                </For>
              </div>
            </section>

            <section aria-labelledby="risks" data-drag="">
              <h2 id="risks">{t().risksHeading}</h2>
              <p class="section-intro">{t().risksIntro}</p>
              <RiskMatrixChart risks={t().risks} t={t()} />
              <ol class="risk-list">
                <For each={t().risks}>
                  {(risk) => (
                    <li class="risk-item" data-drag="">
                      <div class="risk-head">
                        <span class={`risk-badge risk-level-${risk.level}`}>
                          {risk.id}
                        </span>
                        <h3>{risk.title}</h3>
                        <span class={`status-tag status-risk-${risk.level}`}>
                          {t().riskLevelLabels[risk.level]}
                        </span>
                      </div>
                      <p>{risk.detail}</p>
                    </li>
                  )}
                </For>
              </ol>
            </section>

            <section aria-labelledby="paths" data-drag="">
              <h2 id="paths">{t().pathsHeading}</h2>
              <p class="section-intro">{t().pathsIntro}</p>
              <div class="path-grid">
                <For each={t().paths}>
                  {(path) => (
                    <article
                      class={`path-card${path.recommended ? " path-recommended" : ""}`}
                      data-drag=""
                    >
                      <div class="path-head">
                        <h3>{path.name}</h3>
                        <span
                          class={`status-tag ${path.recommended ? "status-positive" : "status-mixed"}`}
                        >
                          {path.tag}
                        </span>
                      </div>
                      <p class="path-summary">{path.summary}</p>
                      <ul class="path-points">
                        <For each={path.points}>
                          {(point) => <li>{point}</li>}
                        </For>
                      </ul>
                    </article>
                  )}
                </For>
              </div>
              <details class="mod-group mod-technical" data-drag="">
                <summary>{t().worldDetailsSummary}</summary>
                <ul class="proposal-notes">
                  <For each={t().worldDetails}>
                    {(line) => <li>{line}</li>}
                  </For>
                </ul>
              </details>
            </section>

            <section aria-labelledby="questions" data-drag="">
              <h2 id="questions">{t().questionsHeading}</h2>
              <p class="section-intro">{t().questionsIntro}</p>
              <ol class="question-list">
                <For each={t().questions}>
                  {(question) => <li data-drag="">{question}</li>}
                </For>
              </ol>
              <div class="proposal-links">
                <a href="https://modrinth.com/mod/create-fly" data-drag="">
                  {t().sourceLink} <span aria-hidden="true">↗</span>
                </a>
                <a href={home} data-drag="">
                  {t().backHome}
                </a>
              </div>
            </section>
          </div>
        </main>
        <Footer locale={props.locale} />
      </body>
    </html>
  );
}

export function renderCreateProposal(locale: Locale) {
  return `<!doctype html>${renderToString(() => (
    <CreateProposalLayout locale={locale} />
  ))}`;
}
