# Data Dictionary

## `tickers`

Tracked Philippine stock metadata. `yahoo_symbol` stores the `.PS` source symbol for the demo provider.

## `ingestion_runs`

Operational log for every worker job. Use it for monitoring freshness, errors, and rows processed.

## `raw_provider_prices`

Provider-normalized yfinance OHLCV data. It preserves source payload context and deduplicates by ticker, provider, and trade date.

## `core_daily_prices`

Cleaned daily prices used as the market source of truth for dashboards and portfolio recomputation.

## `market_indicators_daily`

Technical indicators including RSI, MACD, moving averages, Bollinger Bands, volatility, momentum, and relative volume.

## `mart_ticker_daily`

Analytics-ready ticker table with OHLCV, returns, moving averages, volatility, momentum, relative volume, and drawdown fields.

## `mart_sector_daily`

Daily sector aggregates used by dashboards and leaderboards.

## `prediction_features_daily`

Model-ready features and training targets for the baseline classifier.

## `pipeline_runs`

Operational log for Airflow and worker runs with status, timing, row counts, and errors.

## `portfolio_holdings`

User-owned holdings with shares, average buy price, and notes. These rows are tied to Supabase Auth user ids and are protected by RLS.

## `holding_transactions`

Transaction-level buy/sell rows for future cost-basis expansion.

## `portfolio_daily_snapshots`

Daily account-level portfolio value, invested amount, unrealized gain/loss, and return percentage after the refresh pipeline.

## `predictions_daily`

Stored model outputs with label, confidence, explanation, model version, and generation timestamps.

## `watchlists` / `watchlist_items`

User-owned lists protected by Supabase Auth and Row Level Security.

## `alert_rules`

User-owned alert definitions for price, signal, and volume conditions. Delivery can be implemented in v2.
