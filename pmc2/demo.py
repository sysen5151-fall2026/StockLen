"""Controlled synthetic adapters and F.2 orchestration; never real market data."""
from copy import deepcopy
from datetime import date, timedelta
from uuid import uuid4
from pmc2.acquisition import UNIVERSE, request_dated_records
from pmc2.validation import validate_evidence

SCENARIOS = ('valid', 'missing_unselected_stock', 'missing_observation', 'post_cutoff',
             'missing_source', 'mixed_request', 'no_news', 'bad_news')


def demo_configuration():
    # This is an explicit synthetic observation calendar, not a US exchange calendar.
    dates = [(date(2026, 9, 1) + timedelta(days=i)).isoformat() for i in range(21)]
    return {'configuration_id': 'v0.1-pmc2-synthetic-1', 'universe': list(UNIVERSE),
            'observation_dates': dates, 'news_days': 7, 'max_news_per_stock': 2,
            'providers': {kind: {'provider_id': 'synthetic-' + kind,
                                'conditions_id': 'local-synthetic-v1',
                                'allowed_operations': ['acquire', 'retain', 'display']}
                          for kind in ('market', 'news')}}


def synthetic_responses(queries):
    """IO.07/IO.08: local generated records with explicit fictional sources."""
    mq, nq = queries['market_query'], queries['news_query']
    def identity(q):
        return {k: q[k] for k in ('request_id', 'configuration_id', 'query_id', 'provider_id', 'conditions_id')}
    market = [{**identity(mq), 'symbol': s, 'observation_date': d,
               'adjusted_close': round(80 + i * 9 + j * (i + 1) / 10, 2),
               'currency': 'USD', 'source_id': f'SYNTHETIC-PRICE-{s}-{d}'}
              for i, s in enumerate(mq['symbols']) for j, d in enumerate(mq['observation_dates'])]
    news = [{**identity(nq), 'symbol': s, 'publication_date': nq['end_date'],
             'source_id': f'SYNTHETIC-NEWS-{s}', 'title': f'Fictional {s} synthetic record',
             'permitted': True} for s in nq['symbols']]
    return market, news


def run_demo(scenario='valid', stock_a='AAPL', stock_b='MSFT'):
    if scenario not in SCENARIOS:
        raise ValueError('unknown scenario')
    config = demo_configuration()
    request = {'request_id': str(uuid4()), 'stock_pair': [stock_a, stock_b], 'analysis_date': '2026-09-21'}
    queries = request_dated_records(request, config)
    market, news = synthetic_responses(queries)
    if scenario == 'missing_unselected_stock':
        missing = next(s for s in UNIVERSE if s not in request['stock_pair'])
        market = [r for r in market if r['symbol'] != missing]
    elif scenario == 'missing_observation':
        market.pop()
    elif scenario == 'post_cutoff':
        market[0]['observation_date'] = '2026-09-22'
    elif scenario == 'missing_source':
        market[0]['source_id'] = ''
    elif scenario == 'mixed_request':
        market[0]['request_id'] = 'another-comparison'
    elif scenario == 'no_news':
        news = []
    elif scenario == 'bad_news':
        news[0]['publication_date'] = '2026-09-22'
    result = validate_evidence(queries['context'], market, news, deepcopy(config))
    return {'mode': 'controlled-synthetic-F2', 'scenario': scenario, 'queries': queries,
            'received_market_count': len(market), 'received_news_count': len(news), 'evidence': result}
