import yfinance as yf

from .base import MarketDataProvider, TickerConfig, normalize_price_frame


class YFinanceProvider(MarketDataProvider):
    name = "yfinance"

    def fetch_daily_prices(
        self,
        ticker: TickerConfig,
        period: str = "2y",
        interval: str = "1d",
    ):
        frame = yf.download(
            ticker.source_symbol,
            period=period,
            interval=interval,
            auto_adjust=False,
            progress=False,
            group_by="column",
        )

        if hasattr(frame.columns, "droplevel") and getattr(frame.columns, "nlevels", 1) > 1:
            frame.columns = frame.columns.droplevel(-1)

        return normalize_price_frame(frame, ticker, provider_payload=False)

