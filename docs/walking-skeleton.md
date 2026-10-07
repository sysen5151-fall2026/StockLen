# UC.1 — Compare Stocks & Evaluate Ranking

Source: Innoslate project 659, parent 185145; split-provider baseline reconciled September 20. Chapter 2 §2.4.2 is the authorization for this increment; derived functional requirement IDs are not yet approved.

## Numbered call list
1. Research User → Dashboard / UI: select stock pair and analysis date (UC.1.1).
2. Dashboard / UI → StockLens System: transmit_evaluation_request → evaluate_comparison (UC.1.2).
3. StockLens System → X.02 Market Data Provider: query_external_data_feeds → return_market_data (UC.1.3).
4. X.02 → StockLens: fixed market records and observation dates (UC.1.4.1).
5. StockLens System → X.03 News Provider: same query → return_news_evidence (UC.1.3).
6. X.03 → StockLens: fixed news evidence, source IDs and publication dates (UC.1.4.2).
7. StockLens System: calculate_and_normalize_ranking_scores returns fixed score breakdown with the source evidence (UC.1.5).
8. StockLens System → internal AI Explanation Module: coordinate_explanation(score_evidence) → external X.04 AI Model Service: synthesize_grounded_ai_explanation(score_evidence) (UC.1.6). The internal coordinator realizes BMA section 3.2.4; it is not a new external actor or an invented numbered business action.
9. X.04 returns fixed summary text and source IDs to the Dashboard/UI via the service return path. The service return is a transport choice, not another business action.
10. Dashboard / UI renders scores, dates, drivers and evidence (UC.1.7).
11. Research User inspects drivers and evidence (UC.1.8, human action).

The market and news calls are serialized for a simple nominal implementation; both complete before scoring. The generated sequence has one visible request for the shared Data Fetch Command, while the Action relationships specify both recipients. No extra external actor is introduced.

## Participants and implementation
| Model asset | Python participant | Browser mirror |
|---|---|---|
| Research User X.01 | Person operating browser | Same |
| Dashboard / UI | walking_skeleton/dashboard_ui/ and walking_skeleton/frontend/index.html | walking_skeleton/browser/index.html |
| StockLens System 1 | walking_skeleton/stocklens_system/ | evaluateComparison, queryExternalDataFeeds, calculateAndNormalizeRanking |
| Market Data Provider X.02 | walking_skeleton/market_data_provider/ | returnMarketData |
| News Provider X.03 | walking_skeleton/news_provider/ | returnNewsEvidence |
| Internal AI Explanation Module | walking_skeleton/ai_explanation_module/ | coordinateExplanation |
| AI Model Service X.04 | walking_skeleton/ai_model_service/ | synthesizeGroundedAIExplanation |

Browser functions reside in walking_skeleton/browser/skeleton.js. Every provider and calculation returns hard-coded values. No live data, AI calls, application logging, retries or recovery behavior are added.

## Demonstration
From the repository root with Python 3.12:
```sh
python3 -m venv walking_skeleton/backend/.venv
walking_skeleton/backend/.venv/bin/python -m pip install -r walking_skeleton/backend/requirements.txt
walking_skeleton/backend/.venv/bin/python -m uvicorn walking_skeleton.backend.main:app --host 127.0.0.1 --port 8765 --no-access-log
```
Open http://127.0.0.1:8765, submit the default pair/date, inspect DEMO_A=60, DEMO_B=40, explanation and FIXTURE-01 dated 2026-09-18. The browser network panel should show POST /compare. Change the query: the requested values change while the explicitly labeled fixture remains fixed. Stop with Ctrl+C.

For a shareable browser-only mirror open the website's UC.1 demo link. It exercises the same participant functions in JavaScript, without an HTTP backend. The local FastAPI run remains the evidence for crossing an HTTP boundary. GitHub Pages cannot host Python processes.

## Milestone 1 station pitch

Use the [short presentation script](presentation.md): introduce the system, run one request, then trace N-02 → SR-02 → UC.1.6/UC.1.7 in the native model and back to the result.
