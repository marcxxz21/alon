from __future__ import annotations

from datetime import UTC, datetime

import pandas as pd

from .indicators import add_indicators
from .ml import build_features, predict_next_session
from .portfolio import portfolio_snapshots, recompute_positions
from .validation import validate_ohlcv
from .yfinance_source import TickerSource, fetch_daily_prices


DEFAULT_TICKERS = [
  TickerSource("PSEI", "PSEI.PS"),
  TickerSource("ALI", "ALI.PS"),
  TickerSource("BDO", "BDO.PS"),
  TickerSource("JFC", "JFC.PS"),
  TickerSource("SMPH", "SMPH.PS"),
  TickerSource("TEL", "TEL.PS")
]


def run_daily_market_pipeline(tickers: list[TickerSource] | None = None) -> dict[str, object]:
  started_at = datetime.now(UTC)
  sources = tickers or DEFAULT_TICKERS
  raw = pd.concat([fetch_daily_prices(ticker) for ticker in sources], ignore_index=True)
  clean = validate_ohlcv(raw)
  indicators = add_indicators(clean[clean["is_valid"]])
  features = build_features(indicators)
  predictions = predict_next_session(features)
  return {
    "pipeline_name": "daily_market_pipeline",
    "run_status": "success",
    "started_at": started_at.isoformat(),
    "finished_at": datetime.now(UTC).isoformat(),
    "rows_processed": int(len(raw)),
    "raw_prices": raw,
    "core_daily_prices": clean,
    "market_indicators_daily": indicators,
    "prediction_features_daily": features,
    "predictions_daily": predictions
  }


def run_daily_portfolio_refresh(holdings: pd.DataFrame, latest_prices: pd.DataFrame) -> dict[str, object]:
  started_at = datetime.now(UTC)
  recomputed = recompute_positions(holdings, latest_prices)
  snapshots = portfolio_snapshots(recomputed)
  return {
    "pipeline_name": "daily_portfolio_refresh",
    "run_status": "success",
    "started_at": started_at.isoformat(),
    "finished_at": datetime.now(UTC).isoformat(),
    "rows_processed": int(len(recomputed)),
    "portfolio_positions": recomputed,
    "portfolio_daily_snapshots": snapshots
  }
