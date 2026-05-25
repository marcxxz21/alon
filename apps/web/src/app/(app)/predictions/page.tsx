import Link from "next/link";
import type { Route } from "next";
import { AppShell } from "@/components/alonshell/app-shell";
import { getLeaderboards } from "@/lib/data";

export default async function PredictionsPage() {
  const leaders = await getLeaderboards();

  return (
    <AppShell eyebrow="Explainable ML" title="Prediction signals">
      <section className="glass-tile market-table">
        <div className="panel-head">
          <div>
            <p className="tile-label">Baseline Classifier</p>
            <span>scikit-learn v1, LSTM deferred</span>
          </div>
        </div>
        {leaders.map((row, index) => (
          <Link className="market-row" href={`/stocks/${row.symbol}` as Route} key={row.symbol} style={{ "--index": index } as React.CSSProperties}>
            <strong>{row.symbol}</strong>
            <span>{row.companyName}</span>
            <span>{row.signal}</span>
            <span>{Math.round(row.confidence * 100)}% confidence</span>
            <span className={row.momentum20 && row.momentum20 >= 0 ? "positive" : "negative"}>
              {row.momentum20?.toFixed(2) ?? "0.00"} momentum
            </span>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
