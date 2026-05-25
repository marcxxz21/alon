import numpy as np
import pandas as pd


def add_indicators(prices: pd.DataFrame) -> pd.DataFrame:
    frame = prices.sort_values(["symbol", "price_date"]).copy()
    grouped = frame.groupby("symbol", group_keys=False)

    frame["daily_return"] = grouped["close"].pct_change()
    frame["sma20"] = grouped["close"].rolling(20).mean().reset_index(level=0, drop=True)
    frame["sma50"] = grouped["close"].rolling(50).mean().reset_index(level=0, drop=True)
    frame["momentum20"] = grouped["close"].pct_change(20)
    frame["volatility20"] = grouped["daily_return"].rolling(20).std().reset_index(level=0, drop=True)
    frame["relative_volume20"] = frame["volume"] / grouped["volume"].rolling(20).mean().reset_index(level=0, drop=True)
    frame["max_drawdown90"] = frame["close"] / grouped["close"].rolling(90).max().reset_index(level=0, drop=True) - 1

    delta = grouped["close"].diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.groupby(frame["symbol"]).rolling(14).mean().reset_index(level=0, drop=True)
    avg_loss = loss.groupby(frame["symbol"]).rolling(14).mean().reset_index(level=0, drop=True)
    rs = avg_gain / avg_loss.replace(0, np.nan)
    frame["rsi14"] = 100 - (100 / (1 + rs))

    ema12 = grouped["close"].ewm(span=12, adjust=False).mean().reset_index(level=0, drop=True)
    ema26 = grouped["close"].ewm(span=26, adjust=False).mean().reset_index(level=0, drop=True)
    frame["macd"] = ema12 - ema26
    frame["macd_signal"] = frame.groupby("symbol")["macd"].ewm(span=9, adjust=False).mean().reset_index(level=0, drop=True)

    return frame

