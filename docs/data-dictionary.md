# Data Dictionary

## `tickers`

Tracked Philippine stock metadata. `yahoo_symbol` stores the `.PS` source symbol for the demo provider.

## `ingestion_runs`

Operational log for every worker job. Use it for monitoring freshness, errors, and rows processed.

## `raw_prices`

Provider-normalized OHLCV data. It preserves source payload context and deduplicates by provider, symbol, and date.

## `stg_prices`

Cleaned daily prices from dbt. This is the first transformation layer and removes incomplete candles.

## `mart_ticker_daily`

Analytics-ready ticker table with OHLCV, returns, moving averages, volatility, momentum, relative volume, and drawdown fields.

## `mart_sector_daily`

Daily sector aggregates used by dashboards and leaderboards.

## `features_daily`

Model-ready features and training targets for the baseline classifier.

## `predictions_daily`

Stored model outputs with label, confidence, explanation, model version, and generation timestamps.

## `watchlists` / `watchlist_items`

User-owned lists protected by Supabase Auth and Row Level Security.

## `alert_rules`

User-owned alert definitions for price, signal, and volume conditions. Delivery can be implemented in v2.

