# Supabase Project: Alon

Project name: `alon`

Project ref: `ovhsldrzfqwyoemepbmb`

Project URL:

```txt
https://ovhsldrzfqwyoemepbmb.supabase.co
```

Public publishable key:

```txt
sb_publishable_twMH6pCzxQNdf0up996QoA_KV1ZLtj2
```

Applied migrations:

- `initial_schema`
- `alon_portfolio_schema`
- `alon_market_contract_tables`
- `security_performance_tuning`
- `revoke_public_rls_helper`

Security advisor status: clean after revoking public execution on `public.rls_auto_enable()`.

The service role key is not available through the project metadata tools. Copy it from Supabase Dashboard > Project Settings > API, then set:

```txt
SUPABASE_SERVICE_ROLE_KEY=...
```

Set the same variables in Vercel for Production, Preview, and Development.
