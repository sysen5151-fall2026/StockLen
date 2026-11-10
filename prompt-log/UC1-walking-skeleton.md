# UC.1 walking skeleton — bounded increment

## Sources
Sources: SYSEN 5151 Lab Manual v3.0 (7 September 2026), pp. 53–56; Innoslate project 659, UC.1 Action/Activity/Sequence root 185145. User authorized model, code and report alignment. Remote baseline has empty backend/main.py and frontend/index.html. SPEC.md contains placeholders; no formal functional requirement is asserted here.

## Technical basis
UC.1 Compare Stocks & Evaluate Ranking: Research User selects stock pair/date; Dashboard / UI transmits request; StockLens System queries External API; External API returns market/news evidence; StockLens System calculates ranking; External API supplies explanation; Dashboard / UI renders result; Research User inspects drivers/citations. Data includes identifiers and dates. Human inspection is not an automated validation result.

## Scope
Python 3.12 and FastAPI as specified by repository. Fixed fictional fixture only. No real market access, AI call, ranking algorithm, investment recommendation, exception handling, retries or application logging. FastAPI and uvicorn are justified by the specified HTTP backend and local browser demonstration. Standard-library unittest checks wiring; no additional test framework. Existing local uncommitted work remains outside this clone.



## Verification
Pending execution and final live-model reconciliation. This is an AI-assisted engineering record, not evidence of teammate review.
