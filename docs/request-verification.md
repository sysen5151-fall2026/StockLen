# Request test verification

DR-01 and DR-02 remain the same two tests, now in `tests/test_functional_requirements.py` under `RequestRequirements`. All existing F.2 `EvidenceRequirements` methods are retained. The old `tests/test_request_requirements.py` has been removed to avoid duplicate discovery.

Local checks on 2026-11-09:

- `python -m unittest discover -s tests -v`: 26 tests passed.
- `node --test tests/*.test.mjs`: 14 tests passed.
- `python scripts/check_pmc2_http.py`: F.1 and F.2 HTTP checks passed.

The existing `.github/workflows/tests.yml` runs the Python discovery and HTTP checks. `.github/workflows/pages.yml` also runs Python discovery and the browser tests. Inspect their run for the resulting commit rather than treating an earlier green run as evidence for this change.

This relocation changes neither runtime behavior nor native Innoslate requirements. It does not constitute stakeholder acceptance or live-provider verification.

## P.1 component completion

Five native component requirements now supplement unchanged DR-01/DR-02: P1-IN-01/02, P1-OUT-01, P1-IF-01 and P1-NF-01. P1-NF-01 derives SWR-05 by equivalence and is satisfied by P.1. The full statement and zero-mismatch method are retained in the native Rationale and in p1-component-specification.md.

Local checks: 31 Python tests, 15 Node tests and F.1/F.2 HTTP checks passed. The new tests check actual IF.01-to-F.2.1 transfer and two independently interleaved contexts. Original DR-01/02 assertions and all F.2 tests remain unchanged. DR-01/02 docstrings now quote the full native shall statements. ICOM docstrings now name inputs, control binding, outputs and mechanisms; public signatures and runtime behavior are unchanged.
