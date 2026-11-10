# Request-validation component interfaces

The browser executes F.1 locally. The static page uses in-process JavaScript calls. Matching optional Python HTTP endpoints are implemented in `pmc2/request.py` and the local backend: POST `/internal/f1/validate-pair` and POST `/internal/f1/preserve-context`. `contracts/api-v1.yaml` defines these operations and the shared PairValidationResult handoff, alongside the existing F.2 interfaces. The browser does not call the optional HTTP transport.

| Function / asset | Input and control | Output | Implementation |
|---|---|---|---|
| F.1.1 / P.1.1 | IO.01 first/second symbols; frozen ten-symbol universe from IO.10 | Validation result: normalized stock_pair, valid boolean, reason | `validatePair(stockA, stockB)` |
| F.1.2 / P.1.2 | Validated pair; analysisDate and requestId; versioned configuration | Accepted IF.01 context or explicit rejection | `preserveRequest(pairResult, analysisDate, requestId, configuration)` |

## Internal handoff

`validatePair` outputs `{valid, reason, stock_pair}`. `preserveRequest` consumes that exact value. An invalid result cannot create an accepted IF.01 request. The output preserves the normalized pair and accepted date and identifies the same request/configuration used by F.2–F.5.

```json
{
  "accepted": true,
  "reason": null,
  "request": {
    "request_id": "comparison-identifier",
    "stock_pair": ["AAPL", "MSFT"],
    "analysis_date": "2026-09-21",
    "configuration_id": "v0.1-pmc2-synthetic-1"
  }
}
```

An invalid pair returns `accepted: false`, a reason, and `request: null`. Duplicate symbols and outside-universe symbols are distinguished. Symbols are trimmed and uppercased before checking. This synthetic data package supplies only the 2026-09-21 snapshot; other dates are rejected as unsupported, rather than being relabelled as the available fixture date.

DR-01/DR-02 Python checks are `RequestRequirements.test_DR_01_pair_eligibility` and `RequestRequirements.test_DR_02_preserved_context` in `tests/test_functional_requirements.py`. The corresponding browser checks are in `tests/comparison.test.mjs`. This component contributes to SYS-F-01, SYS-IN-01 and SWR-05; its local field checks do not establish complete upstream user-task or end-to-end acceptance. Native F.1 children are 269043 and 269044 under 269034. The implementation uses the existing model identifiers and does not introduce a duplicate native requirement or flow ID for a browser value.
