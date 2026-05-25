import {
  ChartLineUp,
  Database,
  House,
  Pulse,
  ShieldCheck,
  Sparkle,
  SquaresFour,
  Stack,
  WaveSawtooth
} from "@/components/phosphor-icons";
import type { Route } from "next";
import Link from "next/link";
import { CommandTopbar, WatchlistComposer } from "@/components/command-workbench";
import { PriceChart } from "@/components/price-chart";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { getLeaderboards, getPrices, getSectors, getTickerSummary, getTickers, getWatchlists } from "@/lib/data";
import { hasSupabaseConfig } from "@/lib/supabase";

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

function formatIndex(value: number) {
  return new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);
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
  const [summary, prices, leaderboards, sectors, watchlists, tickers] = await Promise.all([
    getTickerSummary("PSEI"),
    getPrices("PSEI"),
    getLeaderboards(),
    getSectors(),
    getWatchlists(),
    getTickers()
  ]);

  if (!summary) {
    throw new Error("Demo ticker summary is unavailable.");
  }

  const topRows = [...leaderboards].sort((a, b) => b.momentum20! - a.momentum20!).slice(0, 5);
  const watchlist = watchlists[0];
  const confidence = Math.round(summary.prediction.confidence * 1000) / 10;
  const bullishCount = leaderboards.filter((row) => row.signal === "bullish").length;
  const bearishCount = leaderboards.filter((row) => row.signal === "bearish").length;
  const databaseConnected = hasSupabaseConfig();

  return (
    <main className="tide-page">
      <ServiceWorkerRegister />
      <div className="watermark watermark-top">Alon</div>
      <div className="watermark watermark-bottom">Market Tide</div>
      <div className="wave-field" aria-hidden="true" />

      <section className="deck-shell" aria-label="Alon command deck">
        <section className="command-panel">
          <aside className="side-rail" aria-label="Workspace navigation">
            <div className="side-logo">
              <WaveSawtooth size={25} weight="bold" />
              <span>Alon</span>
            </div>
            <Link className="rail-link active" href={"/dashboard" as Route}><House size={18} /> Overview</Link>
            <Link className="rail-link" href={"/market" as Route}><ChartLineUp size={18} /> Markets</Link>
            <Link className="rail-link" href={"/predictions" as Route}><Stack size={18} /> Signals</Link>
            <Link className="rail-link" href={"/tracker" as Route}><Database size={18} /> Tracker</Link>
          </aside>

          <div className="deck-content">
            <CommandTopbar leaderboards={leaderboards} tickers={tickers} watchlist={watchlist} />

            <header className="deck-heading">
              <div>
                <p className="micro-label">Real-time analytics and intelligence across markets, data, and AI</p>
                <h1>Command Deck</h1>
              </div>
              <div className="deck-health">
                <ShieldCheck size={19} weight="fill" />
                {databaseConnected ? "Supabase connected" : "Mock mode: connect Supabase"}
              </div>
            </header>

            <section className="kpi-grid" aria-label="Platform health">
              <article className="glass-tile market-pulse">
                <p className="tile-label">Market Pulse</p>
                <span>as of 9:41 AM PHT</span>
                <dl>
                  <div>
                    <dt>PSEi via PSEI.PS</dt>
                    <dd>{formatIndex(summary.lastClose)} <strong className={summary.changePct >= 0 ? "positive" : "negative"}>{summary.changePct > 0 ? "+" : ""}{summary.changePct.toFixed(2)}%</strong></dd>
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
                <span>{summary.ticker.symbol} - market index monitor</span>
                <div className="gauge-ring" style={{ "--score": `${confidence}%` } as React.CSSProperties}>
                  <strong>{confidence}%</strong>
                  <small>{summary.prediction.label}</small>
                </div>
                <div className="split-row">
                  <span>Target close</span>
                  <strong>{formatIndex(summary.lastClose * 1.018)}</strong>
                </div>
              </article>

              <article className="glass-tile pipeline-health">
                <p className="tile-label">Pipeline Health</p>
                <span>Airflow DAGs</span>
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
                    <small>{databaseConnected ? "Live database" : "Not connected yet"}</small>
                    <strong>{databaseConnected ? "Healthy" : "Mock mode"}</strong>
                  </div>
                </div>
                <div className="warehouse-stats">
                  <span>Last updated <strong>{databaseConnected ? "14m ago" : "local"}</strong></span>
                  <span>Rows <strong>{databaseConnected ? "2,847,193" : "mock"}</strong></span>
                  <span>Tables <strong>12 planned</strong></span>
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

            <WatchlistComposer tickers={tickers} watchlist={watchlist} />
          </div>
        </section>
      </section>

      <footer className="deck-footer">
        <span>Educational analytics only</span>
        <span>Data warehouse: US-East-1</span>
        <span>Provider: yfinance only</span>
      </footer>
    </main>
  );
}
