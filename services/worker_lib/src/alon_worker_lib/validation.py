from __future__ import annotations

import pandas as pd


def validate_ohlcv(frame: pd.DataFrame) -> pd.DataFrame:
  required = {"symbol", "trade_date", "open", "high", "low", "close", "volume"}
  missing = required.difference(frame.columns)
  if missing:
    raise ValueError(f"Missing OHLCV columns: {sorted(missing)}")

  clean = frame.drop_duplicates(["symbol", "trade_date"]).copy()
  invalid = (
    clean["open"].isna()
    | clean["high"].isna()
    | clean["low"].isna()
    | clean["close"].isna()
    | (clean["high"] < clean["low"])
    | (clean["close"] < 0)
    | (clean["volume"].fillna(0) < 0)
  )
  clean["is_valid"] = ~invalid
  return clean
