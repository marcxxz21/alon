import pandas as pd


def build_features(indicator_frame: pd.DataFrame) -> pd.DataFrame:
    frame = indicator_frame.sort_values(["symbol", "price_date"]).copy()
    grouped = frame.groupby("symbol", group_keys=False)

    frame["return_1d"] = grouped["close"].pct_change(1)
    frame["return_5d"] = grouped["close"].pct_change(5)
    frame["return_20d"] = grouped["close"].pct_change(20)
    frame["target_next_return"] = grouped["close"].shift(-1) / frame["close"] - 1
    frame["target_label"] = "neutral"
    frame.loc[frame["target_next_return"] > 0.01, "target_label"] = "bullish"
    frame.loc[frame["target_next_return"] < -0.01, "target_label"] = "bearish"

    columns = [
        "symbol",
        "price_date",
        "return_1d",
        "return_5d",
        "return_20d",
        "rsi14",
        "macd",
        "volatility20",
        "relative_volume20",
        "target_next_return",
        "target_label",
    ]
    return frame[columns].rename(columns={"price_date": "as_of_date"})

