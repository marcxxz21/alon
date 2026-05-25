from stocksage_worker.jobs.ingest_prices import run_ingestion
from stocksage_worker.jobs.run_predictions import run_predictions


def ingest() -> None:
    rows = run_ingestion()
    print(f"Ingested or updated {rows} raw price rows.")


def predict() -> None:
    rows = run_predictions()
    print(f"Wrote {rows} prediction rows.")

