# StockLens — SYSEN 5151

## Operational Concept

A normal session begins when a Research User chooses eligible stocks and an analysis date in the Dashboard/User Interface. StockLens then requests market and company records through the Market Data Interface and dated news evidence through the News Interface. The Scoring & Ranking Model applies the same documented factors, observation periods, and weights to both stocks, so the comparison is created before any explanation is written. Only after the score breakdown is complete does the AI Explanation Module send the relevant results and evidence to the external AI Model Service. The returned text explains the calculation; it cannot change the scoring rules or independently decide the ranking. A sentiment factor would enter this flow only after its derivation has been separately specified and checked.

The Dashboard/User Interface brings the result back to the user as a connected story: what was compared, which factors mattered, what evidence supports the explanation, and when that evidence was dated. The user can inspect the sources or begin another comparison. The Maintenance Interface supports approved configuration, updates, and future service-status exchanges, but it does not participate in the normal research path. The session ends with information for the user to review; no trade is placed and no personalized portfolio is created.

Transcribed from BMA section 3.2.4; see [source register](model-artifacts/source-register.md). This describes the intended system; the runnable increment below still uses fixed stubs.

Group 29: Yihan Zhou, Shuxuan Wang, Henian Li, Xinyuan Yan, David Limmer, Rosa Szurgot.

## Run the Chapter 2 Walking Skeleton

```sh
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.txt
backend/.venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8765 --no-access-log
```
Open http://127.0.0.1:8765 and select **Compare fixture**. One request traverses UI → StockLens → market stub → news stub → ranking stub → AI stub → UI. It returns fictional fixed data. No real provider or AI call occurs.

## Website

`website/` contains the migrated research interface and `skeleton.html`, a browser-only mirror of UC.1. The research lab's numerical data is illustrative and awaits source verification. Its scoring is deterministic; its explanation is a template. This exploratory view is separate from the fixed-stub Chapter 2 deliverable. GitHub Pages hosts static files, not the Python API.

Preview: `python3 -m http.server 8080 --directory website --bind 127.0.0.1`.

## Engineering records

- [Context and external systems](docs/context.md)
- [Numbered call list and demonstration](docs/walking-skeleton.md)
- [User story map](docs/user-story-map.md)
- [Environment](docs/environment.md)
- [Model/code reconciliation](docs/model-code-reconciliation.md)
- [Architecture decisions](docs/adr/)
- [Validation and test evidence](docs/verification.md)
- [Submission checklist](docs/submission-checklist.md)
- [Prompt log](docs/prompt-log.md)
- [Innoslate project](https://cloud.innoslate.com/cornell/p/659/diagrams)

## Check

Windows setup and shutdown: [operating guide](docs/operations.md). With the backend dependencies installed and Node.js 20+ on PATH, run all development checks with `backend/.venv/Scripts/python.exe scripts/verify.py` on Windows or `backend/.venv/bin/python scripts/verify.py` on macOS/Linux.

```sh
python3 -m unittest discover -s tests -v
node --test tests/site.test.mjs
```
SPEC.md retains all eight submitted stakeholder requirements and proposed acceptance criteria. [Five emerging system-function candidates](requirements/FUNCTIONAL-CANDIDATES.md) await approval and native-model allocation. Proposed user MOEs are not completed test results. The separate stakeholder-acceptance workflow intentionally reports eight unmet assessments; green development checks do not close them.

## Reference and provenance

The existing StockLens website was supplied by the project owner and migrated with corrections recorded in ADR 0002. [EarthBreath](https://github.com/hg533-web/earthbreath-dashboard) was inspected for README/setup organization only. No EarthBreath code or dataset was copied. Its later-stage APIs and accounts are not requirements for this Chapter 2 increment.
