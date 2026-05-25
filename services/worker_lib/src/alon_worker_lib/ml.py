from __future__ import annotations

import pandas as pd

LABELS = ("bullish", "bearish", "neutral")
MODEL_VERSION = "baseline-rules-2026-05"


def build_features(indicators: pd.DataFrame) -> pd.DataFrame:
  columns = ["symbol", "trade_date", "daily_return", "rsi_14", "macd", "volatility_20", "momentum_20", "relative_volume"]
  features = indicators[columns].copy()
  features["feature_set_version"] = "technical-v1"
  return features


def predict_next_session(features: pd.DataFrame) -> pd.DataFrame:
  latest = features.sort_values(["symbol", "trade_date"]).groupby("symbol").tail(1).copy()

  def label(row: pd.Series) -> str:
    momentum = row.get("momentum_20") or 0
    rsi = row.get("rsi_14") or 50
    if momentum > 0.04 and rsi < 72:
      return "bullish"
    if momentum < -0.04 or rsi > 78:
      return "bearish"
    return "neutral"

  latest["label"] = latest.apply(label, axis=1)
  latest["confidence"] = (0.54 + latest["momentum_20"].fillna(0).abs().clip(0, 0.18)).clip(0.51, 0.86)
  latest["model_version"] = MODEL_VERSION
  latest["explanation"] = latest.apply(
    lambda row: [
      f"Momentum 20D: {float(row.get('momentum_20') or 0):.4f}",
      f"RSI 14: {float(row.get('rsi_14') or 0):.2f}",
      "Baseline rules emulate the scikit-learn classifier contract until enough clean history is collected."
    ],
    axis=1
  )
  return latest[["symbol", "trade_date", "label", "confidence", "model_version", "explanation"]]
