# Architecture

Alon is a hybrid data engineering app:

1. The Python worker ingests daily OHLCV data through a provider interface.
2. Raw rows land in Supabase PostgreSQL.
3. dbt builds staging tables, ticker marts, sector marts, and feature tables.
4. The worker trains a baseline classifier and writes explainable predictions.
5. Next.js reads the API contract and renders a PWA dashboard on Vercel.

```txt
yfinance provider
  -> Python worker
  -> Supabase raw_prices
  -> dbt stg/mart/features
  -> baseline ML predictions
  -> Next.js route handlers
  -> Vercel PWA dashboard
```

## Deployment shape

- Vercel deploys `apps/web`.
- Supabase hosts Postgres and Auth.
- Railway or Render runs `services/worker`.
- `services/api` can be deployed only if you need protected HTTP triggers.

## Data source replacement

`yfinance` is intentionally isolated in `services/worker/src/stocksage_worker/providers`. To replace it, add a provider class that returns the normalized price frame defined by `MarketDataProvider`, then update `DATA_PROVIDER`.

## Mobile strategy

The v1 mobile target is an installable PWA. A future Expo app can reuse the same API contract in `packages/contracts`.

## Prediction scope

The baseline model is an explainable classifier for educational signals. It writes `bullish`, `bearish`, or `neutral` labels plus confidence and explanation fields. LSTM/CNN models should be added only after the platform has enough clean historical data.
