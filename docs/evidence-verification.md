# Evidence acquisition verification and reconciliation

## Review result

The evidence component implements the F.2 decomposition in the physical design. Acquisition and validation remain separate modules with shared request and configuration context. The following records describe implementation coverage and remaining gaps.

| Finding | Change made | Remaining limitation |
|---|---|---|
| Missing selected second-level product behavior | Implemented F.2.1 acquisition and F.2.2 validation in `pmc2/` | Generated synthetic adapters, not real market/news services |
| Missing `docs/traceability.md` | Added system-function rows and DR/CR module/test links | Unimplemented system functions explicitly remain pending |
| Missing module function IDs and ICOM signatures | New modules name F.2.1/F.2.2, inputs/controls/outputs/mechanisms | Historical M1 modules retain their older transport purpose |
| Missing named functional requirement tests and required workflow path | Added 20 F.2 tests and `.github/workflows/tests.yml` | Controlled component verification only |
| Missing internal-flow API contract | Added OpenAPI `contracts/api-v1.yaml` and two actual local internal endpoints | Normalized synthetic adapter contract; real provider mapping pending |
| Missing route → use case map | Added `docs/route-table.md`, including legacy/exploratory routes and developer endpoints | No claim that every historical UI control implements current v0.1 |
| README treated later function requirements as awaiting allocation | Added later source precedence, native IDs, startup and implementation links | Historical records preserved |
| Research lab uses sentiment, selected-set min/max scores and later-return reveal | Added explicit nonconformance label; excluded it from v0.1 conformance evidence | Controlled browser P.3/P.4/P.5 added; real services remain pending |
| No distinction between system status and evidence-release status | Documented local IF.02 result states separately | Controlled browser five-state service history added; real service monitoring remains pending |
| Prior PDF reported local tests not present in repository | Kept those as historical evidence; new checks are reproducible from this commit | Did not claim to reproduce unavailable historical source code |

## Local verification

Performed from the repository root with Python 3.12.14 and Node 24.22.1 (CI selects Python 3.12 / Node 22 for the existing static build) in the review environment:

- `python -m unittest discover -s tests -v`: 24 passed (20 new F.2, four retained M1 tests).
- `python scripts/check_pmc2_http.py`: passed page delivery, complete/blocked/limited responses, actual acquire→LF.02→validate HTTP handoff and duplicate-pair 422.
- `python scripts/check_http.py`: existing M1 HTTP checks passed.
- `python scripts/check_baseline.py`: original eight stakeholder requirement transcriptions and OpsCon retained.
- `node --test tests/site.test.mjs`: three existing checks passed.
- `python scripts/build_site.py`: existing static build passed. It does not publish or run the Python evidence app.

The live backend binds to 127.0.0.1; fixture records, IDs and sources are clearly labelled. No API key, live stock data, external AI call, provider redistribution or user-study result is added. UI state is exercised separately when possible; successful page delivery alone does not prove browser interaction.

CI verifies controlled component behavior and retained development checks. It does not establish real-provider suitability or complete upstream SWR acceptance.

## Model disposition

Confirmed existing F.2/P.2 decomposition and mechanisms through the native UI. F.2 retains SYS-F-02 satisfaction allocation. F.2.2 receives IO.07, IO.08, IO.10 and LF.02, generates IF.02 and is performed by P.2.2. The component artifact references the subsystem functional and system-wide requirement groups. These existing design relationships should be retained. New controlled checks are code evidence and must not be marked as passed full verification plans in Innoslate.

Use the model's existing SYS/DR/CR/SWR entities when recording implementation references; do not create duplicate stakeholder SR or boundary requirements. The earlier functional report's staged absence of physical mechanisms was superseded by the later form report. Use the physical mechanisms already present in the live model.

## Native implementation references saved

F.2.1 (269045) and F.2.2 (269046) descriptions now link to PR #1 and name their respective callables. F.2.1 also clarifies full-universe market query scope versus pair-specific news scope, consistent with the submitted design. Existing descriptions were retained and extended. No hierarchy, interface relationship or verification verdict was changed.

Remote CI on implementation commit `880bd2c7abe3111cbeb7715416d0dd7e6a788ec6`: the functional requirements workflow, existing verify/build, and stakeholder readiness report all completed successfully. The readiness report is not an acceptance pass; PR deployment is skipped by the existing workflow conditions.

## Integrated comparison verification

The browser comparison adds F.1 request checks, F.3 exact v0.1 scores and drivers, F.4 a checked synthetic service boundary and unavailable/rejected fallback, and F.5 display/status. Six additional Node test groups pass, for 13 Node groups total plus the 26 Python tests (including new DR-01/DR-02 cases). Scoring is checked against an independent Python calculation using `statistics.stdev` and average ranks across the ten-stock universe. Constant-price fixtures yield 50-point ties. Invalid input or missing core coverage produces no ranking. Absent or invalid explanation leaves scores and displayed stock values unchanged. No new live-provider, real AI, performance or user-study verdict is inferred.
