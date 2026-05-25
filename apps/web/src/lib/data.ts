import { NextResponse } from "next/server";
import type { LeaderboardRow, SignalLabel } from "@stocksage/contracts";
import {
  indicatorFor,
  leaderboards,
  mockWatchlists,
  predictionFor,
  pricesFor,
  sectors,
  summaryFor,
  tickers
} from "./mock-data";
import { getServiceSupabase, hasSupabaseConfig } from "./supabase";

export async function getTickers() {
  if (!hasSupabaseConfig()) return tickers;

  const { data, error } = await getServiceSupabase()
    .from("tickers")
    .select("symbol,yahoo_symbol,company_name,sector,active")
    .eq("active", true)
    .order("symbol");

  if (error) throw error;

  return data.map((row) => ({
    symbol: row.symbol,
    yahooSymbol: row.yahoo_symbol,
    companyName: row.company_name,
    sector: row.sector,
    active: row.active
  }));
}

export async function getTickerSummary(symbol: string) {
  const normalized = symbol.toUpperCase();
  if (!hasSupabaseConfig()) return summaryFor(normalized);

  const supabase = getServiceSupabase();
  const [{ data: ticker, error: tickerError }, { data: rows, error: pricesError }] = await Promise.all([
    supabase
      .from("tickers")
      .select("symbol,yahoo_symbol,company_name,sector,active")
      .eq("symbol", normalized)
      .maybeSingle(),
    supabase
      .from("mart_ticker_daily")
      .select("*")
      .eq("symbol", normalized)
      .order("as_of_date", { ascending: false })
      .limit(2)
  ]);

  if (tickerError) throw tickerError;
  if (pricesError) throw pricesError;
  if (!ticker || !rows?.length) return summaryFor(normalized);

  const latest = rows[0];
  const previous = rows[1] ?? latest;
  const prediction = await getPrediction(normalized);

  return {
    ticker: {
      symbol: ticker.symbol,
      yahooSymbol: ticker.yahoo_symbol,
      companyName: ticker.company_name,
      sector: ticker.sector,
      active: ticker.active
    },
    lastClose: Number(latest.close),
    changePct: Number((((Number(latest.close) - Number(previous.close)) / Number(previous.close || latest.close)) * 100).toFixed(2)),
    volume: Number(latest.volume),
    marketFreshness: latest.as_of_date,
    indicator: {
      symbol: latest.symbol,
      asOfDate: latest.as_of_date,
      rsi14: latest.rsi14 === null ? null : Number(latest.rsi14),
      macd: latest.macd === null ? null : Number(latest.macd),
      macdSignal: latest.macd_signal === null ? null : Number(latest.macd_signal),
      sma20: latest.sma20 === null ? null : Number(latest.sma20),
      sma50: latest.sma50 === null ? null : Number(latest.sma50),
      volatility20: latest.volatility20 === null ? null : Number(latest.volatility20),
      momentum20: latest.momentum20 === null ? null : Number(latest.momentum20)
    },
    prediction
  };
}

