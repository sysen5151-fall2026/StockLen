# PMC2 F.2 implementation task

## LOCATE
Sources: six submitted PDFs supplied for PMC2; especially StockLens_NewVersion_Revised, sections 1.4, 2.1.4, 2.1.5, 4.1–4.2. Innoslate project 659 F.2 (269035) and P.2 (290840). UC.1 (185145); N-01/N-03 → SR-01/SR-03; SYS-F-02 → DR-03/DR-04.

## EXTRACT
F.2.1/P.2.1 consumes IF.01 and IO.10, issues IO.03 (all ten symbols, 21 aligned adjusted closes), IO.04 (selected pair, seven calendar days, max two news items each), and LF.02 context. F.2.2/P.2.2 receives LF.02, IO.07, IO.08 and IO.10; releases IF.02 with provenance and separate dates, or explicit non-score-ready failure. CR-01–11, CR-13–17 apply; CR-12 belongs to P.4. SWR-01 → CR-10 is equivalence; SWR-04 → CR-16 is synthesis.

## CONSTRAIN
Use Python standard library for core and synthetic adapters; existing FastAPI only for transport. No new runtime dependency, credentials, live-provider claims, investment advice, scoring-rule changes or fabricated human validation. Existing M1 fixtures remain historical. The old exploratory research lab is not the v0.1 product. Input calendar must explicitly list 21 observation dates; no guessed exchange calendar. Synthetic adapters have explicit local-only conditions. Real providers remain disabled pending contract/terms review.

## PROMPT
Implement F.2 acquisition and validation as pmc2/acquisition.py and pmc2/validation.py, synthetic fixture generation and local demo UI/CLI. Add the module docstrings/ICOM signatures, docs/traceability.md, docs/route-table.md, contracts/api-v1.yaml, tests/test_functional_requirements.py and .github/workflows/tests.yml. Connect demo routes to existing backend, preserve legacy route. Add baseline/source/reconciliation and class/video instructions. Test complete data, missing unselected stock/observation, bad dates/prices/provenance, mixed requests/configurations, news rejection and optional news. Do not claim P.3–P.5 or live services are complete. Allowed edits: these new files plus README.md, SPEC.md, docs/model-code-reconciliation.md, docs/presentation.md, backend/main.py and a label on website/index.html. Acceptance: recorded inputs/outputs through F.2.1 → LF.02 → F.2.2, testable failure reasons, no score-ready data on invalid core, request/config preserved, reproducible startup and passing CI.

## REVIEW / RECONCILE
See docs/evidence-verification.md for verified results and remaining gaps. This increment is a controlled F.2 product slice, not stakeholder acceptance or real market evidence.

## Browser hosting increment

Locate/extract: user requests execution through GitHub instead of PowerShell; retain SYS-F-02, DR-03/04 and CR obligations, LF.02/IF.02 contract and synthetic data boundaries. Constraint: static GitHub Pages cannot execute Python; preserve Python transport and add a dependency-free browser implementation, with no real services or ranking claims. Bounded task: port F.2 functions and synthetic scenarios to pmc2/browser/, add full-output Python parity checks and negative cases, package evidence.html through the existing Pages build, enable workflow hosting and update project links. Review/reconciliation: use the same function/asset IDs and keep presentation-only instructions in this removable directory.

## Integrated comparison and F.1 increment

Locate: user asks to complete the other project functions and select the easiest function to present. Sources: design baseline DR-01–DR-10, SYS-F-01–05, SWR-01–05 and submitted v0.1 score supplement. Extract: F.1 validates a distinct eligible pair and preserves date/request/config identity; F.3 uses 21 prices/20 simple returns, average-tie ranks over ten stocks and 50/50 factor contributions; F.4 packages allowed fields and rejects mismatched synthetic explanations without changing scores; F.5 renders authoritative scores, drivers, dated references and five-state status. Constrain: browser-only JavaScript, no dependencies, no credentials/real-provider/real-AI claims, retained F.2 code/contracts, fixed synthetic snapshot. Prompt: add project comparison page and named leaf functions, meaningful reference-calculation/boundary tests, trace/route/baseline documentation, and build integration. Choose F.1 for the optional class script using valid/duplicate/outside-universe cases. Real service qualification and human acceptance remain separate. Acceptance: a browser executes F.1–F.5 on synthetic records, invalid request/core produces no ranking, unavailable or rejected explanation preserves scores, and all state records carry request/config IDs. Limit changes to new browser project modules/pages, test file, build script, technical docs/README and this removable presentation directory.
