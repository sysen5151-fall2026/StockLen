# DR-01 and DR-02 test relocation

## LOCATE
User requests moving existing F.1 tests to tests/test_functional_requirements.py, retaining F.2 tests and checking the resulting commit CI. Sources: native DR-01 / DR-02, milestone2/README.md, docs/request-contract.md and existing tests.

## EXTRACT
RequestRequirements contains test_DR_01_pair_eligibility and test_DR_02_preserved_context. EvidenceRequirements contains F.2 tests. Both existing CI workflows use unittest discovery.

## CONSTRAIN
Keep the two F.1 test bodies and all F.2 tests unchanged. No runtime behavior, dependencies, requirements or workflows change. Remove the now-empty old file to avoid duplicate discovery.

## PROMPT
Move RequestRequirements and imports into the required test file. Remove tests/test_request_requirements.py. Align traceability, request-contract and milestone2 references. Run tests, review the diff and inspect resulting commit CI.

## GENERATE
See commit diff.

## REVIEW
Both F.1 method bodies and EvidenceRequirements retained unchanged. Local verification recorded in docs/request-verification.md.

## RECONCILE
The test location now matches the video instruction. Native component specification, explicit SWR-05 derivation and stakeholder acceptance remain separate.