export async function getLatestMartRow(symbol: string) {
  if (!hasSupabaseConfig()) return null;

  const { data, error } = await getServiceSupabase()
    .from("mart_ticker_daily")
    .select("*")
    .eq("symbol", symbol.toUpperCase())
    .order("as_of_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getPrices(symbol: string) {
  if (!hasSupabaseConfig()) return pricesFor(symbol.toUpperCase());

  const { data, error } = await getServiceSupabase()
    .from("mart_ticker_daily")
    .select("symbol,as_of_date,open,high,low,close,volume")
    .eq("symbol", symbol.toUpperCase())
    .order("as_of_date", { ascending: true });

  if (error) throw error;
  if (!data.length) return pricesFor(symbol.toUpperCase());

  return data.map((row) => ({
    symbol: row.symbol,
    date: row.as_of_date,
    open: Number(row.open),
    high: Number(row.high),
    low: Number(row.low),
    close: Number(row.close),
    volume: Number(row.volume)
  }));
}

export async function getIndicators(symbol: string) {
  const normalized = symbol.toUpperCase();
  const latest = await getLatestMartRow(normalized);
  if (!latest) return indicatorFor(normalized);

  return {
    symbol: latest.symbol,
    asOfDate: latest.as_of_date,
    rsi14: latest.rsi14 === null ? null : Number(latest.rsi14),
    macd: latest.macd === null ? null : Number(latest.macd),
    macdSignal: latest.macd_signal === null ? null : Number(latest.macd_signal),
    sma20: latest.sma20 === null ? null : Number(latest.sma20),
    sma50: latest.sma50 === null ? null : Number(latest.sma50),
    volatility20: latest.volatility20 === null ? null : Number(latest.volatility20),
    momentum20: latest.momentum20 === null ? null : Number(latest.momentum20)
  };
}

export async function getPrediction(symbol: string) {
  if (!hasSupabaseConfig()) return predictionFor(symbol.toUpperCase());

  const { data, error } = await getServiceSupabase()
    .from("predictions_daily")
    .select("*")
    .eq("symbol", symbol.toUpperCase())
    .order("as_of_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return predictionFor(symbol.toUpperCase());

  return {
    symbol: data.symbol,
    asOfDate: data.as_of_date,
    label: data.label,
    confidence: Number(data.confidence),
    modelVersion: data.model_version,
    explanation: data.explanation ?? [],
    generatedAt: data.generated_at
  };
}

export async function getLeaderboards(): Promise<LeaderboardRow[]> {
  if (!hasSupabaseConfig()) return leaderboards();

  const [tickerRows, martRows] = await Promise.all([getTickers(), getPricesForLeaderboard()]);
  if (!martRows.length) return leaderboards();

  return martRows.map((row) => {
    const ticker = tickerRows.find((item) => item.symbol === row.symbol);
    const signal: SignalLabel = Number(row.momentum20 ?? 0) > 0.015
      ? "bullish"
      : Number(row.momentum20 ?? 0) < -0.015
        ? "bearish"
        : "neutral";

    return {
      symbol: row.symbol,
      companyName: ticker?.companyName ?? row.symbol,
      sector: ticker?.sector ?? "Unknown",
      lastClose: Number(row.close),
      changePct: Number((Number(row.daily_return ?? 0) * 100).toFixed(2)),
      volume: Number(row.volume),
      momentum20: row.momentum20 === null ? null : Number((Number(row.momentum20) * 100).toFixed(2)),
      signal,
      confidence: Math.min(0.89, 0.58 + Math.abs(Number(row.momentum20 ?? 0)) * 2)
    };
  });
}

export async function getSectors() {
  if (hasSupabaseConfig()) {
    const { data, error } = await getServiceSupabase()
      .from("mart_sector_daily")
      .select("sector,ticker_count,avg_daily_return,avg_momentum20")
      .order("as_of_date", { ascending: false })
      .limit(8);

    if (error) throw error;
    if (data.length) {
      return data.map((row) => ({
        sector: row.sector,
        tickerCount: Number(row.ticker_count),
        avgChangePct: Number((Number(row.avg_daily_return ?? 0) * 100).toFixed(2)),
        avgMomentum20: Number((Number(row.avg_momentum20 ?? 0) * 100).toFixed(2))
      }));
    }
  }

  return sectors;
}

export async function getWatchlists() {
  return mockWatchlists;
}

export function jsonError(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ error: message }, { status });
}

async function getPricesForLeaderboard() {
  const { data, error } = await getServiceSupabase()
    .from("mart_ticker_daily")
    .select("symbol,close,volume,daily_return,momentum20,as_of_date")
    .order("as_of_date", { ascending: false })
    .limit(30);

  if (error) throw error;

  const seen = new Set<string>();
  return data.filter((row) => {
    if (seen.has(row.symbol)) return false;
    seen.add(row.symbol);
    return true;
  });
}
