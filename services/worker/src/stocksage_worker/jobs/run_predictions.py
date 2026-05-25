import json

import pandas as pd

from stocksage_worker.database import begin, upsert_predictions
from stocksage_worker.models.baseline import predict_latest, train_baseline


def load_features() -> pd.DataFrame:
    with begin() as connection:
        return pd.read_sql("select * from public.features_daily", connection)


def run_predictions() -> int:
    features = load_features()
    model = train_baseline(features)
    prediction_rows = predict_latest(features, model)
    rows = [
        {
            "symbol": row.symbol,
            "as_of_date": row.as_of_date,
            "label": row.label,
            "confidence": row.confidence,
            "model_version": row.model_version,
            "explanation": json.dumps(row.explanation),
        }
        for row in prediction_rows
    ]
    return upsert_predictions(rows)

