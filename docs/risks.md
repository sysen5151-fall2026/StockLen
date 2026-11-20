# StockLens system risks

The [RA-06 Risk Diagram](https://cloud.innoslate.com/cornell/p/659/diagrams/risk/319226) records the five risks carried forward from System Requirements Definition. [UC.1](https://cloud.innoslate.com/cornell/p/659/diagrams/activity/185145) and the [F.0 IDEF0](https://cloud.innoslate.com/cornell/p/659/diagrams/idef0/264782) identify the interactions below.

| Risk | Fault and effect | Model trace | L | Schedule | Technical | Cost | Impact | Score | Control |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| R-01 | Incomplete or misaligned prices can produce a misleading comparison. | F.2/P.2, IO.07/08, IF.02, F.3, SR-01/03 | 2 | 2 | 5 | 2 | 5 | 10 | Validate the dated price window before releasing results. |
| R-02 | A well-formed model response can change a score, driver or source and mislead a user. | F.4.2/P.4.2, IO.09, IF.03/04, F.5, SR-02/03 | 4 | 2 | 5 | 2 | 5 | 20 | Verify response claims against the accepted package. Preserve the calculated comparison when the explanation fails. |
| R-03 | A provider is late, unavailable or restricts use of its output. The user loses evidence or waits beyond the target. | F.2/P.2, F.4/P.4, IO.03/04/05/07/08/09, SR-03/04/07 | 3 | 3 | 4 | 3 | 4 | 12 | Bound the wait and preserve the stated distinction between missing core prices and limited news. |
| R-04 | A response schema changes or a dependency is abandoned. A stale implementation can break interface conformance. | P.0, IF.01–04, IO.09, SR-01/04/05 | 3 | 3 | 4 | 2 | 4 | 12 | Version the schema and dependencies, then run conformance and failure tests on changes. |
| R-05 | Untrusted source text enters the model request or data leaves through an unintended path. | F.4.1/P.4.1, IF.03, IO.05, SR-08/02/03 | 2 | 2 | 5 | 2 | 5 | 10 | Use the request field allowlist, separate authentication and check the outbound destination. |

Ratings use the five-level Chapter 12 scale for one integration and demonstration cycle. Overall impact is the largest schedule, technical or cost impact. The numeric score is likelihood times overall impact. The native diagram displays the corresponding likelihood and consequence cells.

## R-02 handling and verification

F.4.2 checks the returned context, scores, drivers and sources against the accepted package in [system.mjs](../pmc2/browser/system.mjs). F.5 displays the calculated results with a limitation when the explanation fails. The controlled test covers a valid response, a changed score, unavailable response, changed date, changed driver, unknown source and missing scores.

Run `node --test tests/explanation-guardrail.test.mjs` from the repository root.

At integration review, record the checked contract version, the number of wrong explanations accepted, fallback status and whether the calculated results stayed intact. Require zero incorrect outputs accepted in the controlled cases before demonstration. Repeat the checks with a runtime service when it is connected. The controlled browser uses synthetic evidence and a checked template.

The [local inference path](../pmc2/browser/local-explanation.mjs) also checks the model's leading-factor selection. The [runtime tests](../tests/local-explanation.test.mjs) verify a valid response, incorrect factor, changed score, and an unavailable service. Each failure preserves the calculated comparison and produces the limitation state.
