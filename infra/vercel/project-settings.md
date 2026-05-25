# Vercel Project Settings

Create a Vercel project from this repository with these settings:

- Framework preset: Next.js
- Root directory: `apps/web`
- Install command: `cd ../.. && npm install`
- Build command: `cd ../.. && npm run build:web`
- Output directory: `.next`

Required environment variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The app runs with mock data when Supabase variables are absent, which keeps preview builds useful before the database is connected.

Use Git integration for preview deployments. Production should deploy only from `main`.

