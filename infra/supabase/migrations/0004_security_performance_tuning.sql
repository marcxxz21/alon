create policy "authenticated can read ingestion runs" on public.ingestion_runs
  for select to authenticated using (true);

create policy "public can read raw prices" on public.raw_prices
  for select using (true);

create policy "public can read staging prices" on public.stg_prices
  for select using (true);

create policy "authenticated can read features" on public.features_daily
  for select to authenticated using (true);

create index if not exists alert_rules_symbol_idx on public.alert_rules(symbol);
create index if not exists holding_transactions_symbol_idx on public.holding_transactions(ticker_symbol);
create index if not exists portfolio_holdings_symbol_idx on public.portfolio_holdings(ticker_symbol);
create index if not exists raw_prices_run_id_idx on public.raw_prices(run_id);
create index if not exists ticker_notes_symbol_idx on public.ticker_notes(ticker_symbol);
create index if not exists watchlist_items_symbol_idx on public.watchlist_items(symbol);

drop policy if exists "users can read own watchlists" on public.watchlists;
drop policy if exists "users can insert own watchlists" on public.watchlists;
drop policy if exists "users can update own watchlists" on public.watchlists;
drop policy if exists "users can delete own watchlists" on public.watchlists;
drop policy if exists "users can manage own watchlist items" on public.watchlist_items;
drop policy if exists "users can manage own alerts" on public.alert_rules;
drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "users manage own holdings" on public.portfolio_holdings;
drop policy if exists "users manage own transactions" on public.holding_transactions;
drop policy if exists "users read own snapshots" on public.portfolio_daily_snapshots;
drop policy if exists "users manage own notes" on public.ticker_notes;

create policy "users can read own watchlists" on public.watchlists
  for select using ((select auth.uid()) = user_id);

create policy "users can insert own watchlists" on public.watchlists
  for insert with check ((select auth.uid()) = user_id);

create policy "users can update own watchlists" on public.watchlists
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users can delete own watchlists" on public.watchlists
  for delete using ((select auth.uid()) = user_id);

create policy "users can manage own watchlist items" on public.watchlist_items
  for all using (
    exists (
      select 1 from public.watchlists
      where watchlists.id = watchlist_items.watchlist_id
      and watchlists.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.watchlists
      where watchlists.id = watchlist_items.watchlist_id
      and watchlists.user_id = (select auth.uid())
    )
  );

create policy "users can manage own alerts" on public.alert_rules
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users read own profile" on public.profiles
  for select using ((select auth.uid()) = id);

create policy "users insert own profile" on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "users update own profile" on public.profiles
  for update using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "users manage own holdings" on public.portfolio_holdings
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users manage own transactions" on public.holding_transactions
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users read own snapshots" on public.portfolio_daily_snapshots
  for select using ((select auth.uid()) = user_id);

create policy "users manage own notes" on public.ticker_notes
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke execute on function public.rls_auto_enable() from anon, authenticated;
