from __future__ import annotations

import pandas as pd


def recompute_positions(holdings: pd.DataFrame, latest_prices: pd.DataFrame) -> pd.DataFrame:
  frame = holdings.merge(latest_prices[["symbol", "close"]], on="symbol", how="left")
  frame["invested_amount"] = frame["shares_owned"] * frame["average_buy_price"]
  frame["current_price"] = frame["close"].fillna(frame["average_buy_price"])
  frame["market_value"] = frame["shares_owned"] * frame["current_price"]
  frame["gain_loss"] = frame["market_value"] - frame["invested_amount"]
  frame["return_pct"] = (frame["gain_loss"] / frame["invested_amount"].replace(0, pd.NA)) * 100
  return frame


def portfolio_snapshots(recomputed: pd.DataFrame) -> pd.DataFrame:
  grouped = recomputed.groupby("user_id", as_index=False).agg({
    "invested_amount": "sum",
    "market_value": "sum",
    "gain_loss": "sum"
  })
  grouped["total_return_pct"] = (grouped["gain_loss"] / grouped["invested_amount"].replace(0, pd.NA)) * 100
  return grouped.rename(columns={
    "invested_amount": "total_invested_amount",
    "market_value": "total_market_value",
    "gain_loss": "total_gain_loss"
  })
