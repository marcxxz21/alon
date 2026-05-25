import type { LeaderboardRow } from "@stocksage/contracts";
import { getLeaderboards } from "./data";

export type HoldingInput = {
  id?: string;
  symbol: string;
  sharesOwned: number;
  averageBuyPrice: number;
  notes?: string | null;
};

export type PortfolioHolding = HoldingInput & {
  id: string;
  companyName: string;
  currentPrice: number;
  investedAmount: number;
  marketValue: number;
  gainLoss: number;
  returnPct: number;
  signal: LeaderboardRow["signal"];
  confidence: number;
};

export type PortfolioSummary = {
  totalInvestedAmount: number;
  totalMarketValue: number;
  totalGainLoss: number;
  totalReturnPct: number;
  topGainer: PortfolioHolding | null;
  topLoser: PortfolioHolding | null;
  holdings: PortfolioHolding[];
  lastRefreshAt: string;
  isStale: boolean;
};

export const demoHoldingInputs: HoldingInput[] = [
  { symbol: "ALI", sharesOwned: 120, averageBuyPrice: 71.2, notes: "Long-term property allocation" },
  { symbol: "BDO", sharesOwned: 42, averageBuyPrice: 76.5, notes: "Banking cycle exposure" },
  { symbol: "TEL", sharesOwned: 7, averageBuyPrice: 91.4, notes: "Dividend watch" }
];

export async function buildPortfolioSummary(holdingInputs = demoHoldingInputs): Promise<PortfolioSummary> {
  const leaders = await getLeaderboards();
  const holdings = holdingInputs.map((holding, index) => {
    const market = leaders.find((row) => row.symbol === holding.symbol);
    const currentPrice = market?.lastClose ?? holding.averageBuyPrice;
    const investedAmount = holding.sharesOwned * holding.averageBuyPrice;
    const marketValue = holding.sharesOwned * currentPrice;
    const gainLoss = marketValue - investedAmount;
    const returnPct = investedAmount === 0 ? 0 : (gainLoss / investedAmount) * 100;

    return {
      id: holding.id ?? `demo-${index}-${holding.symbol}`,
      ...holding,
      companyName: market?.companyName ?? holding.symbol,
      currentPrice,
      investedAmount,
      marketValue,
      gainLoss,
      returnPct,
      signal: market?.signal ?? "neutral",
      confidence: market?.confidence ?? 0.58
    };
  });

  const totalInvestedAmount = holdings.reduce((sum, holding) => sum + holding.investedAmount, 0);
  const totalMarketValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const totalGainLoss = totalMarketValue - totalInvestedAmount;
  const totalReturnPct = totalInvestedAmount === 0 ? 0 : (totalGainLoss / totalInvestedAmount) * 100;
  const sorted = [...holdings].sort((a, b) => b.returnPct - a.returnPct);

  return {
    totalInvestedAmount,
    totalMarketValue,
    totalGainLoss,
    totalReturnPct,
    topGainer: sorted[0] ?? null,
    topLoser: sorted.at(-1) ?? null,
    holdings,
    lastRefreshAt: "2026-05-25T18:15:00+08:00",
    isStale: false
  };
}
