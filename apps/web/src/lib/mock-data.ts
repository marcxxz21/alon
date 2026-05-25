import type {
  IndicatorSnapshot,
  LeaderboardRow,
  Prediction,
  PricePoint,
  Ticker,
  TickerSummary,
  Watchlist
} from "@stocksage/contracts";

export const tickers: Ticker[] = [
  {
    symbol: "ALI",
    yahooSymbol: "ALI.PS",
    companyName: "Ayala Land, Inc.",
    sector: "Property",
    active: true
  },
  {
    symbol: "BDO",
    yahooSymbol: "BDO.PS",
    companyName: "BDO Unibank, Inc.",
    sector: "Financials",
    active: true
  },
  {
    symbol: "JFC",
    yahooSymbol: "JFC.PS",
    companyName: "Jollibee Foods Corporation",
    sector: "Consumer",
    active: true
  },
  {
    symbol: "SMPH",
    yahooSymbol: "SMPH.PS",
    companyName: "SM Prime Holdings, Inc.",
    sector: "Property",
    active: true
  },
  {
    symbol: "TEL",
    yahooSymbol: "TEL.PS",
    companyName: "PLDT Inc.",
    sector: "Telecom",
    active: true
  }
];

const baseDate = new Date("2026-05-22T00:00:00+08:00");

export function pricesFor(symbol: string): PricePoint[] {
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const start = 20 + (seed % 80);

  return Array.from({ length: 90 }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - (89 - index));
    const wave = Math.sin((index + seed) / 7) * 2.4;
    const trend = index * ((seed % 7) - 2) * 0.015;
    const close = Number((start + wave + trend).toFixed(2));
    const open = Number((close - Math.sin(index / 4)).toFixed(2));
    const high = Number((Math.max(open, close) + 1.2).toFixed(2));
    const low = Number((Math.min(open, close) - 1.1).toFixed(2));

    return {
      symbol,
      date: date.toISOString().slice(0, 10),
      open,
      high,
      low,
      close,
      volume: 1_000_000 + ((seed * index * 193) % 8_000_000)
    };
  });
}

export function indicatorFor(symbol: string): IndicatorSnapshot {
  const prices = pricesFor(symbol);
  const latest = prices.at(-1)!;
  const prior = prices.at(-21)!;
  const momentum = ((latest.close - prior.close) / prior.close) * 100;

  return {
    symbol,
    asOfDate: latest.date,
    rsi14: Number((52 + Math.sin(latest.close) * 14).toFixed(2)),
    macd: Number((Math.sin(latest.close / 8) * 1.8).toFixed(2)),
    macdSignal: Number((Math.sin(latest.close / 9) * 1.4).toFixed(2)),
    sma20: Number((latest.close * 0.98).toFixed(2)),
    sma50: Number((latest.close * 0.95).toFixed(2)),
    volatility20: Number((1.8 + Math.abs(Math.sin(latest.close)) * 2).toFixed(2)),
    momentum20: Number(momentum.toFixed(2))
  };
}

export function predictionFor(symbol: string): Prediction {
  const indicator = indicatorFor(symbol);
  const momentum = indicator.momentum20 ?? 0;
  const label = momentum > 1.5 ? "bullish" : momentum < -1.5 ? "bearish" : "neutral";

  return {
    symbol,
    asOfDate: indicator.asOfDate,
    label,
    confidence: Number(Math.min(0.89, 0.58 + Math.abs(momentum) / 20).toFixed(2)),
    modelVersion: "baseline-logistic-v0.1",
    explanation: [
      `20-day momentum is ${momentum.toFixed(2)}%.`,
      `RSI is ${indicator.rsi14?.toFixed(2) ?? "unavailable"}.`,
      "Prediction uses educational baseline features, not investment advice."
    ],
    generatedAt: "2026-05-22T18:20:00+08:00"
  };
}

export function summaryFor(symbol: string): TickerSummary | null {
  const ticker = tickers.find((item) => item.symbol === symbol.toUpperCase());
  if (!ticker) return null;
  const prices = pricesFor(ticker.symbol);
  const latest = prices.at(-1)!;
  const previous = prices.at(-2)!;

  return {
    ticker,
    lastClose: latest.close,
    changePct: Number((((latest.close - previous.close) / previous.close) * 100).toFixed(2)),
    volume: latest.volume,
    marketFreshness: latest.date,
    indicator: indicatorFor(ticker.symbol),
    prediction: predictionFor(ticker.symbol)
  };
}

export function leaderboards(): LeaderboardRow[] {
  return tickers.map((ticker) => {
    const summary = summaryFor(ticker.symbol)!;
    return {
      symbol: ticker.symbol,
      companyName: ticker.companyName,
      sector: ticker.sector,
      lastClose: summary.lastClose,
      changePct: summary.changePct,
      volume: summary.volume,
      momentum20: summary.indicator.momentum20,
      signal: summary.prediction.label,
      confidence: summary.prediction.confidence
    };
  });
}

export const sectors = [
  { sector: "Property", tickerCount: 2, avgChangePct: 0.82, avgMomentum20: 2.7 },
  { sector: "Financials", tickerCount: 1, avgChangePct: 0.21, avgMomentum20: 1.4 },
  { sector: "Consumer", tickerCount: 1, avgChangePct: -0.18, avgMomentum20: -0.8 },
  { sector: "Telecom", tickerCount: 1, avgChangePct: 0.39, avgMomentum20: 0.9 }
];

export const mockWatchlists: Watchlist[] = [
  {
    id: "demo-watchlist",
    name: "Core PH Watchlist",
    items: [
      { symbol: "ALI", note: "Property cycle proxy", addedAt: "2026-05-20T09:00:00+08:00" },
      { symbol: "BDO", note: "Banking bellwether", addedAt: "2026-05-20T09:04:00+08:00" },
      { symbol: "JFC", note: null, addedAt: "2026-05-21T14:10:00+08:00" }
    ]
  }
];

