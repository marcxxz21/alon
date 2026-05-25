from __future__ import annotations

from datetime import datetime, timedelta

from airflow.decorators import dag, task

from alon_worker_lib.pipeline import run_daily_market_pipeline


@dag(
  dag_id="daily_market_pipeline",
  description="Fetch PH market data from yfinance only, compute indicators, features, and baseline predictions.",
  schedule="30 18 * * 1-5",
  start_date=datetime(2026, 1, 1),
  catchup=False,
  default_args={"owner": "alon", "retries": 2, "retry_delay": timedelta(minutes=10)},
  tags=["alon", "market", "yfinance"]
)
def daily_market_pipeline():
  @task(task_id="extract_transform_predict")
  def extract_transform_predict() -> dict[str, object]:
    result = run_daily_market_pipeline()
    return {
      "pipeline_name": result["pipeline_name"],
      "run_status": result["run_status"],
      "rows_processed": result["rows_processed"],
      "started_at": result["started_at"],
      "finished_at": result["finished_at"]
    }

  @task(task_id="log_run_results")
  def log_run_results(result: dict[str, object]) -> dict[str, object]:
    return result

  log_run_results(extract_transform_predict())


daily_market_pipeline()
