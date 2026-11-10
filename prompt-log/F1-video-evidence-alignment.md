# DR-01 and DR-02 test relocation

RequestRequirements.test_DR_01_pair_eligibility and test_DR_02_preserved_context are in tests/test_functional_requirements.py. Both original assertion bodies and all EvidenceRequirements F.2 tests are retained. Their docstrings quote the native shall statements. The old tests/test_request_requirements.py is absent, preventing duplicate discovery.

Both CI workflows use unittest discovery. docs/traceability.md and docs/request-contract.md map the tests to pmc2/request.py; browser checks are separately mapped to tests/comparison.test.mjs and pmc2/browser/system.mjs.
