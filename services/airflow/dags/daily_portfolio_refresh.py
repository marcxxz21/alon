from __future__ import annotations

from datetime import datetime, timedelta

import pandas as pd
from airflow.decorators import dag, task

from alon_worker_lib.pipeline import run_daily_portfolio_refresh


@dag(
  dag_id="daily_portfolio_refresh",
  description="Recompute all authenticated user portfolio values after prices refresh.",
  schedule="15 19 * * 1-5",
  start_date=datetime(2026, 1, 1),
  catchup=False,
  default_args={"owner": "alon", "retries": 2, "retry_delay": timedelta(minutes=10)},
  tags=["alon", "portfolio", "supabase"]
)
def daily_portfolio_refresh():
  @task(task_id="load_latest_prices_and_holdings")
  def load_latest_prices_and_holdings() -> dict[str, list[dict[str, object]]]:
    holdings = [{"user_id": "demo", "symbol": "ALI", "shares_owned": 120, "average_buy_price": 71.2}]
    prices = [{"symbol": "ALI", "close": 75.13}]
    return {"holdings": holdings, "prices": prices}

  @task(task_id="recompute_user_portfolios")
  def recompute_user_portfolios(payload: dict[str, list[dict[str, object]]]) -> dict[str, object]:
    result = run_daily_portfolio_refresh(
      pd.DataFrame(payload["holdings"]),
      pd.DataFrame(payload["prices"])
    )
    return {
      "pipeline_name": result["pipeline_name"],
      "run_status": result["run_status"],
      "rows_processed": result["rows_processed"],
      "started_at": result["started_at"],
      "finished_at": result["finished_at"]
    }

  recompute_user_portfolios(load_latest_prices_and_holdings())


daily_portfolio_refresh()
