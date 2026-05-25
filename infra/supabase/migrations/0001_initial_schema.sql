create extension if not exists "uuid-ossp";

create table if not exists public.tickers (
  symbol text primary key,
  yahoo_symbol text not null unique,
  company_name text not null,
  sector text not null,
  active boolean not null default true,
  source_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ingestion_runs (
  id uuid primary key default uuid_generate_v4(),
  provider text not null,
  job_name text not null,
  status text not null check (status in ('running', 'success', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  rows_processed integer not null default 0,
  error_message text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.raw_prices (
  id bigserial primary key,
  run_id uuid references public.ingestion_runs(id) on delete set null,
  provider text not null,
  symbol text not null references public.tickers(symbol),
  source_symbol text not null,
  price_date date not null,
  open numeric(18, 6),
  high numeric(18, 6),
  low numeric(18, 6),
  close numeric(18, 6),
  adjusted_close numeric(18, 6),
  volume bigint,
  payload jsonb not null default '{}'::jsonb,
  loaded_at timestamptz not null default now(),
  unique (provider, symbol, price_date)
);

create table if not exists public.stg_prices (
  symbol text not null references public.tickers(symbol),
  as_of_date date not null,
  open numeric(18, 6) not null,
  high numeric(18, 6) not null,
  low numeric(18, 6) not null,
  close numeric(18, 6) not null,
  adjusted_close numeric(18, 6),
  volume bigint not null,
  loaded_at timestamptz not null default now(),
  primary key (symbol, as_of_date)
);

create table if not exists public.mart_ticker_daily (
  symbol text not null references public.tickers(symbol),
  as_of_date date not null,
  open numeric(18, 6) not null,
  high numeric(18, 6) not null,
  low numeric(18, 6) not null,
  close numeric(18, 6) not null,
  volume bigint not null,
  daily_return numeric(18, 8),
  rsi14 numeric(18, 6),
  macd numeric(18, 6),
  macd_signal numeric(18, 6),
  sma20 numeric(18, 6),
  sma50 numeric(18, 6),
  volatility20 numeric(18, 8),
  momentum20 numeric(18, 8),
  relative_volume20 numeric(18, 8),
  max_drawdown90 numeric(18, 8),
  updated_at timestamptz not null default now(),
  primary key (symbol, as_of_date)
);

create table if not exists public.mart_sector_daily (
  sector text not null,
  as_of_date date not null,
  ticker_count integer not null,
  avg_daily_return numeric(18, 8),
  avg_momentum20 numeric(18, 8),
  avg_volatility20 numeric(18, 8),
  total_volume bigint,
  updated_at timestamptz not null default now(),
  primary key (sector, as_of_date)
);

create table if not exists public.features_daily (
  symbol text not null references public.tickers(symbol),
  as_of_date date not null,
  return_1d numeric(18, 8),
  return_5d numeric(18, 8),
  return_20d numeric(18, 8),
  rsi14 numeric(18, 6),
  macd numeric(18, 6),
  volatility20 numeric(18, 8),
  relative_volume20 numeric(18, 8),
  target_next_return numeric(18, 8),
  target_label text check (target_label in ('bullish', 'bearish', 'neutral')),
  created_at timestamptz not null default now(),
  primary key (symbol, as_of_date)
);

create table if not exists public.predictions_daily (
  symbol text not null references public.tickers(symbol),
  as_of_date date not null,
  label text not null check (label in ('bullish', 'bearish', 'neutral')),
  confidence numeric(8, 6) not null check (confidence >= 0 and confidence <= 1),
  model_version text not null,
  explanation jsonb not null default '[]'::jsonb,
  feature_timestamp timestamptz not null default now(),
  generated_at timestamptz not null default now(),
  primary key (symbol, as_of_date, model_version)
);

create table if not exists public.watchlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.watchlist_items (
  watchlist_id uuid not null references public.watchlists(id) on delete cascade,
  symbol text not null references public.tickers(symbol),
  note text,
  added_at timestamptz not null default now(),
  primary key (watchlist_id, symbol)
);

create table if not exists public.alert_rules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null references public.tickers(symbol),
  rule_type text not null check (rule_type in ('price_above', 'price_below', 'signal_change', 'volume_spike')),
  threshold numeric(18, 6),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists raw_prices_symbol_date_idx on public.raw_prices(symbol, price_date desc);
create index if not exists mart_ticker_daily_symbol_date_idx on public.mart_ticker_daily(symbol, as_of_date desc);
create index if not exists predictions_daily_symbol_date_idx on public.predictions_daily(symbol, as_of_date desc);
create index if not exists watchlists_user_id_idx on public.watchlists(user_id);
create index if not exists alert_rules_user_id_idx on public.alert_rules(user_id);

alter table public.tickers enable row level security;
alter table public.ingestion_runs enable row level security;
alter table public.raw_prices enable row level security;
alter table public.stg_prices enable row level security;
alter table public.mart_ticker_daily enable row level security;
alter table public.mart_sector_daily enable row level security;
alter table public.features_daily enable row level security;
alter table public.predictions_daily enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.alert_rules enable row level security;

create policy "public can read active tickers" on public.tickers
  for select using (active = true);

create policy "public can read ticker marts" on public.mart_ticker_daily
  for select using (true);

create policy "public can read sector marts" on public.mart_sector_daily
  for select using (true);

create policy "public can read predictions" on public.predictions_daily
  for select using (true);

create policy "users can read own watchlists" on public.watchlists
  for select using (auth.uid() = user_id);

create policy "users can insert own watchlists" on public.watchlists
  for insert with check (auth.uid() = user_id);

create policy "users can update own watchlists" on public.watchlists
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users can delete own watchlists" on public.watchlists
  for delete using (auth.uid() = user_id);

create policy "users can manage own watchlist items" on public.watchlist_items
  for all using (
    exists (
      select 1 from public.watchlists
      where watchlists.id = watchlist_items.watchlist_id
      and watchlists.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.watchlists
      where watchlists.id = watchlist_items.watchlist_id
      and watchlists.user_id = auth.uid()
    )
  );

create policy "users can manage own alerts" on public.alert_rules
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into public.tickers (symbol, yahoo_symbol, company_name, sector, source_metadata)
values
  ('ALI', 'ALI.PS', 'Ayala Land, Inc.', 'Property', '{"seed": true}'),
  ('BDO', 'BDO.PS', 'BDO Unibank, Inc.', 'Financials', '{"seed": true}'),
  ('JFC', 'JFC.PS', 'Jollibee Foods Corporation', 'Consumer', '{"seed": true}'),
  ('SMPH', 'SMPH.PS', 'SM Prime Holdings, Inc.', 'Property', '{"seed": true}'),
  ('TEL', 'TEL.PS', 'PLDT Inc.', 'Telecom', '{"seed": true}')
on conflict (symbol) do update set
  yahoo_symbol = excluded.yahoo_symbol,
  company_name = excluded.company_name,
  sector = excluded.sector,
  active = true,
  updated_at = now();

