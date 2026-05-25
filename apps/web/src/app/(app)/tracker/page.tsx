import { AppShell } from "@/components/alonshell/app-shell";
import { HoldingEditor } from "@/components/portfolio/holding-editor";
import { buildPortfolioSummary } from "@/lib/portfolio";

export default async function TrackerPage() {
  const portfolio = await buildPortfolioSummary();

  return (
    <AppShell eyebrow="Authenticated Workspace" title="Tracker and holdings">
      <HoldingEditor initialHoldings={portfolio.holdings} />
    </AppShell>
  );
}
