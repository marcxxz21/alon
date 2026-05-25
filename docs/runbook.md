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

Apply `infra/supabase/migrations/0001_initial_schema.sql`, then configure the Vercel environment variables.

## Worker setup

```bash
cd services/worker
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

Run with mock data:

```bash
DATA_PROVIDER=mock stocksage-ingest
```

Run with yfinance:

```bash
DATA_PROVIDER=yfinance stocksage-ingest
```

## dbt

```bash
cd dbt/stocksage
dbt deps
dbt parse --profiles-dir .
dbt run --profiles-dir .
dbt test --profiles-dir .
```

Set `DBT_HOST`, `DBT_USER`, `DBT_PASSWORD`, `DBT_PORT`, and `DBT_DBNAME` for Supabase Postgres.

## Railway or Render worker schedule

Suggested daily command after the Philippine market close:

```bash
stocksage-ingest && dbt run --project-dir dbt/stocksage --profiles-dir dbt/stocksage && stocksage-predict
```

Configure these environment variables:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATA_PROVIDER`
- `MODEL_REGISTRY_PATH`
- `CRON_SECRET`

## Freshness checks

Check `ingestion_runs` for the latest successful run. If the dashboard stale date does not match the latest market day, inspect worker logs first, then verify provider availability.

## Production notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Do not expose worker trigger endpoints without bearer-token protection.
- Treat `yfinance` as a fallback/demo provider, not a compliance-grade market feed.

