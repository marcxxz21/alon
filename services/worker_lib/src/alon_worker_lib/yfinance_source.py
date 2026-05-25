from __future__ import annotations

from dataclasses import dataclass
from datetime import date

import pandas as pd
import yfinance as yf


@dataclass(frozen=True)
class TickerSource:
  symbol: str
  provider_symbol: str


def normalize_symbol(symbol: str) -> str:
  return symbol.upper().replace(".PS", "").strip()


def fetch_daily_prices(ticker: TickerSource, period: str = "1y") -> pd.DataFrame:
  frame = yf.download(
    ticker.provider_symbol,
    period=period,
    interval="1d",
    auto_adjust=False,
    progress=False,
    threads=False
  )
  if frame.empty:
    return pd.DataFrame(columns=["symbol", "provider_symbol", "trade_date", "open", "high", "low", "close", "adj_close", "volume"])

  if isinstance(frame.columns, pd.MultiIndex):
    frame.columns = [column[0] for column in frame.columns]

  output = frame.reset_index().rename(columns={
    "Date": "trade_date",
    "Open": "open",
    "High": "high",
    "Low": "low",
    "Close": "close",
    "Adj Close": "adj_close",
    "Volume": "volume"
  })
  output["symbol"] = ticker.symbol
  output["provider_symbol"] = ticker.provider_symbol
  output["trade_date"] = pd.to_datetime(output["trade_date"]).dt.date
  return output[["symbol", "provider_symbol", "trade_date", "open", "high", "low", "close", "adj_close", "volume"]]


def fetch_company_profile(ticker: TickerSource) -> dict[str, object]:
  info = yf.Ticker(ticker.provider_symbol).info or {}
  return {
    "symbol": ticker.symbol,
    "company_name": info.get("longName") or info.get("shortName") or ticker.symbol,
    "description": info.get("longBusinessSummary"),
    "industry": info.get("industry"),
    "sector": info.get("sector"),
    "website": info.get("website"),
    "market_cap": info.get("marketCap"),
    "currency": info.get("currency") or "PHP",
    "source_updated_at": date.today().isoformat()
  }
