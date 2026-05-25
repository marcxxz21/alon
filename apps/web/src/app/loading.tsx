export default function Loading() {
  return (
    <main className="tide-page">
      <div className="watermark watermark-top">Alon</div>
      <div className="watermark watermark-bottom">Market Tide</div>
      <div className="wave-field" aria-hidden="true" />
      <section className="loading-shell" aria-label="Loading Alon dashboard">
        <div className="loading-phone">
          <i />
          <i />
          <i />
        </div>
        <div className="loading-deck">
          <div className="skeleton-line wide" />
          <div className="skeleton-grid">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="skeleton-chart" />
          <div className="skeleton-grid lower">
            <i />
            <i />
            <i />
          </div>
        </div>
      </section>
    </main>
  );
}

