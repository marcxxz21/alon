import pandas as pd

from stocksage_worker.features import build_features
from stocksage_worker.indicators import add_indicators
from stocksage_worker.models.baseline import predict_latest, train_baseline
from stocksage_worker.providers import TickerConfig
from stocksage_worker.providers.mock_provider import MockProvider


def test_indicator_feature_model_smoke():
    provider = MockProvider()
    prices = provider.fetch_daily_prices(TickerConfig(symbol="ALI", source_symbol="ALI.PS"))
    indicators = add_indicators(prices)
    features = build_features(indicators).dropna()

    model = train_baseline(features)
    predictions = predict_latest(features, model)

    assert predictions
    assert predictions[0].symbol == "ALI"
    assert predictions[0].label in {"bullish", "bearish", "neutral"}
    assert 0 <= predictions[0].confidence <= 1

