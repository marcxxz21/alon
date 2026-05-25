import Link from "next/link";
import type { Route } from "next";
import { AppShell } from "@/components/alonshell/app-shell";
import { getSystemStatus } from "@/lib/system-status";

export default async function AccountPage() {
  const status = await getSystemStatus();

  return (
    <AppShell eyebrow="Profile" title="Account and data boundary">
      <section className="account-grid">
        <article className="glass-tile account-card">
          <p className="tile-label">Authentication</p>
          <strong>{status.supabase.reachable ? "Supabase connected" : "Demo mode"}</strong>
          <p>
            Once Supabase keys are configured, user holdings, watchlists, transactions, and notes are written with the authenticated user id.
          </p>
          <div className="connection-readout">
            <span>Configured</span>
            <strong className={status.supabase.configured ? "positive" : "negative"}>
              {status.supabase.configured ? "Yes" : "No"}
            </strong>
            <span>Reachable</span>
            <strong className={status.supabase.reachable ? "positive" : "negative"}>
              {status.supabase.reachable ? "Yes" : "No"}
            </strong>
          </div>
          <p>{status.supabase.message}</p>
          <Link className="deck-button compact" href={"/login" as Route}>Open login</Link>
        </article>
        <article className="glass-tile account-card">
          <p className="tile-label">Daily Refresh</p>
          <strong>{status.airflow.reachable ? "Airflow reachable" : "Airflow not connected"}</strong>
          <p>
            The daily market pipeline fetches yfinance PH candles, updates warehouse tables, runs dbt models, publishes predictions, then portfolio refresh recomputes account summaries.
          </p>
          <div className="connection-readout">
            <span>Configured</span>
            <strong className={status.airflow.configured ? "positive" : "negative"}>
              {status.airflow.configured ? "Yes" : "No"}
            </strong>
            <span>Reachable</span>
            <strong className={status.airflow.reachable ? "positive" : "negative"}>
              {status.airflow.reachable ? "Yes" : "No"}
            </strong>
          </div>
          <p>{status.airflow.message}</p>
          <Link className="deck-button compact" href={"/api/system/status" as Route}>Open status JSON</Link>
        </article>
      </section>
    </AppShell>
  );
}
