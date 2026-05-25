create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.company_profiles (
  id uuid primary key default uuid_generate_v4(),
  ticker_symbol text not null references public.tickers(symbol) on delete cascade,
  company_name text not null,
  description text,
  industry text,
  sector text,
  website text,
  market_cap numeric(20, 2),
  currency text,
  source_updated_at timestamptz,
  unique (ticker_symbol)
);

create table if not exists public.portfolio_holdings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker_symbol text not null references public.tickers(symbol),
  shares_owned numeric(20, 6) not null check (shares_owned >= 0),
  average_buy_price numeric(20, 6) not null check (average_buy_price >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, ticker_symbol)
);

create table if not exists public.holding_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker_symbol text not null references public.tickers(symbol),
  transaction_type text not null check (transaction_type in ('buy', 'sell')),
  shares numeric(20, 6) not null check (shares > 0),
  price_per_share numeric(20, 6) not null check (price_per_share >= 0),
  transaction_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_daily_snapshots (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_date date not null,
  total_invested_amount numeric(20, 6) not null default 0,
  total_market_value numeric(20, 6) not null default 0,
  total_gain_loss numeric(20, 6) not null default 0,
  total_return_pct numeric(20, 8) not null default 0,
  generated_at timestamptz not null default now(),
  unique (user_id, snapshot_date)
);

create table if not exists public.ticker_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker_symbol text not null references public.tickers(symbol),
  note_body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.market_freshness (
  id text primary key default 'daily',
  latest_trade_date date,
  latest_successful_run_at timestamptz,
  last_pipeline_status text,
  stale_after timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_holdings_user_idx on public.portfolio_holdings(user_id);
create index if not exists holding_transactions_user_idx on public.holding_transactions(user_id);
create index if not exists portfolio_daily_snapshots_user_idx on public.portfolio_daily_snapshots(user_id);
create index if not exists ticker_notes_user_idx on public.ticker_notes(user_id);

alter table public.profiles enable row level security;
alter table public.company_profiles enable row level security;
alter table public.portfolio_holdings enable row level security;
alter table public.holding_transactions enable row level security;
alter table public.portfolio_daily_snapshots enable row level security;
alter table public.ticker_notes enable row level security;
alter table public.market_freshness enable row level security;

create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "authenticated can read company profiles" on public.company_profiles
  for select to authenticated using (true);

create policy "authenticated can read freshness" on public.market_freshness
  for select to authenticated using (true);

create policy "users manage own holdings" on public.portfolio_holdings
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage own transactions" on public.holding_transactions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users read own snapshots" on public.portfolio_daily_snapshots
  for select using (auth.uid() = user_id);

create policy "users manage own notes" on public.ticker_notes
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into public.market_freshness (id, latest_trade_date, last_pipeline_status)
values ('daily', null, 'not_run')
on conflict (id) do nothing;

