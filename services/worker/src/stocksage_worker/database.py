from contextlib import contextmanager
from typing import Iterable

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from stocksage_worker.settings import get_settings


def get_engine() -> Engine:
    return create_engine(get_settings().database_url, pool_pre_ping=True)


@contextmanager
def begin():
    engine = get_engine()
    with engine.begin() as connection:
        yield connection


def load_tickers() -> list[dict]:
    with begin() as connection:
        rows = connection.execute(
            text("select symbol, yahoo_symbol from public.tickers where active = true order by symbol")
        ).mappings()
        return [dict(row) for row in rows]


def create_ingestion_run(provider: str, job_name: str) -> str:
    with begin() as connection:
        run_id = connection.execute(
            text(
                """
                insert into public.ingestion_runs(provider, job_name, status)
                values (:provider, :job_name, 'running')
                returning id
                """
            ),
            {"provider": provider, "job_name": job_name},
        ).scalar_one()
        return str(run_id)


def finish_ingestion_run(run_id: str, status: str, rows_processed: int, error_message: str | None = None) -> None:
    with begin() as connection:
        connection.execute(
            text(
                """
                update public.ingestion_runs
                set status = :status,
                    rows_processed = :rows_processed,
                    error_message = :error_message,
                    finished_at = now()
                where id = :run_id
                """
            ),
            {
                "run_id": run_id,
                "status": status,
                "rows_processed": rows_processed,
                "error_message": error_message,
            },
        )


def upsert_raw_prices(frame: pd.DataFrame, provider: str, run_id: str) -> int:
    if frame.empty:
        return 0

    rows = frame.assign(provider=provider, run_id=run_id).to_dict("records")
    statement = text(
        """
        insert into public.raw_prices (
          run_id, provider, symbol, source_symbol, price_date, open, high, low,
          close, adjusted_close, volume, payload
        )
        values (
          :run_id, :provider, :symbol, :source_symbol, :price_date, :open, :high, :low,
          :close, :adjusted_close, :volume, cast(:payload as jsonb)
        )
        on conflict (provider, symbol, price_date) do update set
          open = excluded.open,
          high = excluded.high,
          low = excluded.low,
          close = excluded.close,
          adjusted_close = excluded.adjusted_close,
          volume = excluded.volume,
          payload = excluded.payload,
          loaded_at = now()
        """
    )
    with begin() as connection:
        connection.execute(statement, rows)
    return len(rows)


def upsert_predictions(rows: Iterable[dict]) -> int:
    rows = list(rows)
    if not rows:
        return 0

    statement = text(
        """
        insert into public.predictions_daily (
          symbol, as_of_date, label, confidence, model_version, explanation
        )
        values (
          :symbol, :as_of_date, :label, :confidence, :model_version, cast(:explanation as jsonb)
        )
        on conflict (symbol, as_of_date, model_version) do update set
          label = excluded.label,
          confidence = excluded.confidence,
          explanation = excluded.explanation,
          generated_at = now()
        """
    )
    with begin() as connection:
        connection.execute(statement, rows)
    return len(rows)

