# Architecture

Alon is a hybrid data engineering app:

1. Supabase Auth links every profile, holding, transaction, note, and watchlist row to `auth.users.id`.
2. Airflow runs the daily yfinance-only market pipeline after Philippine market close.
3. Raw rows land in Supabase PostgreSQL, then dbt builds staging tables, marts, sector summaries, and feature tables.
4. The worker library publishes baseline explainable predictions.
5. Airflow runs the portfolio refresh pipeline to recompute each user portfolio from the latest daily close.
6. Next.js reads stable API contracts and renders a mobile-first PWA dashboard on Vercel.

```txt
yfinance only
  -> Airflow daily_market_pipeline
  -> Supabase raw_provider_prices / core_daily_prices
  -> dbt alon marts and features
  -> baseline ML predictions_daily
  -> Airflow daily_portfolio_refresh
  -> portfolio_daily_snapshots
  -> Next.js route handlers
  -> Vercel PWA
```

## Deployment shape

- Vercel deploys `apps/web`.
- Supabase hosts Postgres and Auth.
- Railway or Render runs `services/airflow` plus the installed `services/worker_lib` package.

## Data source

V1 uses `yfinance` only. No other market data provider is scaffolded for this version. The extraction code lives in `services/worker_lib/src/alon_worker_lib/yfinance_source.py`, and Philippine symbols use Yahoo `.PS` conventions where available.

## Cross-device persistence

Supabase Auth issues a user id. User-owned rows in `portfolio_holdings`, `holding_transactions`, `ticker_notes`, `watchlists`, and `watchlist_items` store that id and are protected with Row Level Security. When the same person logs in from another device, the app requests `/api/portfolio` and `/api/watchlists` with the Supabase access token, so the same database rows appear immediately.

## Daily portfolio propagation

`daily_market_pipeline` refreshes warehouse prices and predictions. `daily_portfolio_refresh` then joins `portfolio_holdings` to the latest daily close and writes `portfolio_daily_snapshots`. The app reads those refreshed prices rather than fetching live prices in the browser.

## Mobile strategy

The v1 mobile target is an installable PWA. A future Expo app can reuse the same API contract in `packages/contracts`.

## Prediction scope

The baseline model is an explainable classifier for educational signals. It writes `bullish`, `bearish`, or `neutral` labels plus confidence and explanation fields. LSTM/CNN models should be added only after the platform has enough clean historical data.
