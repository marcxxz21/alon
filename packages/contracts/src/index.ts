export type SignalLabel = "bullish" | "bearish" | "neutral";

export type Ticker = {
  symbol: string;
  yahooSymbol: string;
  companyName: string;
  sector: string;
  active: boolean;
};

export type PricePoint = {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type IndicatorSnapshot = {
  symbol: string;
  asOfDate: string;
  rsi14: number | null;
  macd: number | null;
  macdSignal: number | null;
  sma20: number | null;
  sma50: number | null;
  volatility20: number | null;
  momentum20: number | null;
};

export type Prediction = {
  symbol: string;
  asOfDate: string;
  label: SignalLabel;
  confidence: number;
  modelVersion: string;
  explanation: string[];
  generatedAt: string;
};

export type TickerSummary = {
  ticker: Ticker;
  lastClose: number;
  changePct: number;
  volume: number;
  marketFreshness: string;
  indicator: IndicatorSnapshot;
  prediction: Prediction;
};

export type LeaderboardRow = {
  symbol: string;
  companyName: string;
  sector: string;
  lastClose: number;
  changePct: number;
  volume: number;
  momentum20: number | null;
  signal: SignalLabel;
  confidence: number;
};

export type Watchlist = {
  id: string;
  name: string;
  items: WatchlistItem[];
};

export type WatchlistItem = {
  symbol: string;
  note: string | null;
  addedAt: string;
};

export type PortfolioHolding = {
  id: string;
  symbol: string;
  companyName: string;
  sharesOwned: number;
  averageBuyPrice: number;
  currentPrice: number;
  investedAmount: number;
  marketValue: number;
  gainLoss: number;
  returnPct: number;
  signal: SignalLabel;
  confidence: number;
  notes?: string | null;
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

export type CompanyProfile = {
  symbol: string;
  companyName: string;
  description: string | null;
  industry: string | null;
  sector: string | null;
  website: string | null;
  marketCap: number | null;
  currency: string | null;
  sourceUpdatedAt: string | null;
};
