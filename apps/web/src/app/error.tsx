"use client";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="tide-page">
      <div className="watermark watermark-top">Alon</div>
      <div className="watermark watermark-bottom">Market Tide</div>
      <section className="error-shell" aria-label="Dashboard error">
        <p className="micro-label">Command deck interrupted</p>
        <h1>Market view needs a clean reload.</h1>
        <p>{error.message || "The dashboard could not collect its data snapshot."}</p>
        <button className="deck-button" onClick={reset} type="button">
          Retry dashboard
        </button>
      </section>
    </main>
  );
}

