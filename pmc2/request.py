"""F.1 request validation: P.1.1/DR-01 and P.1.2/DR-02.

IO.01 + IO.10 -> eligible-pair handoff -> IF.01 accepted request context.
The single synthetic snapshot is an explicit fixture-coverage constraint.
"""
from pmc2.acquisition import UNIVERSE


def validate_pair(stock_a: str, stock_b: str) -> dict:
    """F.1.1 / DR-01: normalize and check distinct eligible symbols."""
    pair = [s.strip().upper() if isinstance(s, str) else '' for s in (stock_a, stock_b)]
    reason = ('ineligible_symbol' if any(s not in UNIVERSE for s in pair)
              else 'duplicate_symbols' if pair[0] == pair[1] else None)
    return {'valid': reason is None, 'reason': reason, 'stock_pair': pair}


def preserve_request(pair_result: dict, analysis_date: str, request_id: str, configuration: dict) -> dict:
    """F.1.2 / DR-02: preserve accepted identity/date; reject unsupported snapshot."""
    reason = pair_result.get('reason') if not pair_result.get('valid') else None
    if not pair_result.get('valid'):
        return {'accepted': False, 'reason': reason or 'invalid_pair_result', 'request': None}
    # Recheck the handoff at the optional HTTP boundary; callers cannot forge it.
    checked = validate_pair(*pair_result['stock_pair'])
    if checked != pair_result:
        return {'accepted': False, 'reason': 'invalid_pair_result', 'request': None}
    if analysis_date != '2026-09-21':
        reason = 'unsupported_snapshot_date'
    elif not request_id or configuration.get('configuration_id') != 'v0.1-pmc2-synthetic-1':
        reason = 'invalid_request_or_configuration'
    if reason:
        return {'accepted': False, 'reason': reason, 'request': None}
    return {'accepted': True, 'reason': None, 'request': {'request_id': request_id,
            'stock_pair': list(pair_result['stock_pair']), 'analysis_date': analysis_date,
            'configuration_id': configuration['configuration_id']}}
