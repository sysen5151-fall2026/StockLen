"""Controlled F.1/F.2 requirement tests; not stakeholder acceptance."""
import unittest
from copy import deepcopy
from unittest.mock import patch
from pmc2.acquisition import UNIVERSE, request_dated_records
from pmc2.demo import demo_configuration, run_demo, synthetic_responses
from pmc2.validation import validate_evidence
from pmc2.request import validate_pair, preserve_request


class EvidenceRequirements(unittest.TestCase):
    def setUp(self):
        self.config = demo_configuration()
        self.request = {'request_id': 'comparison-1', 'stock_pair': ['AAPL', 'MSFT'], 'analysis_date': '2026-09-21'}
        self.q = request_dated_records(self.request, self.config)
        self.market, self.news = synthetic_responses(self.q)

    def validate(self, market=None, news=None, config=None):
        return validate_evidence(self.q['context'], self.market if market is None else market,
                                 self.news if news is None else news, self.config if config is None else config)

    def test_SYS_F_02_acquires_and_validates_dated_evidence(self):
        """SYS-F-02: The StockLens System shall acquire and validate dated evidence."""
        result = run_demo()['evidence']
        self.assertTrue(result['score_ready'])
        self.assertEqual(len(result['market_records']), 210)
        self.assertEqual(len(result['news_records']), 2)

    def test_DR_03_full_universe_and_pair_queries(self):
        """DR-03: The P.2.1 Provider Acquisition Module shall issue IO.03 market queries for the frozen scoring universe and IO.04 news queries for the validated pair, using the accepted analysis date and Research Configuration, and provide the associated Evidence Acquisition Context in LF.02 to P.2.2.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        self.assertEqual(self.q['market_query']['symbols'], list(UNIVERSE))
        self.assertEqual(len(self.q['market_query']['observation_dates']), 21)
        self.assertEqual(self.q['news_query']['symbols'], ['AAPL', 'MSFT'])
        self.assertEqual(self.q['news_query']['start_date'], '2026-09-15')
        self.assertEqual(self.q['news_query']['end_date'], '2026-09-21')

    def test_DR_04_invalid_core_never_released(self):
        """DR-04: The P.2.2 Evidence Validation Module shall validate evidence dates, configured market coverage and provenance before releasing IF.02.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        for case in ('missing_unselected_stock', 'missing_observation', 'post_cutoff', 'missing_source', 'mixed_request'):
            with self.subTest(case=case):
                r = run_demo(case)['evidence']
                self.assertFalse(r['score_ready'])
                self.assertEqual(r['market_records'], [])
                self.assertEqual(r['status'], 'failed')
                self.assertTrue(r['reason'])

    def test_CR_01_accepts_request_context(self):
        """CR-01: The P.2 Evidence Acquisition Subsystem shall accept IF.01 from P.1 with the validated pair, common date and request identity.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        for k, v in self.request.items():
            self.assertEqual(self.q['context'][k], v)

    def test_CR_02_retains_market_fields(self):
        """CR-02: The P.2 Evidence Acquisition Subsystem shall accept IO.07 from the Market Data Provider while retaining symbols, observation dates, adjusted prices and provider association.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        self.assertEqual(self.validate()['market_records'], self.market)

    def test_CR_03_excludes_unsupported_news(self):
        """CR-03: The P.2 Evidence Acquisition Subsystem shall accept IO.08 from the News Provider while retaining source identity, publication date and query association.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        for change in ({'source_id': ''}, {'query_id': 'other'}, {'publication_date': '2026-09-22'},
                       {'publication_date': '2026-09-14'}, {'permitted': False}):
            with self.subTest(change=change):
                bad = deepcopy(self.news); bad[0].update(change)
                r = self.validate(news=bad)
                self.assertTrue(r['score_ready'])
                self.assertEqual(len(r['news_records']), 1)
                self.assertEqual(len(r['rejected_news']), 1)

    def test_CR_04_rejects_configuration_drift(self):
        """CR-04: The P.2 Evidence Acquisition Subsystem shall apply IO.10 to acquisition and validation for the same comparison.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        changed = deepcopy(self.config); changed['configuration_id'] = 'changed'
        self.assertEqual(self.validate(config=changed)['reason'], 'configuration_mismatch')

    def test_CR_05_market_contract(self):
        """CR-05: The P.2 Evidence Acquisition Subsystem shall provide IO.03 to the configured Market Data Provider for the required symbols and common observation window.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        q = self.q['market_query']
        self.assertEqual((q['provider_id'], q['field'], q['currency']), ('synthetic-market', 'adjusted_close', 'USD'))
        self.assertEqual(q['observation_dates'], self.config['observation_dates'])

    def test_CR_06_news_contract_and_limit(self):
        """CR-06: The P.2 Evidence Acquisition Subsystem shall provide IO.04 to the configured News Provider with company/date bounds associated with IF.01.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        self.assertEqual(self.q['news_query']['provider_id'], 'synthetic-news')
        news = [{**self.news[0], 'source_id': f'ITEM-{i}'} for i in range(4)] + self.news[1:]
        r = self.validate(news=news)
        self.assertEqual(sum(n['symbol'] == 'AAPL' for n in r['news_records']), 2)
        self.assertEqual(len(r['rejected_news']), 2)

    def test_CR_07_valid_and_failed_envelopes(self):
        """CR-07: The P.2 Evidence Acquisition Subsystem shall provide IF.02 to P.3 with validated market records, accepted news if any, source references, date context and applied configuration identity when core evidence is valid, or an explicit non-score-ready validation status with the failure reason, request identity and configuration identity when core evidence is invalid.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        self.assertEqual(self.validate()['configuration_id'], self.config['configuration_id'])
        failed = self.validate(market=[])
        self.assertEqual(failed['request_id'], self.request['request_id'])
        self.assertFalse(failed['score_ready'])
        self.assertEqual(failed['market_records'], [])

    def test_CR_08_market_query_response_association(self):
        """CR-08: The P.2 Evidence Acquisition Subsystem shall interface with the Market Data Provider through the Market Data Interface, associating IO.03 and IO.07.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        for field in ('request_id', 'configuration_id', 'query_id', 'provider_id', 'conditions_id'):
            with self.subTest(field=field):
                bad = deepcopy(self.market); bad[0][field] = 'wrong'
                self.assertEqual(self.validate(market=bad)['reason'], 'market_association_mismatch')

    def test_CR_09_news_query_response_association(self):
        """CR-09: The P.2 Evidence Acquisition Subsystem shall interface with the News Provider through the News Interface, associating IO.04 and IO.08.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        for field in ('request_id', 'configuration_id', 'query_id', 'provider_id', 'conditions_id'):
            with self.subTest(field=field):
                bad = deepcopy(self.news); bad[0][field] = 'wrong'
                self.assertEqual(len(self.validate(news=bad)['news_records']), 1)

    def test_CR_10_preserves_distinct_dates_and_sources(self):
        """CR-10: The P.2 Evidence Acquisition Subsystem shall preserve source identifiers and separate analysis, observation and publication dates in released evidence.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        news = deepcopy(self.news); news[0]['publication_date'] = '2026-09-15'
        r = self.validate(news=news)
        self.assertEqual(r['analysis_date'], '2026-09-21')
        self.assertEqual(r['market_records'][0]['observation_date'], '2026-09-01')
        self.assertIn('2026-09-15', [n['publication_date'] for n in r['news_records']])
        self.assertEqual(r['market_records'][0]['source_id'], self.market[0]['source_id'])

    def test_CR_11_unreviewed_provider_blocked(self):
        """CR-11: The P.2 Evidence Acquisition Subsystem shall acquire, retain and expose provider data only as permitted by the recorded conditions applicable to that provider and operation.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        bad = deepcopy(self.config); bad['providers']['market']['provider_id'] = 'unreviewed-live-provider'
        with self.assertRaises(ValueError):
            request_dated_records(self.request, bad)

    def test_CR_13_preserves_P1_boundary(self):
        """CR-13: The P.2 Evidence Acquisition Subsystem shall interface with P.1 Request Management Subsystem through the request-context conduit carrying IF.01.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        original = deepcopy(self.request)
        request_dated_records(self.request, self.config)
        self.assertEqual(self.request, original)
        for pair in (['AAPL', 'AAPL'], ['AAPL', 'OUTSIDE']):
            with self.assertRaises(ValueError):
                request_dated_records({**self.request, 'stock_pair': pair}, self.config)

    def test_CR_14_P3_receives_only_checked_core(self):
        """CR-14: The P.2 Evidence Acquisition Subsystem shall interface with P.3 Ranking and Driver Subsystem through the validated-evidence conduit carrying IF.02.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        invalid = deepcopy(self.market); invalid[0]['adjusted_close'] = 0
        self.assertEqual(self.validate(market=invalid)['market_records'], [])
        self.assertEqual(len(self.validate()['market_records']), 210)

    def test_CR_15_both_modules_use_frozen_configuration(self):
        """CR-15: The P.2 Evidence Acquisition Subsystem shall interface with the System Maintainer through the configuration conduit carrying IO.10.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        self.config['configuration_id'] = 'new-maintainer-version'
        self.assertEqual(self.q['context']['configuration_id'], 'v0.1-pmc2-synthetic-1')
        self.assertEqual(self.validate(config=self.q['context']['configuration'])['status'], 'accepted')

    def test_CR_16_evidence_decision_has_no_AI_dependency(self):
        """CR-16: The P.2 Evidence Acquisition Subsystem shall release core market evidence for scoring only when its configured coverage, date and provenance checks pass, independently of AI explanation availability.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        with patch('walking_skeleton.ai_model_service.synthesize_grounded_ai_explanation', side_effect=RuntimeError('AI unavailable')) as ai:
            self.assertTrue(self.validate()['score_ready'])
            self.assertFalse(self.validate(market=self.market[:-1])['score_ready'])
            ai.assert_not_called()
        self.assertTrue(self.validate(news=[])['score_ready'])
        self.assertTrue(self.validate(news=[])['limitations'])

    def test_CR_17_interleaved_requests_preserve_identity(self):
        """CR-17: The P.2 Evidence Acquisition Subsystem shall preserve the accepted request identity, common analysis date and applied configuration identity in LF.02 and IF.02.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        second_config = deepcopy(self.config); second_config['configuration_id'] = 'v0.1-synthetic-2'
        q2 = request_dated_records({**self.request, 'request_id': 'comparison-2', 'stock_pair': ['NVDA', 'XOM']}, second_config)
        m2, n2 = synthetic_responses(q2)
        r2 = validate_evidence(q2['context'], m2, n2, second_config)
        self.assertEqual(r2['request_id'], 'comparison-2')
        self.assertEqual(self.validate()['request_id'], 'comparison-1')
        self.assertFalse(self.validate(market=m2)['score_ready'])

    def test_DR_04_malformed_prices_and_duplicate_dates(self):
        """DR-04: The P.2.2 Evidence Validation Module shall validate evidence dates, configured market coverage and provenance before releasing IF.02.

        Scope: controlled synthetic F.2 check; upstream/live-service acceptance is separate.
        """
        for price in (float('nan'), float('inf'), -1, True, '100'):
            bad = deepcopy(self.market); bad[0]['adjusted_close'] = price
            self.assertFalse(self.validate(market=bad)['score_ready'])
        self.assertFalse(self.validate(market=self.market + self.market[:1])['score_ready'])



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


if __name__ == '__main__':
    unittest.main()
