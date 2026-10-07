"""StockLens System: UC.1.3 retrieval coordination and UC.1.5 fixed ranking."""
from walking_skeleton import market_data_provider
from walking_skeleton import news_provider
from walking_skeleton import ai_explanation_module
def query_external_data_feeds(query: dict) -> dict:
    market = market_data_provider.return_market_data(query)
    news = news_provider.return_news_evidence(query)
    return {**market, "sources": news}

def calculate_and_normalize_ranking_scores(evidence: dict) -> dict:
    return {"fixture": True, "stock_pair": evidence["stock_pair"],
            "analysis_date": evidence["analysis_date"],
            "observation_date": evidence["observation_date"],
            "scores": [{"symbol": "DEMO_A", "score": 60.0, "driver": "Fixed demonstration factor"},
                       {"symbol": "DEMO_B", "score": 40.0, "driver": "Fixed demonstration factor"}],
            "sources": evidence["sources"]}

def evaluate_comparison(query: dict) -> dict:
    evidence = query_external_data_feeds(query)
    ranking = calculate_and_normalize_ranking_scores(evidence)
    explanation = ai_explanation_module.coordinate_explanation(ranking)
    return {"requested_query": query, "ranking": ranking, "explanation": explanation}
