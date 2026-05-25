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

