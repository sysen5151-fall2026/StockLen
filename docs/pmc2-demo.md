# PMC2 presentation guide — Group 29

## Dates and submissions

Teaching-team announcement dated October 31, 2026: on-campus demo **Wednesday November 4**; individual three peer-review worksheets completed in class (submission flexibility until **November 11**); approximately ten-minute team video due **November 11**. Afternoon LEC003 presents in class and reviews the other three afternoon teams. The AM six-round schedule does not apply to LEC003. Each student's written peer-review answers must be their own.

## Start before class

Run from the repository root, not inside `pmc2/`. Python 3.12 is the repository environment.

Windows PowerShell:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r walking_skeleton/backend/requirements.txt
.\.venv\Scripts\python.exe -m uvicorn walking_skeleton.backend.main:app --host 127.0.0.1 --port 8765 --no-access-log
```

macOS/Linux:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r walking_skeleton/backend/requirements.txt
.venv/bin/python -m uvicorn walking_skeleton.backend.main:app --host 127.0.0.1 --port 8765 --no-access-log
```

Open **http://127.0.0.1:8765/pmc2**. Keep the terminal running; Ctrl+C stops it. GitHub Pages cannot run this Python slice. Do not open the old research lab as evidence for the v0.1 algorithm. An offline fallback is `python -m pmc2 --scenario valid` and `python -m pmc2 --scenario missing_unselected_stock`; these call the same functions.

Open these native views in advance:

| View | Link |
|---|---|
| First-level physical IDEF0 | https://cloud.innoslate.com/cornell/p/659/diagrams/idef0/264782 |
| Selected F.2 second-level IDEF0 | https://cloud.innoslate.com/cornell/p/659/diagrams/idef0/269035 |
| F.2 function hierarchy | https://cloud.innoslate.com/cornell/p/659/diagrams/hierarchy/269035 |
| P.2 asset hierarchy | https://cloud.innoslate.com/cornell/p/659/diagrams/hierarchy/290840 |
| SYS-F-02 | https://cloud.innoslate.com/cornell/p/659/database/entity/290910 |
| P.2 component specification | https://cloud.innoslate.com/cornell/p/659/database/entity/290873 |

The F.2 hierarchy route is a view of an existing decomposed Action, not a request to create replacement entities. Fit the IDEF0 to the window and check label readability before recording.

## Five-minute classroom demo

| Time | Screen and action | Simple English narration |
|---|---|---|
| 0:00–0:40 | First-level IDEF0, mechanism arrows | “StockLens helps students compare two stocks using the same date and scoring rules. These five functions handle the request, evidence, calculation, explanation and display. Each function has a software asset shown below it.” |
| 0:40–1:35 | F.2 second-level IDEF0 | “We selected F.2, Acquire and Validate Dated Evidence. F.2.1 sends market and news queries. It passes the request and query context in LF.02. F.2.2 checks the returned records and releases IF.02. The research configuration controls both steps.” |
| 1:35–2:10 | Function and asset hierarchies side by side | “F.2 has two child functions. P.2 has two matching modules. P.2.1 performs acquisition. P.2.2 performs validation. They are software modules, so we do not need separate servers.” |
| 2:10–3:15 | `/pmc2`, AAPL/MSFT, Complete evidence → Run F.2; expand LF.02 and IF.02 | “This is a controlled demonstration with synthetic records. The market query covers all ten stocks and 21 aligned dates. News covers only our selected pair. Both steps keep the same request, analysis date and configuration. The valid result releases 210 price records for scoring.” |
| 3:15–4:10 | Missing an unselected universe stock → Run F.2 | “Now we remove a stock that the user did not select. The result is blocked because normalization still needs the full ten-stock universe. IF.02 carries a reason and the request context, but no score-ready prices.” |
| 4:10–5:00 | No qualifying news → Run F.2 | “With valid prices but no qualifying news, the evidence stays score-ready with a limitation. News does not determine the score. This completes the selected evidence function. Real-provider checks and the full stock-comparison product still need separate verification.” |

The classroom requirement is model → product in three steps. A long repository tour is not needed inside these five minutes. Keep the exact same selected function for the team video.

## Approximately ten-minute team submission video

| Time | Required evidence |
|---|---|
| 0:00–4:30 | The same physical IDEF0, F.2 decomposition, function/asset hierarchies and product cases above |
| 4:30–5:30 | `docs/traceability.md`: read SYS-F-02 → F.2 → module path → test name; then DR-03 and DR-04 rows |
| 5:30–6:30 | `pmc2/acquisition.py` and `pmc2/validation.py`: function IDs in docstrings; arguments/outputs follow ICOM; LF.02 separates queries/context from boundary responses |
| 6:30–7:15 | `tests/test_functional_requirements.py`, `.github/workflows/tests.yml` and an actual successful Actions run for the video commit. Do not show only a badge or claim a queued run passed |
| 7:15–8:00 | `contracts/api-v1.yaml`: acquire operation yields context; validate operation consumes that exact LF.02 context plus IO.07/08. `docs/route-table.md`: Run F.2 → UC.1 |
| 8:00–9:00 | Innoslate: SYS-F-02 as system parent; P.2 specification DR-03/DR-04 and boundary/interface CRs. Show the native relationships, not just this Markdown |
| 9:00–10:00 | SWR-01 → CR-10: **equivalence**, same source/date preservation obligation at P.2. Show separate analysis, observation and publication dates in IF.02. Optionally SWR-04 → CR-16: **synthesis**, evidence checks support AI-independent ranking. State test and integration limits |

Suggested division among the four report contributors, subject to team agreement: Yihan introduces model/product; Shuxuan explains second-level functions and matching assets; Henian explains requirements/flow-down; Xinyuan explains interfaces/code/test links. This is a suggested speaking plan, not a new claim about completed contributions.

## Likely questions

- **Why ten stocks when comparing two?** The two displayed scores are normalized against one frozen ten-stock universe. Pair-only normalization changes the comparison basis.
- **Why separate acquisition and validation?** Receiving records is not proof that they have the right dates, coverage or provenance.
- **Does green CI mean the whole project is validated?** No. It checks the controlled component and retained development tests. Real provider suitability, end-to-end timing and human MOEs remain separate.
- **Why no ranking in this screen?** This screen demonstrates the selected F.2 function and its IF.02 result. P.3 owns numerical ranking; P.4 owns AI coordination; P.5 owns completed comparison display.
- **What does no news do?** It marks a limitation while keeping valid core evidence available; it does not create news or change scores.
- **Are the stock prices real?** No. They are generated fixtures under an explicit synthetic calendar, clearly labelled in the product.
