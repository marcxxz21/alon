import { AppShell } from "@/components/alonshell/app-shell";
import { PriceChart } from "@/components/price-chart";
import { getPrices, getTickerProfile, getTickerSummary } from "@/lib/data";

type Params = { params: Promise<{ symbol: string }> };

export default async function StockDetailPage({ params }: Params) {
  const { symbol } = await params;
  const [summary, prices, profile] = await Promise.all([
    getTickerSummary(symbol),
    getPrices(symbol),
    getTickerProfile(symbol)
  ]);

  if (!summary) throw new Error("Ticker not found.");

  return (
    <AppShell eyebrow="Stock Detail" title={`${summary.ticker.symbol} intelligence`}>
      <section className="stock-detail-grid">
        <article className="glass-tile market-hero-card">
          <p className="tile-label">{summary.ticker.companyName}</p>
          <strong>{summary.lastClose.toFixed(2)}</strong>
          <span className={summary.changePct >= 0 ? "positive" : "negative"}>
            {summary.changePct >= 0 ? "+" : ""}{summary.changePct.toFixed(2)}%
          </span>
          <p>{profile?.description}</p>
        </article>
        <article className="glass-tile prediction-card">
          <p className="tile-label">Baseline ML Signal</p>
          <strong>{summary.prediction.label}</strong>
          <span>{Math.round(summary.prediction.confidence * 100)}% confidence</span>
          <p>{summary.prediction.explanation.join(" ")}</p>
        </article>
      </section>
      <article className="glass-tile chart-panel app-chart">
        <PriceChart prices={prices} />
      </article>
    </AppShell>
  );
}
