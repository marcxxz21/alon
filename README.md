# Alon

Philippine stock analytics data platform with a Vercel-hosted Next.js PWA, Supabase PostgreSQL/Auth, dbt transformations, a Python ETL and ML worker, and an optional FastAPI service.

## What is included

- `apps/web` - Next.js App Router PWA deployed to Vercel.
- `services/worker` - Python ingestion, feature engineering, and baseline prediction jobs.
- `services/api` - FastAPI service for worker/admin health and trigger endpoints.
- `dbt/stocksage` - staging, mart, and feature models for Supabase/Postgres.
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
cd services/worker
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
pytest
```

## Environment

Copy `.env.example` to `.env` at the repo root and configure Supabase, database, and worker values. Vercel should use `apps/web` as the project root.

## Deployment

- Vercel project root: `apps/web`
- Worker: Railway or Render
- Database/Auth: Supabase
- dbt target: Supabase Postgres

See `docs/database-and-market-data.md` for the Supabase database path and the `PSEI.PS` Yahoo Finance ingestion route.

This project is for educational analytics and portfolio use only. It is not financial advice.
