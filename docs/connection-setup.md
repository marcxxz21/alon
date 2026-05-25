# Connection Setup

## Current state

The connected Supabase account returned no existing projects. Alon is ready to connect, but it needs a Supabase project URL, anon key, and service role key before live Auth and per-user watchlists can work.

Check live connection status in the app:

- `/account`
- `/api/system/status`

## Supabase

Create or select a Supabase project, then apply the migrations in `infra/supabase/migrations`.

Required Vercel environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

For local development, put these in `apps/web/.env.local` because Vercel and Next.js use `apps/web` as the app root:

```txt
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://ovhsldrzfqwyoemepbmb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_twMH6pCzxQNdf0up996QoA_KV1ZLtj2
SUPABASE_SERVICE_ROLE_KEY=
```

Restart `npm run dev:web` after changing env files.

What these enable:

- Supabase Auth login and signup.
- User-owned `watchlists` and `watchlist_items`.
- User-owned `portfolio_holdings`, `holding_transactions`, `ticker_notes`, and snapshots.
- RLS so users can only read and write their own account data.

## Airflow

Airflow is deployed separately from Vercel. Deploy `services/airflow` to Railway, Render, or your Airflow host, then expose a protected health endpoint.

Required Vercel environment variable:

- `AIRFLOW_HEALTH_URL` or `AIRFLOW_API_URL`

Alon uses this only for health/status visibility. Scheduled jobs still run inside Airflow, not inside Vercel.

## Watchlist persistence

When Supabase env vars are present and the user is logged in, watchlist API calls include the Supabase access token and write to:

- `watchlists`
- `watchlist_items`

Without a logged-in Supabase session, the app keeps mock/demo behavior so the UI can still be reviewed.
