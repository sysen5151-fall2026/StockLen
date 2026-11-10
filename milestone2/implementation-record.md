# Milestone 2 implementation record

F.1 accepts and validates a comparison request. pmc2/request.py and pmc2/browser/system.mjs implement eligibility validation and accepted-context preservation. F.2 uses pmc2/acquisition.py and pmc2/validation.py to build provider queries and validate returned evidence.

The browser comparison continues through F.3 average-tie rank scoring and driver attribution, F.4 synthetic explanation validation, and F.5 presentation/status. The v0.1 calculation uses 21 adjusted closes, 20 simple returns, a frozen ten-stock universe and equal factor weights. News supports explanations and does not change scores.

The controlled workflow uses synthetic data and no external provider or AI service. Failure cases block ranking for invalid core evidence; unavailable or rejected explanation retains authoritative scores. Request, date and configuration identifiers remain associated with the same comparison.

Verification maps are in docs/traceability.md, contracts/api-v1.yaml and tests/test_functional_requirements.py. The component requirements and SWR-05 allocation are in docs/p1-component-specification.md.
