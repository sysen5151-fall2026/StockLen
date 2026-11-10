# Milestone 2 presentation — Group 29

This directory contains optional presentation material. The application, build and tests do not depend on it. It may be deleted as a whole.

## Selected function: F.1 Accept and Validate Comparison Request

F.1 is easier to explain than evidence-validation details: a user submits two stocks, the system checks eligibility and whether they are different, and then preserves the accepted date/request context. Invalid input stops before provider queries.

Open **https://sysen5151-fall2026.github.io/StockLen/compare.html**. No PowerShell or local installation is needed. Expand **Engineering trace** before presenting.

Open these existing model views:

| View | Link |
|---|---|
| First-level IDEF0 with mechanisms | https://cloud.innoslate.com/cornell/p/659/diagrams/idef0/264782 |
| F.1 second-level IDEF0 | https://cloud.innoslate.com/cornell/p/659/diagrams/idef0/269034 |
| F.1 function hierarchy | https://cloud.innoslate.com/cornell/p/659/diagrams/hierarchy/269034 |
| P.1 asset hierarchy | https://cloud.innoslate.com/cornell/p/659/diagrams/hierarchy/290841 |
| F.1.1 | https://cloud.innoslate.com/cornell/p/659/database/entity/269043 |
| F.1.2 | https://cloud.innoslate.com/cornell/p/659/database/entity/269044 |

## Five-minute classroom plan

| Time | Show | Simple English |
|---|---|---|
| 0:00–0:40 | First-level IDEF0 | “StockLens compares two stocks using the same date and scoring rules. These five functions handle the request, evidence, scores, explanation and display. The software asset below each box performs that function.” |
| 0:40–1:30 | F.1 second-level IDEF0 | “We selected F.1, Accept and Validate Comparison Request. F.1.1 checks that both symbols are eligible and different. F.1.2 keeps the accepted pair, analysis date and request identity together.” |
| 1:30–2:10 | Function and asset hierarchies | “F.1 has two child functions. P.1 has two matching software modules. P.1.1 checks eligibility, and P.1.2 preserves the request context.” |
| 2:10–3:10 | AAPL / MSFT, Sep 21 2026, Compare stocks | “Both stocks are in our ten-stock universe. They are different, so the request is accepted. In the engineering trace, IF.01 keeps the pair, date, request ID and configuration version. The other functions can now use the same context.” |
| 3:10–4:00 | AAPL / AAPL, Compare stocks | “Now I select the same stock twice. F.1.1 rejects the request. The system gives a clear reason and does not request data or calculate a ranking.” |
| 4:00–4:40 | Type OUTSIDE / MSFT, Compare stocks | “This symbol is outside our configured universe. The request is rejected before acquisition. This prevents unsupported comparisons.” |
| 4:40–5:00 | Restore AAPL / MSFT | “These cases show the two child functions in the model. The page uses synthetic data. We are demonstrating request validation, not real-provider access or investment performance.” |

The data package supports the single synthetic snapshot 2026-09-21. A different date is explicitly rejected as unsupported. The generated price paths can give tied total scores because the factors offset; a tie is a valid calculation, not an application error. F.1 is about accepting or rejecting the request, so no winning stock is needed for this demonstration.

## Approximately ten-minute team video

Use the same F.1 function as the classroom demonstration.

1. 0:00–4:30: the same model views, hierarchies and valid/duplicate/outside-universe product cases.
2. 4:30–5:30: `docs/traceability.md`, SYS-F-01 → F.1 → DR-01/DR-02 → `pmc2/browser/system.mjs` → DR-01/02 test group in `tests/comparison.test.mjs`.
3. 5:30–6:30: `validatePair` (F.1.1/P.1.1) and `preserveRequest` (F.1.2/P.1.2), with docstrings and IF.01 fields. The private validation-result handoff is an in-process browser value, not a new public HTTP call.
4. 6:30–7:15: the test cases and an actual green Actions run for the video commit, especially Node tests within the Verify and publish workflow. The existing tests.yml checks the Python evidence component; it is not the only test job.
5. 7:15–8:00: `docs/route-table.md`: Compare stocks → UC.1 → F.1–F.5. `contracts/api-v1.yaml`: F.1.1 validate-pair produces PairValidationResult, and F.1.2 preserve-context consumes it. These are implemented optional Python endpoints; the static product uses the corresponding in-process JavaScript calls. `docs/request-contract.md` documents both routes and the internal handoff. Do not claim the hosted page makes Python HTTP calls.
6. 8:00–9:00: native SYS-F-01 and the P.1 component specification: DR-01/02, P1-IN-01/02, P1-OUT-01 and P1-IF-01 in document 290950. Show their shall statements, IF.01 handoff and P.1 satisfaction allocations. Repository mirror: docs/p1-component-specification.md.
7. 9:00–10:00: SWR-05 (290908) → P1-NF-01 (308649), satisfied by P.1 (290841). Explain equivalence: common analysis date, request identity and applied configuration identity keep the same values and zero-mismatch criterion at IF.01. Show the native derives/satisfied-by links and the actual IF.01 fields. The named test_P1_NF_01_context_equivalence in tests/test_functional_requirements.py interleaves accepted requests. Full SWR-05 still spans F.2–F.5.

## Other available functions

The integrated page also executes F.2 evidence checks, F.3 average-tie rank scoring and driver selection, F.4 synthetic explanation checks, and F.5 display/service-state history. Advanced options exercise missing core evidence, unavailable news and invalid/unavailable synthetic explanations. These support follow-up questions; do not try to explain every case in the five-minute slot.

The external market/news providers and AI service remain unconnected. Synthetic checked templates are explicitly labelled. Provider/calendar review, end-to-end performance and human MOEs remain separate acceptance work.

## Individual work and dates

On-campus demo: November 4. Team video: November 11. Afternoon LEC003 reviews the other three afternoon teams. Each student completes three specific peer-review sheets independently; written answers must be their own. The AM rotation schedule does not apply to LEC003.
