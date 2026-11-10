# P.1 Request Management component specification

P.1 performs F.1, Accept and Validate Comparison Request, for UC.1. Its leaf mechanisms are P.1.1 Eligibility Validation Module and P.1.2 Request Context Module. These requirements refine the existing system and functional baseline; they introduce no provider, scoring or performance scope.

Native document: [StockLens Other Leaf Requirements](https://cloud.innoslate.com/cornell/p/659/documents/290950). Existing DR-01 and DR-02 remain unchanged. P1-prefixed requirements distinguish this component from the existing P.2 CR requirements.

| ID | Type | Requirement | Upstream and boundary | Verification |
|---|---|---|---|---|
| DR-01 | Function | P.1.1 Eligibility Validation Module shall validate the submitted pair against the configured stock universe and reject duplicate or ineligible symbols. | SYS-F-01; F.1.1 / P.1.1 | test_DR_01_pair_eligibility |
| DR-02 | Function | P.1.2 Request Context Module shall preserve the validated pair, common analysis date and request identity in IF.01. | SYS-F-01; F.1.2 / P.1.2 | test_DR_02_preserved_context |
| P1-IN-01 | Input | The P.1 Request Management Subsystem shall accept the submitted stock pair and common analysis date from IO.01 for validation. | SYS-IN-01, SYS-F-01; IO.01 | test_P1_IN_01_request_input |
| P1-IN-02 | Input and control | The P.1 Request Management Subsystem shall accept IO.10 Research Configuration with the eligible stock universe and applied configuration identity. | SYS-IN-05, SYS-IF-05; IO.10 | test_P1_IN_02_configuration_input |
| P1-OUT-01 | Output | The P.1 Request Management Subsystem shall release IF.01 with the validated pair, common analysis date, request identity and applied configuration identity only after request validation succeeds. | SYS-F-01, DR-01/02; IF.01 | test_P1_OUT_01_accepted_context |
| P1-IF-01 | Interface | The P.1 Request Management Subsystem shall provide IF.01 to P.2 through the request interface without changing its accepted pair, analysis date, request identity or configuration identity. | SYS-F-01, DR-02; P.1 to P.2 | test_P1_IF_01_P2_handoff |
| P1-NF-01 | System-wide flow-down | The P.1 Request Management Subsystem shall preserve the accepted common analysis date, request identity and applied configuration identity unchanged in each IF.01 handoff. | SWR-05 by equivalence | test_P1_NF_01_context_equivalence |

All named Python tests are in `tests/test_functional_requirements.py`. Corresponding browser checks are in `tests/comparison.test.mjs`. The interface test passes an actual accepted IF.01 into F.2.1 and compares each field. The consistency test interleaves two requests and checks zero mismatches.

## ICOM allocation

| Function | Input | Control | Output | Mechanism and code |
|---|---|---|---|---|
| F.1.1 | IO.01 symbol pair | IO.10 frozen eligible universe | LF.01 PairValidationResult | P.1.1; pmc2/request.py::validate_pair; pmc2/browser/system.mjs::validatePair |
| F.1.2 | LF.01 plus common date and request identity | IO.10 configuration identity; available snapshot | IF.01 context or explicit rejection | P.1.2; pmc2/request.py::preserve_request; pmc2/browser/system.mjs::preserveRequest |

LF.01 is internal to P.1 and is not a new system-boundary requirement. Its contract is PairValidationResult in `contracts/api-v1.yaml`; the F.1.1 response and F.1.2 `pair_result` input use the same schema. The logical operations are optional local Python endpoints; GitHub Pages invokes the JavaScript functions in-process.

## SWR-05 allocation

SWR-05 requires common analysis date, request identity and applied configuration identity across acquisition, scoring, explanation and presentation. P1-NF-01 takes the same three fields and the same zero-mismatch obligation at the P.1/IF.01 boundary. This is **equivalence**: values and criterion remain unchanged, without a numerical budget or a different derived measure. P1-NF-01 derives SWR-05 and is satisfied by P.1 in the native model. This local contribution does not alone verify F.2–F.5 or stakeholder acceptance.

## Controlled configuration

The current build binds the IO.10 universe to the imported ten-stock UNIVERSE constant, with configuration ID `v0.1-pmc2-synthetic-1`. Its data package supports analysis date `2026-09-21`. F.1.1 receives symbols explicitly; F.1.2 receives date, request ID and configuration explicitly. An unsupported configuration/date is rejected, not silently relabelled. No claim of arbitrary live configurations is made.


## Native entity register

| Requirement | Native entity | Allocation |
|---|---|---|
| P1-IN-01 | 308645 | satisfied by P.1 290841 |
| P1-IN-02 | 308646 | satisfied by P.1 290841 |
| P1-OUT-01 | 308647 | satisfied by P.1 290841 |
| P1-IF-01 | 308648 | satisfied by P.1 290841 |
| P1-NF-01 | 308649 | derives SWR-05 290908; satisfied by P.1 290841 |

The clauses are stored in the existing native leaf-requirements document 290950 with their verification rationale. Their numbers do not replace DR-01/02 or the P.2 component CRs. New native requirements retain Draft status; an allocation relationship is not an independently approved acceptance verdict.
