import pandas as pd

from stocksage_worker.providers.base import TickerConfig, normalize_price_frame


def test_normalize_price_frame_deduplicates_and_maps_columns():
    frame = pd.DataFrame(
        [
            {
                "Date": "2026-05-20",
                "Open": 10,
                "High": 12,
                "Low": 9,
                "Close": 11,
                "Adj Close": 11,
                "Volume": 1000,
            },
            {
                "Date": "2026-05-20",
                "Open": 10,
                "High": 12,
                "Low": 9,
                "Close": 11,
                "Adj Close": 11,
                "Volume": 1000,
            },
        ]
    )

    normalized = normalize_price_frame(frame, TickerConfig(symbol="ALI", source_symbol="ALI.PS"))

    assert len(normalized) == 1
    assert normalized.iloc[0]["symbol"] == "ALI"
    assert normalized.iloc[0]["source_symbol"] == "ALI.PS"
    assert normalized.iloc[0]["close"] == 11

