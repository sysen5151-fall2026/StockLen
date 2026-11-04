"""F.2.2 / P.2.2 — Validate Evidence Dates and Provenance (DR-04).

ICOM: IO.07 market records + IO.08 news records + LF.02 context;
control IO.10 configuration; output IF.02 validation envelope; mechanism P.2.2.
Invalid core means no score-ready records. Unsupported news is excluded and
valid core remains usable with an explicit limitation. No AI dependency exists.
"""
from copy import deepcopy
from datetime import date
from math import isfinite
from pmc2.acquisition import request_dated_records


def validate_evidence(context: dict, market_records: list, news_records: list,
                      configuration: dict) -> dict:
    """F.2.2: preserve request/config and distinct dates in IF.02 (CR-10/17)."""
    result = {k: deepcopy(context[k]) for k in ('request_id', 'stock_pair', 'analysis_date', 'configuration_id')}
    result.update(score_ready=False, status='failed', reason=None,
                  market_records=[], news_records=[], rejected_news=[], limitations=[])

    def fail(reason):
        result['reason'] = reason
        return result

    if configuration != context['configuration']:
        return fail('configuration_mismatch')
    request = {k: context[k] for k in ('request_id', 'stock_pair', 'analysis_date')}
    try:
        rebuilt = request_dated_records(request, configuration)['context']
    except (ValueError, KeyError, TypeError):
        return fail('invalid_acquisition_context')
    if context != rebuilt:
        return fail('invalid_acquisition_context')
    expected = {(s, d) for s in configuration['universe'] for d in configuration['observation_dates']}
    seen = set()
    market_query, news_query = context['market_query'], context['news_query']

    def associated(item, query):
        return all(item.get(k) == query[k] for k in
                   ('request_id', 'configuration_id', 'query_id', 'provider_id', 'conditions_id'))

    for record in market_records:
        if not associated(record, market_query):
            return fail('market_association_mismatch')
        key = (record.get('symbol'), record.get('observation_date'))
        if key not in expected or key in seen:
            return fail('market_date_symbol_or_duplicate')
        price = record.get('adjusted_close')
        if (isinstance(price, bool) or not isinstance(price, (float, int))
                or not isfinite(price) or price <= 0 or record.get('currency') != 'USD'
                or not isinstance(record.get('source_id'), str) or not record['source_id'].strip()):
            return fail('invalid_price_units_or_source')
        seen.add(key)
    if seen != expected:
        return fail('incomplete_frozen_universe_window')
    accepted, rejected, ids, counts = [], [], set(), {}
    # Strict date-only normalized adapter contract; real publication timestamps
    # must be normalized under the reviewed provider timezone/cutoff contract.
    for item in sorted(news_records, key=lambda n: (str(n.get('publication_date', '')), str(n.get('source_id', ''))), reverse=True):
        try:
            published = date.fromisoformat(item.get('publication_date', ''))
            valid_date = date.fromisoformat(news_query['start_date']) <= published <= date.fromisoformat(news_query['end_date'])
        except (ValueError, TypeError):
            valid_date = False
        symbol = item.get('symbol')
        source = item.get('source_id')
        valid = (associated(item, news_query) and symbol in news_query['symbols'] and valid_date
                 and isinstance(source, str) and bool(source.strip())
                 and isinstance(item.get('title'), str) and bool(item['title'].strip())
                 and item.get('permitted') is True and source not in ids)
        if not valid:
            rejected.append({'source_id': source, 'reason': 'unsupported_or_mismatched_news'})
        elif counts.get(symbol, 0) >= news_query['max_per_stock']:
            rejected.append({'source_id': source, 'reason': 'news_limit'})
        else:
            accepted.append(deepcopy(item))
            ids.add(source)
            counts[symbol] = counts.get(symbol, 0) + 1
    limitations = []
    if any(counts.get(s, 0) == 0 for s in context['stock_pair']):
        limitations.append('qualifying_news_unavailable_for_one_or_both_stocks')
    result.update(score_ready=True, status='accepted_with_limitations' if limitations else 'accepted',
                  market_records=deepcopy(market_records), news_records=accepted,
                  rejected_news=rejected, limitations=limitations)
    return result
