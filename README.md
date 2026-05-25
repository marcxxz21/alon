# Alon

Philippine stock analytics platform with a Vercel-hosted Next.js PWA, Supabase PostgreSQL/Auth, dbt transformations, Apache Airflow orchestration, and a yfinance-only Python ETL/ML worker library.

## What is included

- `apps/web` - Next.js App Router PWA deployed to Vercel.
- `services/airflow` - scheduled DAGs for daily market refresh and portfolio recomputation.
- `services/worker_lib` - reusable yfinance extraction, validation, indicators, portfolio, and baseline ML modules.
- `dbt/alon` - staging, mart, and feature models for Supabase/Postgres.
- `infra/supabase` - database migrations, RLS policies, seed-ready schema.
- `packages/contracts` - shared API types and OpenAPI contract.
- `docs` - architecture, data dictionary, and runbook.

## Quick start

```bash
npm install
npm run dev:web
```

The web app runs with mock data until Supabase environment variables are configured.

For the worker:

```bash
cd services/worker_lib
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[test]"
pytest
```

## Environment

Copy `.env.example` to `.env` at the repo root and configure Supabase, database, and worker values. Vercel should use `apps/web` as the project root.

## Deployment

- Vercel project root: `apps/web`
- Airflow/worker runtime: Railway or Render
- Database/Auth: Supabase
- dbt target: Supabase Postgres

See `docs/database-and-market-data.md` for the Supabase database path and the `PSEI.PS` Yahoo Finance ingestion route.

V1 market data uses `yfinance` only, including `.PS` symbols such as `ALI.PS` and `PSEI.PS`. This project is for educational analytics and portfolio use only. It is not financial advice.
