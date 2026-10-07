# Verification record — 24 September 2026

## Completion verification — 6 October 2026

Executed in the Windows working copy using Python 3.12.14, FastAPI 0.135.1 and uvicorn 0.41.0. `python scripts/verify.py` returned exit code 0:

- Python: four unit checks passed, including internal AI coordinator delegation and call ordering.
- Node: three checks passed, including browser/Python fixture parity and isolation of later outcomes from illustrative ranking.
- Baseline: all eight retained need/requirement/criterion/method records and OpsCon passed transcription checks.
- HTTP: real local server served GET / and two POST /compare requests with different requested inputs and the same clearly labelled fixture; process terminated after checking.
- Separate stakeholder acceptance: eight expected failures explicitly report NOT ASSESSED. No user pilot, human review, provider assessment or approved-schema result is claimed.

The first runtime attempt used a Python without uvicorn; the documented project virtual environment resolved it. The sandbox then blocked local socket access; the successful HTTP run used the authorized unrestricted execution context. Source PDF hashes were recomputed; the BMA source register was corrected after inspecting the current OpsCon. Five functional candidates remain unapproved. Active website links now point to the StockLen repository. Earlier browser observations below were not rerun in this increment.

## Earlier development observations

- Python unit tests: 2 passed. Separate market and news stubs return dated evidence before StockLens prepares the fixed ranking and calls the AI-service stub. Query fields remain separate from fixed fixture values.
- Node tests: 3 passed. Browser and Python fixture payloads match; later returns and paths cannot change research-lab scores; scores and evidence dates pass the defined checks.
- Local FastAPI smoke check: POST `/compare` returned both fixed score rows, explanation, analysis date and FIXTURE-01 evidence.
- Browser UC.1 demo: Compare fixture rendered DEMO_A (60), DEMO_B (40), the fixed explanation and dated evidence.
- Browser research lab: ranking rendered three stocks and source cards; later paths and returns were hidden until explicitly revealed. Desktop layout inspected.

These are automated and agent-operated development checks, not human acceptance or a claim of live provider integration. Human prompt review, teammate contributions, and current Innoslate export review remain recorded in the submission checklist. Deployment verification is recorded separately when publishing succeeds.
