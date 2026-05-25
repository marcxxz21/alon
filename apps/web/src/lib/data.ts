import { NextResponse } from "next/server";
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
  if (!hasSupabaseConfig()) return summaryFor(symbol);

  const { data, error } = await getServiceSupabase()
    .from("mart_ticker_daily")
    .select("*")
    .eq("symbol", symbol.toUpperCase())
    .order("as_of_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return summaryFor(symbol);

  return summaryFor(symbol);
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
  return indicatorFor(symbol.toUpperCase());
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

export async function getLeaderboards() {
  return leaderboards();
}

export async function getSectors() {
  return sectors;
}

export async function getWatchlists() {
  return mockWatchlists;
}

export function jsonError(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ error: message }, { status });
}
