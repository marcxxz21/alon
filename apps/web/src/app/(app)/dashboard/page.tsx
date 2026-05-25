import Link from "next/link";
import type { Route } from "next";
import { AppShell } from "@/components/alonshell/app-shell";
import { Bell, ChartLineUp, TrendDown, TrendUp } from "@/components/phosphor-icons";
import { PriceChart } from "@/components/price-chart";
import { getLeaderboards, getPrices } from "@/lib/data";
import { buildPortfolioSummary } from "@/lib/portfolio";

function peso(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
}

export default async function DashboardPage() {
  const [portfolio, prices, leaders] = await Promise.all([
    buildPortfolioSummary(),
    getPrices("PSEI"),
    getLeaderboards()
  ]);

  return (
    <AppShell eyebrow="Personal Command Deck" title="Good morning. Your market tide is current.">
      {portfolio.isStale ? (
        <div className="stale-banner">
          <Bell size={18} weight="fill" />
          Latest market refresh is stale. Airflow should rerun the daily market pipeline.
        </div>
      ) : null}

      <section className="mobile-hero-strip">
        <div>
          <p>Total Portfolio Value</p>
          <strong>{peso(portfolio.totalMarketValue)}</strong>
          <span className={portfolio.totalGainLoss >= 0 ? "positive" : "negative"}>
            {portfolio.totalGainLoss >= 0 ? "+" : ""}{peso(portfolio.totalGainLoss)} today
          </span>
        </div>
        <Link href={"/tracker" as Route}>Manage</Link>
      </section>

      <section className="portfolio-kpis">
        <article className="glass-tile stat-card">
          <p className="tile-label">Total Invested</p>
          <strong>{peso(portfolio.totalInvestedAmount)}</strong>
          <span>Cost basis from saved holdings</span>
        </article>
        <article className="glass-tile stat-card">
          <p className="tile-label">Market Value</p>
          <strong>{peso(portfolio.totalMarketValue)}</strong>
          <span>Latest warehouse close</span>
        </article>
        <article className="glass-tile stat-card">
          <p className="tile-label">Unrealized P/L</p>
          <strong className={portfolio.totalGainLoss >= 0 ? "positive" : "negative"}>
            {portfolio.totalGainLoss >= 0 ? "+" : ""}{peso(portfolio.totalGainLoss)}
          </strong>
          <span>{portfolio.totalReturnPct.toFixed(2)}% return</span>
        </article>
        <article className="glass-tile stat-card">
          <p className="tile-label">Refresh</p>
          <strong>{new Date(portfolio.lastRefreshAt).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}</strong>
          <span>Airflow daily yfinance run</span>
        </article>
      </section>

      <section className="app-dashboard-grid">
        <article className="glass-tile chart-panel app-chart">
          <div className="panel-head">
            <div>
              <p className="tile-label">PSEi Market Tide</p>
              <span>Fetched by yfinance as PSEI.PS</span>
            </div>
            <ChartLineUp size={20} />
          </div>
          <PriceChart prices={prices} />
        </article>

        <article className="glass-tile signal-stack">
          <p className="tile-label">Tracked Signals</p>
          {portfolio.holdings.map((holding, index) => (
            <Link className="signal-row" href={`/stocks/${holding.symbol}` as Route} key={holding.symbol} style={{ "--index": index } as React.CSSProperties}>
              <span>{holding.symbol}</span>
              <strong className={holding.returnPct >= 0 ? "positive" : "negative"}>
                {holding.returnPct >= 0 ? "+" : ""}{holding.returnPct.toFixed(2)}%
              </strong>
              <small>{holding.signal}</small>
            </Link>
          ))}
        </article>
      </section>

      <section className="portfolio-kpis two-col">
        <article className="glass-tile stat-card">
          <TrendUp size={24} />
          <p className="tile-label">Top Gainer</p>
          <strong>{portfolio.topGainer?.symbol ?? "None"}</strong>
          <span>{portfolio.topGainer ? `${portfolio.topGainer.returnPct.toFixed(2)}%` : "Add holdings to begin"}</span>
        </article>
        <article className="glass-tile stat-card">
          <TrendDown size={24} />
          <p className="tile-label">Top Loser</p>
          <strong>{portfolio.topLoser?.symbol ?? "None"}</strong>
          <span>{portfolio.topLoser ? `${portfolio.topLoser.returnPct.toFixed(2)}%` : "No drawdown yet"}</span>
        </article>
        <article className="glass-tile movers-panel dashboard-movers">
          <div className="panel-head">
            <div>
              <p className="tile-label">Public Movers</p>
              <span>Market overview</span>
            </div>
            <Link href={"/market" as Route}>Open market</Link>
          </div>
          <div className="movers-table">
            {leaders.slice(0, 5).map((row, index) => (
              <div className="mover-row" key={row.symbol} style={{ "--index": index } as React.CSSProperties}>
                <strong>{row.symbol}</strong>
                <span>{peso(row.lastClose)}</span>
                <span className={row.changePct >= 0 ? "positive" : "negative"}>{row.changePct.toFixed(2)}%</span>
                <span>{row.signal}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
