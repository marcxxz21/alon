"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import type { LeaderboardRow, Ticker, Watchlist } from "@stocksage/contracts";
import { CalendarBlank, MagnifyingGlass } from "@/components/phosphor-icons";

type CommandWorkbenchProps = {
  tickers: Ticker[];
  leaderboards: LeaderboardRow[];
  watchlist: Watchlist;
};

export function CommandTopbar({ tickers, leaderboards, watchlist }: CommandWorkbenchProps) {
  const [query, setQuery] = useState("");
  const [activeSymbol, setActiveSymbol] = useState(tickers[0]?.symbol ?? "ALI");

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tickers.slice(0, 4);

    return tickers
      .filter((ticker) => {
        return (
          ticker.symbol.toLowerCase().includes(needle) ||
          ticker.companyName.toLowerCase().includes(needle) ||
          ticker.sector.toLowerCase().includes(needle)
        );
      })
      .slice(0, 5);
  }, [query, tickers]);

  const selectedRow = leaderboards.find((row) => row.symbol === activeSymbol) ?? leaderboards[0];
  const isInWatchlist = watchlist.items.some((item) => item.symbol === activeSymbol);

  return (
    <nav className="deck-topbar" aria-label="Command deck tools">
      <div className="search-shell search-interactive">
        <MagnifyingGlass size={16} />
        <input
          aria-label="Search ticker or company"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search ticker or company..."
          value={query}
        />
        <kbd>K</kbd>
        <div className="search-results" role="listbox" aria-label="Ticker search results">
          {matches.length > 0 ? (
            matches.map((ticker) => (
              <button
                className={ticker.symbol === activeSymbol ? "active" : ""}
                key={ticker.symbol}
                onClick={() => {
                  setActiveSymbol(ticker.symbol);
                  setQuery(ticker.symbol);
                  window.location.href = `/stocks/${ticker.symbol}`;
                }}
                type="button"
              >
                <strong>{ticker.symbol}</strong>
                <span>{ticker.companyName}</span>
                <em>{ticker.sector}</em>
              </button>
            ))
          ) : (
            <div className="search-empty">No matching ticker in the current universe.</div>
          )}
        </div>
      </div>
      <div className="date-pill">
        <CalendarBlank size={16} />
        May 12, 2026 - May 16, 2026
      </div>
      <Link className="deck-select" href={"/account" as Route}>Connections</Link>
      <Link className="live-sync" href={"/api/system/status" as Route}>
        <i />
        System Status
        <span>2.4s ago</span>
      </Link>
      <div className="command-readout">
        <span>Focus</span>
        <strong>{activeSymbol}</strong>
        <em className={selectedRow?.signal === "bullish" ? "positive" : selectedRow?.signal === "bearish" ? "negative" : "neutral"}>
          {selectedRow?.signal ?? "neutral"}
        </em>
        <small>{isInWatchlist ? "On watchlist" : "Not watched"}</small>
      </div>
    </nav>
  );
}

export function WatchlistComposer({ tickers, watchlist }: Pick<CommandWorkbenchProps, "tickers" | "watchlist">) {
  const [symbol, setSymbol] = useState("");
  const [message, setMessage] = useState("Ready to stage a symbol for Supabase watchlist writes.");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function addTicker() {
    const normalized = symbol.trim().toUpperCase();
    const exists = tickers.some((ticker) => ticker.symbol === normalized);

    if (!normalized) {
      setStatus("error");
      setMessage("Enter a ticker symbol before adding it.");
      return;
    }

    if (!exists) {
      setStatus("error");
      setMessage(`${normalized} is not in the current PSE demo universe.`);
      return;
    }

    if (watchlist.items.some((item) => item.symbol === normalized)) {
      setStatus("idle");
      setMessage(`${normalized} is already inside ${watchlist.name}.`);
      return;
    }

    const response = await fetch(`/api/watchlists/${watchlist.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: normalized })
    });

    setStatus(response.ok ? "success" : "error");
    setMessage(response.ok
      ? `${normalized} was accepted by the watchlist API. Add Supabase env vars to persist it per account.`
      : `Could not add ${normalized}. Check /api/system/status.`);
    setSymbol("");
  }

  return (
    <form className="watchlist-form" aria-label="Add ticker to watchlist">
      <label htmlFor="ticker-symbol">Add symbol to authenticated watchlist</label>
      <div className="input-line">
        <input
          id="ticker-symbol"
          onChange={(event) => setSymbol(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTicker();
            }
          }}
          placeholder="TEL, BDO, JFC"
          value={symbol}
        />
        <button onClick={addTicker} type="button">Add ticker</button>
      </div>
      <p className={`form-message ${status}`}>{message}</p>
    </form>
  );
}
