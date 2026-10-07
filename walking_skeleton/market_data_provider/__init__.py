"""X.02 Market Data Provider: UC.1.4.1 fixed classroom response."""
def return_market_data(query: dict) -> dict:
    return {"fixture": True, "stock_pair": ["DEMO_A", "DEMO_B"],
            "analysis_date": "2026-09-18", "observation_date": "2026-09-18",
            "market_bars": [{"symbol": "DEMO_A", "close": 100.0},
                            {"symbol": "DEMO_B", "close": 80.0}]}
