import pandas as pd

from alon_worker_lib.indicators import add_indicators
from alon_worker_lib.portfolio import recompute_positions
from alon_worker_lib.validation import validate_ohlcv
from alon_worker_lib.yfinance_source import normalize_symbol


def test_normalize_symbol_removes_ph_suffix():
  assert normalize_symbol("ali.ps") == "ALI"


def test_validate_ohlcv_marks_invalid_rows():
  frame = pd.DataFrame([{
    "symbol": "ALI",
    "trade_date": "2026-05-25",
    "open": 10,
    "high": 9,
    "low": 11,
    "close": 10,
    "volume": 100
  }])
  result = validate_ohlcv(frame)
  assert result["is_valid"].iloc[0] is False


def test_indicator_generation_smoke():
  frame = pd.DataFrame({
    "symbol": ["ALI"] * 30,
    "trade_date": pd.date_range("2026-04-01", periods=30),
    "open": range(30),
    "high": range(1, 31),
    "low": range(30),
    "close": range(1, 31),
    "volume": [1000] * 30
  })
  result = add_indicators(frame)
  assert "rsi_14" in result.columns
  assert "momentum_20" in result.columns


def test_portfolio_recomputation():
  holdings = pd.DataFrame([{
    "user_id": "user-1",
    "symbol": "ALI",
    "shares_owned": 10,
    "average_buy_price": 8
  }])
  prices = pd.DataFrame([{"symbol": "ALI", "close": 10}])
  result = recompute_positions(holdings, prices)
  assert result["market_value"].iloc[0] == 100
  assert result["gain_loss"].iloc[0] == 20
