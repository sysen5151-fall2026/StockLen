# Product entry point → use case audit

| Entry point | Use case / role | Model functions | Status and code |
|---|---|---|---|
| Pages `evidence.html`, **Run F.2** | UC.1 evidence-acquisition segment | F.2.1 → F.2.2 | Implemented in `pmc2/browser/evidence.mjs`; browser-only synthetic adapters; no Python HTTP call |
| GET `/pmc2` | UC.1 evidence-acquisition segment, Research User / observer | F.2.1 → F.2.2 | Implemented, `pmc2/index.html`, live local Python backend |
| Select pair and scenario; **Run F.2**, POST `/api/pmc2/demo` | UC.1 (185145), particularly UC.1.3/1.4 provider exchange | F.2 → F.2.1/F.2.2 | Implemented controlled synthetic slice, `pmc2/demo.py`; no ranking or external service |
| POST `/internal/f2/acquire` | Internal operation supporting UC.1; not an extra user use case | F.2.1 / P.2.1 | Implemented, `pmc2/acquisition.py`; emits IO.03, IO.04 and LF.02 |
| POST `/internal/f2/validate` | Internal operation supporting UC.1 | F.2.2 / P.2.2 | Implemented, `pmc2/validation.py`; consumes LF.02 plus IO.07/08, emits IF.02 |
| CLI `python -m pmc2 --scenario …` | Maintainer/test observation of the same UC.1 segment | F.2.1/F.2.2 | Implemented; full JSON queries and envelope; no parallel business logic |
| GET `/` and POST `/compare` | Historical Chapter 2 UC.1 nominal transport | UC.1 call sequence | Retained fixed fictional fixture; does not implement the current F.2 specification |
| Static `skeleton.html` / Compare fixture | Historical Chapter 2 UC.1 mirror | UC.1 call sequence | Browser-only stub, separate from the evidence component |
| Static research lab `website/index.html`: add/remove stocks, weights, result reveal, dates, charts | Earlier exploratory research concept | Partial conceptual links to F.3/F.5 | Illustrative, **not v0.1-conformant**: selected-set min/max normalization, sentiment weight and future-outcome reveal differ from submitted scope. Excluded from v0.1 conformance evidence |
| GET `/docs`, `/redoc`, `/openapi.json` | Developer inspection; no business UC | Transport metadata | FastAPI generated documentation; not a new model function |

No health, login, trading or portfolio route is claimed. Internal endpoints document logical software boundaries and are bound to 127.0.0.1 for this demo; they are not a production public API deployment.
