# StockLens — SYSEN 5151

**[Open the StockLens dashboard](https://sysen5151-fall2026.github.io/StockLen/)**

StockLens is a stock research and ranking website for students and beginner investors. Explore rankings for a predefined universe of up to 100 U.S. stocks, compare two eligible stocks on a common date, and inspect adjusted-price history, score drivers and dated source records. Select a ticker in the ranking table to open its price chart and underlying records.

Group 29: Yihan Zhou, Shuxuan Wang, Henian Li, Xinyuan Yan, David Limmer, Rosa Szurgot.

## Research workflow

1. Import daily Yahoo Finance CSVs you are authorized to use, or choose the sample dataset. Select two distinct stocks and an eligible analysis date.
2. StockLens validates the request and the aligned 21-observation market window across the full selected universe.
3. It scores momentum and lower volatility at equal weights. News provides dated evidence for the pair.
4. The same-host model identifies the leading score driver. StockLens checks the response against the computed factors and retains the scored comparison if the model response is unavailable or inconsistent.

Historical imports run in browser memory. Select one CSV per ticker in a predefined universe of 2–100 U.S. stocks and optionally import a dated news JSON file. The public build includes only the fictional sample snapshot for 2026-09-21. See the [import instructions and data requirements](docs/research-dashboard.md#historical-data-import).

**[Engineering comparison](https://sysen5151-fall2026.github.io/StockLen/compare.html)** exposes the same F.1–F.5 workflow with additional scenarios and the engineering trace. See [the dashboard, model and verification map](docs/research-dashboard.md).

## Evidence acquisition and validation

F.2 Acquire and Validate Dated Evidence is implemented by two software modules: F.2.1/P.2.1 builds provider queries and F.2.2/P.2.2 checks returned evidence. The Evidence Lab uses synthetic records and fictional sources. It does not call live providers or calculate stock rankings.

**[Open the Evidence Lab online](https://sysen5151-fall2026.github.io/StockLen/evidence.html)** — runs in your browser without installation or a terminal. Select the stock pair and evidence case, then click **Run F.2**. The browser uses the same synthetic contract and is checked against the Python implementation for every supported scenario.

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

`website/index.html` is the research dashboard. `research-lab.html` retains the earlier illustrative lab and its separate scoring method. The GitHub Pages build also publishes the engineering comparison, evidence lab and browser-only transport fixture. The local FastAPI fixture runs separately.

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

