# Runbook

## Local web app

```bash
npm install
npm run dev:web
```

Open `http://localhost:3000`.

## Supabase setup

```bash
supabase init
supabase link --project-ref <project-ref>
supabase db push
```

Apply the migrations in `infra/supabase/migrations`, then configure the Vercel environment variables.

## Worker setup

```bash
cd services/worker_lib
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[test]"
```

## Airflow

```bash
cd services/airflow
pip install -r requirements.txt
airflow dags list
```

The v1 DAGs are `daily_market_pipeline` and `daily_portfolio_refresh`. Both are scheduled after Philippine market close and use the yfinance-only worker library.

## dbt

```bash
cd dbt/alon
dbt deps
dbt parse --profiles-dir .
dbt run --profiles-dir .
dbt test --profiles-dir .
```

Set `DBT_HOST`, `DBT_USER`, `DBT_PASSWORD`, `DBT_PORT`, and `DBT_DBNAME` for Supabase Postgres.

## Railway or Render worker schedule

Suggested daily command after the Philippine market close:

```bash
airflow scheduler
```

Configure these environment variables:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATA_PROVIDER=yfinance`
- `MODEL_REGISTRY_PATH`
- `CRON_SECRET`

## Freshness checks

Check `pipeline_runs` and `market_freshness` for the latest successful run. If the dashboard stale date does not match the latest market day, inspect Airflow task logs first, then verify yfinance availability for `.PS` symbols.

## Production notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Do not expose worker trigger endpoints without bearer-token protection.
- V1 uses `yfinance` only. Treat it as educational market data, not a compliance-grade market feed.
