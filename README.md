# Alon

Alon is a Philippine stock analytics platform for tracking market movement, watchlists, portfolio positions, and explainable prediction signals. It is built as a mobile-first command deck: the frontend can run immediately with mock data, then switch to live Supabase-backed data once the database and worker environment are configured.

This project is for educational analytics and portfolio monitoring only. It is not financial advice.

## What It Is For

Alon helps a user watch Philippine market data in one place:

- Follow PSE tickers and the PSEi index through Yahoo Finance `.PS` symbols such as `ALI.PS` and `PSEI.PS`.
- Review market leaderboards, sector movement, technical indicators, and baseline bullish/bearish/neutral signals.
- Maintain authenticated watchlists, portfolio holdings, transactions, and ticker notes across devices.
- Refresh market, prediction, and portfolio snapshots through scheduled backend jobs instead of doing heavy data work in the browser.
- Keep a clear separation between the app experience, the database contract, and the market-data pipeline.

## How It Is Made

Alon is a small full-stack data platform:

```txt
yfinance
  -> Python worker library
  -> Airflow daily market DAG
  -> Supabase PostgreSQL raw/core tables
  -> dbt staging, marts, and feature models
  -> baseline ML predictions
  -> Airflow portfolio refresh DAG
  -> Next.js API routes
  -> Vercel-hosted PWA
```

The web app is made with Next.js App Router and TypeScript. It renders a PWA dashboard on Vercel, reads through route handlers, and falls back to mock data when Supabase environment variables are missing.

Supabase provides PostgreSQL, Auth, Row Level Security, and user-owned records. Authenticated rows such as holdings, transactions, notes, watchlists, and watchlist items are tied to `auth.users.id` so the same user can move between devices.

The backend data path is Python-first. The worker library extracts yfinance OHLCV data, validates and normalizes prices, computes indicators, generates baseline model signals, and recomputes portfolio snapshots. Airflow schedules the daily refresh jobs after market close. dbt shapes the raw data into stable analytics tables for the app.

## Repository Layout

- `apps/web` - Next.js App Router PWA and API route handlers.
- `services/worker_lib` - reusable yfinance extraction, validation, indicators, portfolio, and baseline ML modules.
- `services/airflow` - DAGs for daily market refresh and portfolio recomputation.
- `dbt/alon` - staging, mart, sector, and feature models for Supabase/Postgres.
- `infra/supabase` - database migrations, RLS policies, and seed-ready schema.
- `packages/contracts` - shared API types and OpenAPI contract.
- `docs` - architecture notes, data dictionary, setup guide, and runbook.

## Quick Start

Install the JavaScript workspaces and run the web app:

```bash
npm install
npm run dev:web
```

The app runs in mock mode until Supabase is configured.

Run the worker library tests:

```bash
cd services/worker_lib
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[test]"
pytest
```

## Environment

Copy `.env.example` to `.env` at the repo root and configure the Supabase, database, and worker values.

Important values include:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DATA_PROVIDER=yfinance`
- `AIRFLOW_API_URL`
- `AIRFLOW_HEALTH_URL`

## Deployment

- Frontend: Vercel, with `apps/web` as the project root.
- Database/Auth: Supabase.
- Worker and scheduler: Railway, Render, or another Python runtime that can run Airflow and install `services/worker_lib`.
- dbt target: Supabase Postgres.

See `docs/architecture.md` for the system shape, `docs/database-and-market-data.md` for the Supabase and yfinance path, and `docs/connection-setup.md` for environment variables and status-check URLs.
