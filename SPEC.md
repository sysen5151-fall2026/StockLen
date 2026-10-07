# SPEC — StockLens

## Needs and Acceptance Criteria

N-01–N-08 and SR-01–SR-08 below are transcribed from our submitted report, Tables 7–8. Acceptance criteria are transcribed from Tables 11–12 and remain proposed, as in the report. Only PDF line wrapping is normalized. [Source and exact-text record](model-artifacts/submitted-baseline.json).

### N-01
I need to compare two stocks on a common analysis date using a consistent indicator basis.

**Traces to SR-01:** StockLens shall display a comparison of two eligible stocks using a common analysis date and the same documented indicator and scoring configuration.

**Acceptance criterion:** MOE-01: ≥80% unassisted correct completion of the agreed comparison task. Conformance check: both stocks are eligible and use the same analysis date and documented indicator/scoring configuration.

**Model:** UC.1 (185145)
**Current evidence:** Fixed fixture only; no eligible-universe/scoring or user-task acceptance.

### N-02
I need to understand a displayed ranking through the computed drivers that explain the difference between the stocks.

**Traces to SR-02:** StockLens shall provide an explanation of each displayed ranking that identifies the ranking’s main computed drivers and their corresponding indicator values.

**Acceptance criterion:** MOE-02: ≥80% correctly identify both requested drivers without assistance. Conformance check: every explanation in the assessment set identifies the selected computed drivers and their correct values, with no contradiction of the score breakdown.

**Model:** UC.1.6 (186309); UC.1.7 (186503)
**Current evidence:** Fixed explanation only; computed driver values and comprehension evidence pending.

### N-03
I need inspectable, dated evidence for the news claims used in my stock comparison.

**Traces to SR-03:** StockLens shall associate each displayed news claim with an inspectable supporting source identifier and publication date, alongside the analysis and market-data dates for the comparison.

**Acceptance criterion:** MOE-03: ≥80% locate the requested supporting item and distinguish its publication date from the comparison’s analysis and market-data dates without assistance. Conformance check: every news claim in the assessment set has an inspectable source that supports the claim and the required date information.

**Model:** UC.1.7 (186503)
**Current evidence:** Fictional source displayed; real claim support and user-task evidence pending.

### N-04
We need an agreed core research workflow that our team can deliver within its available time, skills and service resources.

**Traces to SR-04:** The StockLens project shall deliver an executable instance of the agreed UC.1 research workflow within the time and service-resource limits recorded in the demonstration baseline.

**Acceptance criterion:** MOE-04: pass only when the agreed UC.1 workflow executes in the documented environment within confirmed time and service-resource limits. Undefined limits make it not assessable, rather than satisfied.

**Model:** UC.1 (185145); A-04 (219105)
**Current evidence:** HTTP skeleton runs; approved time/service-resource limits pending.

### N-05
I need a traceable account of how each stakeholder requirement follows from a need and is supported by model and assessment evidence.

**Traces to SR-05:** The StockLens project shall maintain a traceability record for each stakeholder requirement identifying its originating need, related model entities, validation method and evidence status.

**Acceptance criterion:** MOE-05: 100% of the current eight requirements have correct need links, related model entities, a validation method and an explicit evidence status. Recalculate the denominator if the baseline changes.

**Model:** A-05 (216873)
**Current evidence:** All eight records mapped here; live model and independent inspection pending.

### N-06
I need continuity of operation through instructions that another team member can follow without the original author’s undocumented knowledge.

**Traces to SR-06:** The StockLens project shall provide an operating and transition guide enabling a team member other than its author to start, run and shut down the demonstration and carry out the documented handover or retirement procedure without undocumented instructions.

**Acceptance criterion:** MOE-06: pass only when a member other than the guide’s author completes startup, the demonstration, shutdown and the selected documented handover or retirement procedure without undocumented instructions.

**Model:** A-06 (217607)
**Current evidence:** Operating instructions available; independent transition exercise pending.

### N-07
We need the project’s use of our services and content to remain within the conditions applicable to the selected access arrangements.

**Traces to SR-07:** The StockLens project shall conduct its use of each selected market-data and news service in accordance with the applicable access, retention and display conditions identified in its dated service-use record.

**Acceptance criterion:** MOE-07: 100% provider coverage, with no unresolved discrepancy between applicable conditions and observed access, retention or display in the assessment scope. A conditions register alone does not pass.

**Model:** A-07 (217608)
**Current evidence:** Only fictional stubs; no selected-provider actual-use assessment.

### N-08
We need the analysis request to contain only the inputs agreed for that task through the approved service access.

**Traces to SR-08:** StockLens shall restrict AI analysis-request content to the approved field schema, excluding credentials and unnecessary personal information from that content.

**Acceptance criterion:** MOE-08: 100% of requests in the recorded set conform to the approved schema, with no credentials or unnecessary personal information in analysis content. Approved service access is a separate prerequisite for assessing N-08; content conformance alone does not close its access-coverage item.

**Model:** A-08 (217609)
**Current evidence:** No approved schema or executable content gate; request assessment pending.

## Scope for Milestone 1

Our local UC.1 demonstration uses fixed, fictional market, news, ranking and explanation stubs. It demonstrates participant wiring, not satisfaction of the eight stakeholder requirements. The future product remains a research-only comparison service for up to 100 predefined U.S. stocks with daily observations. Trading, order execution, personalized portfolio management and intraday support remain outside scope.

Real provider access, real scoring and real AI remain unimplemented in this skeleton; they are not deleted from the submitted requirements. The separate historical research interface remains an exploratory illustration and is not acceptance evidence.

## Data Contract

[Emerging system functional candidates](requirements/FUNCTIONAL-CANDIDATES.md) derive five functions from the submitted UC.1. They await team review and native-model allocation; they do not replace the stakeholder baseline.

The [current fixture contract](docs/contracts.md) records the existing executable types, fields and fixed values. The production eligible universe, scoring configuration, source conditions and missing/stale-input rules still require the confirmations stated in report Section 3.1. No new numerical limits are introduced here.

## Model Response Contract

The internal AI Explanation Module coordinates the existing score/evidence payload with external X.04. X.04 returns the existing fixed explanation object. This is an observed stub contract, not the approved production schema. A-08 request checking, pass/fail behavior and approved access remain open as recorded in report Section 4.1.

## Verification and Validation

[Traceability](requirements/TRACEABILITY.md) separates code checks from the report’s acceptance methods. [Verification](docs/verification.md) records actual runs. Requirement acceptance tests remain red until the team retains the required evidence; passing the skeleton checks does not pass MOE-01–MOE-08. See [open items](docs/milestone-1-status.md).
