# Database And Market Data

## Database location

Alon is designed to use Supabase PostgreSQL. The schema lives in:

- `infra/supabase/migrations`

Until these environment variables are set, the Vercel app intentionally runs in mock mode:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

When Supabase is connected, the dashboard reads from:

- `tickers`
- `mart_ticker_daily`
- `mart_sector_daily`
- `predictions_daily`
- `portfolio_holdings`
- `portfolio_daily_snapshots`
- `watchlists`
- `watchlist_items`

## PSEi source

The PSEi Yahoo Finance symbol is `PSEI.PS`. The worker seeds it as:

```sql
('PSEI', 'PSEI.PS', 'PSEi Index', 'Index', ...)
```

The frontend does not run Python `yfinance` directly on Vercel. The intended production flow is:

```txt
yfinance in services/worker_lib
  -> Airflow daily_market_pipeline
  -> Supabase raw_provider_prices / core_daily_prices
  -> dbt/alon mart_ticker_daily
  -> Airflow daily_portfolio_refresh
  -> Supabase portfolio_daily_snapshots
  -> Next.js dashboard
```

V1 uses `yfinance` only. If the database is not connected or the worker has not run, Alon shows mock market data and labels the warehouse as mock mode.
