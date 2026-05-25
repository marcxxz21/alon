"use client";

import type { PortfolioHolding } from "@stocksage/contracts";
import { Plus, Trash } from "@/components/phosphor-icons";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useMemo, useState } from "react";

type DraftHolding = {
  symbol: string;
  sharesOwned: string;
  averageBuyPrice: string;
  notes: string;
};

const emptyDraft: DraftHolding = {
  symbol: "",
  sharesOwned: "",
  averageBuyPrice: "",
  notes: ""
};

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = getBrowserSupabase();
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function HoldingEditor({ initialHoldings }: { initialHoldings: PortfolioHolding[] }) {
  const [holdings, setHoldings] = useState(initialHoldings);
  const [draft, setDraft] = useState(emptyDraft);
  const [message, setMessage] = useState("Ready to save holdings to your authenticated Supabase account.");
  const [isSaving, setIsSaving] = useState(false);

  const totals = useMemo(() => {
    const invested = holdings.reduce((sum, holding) => sum + holding.investedAmount, 0);
    const value = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
    return { invested, value, gainLoss: value - invested };
  }, [holdings]);

  async function addHolding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("Saving tracker row...");
    const response = await fetch("/api/portfolio/holdings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders())
      },
      body: JSON.stringify({
        symbol: draft.symbol,
        sharesOwned: Number(draft.sharesOwned),
        averageBuyPrice: Number(draft.averageBuyPrice),
        notes: draft.notes || null
      })
    });

    const result = await response.json();
    if (result.mode === "mock") {
      const sharesOwned = Number(draft.sharesOwned);
      const averageBuyPrice = Number(draft.averageBuyPrice);
      setHoldings((current) => [
        {
          id: result.id,
          symbol: result.symbol,
          companyName: result.symbol,
          sharesOwned,
          averageBuyPrice,
          currentPrice: averageBuyPrice,
          investedAmount: sharesOwned * averageBuyPrice,
          marketValue: sharesOwned * averageBuyPrice,
          gainLoss: 0,
          returnPct: 0,
          signal: "neutral",
          confidence: 0.52,
          notes: result.notes
        },
        ...current.filter((holding) => holding.symbol !== result.symbol)
      ]);
    } else {
      const portfolioResponse = await fetch("/api/portfolio", { headers: await authHeaders() });
      const portfolio = await portfolioResponse.json();
      setHoldings(portfolio.holdings ?? holdings);
    }
    setDraft(emptyDraft);
    setIsSaving(false);
    setMessage(response.ok ? "Holding saved. Portfolio values will update after the next daily refresh." : "Could not save holding.");
  }

  async function removeHolding(id: string) {
    setMessage("Removing tracker row...");
    await fetch(`/api/portfolio/holdings/${id}`, {
      method: "DELETE",
      headers: await authHeaders()
    });
    setHoldings((current) => current.filter((holding) => holding.id !== id));
    setMessage("Holding removed from this device view and from Supabase when authenticated.");
  }

  return (
    <section className="tracker-grid">
      <form className="tracker-form glass-tile" onSubmit={addHolding}>
        <div>
          <p className="micro-label">Add Position</p>
          <h2>Stock tracker</h2>
          <p className="muted-copy">
            Store shares, cost basis, and notes. Current prices come from the refreshed market warehouse.
          </p>
        </div>
        <label>
          <span>PH symbol</span>
          <input
            onChange={(event) => setDraft((current) => ({ ...current, symbol: event.target.value.toUpperCase() }))}
            placeholder="ALI"
            required
            value={draft.symbol}
          />
        </label>
        <label>
          <span>Shares owned</span>
          <input
            inputMode="decimal"
            min="0"
            onChange={(event) => setDraft((current) => ({ ...current, sharesOwned: event.target.value }))}
            placeholder="120"
            required
            type="number"
            value={draft.sharesOwned}
          />
        </label>
        <label>
          <span>Average buy price</span>
          <input
            inputMode="decimal"
            min="0"
            onChange={(event) => setDraft((current) => ({ ...current, averageBuyPrice: event.target.value }))}
            placeholder="71.20"
            required
            step="0.01"
            type="number"
            value={draft.averageBuyPrice}
          />
        </label>
        <label>
          <span>Notes</span>
          <textarea
            onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
            placeholder="Allocation thesis, target, or watch item"
            rows={4}
            value={draft.notes}
          />
        </label>
        <button className="deck-button" disabled={isSaving} type="submit">
          <Plus size={17} />
          {isSaving ? "Saving..." : "Add holding"}
        </button>
        <p className="form-message success">{message}</p>
      </form>

      <section className="holdings-panel glass-tile">
        <div className="panel-head">
          <div>
            <p className="micro-label">Portfolio</p>
            <span>{holdings.length} tracked stocks</span>
          </div>
          <strong>{totals.gainLoss >= 0 ? "+" : ""}{totals.gainLoss.toFixed(0)}</strong>
        </div>
        <div className="holding-list">
          {holdings.map((holding, index) => (
            <article className="holding-row" key={holding.id} style={{ "--index": index } as React.CSSProperties}>
              <div>
                <strong>{holding.symbol}</strong>
                <span>{holding.companyName}</span>
              </div>
              <dl>
                <div>
                  <dt>Shares</dt>
                  <dd>{holding.sharesOwned}</dd>
                </div>
                <div>
                  <dt>Avg</dt>
                  <dd>{holding.averageBuyPrice.toFixed(2)}</dd>
                </div>
                <div>
                  <dt>Value</dt>
                  <dd>{holding.marketValue.toFixed(2)}</dd>
                </div>
                <div>
                  <dt>Return</dt>
                  <dd className={holding.returnPct >= 0 ? "positive" : "negative"}>
                    {holding.returnPct >= 0 ? "+" : ""}{holding.returnPct.toFixed(2)}%
                  </dd>
                </div>
              </dl>
              {holding.notes ? <p>{holding.notes}</p> : null}
              <button aria-label={`Remove ${holding.symbol}`} onClick={() => removeHolding(holding.id)} type="button">
                <Trash size={17} />
              </button>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
