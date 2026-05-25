create table if not exists public.pipeline_runs (
  id uuid primary key default uuid_generate_v4(),
  pipeline_name text not null,
  run_status text not null check (run_status in ('running', 'success', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_seconds integer,
  rows_processed integer not null default 0,
  error_message text
);

create table if not exists public.raw_provider_prices (
  id uuid primary key default uuid_generate_v4(),
  ticker_id text not null references public.tickers(symbol),
  provider_name text not null default 'yfinance',
  trade_date date not null,
  open numeric(18, 6),
  high numeric(18, 6),
  low numeric(18, 6),
  close numeric(18, 6),
  adj_close numeric(18, 6),
  volume bigint,
  raw_payload_json jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  unique (ticker_id, provider_name, trade_date)
);

create table if not exists public.core_daily_prices (
  id uuid primary key default uuid_generate_v4(),
  ticker_id text not null references public.tickers(symbol),
  trade_date date not null,
  open numeric(18, 6) not null,
  high numeric(18, 6) not null,
  low numeric(18, 6) not null,
  close numeric(18, 6) not null,
  adj_close numeric(18, 6),
  volume bigint not null,
  is_valid boolean not null default true,
  loaded_at timestamptz not null default now(),
  unique (ticker_id, trade_date)
);

create table if not exists public.market_indicators_daily (
  id uuid primary key default uuid_generate_v4(),
  ticker_id text not null references public.tickers(symbol),
  trade_date date not null,
  sma_20 numeric(18, 6),
  sma_50 numeric(18, 6),
  ema_12 numeric(18, 6),
  ema_26 numeric(18, 6),
  rsi_14 numeric(18, 6),
  macd numeric(18, 6),
  macd_signal numeric(18, 6),
  macd_hist numeric(18, 6),
  bb_upper numeric(18, 6),
  bb_middle numeric(18, 6),
  bb_lower numeric(18, 6),
  volatility_20 numeric(18, 8),
  momentum_20 numeric(18, 8),
  relative_volume numeric(18, 8),
  unique (ticker_id, trade_date)
);

create table if not exists public.prediction_features_daily (
  id uuid primary key default uuid_generate_v4(),
  ticker_id text not null references public.tickers(symbol),
  trade_date date not null,
  feature_json jsonb not null,
  feature_set_version text not null,
  unique (ticker_id, trade_date, feature_set_version)
);

create table if not exists public.model_registry (
  id uuid primary key default uuid_generate_v4(),
  model_version text not null unique,
  model_type text not null,
  trained_at timestamptz not null default now(),
  metrics_json jsonb not null default '{}'::jsonb,
  artifact_uri text,
  is_active boolean not null default false
);

alter table public.pipeline_runs enable row level security;
alter table public.raw_provider_prices enable row level security;
alter table public.core_daily_prices enable row level security;
alter table public.market_indicators_daily enable row level security;
alter table public.prediction_features_daily enable row level security;
alter table public.model_registry enable row level security;

create policy "authenticated can read pipeline runs" on public.pipeline_runs
  for select to authenticated using (true);

create policy "public can read raw provider prices" on public.raw_provider_prices
  for select using (true);

create policy "public can read core prices" on public.core_daily_prices
  for select using (true);

create policy "public can read market indicators" on public.market_indicators_daily
  for select using (true);

create policy "authenticated can read prediction features" on public.prediction_features_daily
  for select to authenticated using (true);

create policy "authenticated can read model registry" on public.model_registry
  for select to authenticated using (true);
