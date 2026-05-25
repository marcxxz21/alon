import { AppShell } from "@/components/alonshell/app-shell";
import { WatchlistComposer } from "@/components/command-workbench";
import { getTickers, getWatchlists } from "@/lib/data";

export default async function WatchlistPage() {
  const [tickers, watchlists] = await Promise.all([getTickers(), getWatchlists()]);
  const watchlist = watchlists[0];

  return (
    <AppShell eyebrow="Saved Symbols" title="Watchlist">
      <section className="watchlist-layout">
        <article className="glass-tile watchlist-card">
          <div className="panel-head">
            <div>
              <p className="tile-label">{watchlist.name}</p>
              <span>Persists through Supabase once authenticated</span>
            </div>
            <strong>{watchlist.items.length}</strong>
          </div>
          <div className="holding-list">
            {watchlist.items.map((item, index) => (
              <article className="watchlist-row" key={item.symbol} style={{ "--index": index } as React.CSSProperties}>
                <strong>{item.symbol}</strong>
                <span>{item.note ?? "Monitoring market movement"}</span>
                <time>{new Date(item.addedAt).toLocaleDateString("en-PH")}</time>
              </article>
            ))}
          </div>
        </article>
        <WatchlistComposer tickers={tickers} watchlist={watchlist} />
      </section>
    </AppShell>
  );
}
