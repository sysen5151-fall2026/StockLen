# Function → requirement → code → test (Chapter 5 / PMC2)

Source: [submitted baseline and model observations](pmc2-baseline.md). Test file: `tests/test_functional_requirements.py`, class `EvidenceRequirements`. Every `test_…` below is in that file. Run `python -m unittest discover -s tests -v`. A test proves only the stated controlled scope, not the whole upstream obligation. One row per system-level functional requirement is retained, including gaps.

| Requirement | Function | Module / callable | Test name | Evidence scope |
|---|---|---|---|---|
| SYS-F-01 | F.1 | — | — | Not implemented by PMC2; duplicate/outside pair guard is only a boundary precondition |
| SYS-F-02 | F.2 | pmc2/demo.py::run_demo | test_SYS_F_02_acquires_and_validates_dated_evidence | Controlled synthetic integration |
| SYS-F-03 | F.3 | — | — | Current v0.1 scoring not implemented in this repo |
| SYS-F-04 | F.4 | — | — | M1 fixed AI stub only; real grounded integration pending |
| SYS-F-05 | F.5 | — | — | F.2 evidence inspector only; full comparison and service-state integration pending |

## Selected F.2 leaf and component specification

N-01/N-03 → SR-01/SR-03 → SYS-F-02 (290910) → F.2 (269035). F.2.1 (269045) is performed by P.2.1; F.2.2 (269046) by P.2.2. The latter assets decompose P.2 (290840). LF.02 is the internal handoff, not an extra system boundary requirement.

| Requirement | Parent / flow | Function | Module path | Test name |
|---|---|---|---|---|
| DR-03 | SYS-F-02; SYS-OUT-02/03; SWR-05 | F.2.1 | `pmc2/acquisition.py::request_dated_records` | `test_DR_03_full_universe_and_pair_queries` |
| DR-04 | SYS-F-02; SYS-IN-02/03; SWR-01/05 | F.2.2 | `pmc2/validation.py::validate_evidence` | `test_DR_04_invalid_core_never_released` |
| CR-01 | SYS-IN-01 / IF.01 | F.2.1 | `pmc2/acquisition.py::request_dated_records` | `test_CR_01_accepts_request_context` |
| CR-02 | SYS-IN-02 / IO.07 | F.2.2 | `pmc2/validation.py::validate_evidence` | `test_CR_02_retains_market_fields` |
| CR-03 | SYS-IN-03 / IO.08 | F.2.2 | `pmc2/validation.py::validate_evidence` | `test_CR_03_excludes_unsupported_news` |
| CR-04 | SYS-IN-05 / IO.10 | F.2.2 | `pmc2/validation.py::validate_evidence` | `test_CR_04_rejects_configuration_drift` |
| CR-05 | SYS-OUT-02 / IO.03 | F.2.1 | `pmc2/acquisition.py::request_dated_records` | `test_CR_05_market_contract` |
| CR-06 | SYS-OUT-03 / IO.04 | F.2.1 | `pmc2/acquisition.py::request_dated_records` | `test_CR_06_news_contract_and_limit` |
| CR-07 | SYS-F-02 / IF.02 | F.2.2 | `pmc2/validation.py::validate_evidence` | `test_CR_07_valid_and_failed_envelopes` |
| CR-08 | SYS-IF-02 / IO.03↔IO.07 | F.2.2 | `pmc2/validation.py::validate_evidence` | `test_CR_08_market_query_response_association` |
| CR-09 | SYS-IF-03 / IO.04↔IO.08 | F.2.2 | `pmc2/validation.py::validate_evidence` | `test_CR_09_news_query_response_association` |
| CR-10 | SWR-01 / distinct dates, equivalence | F.2.2 | `pmc2/validation.py::validate_evidence` | `test_CR_10_preserves_distinct_dates_and_sources` |
| CR-11 | SWR-02 / local provider gate only | F.2.1 | `pmc2/acquisition.py::request_dated_records` | `test_CR_11_unreviewed_provider_blocked` |
| CR-13 | SYS-IN-01 / P.1↔P.2 | F.2.1 | `pmc2/acquisition.py::request_dated_records` | `test_CR_13_preserves_P1_boundary` |
| CR-14 | SYS-F-02 / P.2→P.3 | F.2.2 | `pmc2/validation.py::validate_evidence` | `test_CR_14_P3_receives_only_checked_core` |
| CR-15 | SYS-IF-05 / configuration conduit | F.2.2 | `pmc2/validation.py::validate_evidence` | `test_CR_15_both_modules_use_frozen_configuration` |
| CR-16 | SWR-04 / AI independence, synthesis | F.2.2 | `pmc2/validation.py::validate_evidence` | `test_CR_16_evidence_decision_has_no_AI_dependency` |
| CR-17 | SWR-05 / LF.02 + IF.02 | F.2.2 | `pmc2/validation.py::validate_evidence` | `test_CR_17_interleaved_requests_preserve_identity` |

CR-12 is allocated to P.4 and is outside this component. CR-11's test only checks that unreviewed adapters are disabled; no real provider terms, retention or display compliance is claimed. CR-16's F.2 implementation has no AI parameter or service dependency; preserving actual computed scores through P.3–P.5 is still an integration obligation. SYS-F-01/03/04/05 remain gaps, not passing rows. Original stakeholder acceptance records remain in `requirements/TRACEABILITY.md`.

## ICOM and interface map

| Function | Inputs / controls | Outputs | Mechanism |
|---|---|---|---|
| F.2.1 | IF.01 accepted request; IO.10 frozen config | IO.03 full-universe market query; IO.04 pair news query; LF.02 context | P.2.1 Provider Acquisition Module |
| F.2.2 | IO.07 market, IO.08 news, LF.02 context; IO.10 control | IF.02 accepted records or explicit failed envelope | P.2.2 Evidence Validation Module |

`contracts/api-v1.yaml` models the same `AcquisitionContext` as F.2.1 output and F.2.2 input. Responses remain boundary inputs; they are not disguised as the LF.02 internal flow.
