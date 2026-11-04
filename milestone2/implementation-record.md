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
