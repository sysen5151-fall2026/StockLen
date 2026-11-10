# StockLens F.1 — Group 29

## Accept and Validate Comparison Request

F.1 validates two distinct eligible symbols and preserves the accepted pair, analysis date, request identity and configuration identity in IF.01. Invalid input stops before evidence acquisition.

[Stock comparison](https://sysen5151-fall2026.github.io/StockLen/compare.html)

## Model views

| View | Link |
|---|---|
| First-level IDEF0 with mechanisms | https://cloud.innoslate.com/cornell/p/659/diagrams/idef0/264782 |
| F.1 second-level IDEF0 | https://cloud.innoslate.com/cornell/p/659/diagrams/idef0/269034 |
| F.1 function hierarchy | https://cloud.innoslate.com/cornell/p/659/diagrams/hierarchy/269034 |
| P.1 asset hierarchy | https://cloud.innoslate.com/cornell/p/659/diagrams/hierarchy/290841 |
| F.1.1 | https://cloud.innoslate.com/cornell/p/659/database/entity/269043 |
| F.1.2 | https://cloud.innoslate.com/cornell/p/659/database/entity/269044 |

## Functional decomposition

| Function | Software asset | Behavior |
|---|---|---|
| F.1.1 | P.1.1 Eligibility Validation Module | Normalizes symbols and rejects duplicate or ineligible symbols |
| F.1.2 | P.1.2 Request Context Module | Releases accepted IF.01 with preserved context |

## Controlled cases

| Pair | Date | Result |
|---|---|---|
| AAPL / MSFT | 2026-09-21 | Accepted IF.01 |
| AAPL / AAPL | 2026-09-21 | duplicate_symbols; no accepted request |
| OUTSIDE / MSFT | 2026-09-21 | ineligible_symbol; no accepted request |

The data package contains one synthetic snapshot and a ten-stock universe. The browser executes JavaScript in-process; the optional local Python endpoints provide HTTP transport. External market/news providers and AI services are not connected.

## Engineering evidence

- [Function, requirement, module and test trace](../docs/traceability.md)
- [Python ICOM implementation](../pmc2/request.py)
- [Browser implementation](../pmc2/browser/system.mjs)
- [Named F.1 and F.2 requirement tests](../tests/test_functional_requirements.py)
- [Internal flow contract](../contracts/api-v1.yaml)
- [Product entry points and use cases](../docs/route-table.md)
- [P.1 component specification](../docs/p1-component-specification.md)

SYS-F-01 is allocated to F.1. DR-01/02 define its leaf functions. P1-IN-01/02, P1-OUT-01 and P1-IF-01 define the P.1 boundary. P1-NF-01 derives from SWR-05 by equivalence: common date, request identity and configuration identity remain unchanged, with zero field mismatches at the IF.01 handoff.
