from __future__ import annotations

import pandas as pd


def add_indicators(frame: pd.DataFrame) -> pd.DataFrame:
  output = frame.sort_values(["symbol", "trade_date"]).copy()
  grouped = output.groupby("symbol", group_keys=False)
  output["daily_return"] = grouped["close"].pct_change()
  output["sma_20"] = grouped["close"].transform(lambda series: series.rolling(20, min_periods=5).mean())
  output["sma_50"] = grouped["close"].transform(lambda series: series.rolling(50, min_periods=10).mean())
  output["ema_12"] = grouped["close"].transform(lambda series: series.ewm(span=12, adjust=False).mean())
  output["ema_26"] = grouped["close"].transform(lambda series: series.ewm(span=26, adjust=False).mean())
  output["macd"] = output["ema_12"] - output["ema_26"]
  output["macd_signal"] = grouped["macd"].transform(lambda series: series.ewm(span=9, adjust=False).mean())
  output["macd_hist"] = output["macd"] - output["macd_signal"]
  output["volatility_20"] = grouped["daily_return"].transform(lambda series: series.rolling(20, min_periods=5).std())
  output["momentum_20"] = grouped["close"].pct_change(20)
  output["relative_volume"] = output["volume"] / grouped["volume"].transform(lambda series: series.rolling(20, min_periods=5).mean())
  delta = grouped["close"].diff()
  gain = delta.clip(lower=0).groupby(output["symbol"]).transform(lambda series: series.rolling(14, min_periods=5).mean())
  loss = (-delta.clip(upper=0)).groupby(output["symbol"]).transform(lambda series: series.rolling(14, min_periods=5).mean())
  rs = gain / loss.replace(0, pd.NA)
  output["rsi_14"] = 100 - (100 / (1 + rs))
  middle = grouped["close"].transform(lambda series: series.rolling(20, min_periods=5).mean())
  std = grouped["close"].transform(lambda series: series.rolling(20, min_periods=5).std())
  output["bb_middle"] = middle
  output["bb_upper"] = middle + (std * 2)
  output["bb_lower"] = middle - (std * 2)
  return output
