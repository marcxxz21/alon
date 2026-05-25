import json

import pandas as pd

from stocksage_worker.database import create_ingestion_run, finish_ingestion_run, load_tickers, upsert_raw_prices
from stocksage_worker.providers import TickerConfig, get_provider
from stocksage_worker.settings import get_settings


def run_ingestion() -> int:
    settings = get_settings()
    provider = get_provider()
    run_id = create_ingestion_run(provider.name, "daily_prices")
    rows_processed = 0

    try:
        frames = []
        for ticker in load_tickers():
            frame = provider.fetch_daily_prices(
                TickerConfig(symbol=ticker["symbol"], source_symbol=ticker["yahoo_symbol"]),
                period=settings.default_period,
                interval=settings.default_interval,
            )
            frames.append(frame)

        combined = pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()
        if not combined.empty:
            combined["payload"] = combined["payload"].apply(json.dumps)
        rows_processed = upsert_raw_prices(combined, provider.name, run_id)
        finish_ingestion_run(run_id, "success", rows_processed)
        return rows_processed
    except Exception as exc:
        finish_ingestion_run(run_id, "failed", rows_processed, str(exc))
        raise

