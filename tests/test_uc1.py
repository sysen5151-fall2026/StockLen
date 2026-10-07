import unittest
from unittest.mock import patch
from walking_skeleton import dashboard_ui, stocklens_system, market_data_provider, news_provider, ai_model_service

class WalkingSkeletonTest(unittest.TestCase):
    def test_uc1_order_and_evidence_handoff(self):
        calls=[]
        def observed(module, name, step):
            original=getattr(module,name)
            def invoke(value):
                calls.append(step)
                if step == "UC.1.6":
                    self.assertEqual(value["sources"][0]["id"], "FIXTURE-01")
                    self.assertEqual(value["observation_date"], "2026-09-18")
                    self.assertEqual(value["scores"][0]["score"], 60.0)
                return original(value)
            return patch.object(module,name,invoke)
        with observed(market_data_provider,"return_market_data","UC.1.4.1"), observed(news_provider,"return_news_evidence","UC.1.4.2"), observed(stocklens_system,"calculate_and_normalize_ranking_scores","UC.1.5"), observed(ai_model_service,"synthesize_grounded_ai_explanation","UC.1.6"):
            result=dashboard_ui.render_comparison_dashboard(dashboard_ui.transmit_evaluation_request("DEMO_A","DEMO_B","2026-09-18"))
        self.assertEqual(calls,["UC.1.4.1","UC.1.4.2","UC.1.5","UC.1.6"])
        self.assertEqual(result["explanation"]["source_ids"],["FIXTURE-01"])
        self.assertEqual(result["mode"],"walking-skeleton-fixed-fixture")
    def test_query_never_relabels_fixture(self):
        result=dashboard_ui.transmit_evaluation_request("OTHER_A","OTHER_B","2020-01-01")
        self.assertEqual(result["requested_query"]["stock_pair"],["OTHER_A","OTHER_B"])
        self.assertEqual(result["ranking"]["stock_pair"],["DEMO_A","DEMO_B"])
        self.assertEqual(result["ranking"]["analysis_date"],"2026-09-18")
if __name__ == "__main__": unittest.main()
