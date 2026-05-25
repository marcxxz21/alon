import {
  CalendarBlank,
  ChartLineUp,
  Database,
  House,
  MagnifyingGlass,
  Pulse,
  ShieldCheck,
  Sparkle,
  SquaresFour,
  Stack,
  WaveSawtooth
} from "@/components/phosphor-icons";
import Link from "next/link";
import { PriceChart } from "@/components/price-chart";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { getLeaderboards, getPrices, getSectors, getTickerSummary, getWatchlists } from "@/lib/data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2
  }).format(value);
}

function formatVolume(value: number) {
  return new Intl.NumberFormat("en-PH", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function signalClass(label: string) {
  if (label === "bullish") return "positive";
  if (label === "bearish") return "negative";
  return "neutral";
}

const pipelineRuns = [
  { name: "market_data_ingest", state: "Completed", time: "9:38 AM", rows: "452K" },
  { name: "news_sentiment_pipeline", state: "Completed", time: "9:33 AM", rows: "2m 14s" },
  { name: "features_generation", state: "Running", time: "9:33 AM", rows: "1m 21s" },
  { name: "model_training", state: "Failed", time: "9:28 AM", rows: "retry queued" },
  { name: "publish_predictions", state: "Completed", time: "9:25 AM", rows: "45s" }
];

const alertFeed = [
  { type: "Data quality", detail: "APLI_income_statement null rate > 2%", time: "9:22 AM" },
  { type: "Pipeline failure", detail: "earnings_sentiment_pipeline retry threshold reached", time: "9:37 AM" },
  { type: "Market event", detail: "CPI data release today 8:30 AM ET", time: "9:37 AM" }
];

export default async function Home() {
  const [summary, prices, leaderboards, sectors, watchlists] = await Promise.all([
    getTickerSummary("ALI"),
    getPrices("ALI"),
    getLeaderboards(),
    getSectors(),
    getWatchlists()
  ]);

  if (!summary) {
    throw new Error("Demo ticker summary is unavailable.");
  }

  const topRows = [...leaderboards].sort((a, b) => b.momentum20! - a.momentum20!).slice(0, 5);
  const watchlist = watchlists[0];
  const confidence = Math.round(summary.prediction.confidence * 1000) / 10;
  const bullishCount = leaderboards.filter((row) => row.signal === "bullish").length;
  const bearishCount = leaderboards.filter((row) => row.signal === "bearish").length;

  return (
    <main className="tide-page">
      <ServiceWorkerRegister />
      <div className="watermark watermark-top">Alon</div>
      <div className="watermark watermark-bottom">Market Tide</div>
      <div className="wave-field" aria-hidden="true" />

      <section className="deck-shell" aria-label="Alon command deck">
        <aside className="phone-stage" aria-label="Mobile PWA preview">
          <div className="phone-device phone-landing">
            <div className="phone-notch" />
            <div className="phone-status">11:31</div>
            <div className="phone-brand">
              <WaveSawtooth size={22} weight="bold" />
              <span>Alon</span>
            </div>
            <div className="phone-copy">
              <span>Track the</span>
              <strong>market tide</strong>
              <span>with clarity</span>
            </div>
            <p>
              AI signals, pipeline health, and warehouse freshness in a pocket-ready PWA.
            </p>
            <div className="floating-metric metric-a">
              Signal Strength
              <strong>{summary.changePct > 0 ? "+" : ""}{summary.changePct.toFixed(2)}%</strong>
            </div>
            <div className="floating-metric metric-b">
              Flow Runs
              <strong>38</strong>
            </div>
            <div className="floating-metric metric-c">
              Model
              <strong>{confidence}%</strong>
            </div>
            <a className="deck-button phone-button" href="/api/tickers/ALI/summary">
              Get started
              <ChartLineUp size={18} weight="bold" />
            </a>
          </div>

          <div className="phone-device phone-signals">
            <div className="phone-notch" />
            <div className="phone-status">11:31</div>
            <p className="micro-label">Signals</p>
            <h2>You have {bullishCount + bearishCount} active signals</h2>
            <div className="signal-card">
              <span>Model drift is stable</span>
              <p>All monitored models are within acceptable range.</p>
            </div>
            <div className="signal-list">
              {topRows.slice(0, 4).map((row, index) => (
                <div className="signal-item" key={row.symbol} style={{ "--index": index } as React.CSSProperties}>
                  <span>{row.symbol} {row.signal}</span>
                  <strong className={signalClass(row.signal)}>
                    {row.momentum20 && row.momentum20 > 0 ? "+" : ""}{row.momentum20?.toFixed(2)}%
                  </strong>
                  <div className="signal-bar">
                    <i style={{ width: `${Math.round(row.confidence * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="command-panel">
          <aside className="side-rail" aria-label="Workspace navigation">
            <div className="side-logo">
              <WaveSawtooth size={25} weight="bold" />
              <span>Alon</span>
            </div>
            <Link className="rail-link active" href="/"><House size={18} /> Overview</Link>
            <a className="rail-link" href="/api/leaderboards"><ChartLineUp size={18} /> Markets</a>
            <a className="rail-link" href="/api/sectors"><Stack size={18} /> Pipelines</a>
            <a className="rail-link" href="/api/tickers"><Database size={18} /> Warehouse</a>
          </aside>

          <div className="deck-content">
            <nav className="deck-topbar" aria-label="Command deck tools">
              <div className="search-shell">
                <MagnifyingGlass size={16} />
                <span>Search ticker or company...</span>
                <kbd>K</kbd>
              </div>
              <div className="date-pill">
                <CalendarBlank size={16} />
                May 12, 2026 - May 16, 2026
              </div>
              <button className="deck-select" type="button">Production</button>
              <div className="live-sync">
                <i />
                Live Sync
                <span>2.4s ago</span>
              </div>
            </nav>

            <header className="deck-heading">
              <div>
                <p className="micro-label">Real-time analytics and intelligence across markets, data, and AI</p>
                <h1>Command Deck</h1>
              </div>
              <div className="deck-health">
                <ShieldCheck size={19} weight="fill" />
                Perfect cloud connected
              </div>
            </header>

            <section className="kpi-grid" aria-label="Platform health">
              <article className="glass-tile market-pulse">
                <p className="tile-label">Market Pulse</p>
                <span>as of 9:41 AM PHT</span>
                <dl>
                  <div>
                    <dt>PSEi sample</dt>
                    <dd>5,297.10 <strong className="positive">+2.73%</strong></dd>
                  </div>
                  <div>
                    <dt>Tracked tickers</dt>
                    <dd>{leaderboards.length} <strong className="positive">active</strong></dd>
                  </div>
                  <div>
                    <dt>Signal split</dt>
                    <dd>{bullishCount} bull / {bearishCount} bear</dd>
                  </div>
                </dl>
              </article>

              <article className="glass-tile forecast-gauge">
                <p className="tile-label">Forecast Signal</p>
                <span>{summary.ticker.symbol} - baseline classifier</span>
                <div className="gauge-ring" style={{ "--score": `${confidence}%` } as React.CSSProperties}>
                  <strong>{confidence}%</strong>
                  <small>{summary.prediction.label}</small>
                </div>
                <div className="split-row">
                  <span>Target close</span>
                  <strong>{formatCurrency(summary.lastClose * 1.018)}</strong>
                </div>
              </article>

              <article className="glass-tile pipeline-health">
                <p className="tile-label">Pipeline Health</p>
                <span>Prefect worker</span>
                <div className="health-orbit">
                  <strong>24</strong>
                  <small>total</small>
                </div>
                <ul>
                  <li><i className="ok" />20 Successful</li>
                  <li><i className="warn" />3 Running</li>
                  <li><i className="bad" />1 Failed</li>
                </ul>
              </article>

              <article className="glass-tile warehouse-card">
                <p className="tile-label">Warehouse Freshness</p>
                <span>Supabase PostgreSQL</span>
                <div className="warehouse-main">
                  <Database size={38} />
                  <div>
                    <small>Lakehouse DB</small>
                    <strong>Healthy</strong>
                  </div>
                </div>
                <div className="warehouse-stats">
                  <span>Last updated <strong>14m ago</strong></span>
                  <span>Rows <strong>2,847,193</strong></span>
                  <span>Tables <strong>1,248</strong></span>
                </div>
              </article>
            </section>

            <section className="chart-row">
              <article className="glass-tile chart-panel">
                <div className="chart-toolbar">
                  <div className="range-tabs" aria-label="Chart ranges">
                    {["1D", "5D", "1M", "3M", "6M", "YTD", "1Y", "5Y", "MAX"].map((range) => (
                      <span className={range === "5D" ? "active" : ""} key={range}>{range}</span>
                    ))}
                  </div>
                  <button className="deck-select" type="button">Indicators</button>
                </div>
                <PriceChart prices={prices} />
              </article>

              <article className="glass-tile intelligence-panel">
                <div className="panel-head">
                  <div>
                    <p className="tile-label">Intelligence Center</p>
                    <span>Alerts</span>
                  </div>
                  <strong>4</strong>
                </div>
                <div className="alert-feed">
                  {alertFeed.map((alert, index) => (
                    <div className="alert-item" key={alert.detail} style={{ "--index": index } as React.CSSProperties}>
                      <Pulse size={15} weight="fill" />
                      <div>
                        <span>{alert.type}</span>
                        <p>{alert.detail}</p>
                      </div>
                      <time>{alert.time}</time>
                    </div>
                  ))}
                </div>
                <div className="state-grid" aria-label="Interface states">
                  <div className="state-cell loading-state"><i /> Loading</div>
                  <div className="state-cell empty-state">No alert</div>
                  <div className="state-cell error-state">Retry queued</div>
                </div>
              </article>
            </section>

            <section className="lower-grid" aria-label="Feature modules">
              <article className="glass-tile movers-panel">
                <div className="panel-head">
                  <div>
                    <p className="tile-label">Watchlist Movers</p>
                    <span>{watchlist.name}</span>
                  </div>
                  <Sparkle size={18} weight="fill" />
                </div>
                <div className="movers-table">
                  {topRows.map((row, index) => (
                    <div className="mover-row" key={row.symbol} style={{ "--index": index } as React.CSSProperties}>
                      <strong>{row.symbol}</strong>
                      <span>{formatCurrency(row.lastClose)}</span>
                      <span className={row.changePct >= 0 ? "positive" : "negative"}>
                        {row.changePct > 0 ? "+" : ""}{row.changePct.toFixed(2)}%
                      </span>
                      <span>{formatVolume(row.volume)}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="glass-tile etl-panel">
                <div className="panel-head">
                  <div>
                    <p className="tile-label">ETL Run Timeline</p>
                    <span>worker + dbt + prediction publish</span>
                  </div>
                  <a href="/api/tickers">View API</a>
                </div>
                <div className="run-list">
                  {pipelineRuns.map((run, index) => (
                    <div className="run-item" key={run.name} style={{ "--index": index } as React.CSSProperties}>
                      <i className={run.state.toLowerCase()} />
                      <div>
                        <strong>{run.name}</strong>
                        <span>{run.state}</span>
                      </div>
                      <time>{run.time}</time>
                      <small>{run.rows}</small>
                    </div>
                  ))}
                </div>
              </article>

              <article className="glass-tile heatmap-panel">
                <div className="panel-head">
                  <div>
                    <p className="tile-label">Sector Heatmap</p>
                    <span>dbt mart_sector_daily</span>
                  </div>
                  <SquaresFour size={18} />
                </div>
                <div className="sector-tiles">
                  {sectors.map((sector, index) => (
                    <div
                      className="sector-tile"
                      key={sector.sector}
                      style={{ "--index": index } as React.CSSProperties}
                    >
                      <span>{sector.sector}</span>
                      <strong className={sector.avgMomentum20 >= 0 ? "positive" : "negative"}>
                        {sector.avgMomentum20 > 0 ? "+" : ""}{sector.avgMomentum20.toFixed(2)}%
                      </strong>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <form className="watchlist-form" aria-label="Add ticker to watchlist">
              <label htmlFor="ticker-symbol">Add symbol to authenticated watchlist</label>
              <div className="input-line">
                <input id="ticker-symbol" placeholder="TEL, BDO, JFC" />
                <button type="button">Add ticker</button>
              </div>
              <p>Helper: production writes this through Supabase Auth and RLS-protected watchlist tables.</p>
            </form>
          </div>
        </section>
      </section>

      <footer className="deck-footer">
        <span>Educational analytics only</span>
        <span>Data warehouse: US-East-1</span>
        <span>Provider: yfinance fallback</span>
      </footer>
    </main>
  );
}
