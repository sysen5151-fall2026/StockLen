"""BMA 3.2.4 internal coordination / external X.04 boundary; not SR-02 acceptance."""
import copy
import unittest
from unittest.mock import patch

from walking_skeleton import ai_explanation_module
from walking_skeleton import ai_model_service
from walking_skeleton import dashboard_ui
class ExplanationBoundaryTest(unittest.TestCase):
    def test_internal_module_delegates_once_without_changing_scores(self):
        payload = {"scores": [{"symbol": "DEMO_A", "score": 60.0}],
                   "sources": [{"id": "FIXTURE-01"}], "analysis_date": "2026-09-18"}
        before = copy.deepcopy(payload)
        response = {"fixture": True, "text": "fixed", "source_ids": ["FIXTURE-01"]}
        with patch.object(ai_model_service, "synthesize_grounded_ai_explanation", return_value=response) as external:
            result = ai_explanation_module.coordinate_explanation(payload)
        external.assert_called_once_with(before)
        self.assertEqual(payload, before)
        self.assertIs(result, response)

    def test_uc1_routes_through_internal_module_before_external_service(self):
        order = []
        coordinate = ai_explanation_module.coordinate_explanation
        generate = ai_model_service.synthesize_grounded_ai_explanation

        def internal(payload):
            order.append("internal")
            return coordinate(payload)

        def external(payload):
            order.append("X.04")
            self.assertEqual(payload["sources"][0]["id"], "FIXTURE-01")
            self.assertEqual(payload["scores"][0]["score"], 60.0)
            return generate(payload)

        with patch.object(ai_explanation_module, "coordinate_explanation", internal), patch.object(ai_model_service, "synthesize_grounded_ai_explanation", external):
            result = dashboard_ui.transmit_evaluation_request("DEMO_A", "DEMO_B", "2026-09-18")
        self.assertEqual(order, ["internal", "X.04"])
        self.assertEqual(result["ranking"]["scores"][0]["score"], 60.0)
