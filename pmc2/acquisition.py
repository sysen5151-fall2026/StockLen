"""F.2.1 / P.2.1 — Request Dated Market and News Records (DR-03).

ICOM: IF.01 request + IO.10 configuration controls → IO.03 market query,
IO.04 news query and LF.02 acquisition context. Mechanism: P.2.1.
Provider responses IO.07/IO.08 are boundary inputs to F.2.2, not LF.02.
"""
from copy import deepcopy
from datetime import date, timedelta

UNIVERSE = ('AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NVDA', 'TSLA', 'JPM', 'JNJ', 'XOM')


def request_dated_records(request: dict, configuration: dict) -> dict:
    """F.2.1: apply frozen IO.10 to accepted IF.01; return queries and LF.02.

    Controlled adapters only. A production adapter must first pass its recorded
    provider contract and service-condition review (CR-11).
    """
    config = deepcopy(configuration)
    pair = request['stock_pair']
    cutoff = date.fromisoformat(request['analysis_date'])
    dates = config['observation_dates']
    if (not request.get('request_id') or len(pair) != 2 or len(set(pair)) != 2
            or not all(s in UNIVERSE for s in pair)):
        raise ValueError('IF.01 must contain an identified eligible distinct pair')
    if (tuple(config['universe']) != UNIVERSE or not config.get('configuration_id')
            or len(dates) != 21 or len(set(dates)) != 21
            or dates != sorted(dates)
            or any(date.fromisoformat(d) > cutoff for d in dates)):
        raise ValueError('IO.10 requires a version and 21 explicit aligned dates for the frozen ten-stock universe')
    if config.get('news_days') != 7 or config.get('max_news_per_stock') != 2:
        raise ValueError('IO.10 differs from the submitted v0.1 news bounds')
    for kind in ('market', 'news'):
        policy = config['providers'][kind]
        if (policy.get('provider_id') != 'synthetic-' + kind
                or policy.get('conditions_id') != 'local-synthetic-v1'
                or policy.get('allowed_operations') != ['acquire', 'retain', 'display']):
            raise ValueError('Only the reviewed local synthetic adapters are enabled')
    context = {**deepcopy(request), 'configuration_id': config['configuration_id']}
    market = {**context, 'query_id': request['request_id'] + ':market',
              'symbols': list(UNIVERSE), 'observation_dates': dates,
              'field': 'adjusted_close', 'currency': 'USD',
              **config['providers']['market']}
    news = {**context, 'query_id': request['request_id'] + ':news',
            'symbols': list(pair), 'start_date': (cutoff - timedelta(days=6)).isoformat(),
            'end_date': cutoff.isoformat(), 'max_per_stock': 2,
            **config['providers']['news']}
    return deepcopy({'market_query': market, 'news_query': news,
                     'context': {**context, 'market_query': market, 'news_query': news,
                                 'configuration': config}})
