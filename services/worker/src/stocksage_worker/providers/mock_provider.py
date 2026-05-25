import math
from datetime import date, timedelta

import pandas as pd

from .base import MarketDataProvider, TickerConfig, normalize_price_frame


class MockProvider(MarketDataProvider):
    name = "mock"

    def fetch_daily_prices(self, ticker: TickerConfig, period: str = "2y", interval: str = "1d"):
        seed = sum(ord(char) for char in ticker.symbol)
        today = date.today()
        rows = []
        for index in range(120):
            day = today - timedelta(days=119 - index)
            close = 30 + (seed % 40) + math.sin(index / 6) * 2 + index * 0.025
            rows.append(
                {
                    "Date": day,
                    "Open": close - 0.4,
                    "High": close + 1.0,
                    "Low": close - 1.2,
                    "Close": close,
                    "Adj Close": close,
                    "Volume": 1_000_000 + ((seed * index * 101) % 7_000_000),
                }
            )
        return normalize_price_frame(pd.DataFrame(rows), ticker)

