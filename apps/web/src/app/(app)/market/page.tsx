import Link from "next/link";
import type { Route } from "next";
import { AppShell } from "@/components/alonshell/app-shell";
import { getLeaderboards, getSectors, getTickerSummary } from "@/lib/data";

export default async function MarketPage() {
  const [summary, leaders, sectors] = await Promise.all([
    getTickerSummary("PSEI"),
    getLeaderboards(),
    getSectors()
  ]);

  return (
    <AppShell eyebrow="Public Market Overview" title="Philippine market pulse">
      <section className="market-grid">
        <article className="glass-tile market-hero-card">
          <p className="tile-label">PSEi Sample</p>
          <strong>{summary?.lastClose.toFixed(2)}</strong>
          <span className={(summary?.changePct ?? 0) >= 0 ? "positive" : "negative"}>
            {summary?.changePct.toFixed(2)}%
          </span>
          <p>All v1 market data is sourced only from yfinance and stored by the daily warehouse pipeline.</p>
        </article>
        <article className="glass-tile heatmap-panel">
          <div className="panel-head">
            <div>
              <p className="tile-label">Sector Heatmap</p>
              <span>dbt mart_sector_daily</span>
            </div>
          </div>
          <div className="sector-tiles">
            {sectors.map((sector, index) => (
              <div className="sector-tile" key={sector.sector} style={{ "--index": index } as React.CSSProperties}>
                <span>{sector.sector}</span>
                <strong className={sector.avgMomentum20 >= 0 ? "positive" : "negative"}>
                  {sector.avgMomentum20 >= 0 ? "+" : ""}{sector.avgMomentum20.toFixed(2)}%
                </strong>
              </div>
            ))}
          </div>
        </article>
      </section>
      <section className="glass-tile market-table">
        <div className="panel-head">
          <div>
            <p className="tile-label">Leaderboards</p>
            <span>Gainers, losers, volume, momentum</span>
          </div>
        </div>
        {leaders.map((row, index) => (
          <Link className="market-row" href={`/stocks/${row.symbol}` as Route} key={row.symbol} style={{ "--index": index } as React.CSSProperties}>
            <strong>{row.symbol}</strong>
            <span>{row.companyName}</span>
            <span>{row.sector}</span>
            <span className={row.changePct >= 0 ? "positive" : "negative"}>{row.changePct.toFixed(2)}%</span>
            <span>{row.signal}</span>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
