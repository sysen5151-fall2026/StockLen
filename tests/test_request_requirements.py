"""Controlled F.1 request requirements, separate from user-task acceptance."""
import unittest
from pmc2.request import validate_pair, preserve_request
from pmc2.demo import demo_configuration


class RequestRequirements(unittest.TestCase):
    def test_DR_01_pair_eligibility(self):
        """DR-01: validate the configured universe; reject duplicate/ineligible symbols."""
        self.assertEqual(validate_pair(' aapl ', 'msft'), {'valid': True, 'reason': None, 'stock_pair': ['AAPL', 'MSFT']})
        self.assertEqual(validate_pair('AAPL', 'AAPL')['reason'], 'duplicate_symbols')
        self.assertEqual(validate_pair('OUTSIDE', 'MSFT')['reason'], 'ineligible_symbol')

    def test_DR_02_preserved_context(self):
        """DR-02: preserve validated pair, common date and identity in IF.01."""
        pair = validate_pair('AAPL', 'MSFT')
        c = demo_configuration()
        r = preserve_request(pair, '2026-09-21', 'request-1', c)
        self.assertEqual(r['request'], {'stock_pair': ['AAPL', 'MSFT'], 'analysis_date': '2026-09-21', 'request_id': 'request-1', 'configuration_id': c['configuration_id']})
        self.assertFalse(preserve_request(pair, '2026-09-20', 'request-1', c)['accepted'])
        self.assertIsNone(preserve_request(validate_pair('AAPL', 'AAPL'), '2026-09-21', 'request-1', c)['request'])
        self.assertFalse(preserve_request({'valid': True, 'reason': None, 'stock_pair': ['AAPL', 'AAPL']}, '2026-09-21', 'request-1', c)['accepted'])
