from dataclasses import dataclass
from datetime import date
from typing import Protocol

import pandas as pd


@dataclass(frozen=True)
class TickerConfig:
    symbol: str
    source_symbol: str


class MarketDataProvider(Protocol):
    name: str

    def fetch_daily_prices(
        self,
        ticker: TickerConfig,
        period: str = "2y",
        interval: str = "1d",
    ) -> pd.DataFrame:
        """Return normalized OHLCV rows for one ticker."""


REQUIRED_COLUMNS = [
    "symbol",
    "source_symbol",
    "price_date",
    "open",
    "high",
    "low",
    "close",
    "adjusted_close",
    "volume",
]


def normalize_price_frame(
    frame: pd.DataFrame,
    ticker: TickerConfig,
    provider_payload: bool = False,
) -> pd.DataFrame:
    if frame.empty:
        return pd.DataFrame(columns=REQUIRED_COLUMNS + ["payload"])

    normalized = frame.reset_index().rename(
        columns={
            "Date": "price_date",
            "Datetime": "price_date",
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Adj Close": "adjusted_close",
            "Volume": "volume",
        }
    )

    if "price_date" not in normalized.columns:
        normalized = normalized.rename(columns={normalized.columns[0]: "price_date"})

    normalized["price_date"] = pd.to_datetime(normalized["price_date"]).dt.date
    normalized["symbol"] = ticker.symbol
    normalized["source_symbol"] = ticker.source_symbol

    if "adjusted_close" not in normalized.columns:
        normalized["adjusted_close"] = normalized["close"]

    normalized["payload"] = (
        normalized.apply(lambda row: row.to_dict(), axis=1) if provider_payload else [{} for _ in range(len(normalized))]
    )

    for column in ["open", "high", "low", "close", "adjusted_close"]:
        normalized[column] = pd.to_numeric(normalized[column], errors="coerce")

    normalized["volume"] = pd.to_numeric(normalized["volume"], errors="coerce").fillna(0).astype("int64")
    normalized = normalized.dropna(subset=["open", "high", "low", "close"])
    normalized = normalized[normalized["price_date"] <= date.today()]

    return normalized[REQUIRED_COLUMNS + ["payload"]].drop_duplicates(["symbol", "price_date"])

