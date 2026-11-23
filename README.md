# StockLens — SYSEN 5151

**[Open the StockLens dashboard](https://sysen5151-fall2026.github.io/StockLen/)**

StockLens lets researchers select 2–100 companies from a fixed U.S. large-cap list, browse dated financial news, and rank the selected stocks by their market-adjusted price reaction. Open a ranked stock for its company, sector, price chart and reported volume.

Group 29: Yihan Zhou, Shuxuan Wang, Henian Li, Xinyuan Yan, David Limmer, Rosa Szurgot.

The fixed universe uses the November 20, 2026 iShares OEF equity holdings, with one share class per company. The website queries history using the Massive news and grouped daily data APIs. The absolute difference between a stock’s price return and SPY’s price return determines the rank; the signed difference shows direction. Upstream closes are split-adjusted, with dividends excluded. On-device AI can classify the selected article's licensed summary when the browser’s language model is available.

### Deployment

`python scripts/build_site.py` builds the UI. `python scripts/build_worker.py .site dist/server/index.js` bundles that UI and the data API for a Worker deployment. Configure `MASSIVE_API_KEY` as a server secret with a plan authorized for the intended website audience. The deployed API returns a service status when the secret is missing. Static GitHub Pages alone cannot run this server. Visitors search and analyze on the site and do not supply files or keys.

## Evidence acquisition and validation

F.2 Acquire and Validate Dated Evidence is implemented by two software modules: F.2.1/P.2.1 builds provider queries and F.2.2/P.2.2 checks returned evidence. The Evidence Lab uses synthetic records and fictional sources. It does not call live providers or calculate stock rankings.

For the course verification views, run `python scripts/build_site.py --engineering` and `python -m http.server 8081 --bind 127.0.0.1 --directory .engineering-site`. Open `http://127.0.0.1:8081/evidence.html` for the F.2 lab or `http://127.0.0.1:8081/compare.html` for the engineering comparison.

The Python implementation is also available for local development:

```sh
python -m pip install -r walking_skeleton/backend/requirements.txt
python -m uvicorn walking_skeleton.backend.main:app --host 127.0.0.1 --port 8765 --no-access-log
```

Open **http://127.0.0.1:8765/pmc2**. Complete evidence releases checked records; incomplete core data blocks release; missing news produces an explicit limitation. CLI: `python -m pmc2 --scenario valid`.

- [Function / requirement / module / test trace](docs/traceability.md)
- [Product entry points and use cases](docs/route-table.md)
- [Internal flow API contract](contracts/api-v1.yaml)
- [Functional requirement tests](tests/test_functional_requirements.py)
- [Design baseline](docs/design-baseline.md)
- [Evidence verification and limitations](docs/evidence-verification.md)

The v0.1 design uses two selected stocks within a fixed ten-stock universe, 21 aligned adjusted closes, and 50/50 momentum and lower-volatility average-tie ranks. News supports explanations and does not enter the score. The earlier research lab uses different rules and is excluded from v0.1 conformance evidence.

## Walking Skeleton

All skeleton code is in [walking_skeleton/](walking_skeleton/). Start with its [README](walking_skeleton/README.md) for the folder map and Windows startup.

## Run the Chapter 2 Walking Skeleton

```sh
python3 -m venv walking_skeleton/backend/.venv
walking_skeleton/backend/.venv/bin/python -m pip install -r walking_skeleton/backend/requirements.txt
walking_skeleton/backend/.venv/bin/python -m uvicorn walking_skeleton.backend.main:app --host 127.0.0.1 --port 8765 --no-access-log
```
Open http://127.0.0.1:8765 and select **Compare fixture**. One request traverses UI → StockLens → market stub → news stub → ranking stub → AI stub → UI. It returns fictional fixed data. No real provider or AI call occurs.

## Website

`website/index.html` is the StockLens website. The GitHub Pages entry opens the deployed dashboard, which runs the data API on the same host as the interface. The engineering build and local FastAPI fixture support course verification.

Preview: `python3 scripts/build_site.py` then `python3 -m http.server 8080 --directory .site --bind 127.0.0.1`.

## Submitted operational concept

# Operational Concept Narrative

A normal session begins when a Research User chooses eligible stocks and an analysis date in the Dashboard/User Interface. StockLens then requests market and company records through the Market Data Interface and dated news evidence through the News Interface. The Scoring & Ranking Model applies the same documented factors, observation periods, and weights to both stocks, so the comparison is created before any explanation is written. Only after the score breakdown is complete does the AI Explanation Module send the relevant results and evidence to the external AI Model Service. The returned text explains the calculation; it cannot change the scoring rules or independently decide the ranking. A sentiment factor would enter this flow only after its derivation has been separately specified and checked.

The Dashboard/User Interface brings the result back to the user as a connected story: what was compared, which factors mattered, what evidence supports the explanation, and when that evidence was dated. The user can inspect the sources or begin another comparison. The Maintenance Interface supports approved configuration, updates, and future service-status exchanges, but it does not participate in the normal research path. The session ends with information for the user to review; no trade is placed and no personalized portfolio is created.

## Engineering records

- [Context and external systems](docs/context.md)
- [Numbered call list and demonstration](docs/walking-skeleton.md)
- [User story map](docs/user-story-map.md)
- [Environment](docs/environment.md)
- [Model/code reconciliation](docs/model-code-reconciliation.md)
- [Architecture decisions](docs/adr/)
- [Validation and test evidence](docs/verification.md)
- [Milestone 1 checklist](docs/submission-checklist.md)
- [Innoslate project](https://cloud.innoslate.com/cornell/p/659/diagrams)

## Check

Windows setup and shutdown: [operating guide](docs/operations.md). With the backend dependencies installed and Node.js 20+ on PATH, run all development checks with `walking_skeleton/backend/.venv/Scripts/python.exe scripts/verify.py` on Windows or `walking_skeleton/backend/.venv/bin/python scripts/verify.py` on macOS/Linux.

```sh
python3 -m unittest discover -s tests -v
node --test tests/*.test.mjs
```
SPEC.md retains all eight submitted stakeholder requirements and proposed acceptance criteria. The [earlier five system-function candidates](requirements/FUNCTIONAL-CANDIDATES.md) are a historical M1 record. For the later submitted SYS-F/DR/CR/SWR baseline and current native-model observations, use [the design source register](docs/design-baseline.md). Proposed user MOEs are not completed test results. The stakeholder-readiness workflow reports all eight as **not assessed**; a green report job only means the report was generated. The strict acceptance scaffold remains available through the manual workflow option or `python -m unittest discover -s acceptance -v`, and still fails while evidence is missing.

Website publishing requires **Settings → Pages → Source: GitHub Actions**. The workflow builds and checks the site on every run; when Pages is unavailable, deployment is skipped with a setup notice. Skipped deployment does not mean the website was published. After enabling Pages, run **Verify and publish StockLens** from the Actions tab.

## Reference and provenance

The existing StockLens website was supplied by the project owner and migrated with corrections recorded in ADR 0002. [EarthBreath](https://github.com/hg533-web/earthbreath-dashboard) was inspected for README/setup organization only. No EarthBreath code or dataset was copied. Its later-stage APIs and accounts are not requirements for this Chapter 2 increment.

