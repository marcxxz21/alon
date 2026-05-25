from stocksage_worker.settings import get_settings

from .base import MarketDataProvider, TickerConfig
from .mock_provider import MockProvider
from .yfinance_provider import YFinanceProvider


def get_provider() -> MarketDataProvider:
    provider = get_settings().data_provider.lower()
    if provider == "mock":
        return MockProvider()
    if provider == "yfinance":
        return YFinanceProvider()
    raise ValueError(f"Unsupported data provider: {provider}")


__all__ = ["MarketDataProvider", "TickerConfig", "get_provider"]

