# Request test verification

DR-01 and DR-02 remain the same two tests, now in `tests/test_functional_requirements.py` under `RequestRequirements`. All existing F.2 `EvidenceRequirements` methods are retained. The old `tests/test_request_requirements.py` has been removed to avoid duplicate discovery.

Local checks on 2026-11-09:

- `python -m unittest discover -s tests -v`: 26 tests passed.
- `node --test tests/*.test.mjs`: 14 tests passed.
- `python scripts/check_pmc2_http.py`: F.1 and F.2 HTTP checks passed.

The existing `.github/workflows/tests.yml` runs the Python discovery and HTTP checks. `.github/workflows/pages.yml` also runs Python discovery and the browser tests. Inspect their run for the resulting commit rather than treating an earlier green run as evidence for this change.

This relocation changes neither runtime behavior nor native Innoslate requirements. It does not constitute stakeholder acceptance or live-provider verification.
