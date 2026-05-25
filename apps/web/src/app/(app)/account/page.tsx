import Link from "next/link";
import type { Route } from "next";
import { AppShell } from "@/components/alonshell/app-shell";
import { hasSupabaseConfig } from "@/lib/supabase";

export default function AccountPage() {
  return (
    <AppShell eyebrow="Profile" title="Account and data boundary">
      <section className="account-grid">
        <article className="glass-tile account-card">
          <p className="tile-label">Authentication</p>
          <strong>{hasSupabaseConfig() ? "Supabase configured" : "Demo mode"}</strong>
          <p>
            Once Supabase keys are configured, user holdings, watchlists, transactions, and notes are written with the authenticated user id.
          </p>
          <Link className="deck-button compact" href={"/login" as Route}>Open login</Link>
        </article>
        <article className="glass-tile account-card">
          <p className="tile-label">Daily Refresh</p>
          <strong>Airflow after close</strong>
          <p>
            The daily market pipeline fetches yfinance PH candles, updates warehouse tables, runs dbt models, publishes predictions, then portfolio refresh recomputes account summaries.
          </p>
        </article>
      </section>
    </AppShell>
  );
}
