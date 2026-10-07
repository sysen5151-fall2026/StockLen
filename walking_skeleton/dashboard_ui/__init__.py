"""Dashboard / UI: request transmission and display payload."""
from walking_skeleton import stocklens_system
def transmit_evaluation_request(stock_a: str, stock_b: str, analysis_date: str) -> dict:
    query = {"stock_pair": [stock_a, stock_b], "analysis_date": analysis_date}
    return stocklens_system.evaluate_comparison(query)


def render_comparison_dashboard(result: dict) -> dict:
    return {"mode": "walking-skeleton-fixed-fixture", **result}
