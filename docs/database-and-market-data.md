# Database And Market Data

## Database location

Alon is designed to use Supabase PostgreSQL. The schema lives in:

- `infra/supabase/migrations/0001_initial_schema.sql`

Until these environment variables are set, the Vercel app intentionally runs in mock mode:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

When Supabase is connected, the dashboard reads from:

- `tickers`
- `mart_ticker_daily`
- `mart_sector_daily`
- `predictions_daily`
- `watchlists`
- `watchlist_items`

## PSEi source

The PSEi Yahoo Finance symbol is `PSEI.PS`. The worker seeds it as:

```sql
('PSEI', 'PSEI.PS', 'PSEi Index', 'Index', ...)
```

The frontend does not run Python `yfinance` directly on Vercel. The intended production flow is:

```txt
yfinance in services/worker
  -> Supabase raw_prices
  -> dbt mart_ticker_daily
  -> Next.js dashboard
```

If the database is not connected or the worker has not run, Alon shows mock market data and labels the warehouse as mock mode.

