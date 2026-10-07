# Model–code reconciliation

| Model behavior | Code | Verification |
|---|---|---|
| UC.1.1 user selects pair/date | frontend form | Browser demonstration |
| UC.1.2 UI transmits request | dashboard_ui.transmit_evaluation_request; POST /compare | HTTP smoke check |
| UC.1.3 StockLens requests evidence | stocklens_system.query_external_data_feeds | Ordered participant test |
| UC.1.4.1 X.02 returns market data | market_data_provider.return_market_data | First provider call and observation date |
| UC.1.4.2 X.03 returns news evidence | news_provider.return_news_evidence | Second provider call and source ID |
| UC.1.5 StockLens scoring | calculate_and_normalize_ranking_scores | Fixed values; no real formula in skeleton |
| BMA 3.2.4 internal explanation coordination | ai_explanation_module.coordinate_explanation | Boundary check; native-view synchronization still pending |
| UC.1.6 X.04 explanation | ai_model_service.synthesize_grounded_ai_explanation | Receives scores, source IDs and dates |
| UC.1.7 UI renders | dashboard_ui; walking_skeleton/frontend/index.html | Scores, explanation and dated evidence shown |
| UC.1.8 user inspects | Human operator | Not falsely marked as automated completion |

Formal functional requirement IDs await the appropriate requirement-definition increment. UC.1 identifiers are model action IDs, not invented requirements. Python return values mediate X.04-to-UI delivery through StockLens. The browser mirror runs in one process; neither mirror nor Python stub demonstrates real network access to providers. Report model diagrams remain authoritative for the agreed concept.

Five [emerging functional candidates](../requirements/FUNCTIONAL-CANDIDATES.md) now record proposed statements, stakeholder derivation, action allocation, implementation evidence and unresolved parameters for Milestone 1 review. None has been approved or added to Innoslate.

Remaining team decisions: scoring definitions and weights, data provenance/windows, service provider selection, real AI integration, exception flows in later work, human provenance review and pilot. Historical lab sentiment values and later returns remain illustrative pending provenance.

## Folder consolidation

All executable UC.1 participants now live under `walking_skeleton/`. Participant names, model IDs, request/response fields and fixed-fixture behavior are unchanged. Browser-only source is in `walking_skeleton/browser/`; `scripts/build_site.py` assembles the existing public `skeleton.html` route. Native model allocation and stakeholder acceptance remain pending as above.
