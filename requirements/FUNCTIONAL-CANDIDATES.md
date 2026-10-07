# Emerging system functional requirements

Milestone 1 requests emerging system-level functions. These are proposed derivations from the submitted UC.1 and SR-01-SR-03, not approved requirements or new Innoslate entities. CF identifiers are local candidate labels. Team review must assign approved identifiers and allocate them in the native model before baselining.

| Candidate | Proposed statement | Derivation / model action | Current implementation and evidence | Open baseline decision |
|---|---|---|---|---|
| CF-01 | StockLens shall receive a two-stock comparison request with a common analysis date from the dashboard. | SR-01; UC.1.1-UC.1.2 | frontend/index.html, POST /compare; HTTP smoke check | Eligibility and invalid-request behavior |
| CF-02 | StockLens shall request market observations and dated news evidence for the requested comparison through their respective interfaces. | SR-01, SR-03; UC.1.3-UC.1.4.2 | Separate market/news participants; ordered unit check | Providers, observation windows, stale/missing data behavior |
| CF-03 | StockLens shall calculate both stocks' scores using the same documented indicator and scoring configuration and retain the corresponding driver values. | SR-01, SR-02; UC.1.5 | Fixed ranking stub only; no production calculation evidence | Indicators, weights, normalization and driver selection |
| CF-04 | StockLens shall coordinate an explanation request to X.04 using the computed score and evidence package while retaining ownership of the ranking. | SR-02; UC.1.6; BMA 3.2.4 | ai_explanation_module -> ai_model_service; boundary unit checks | Approved SR-08 schema, access and response controls |
| CF-05 | StockLens shall display the comparison, computed-driver explanation, source identifiers, publication dates, analysis date and market-data dates in the dashboard. | SR-01, SR-02, SR-03; UC.1.7 | Dashboard and fictional dated fixture; HTTP and browser/Python parity checks | Real source inspectability and user-task assessment |

SR-04-SR-07 remain project/lifecycle obligations in the stakeholder traceability register. SR-08 is a content-control obligation whose schema and pass/fail behavior are explicitly open. They are not silently converted into nominal UC.1 actions.

Review record: reviewer/date/disposition and native model allocation pending. Fixed stubs demonstrate participant wiring only; CF-02-CF-05 production behavior is not verified by passing fixture checks.
