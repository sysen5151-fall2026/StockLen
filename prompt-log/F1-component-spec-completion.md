# F.1 component specification completion

## LOCATE
User requests full compliance with the three-part video requirements and authorizes filling missing project material. Native sources: F.1 269034, F.1.1 269043, F.1.2 269044, P.1 290841, DR-01/02, SYS-F-01, SYS-IN-01, SYS-IN-05, SYS-IF-01/05, SWR-05. Lab Manual Chapter 9 requires component input/output/interface/functional requirements and system-wide flow-down.

## EXTRACT
P.1 receives IO.01 stock pair/date and IO.10 configuration; generates IF.01 for P.2. LF.01 is internal. DR-01 validates eligibility; DR-02 preserves pair/date/identity. SWR-05 preserves date/request/config identity across stages. Existing code uses a frozen ten-symbol universe and one synthetic date; no new budgets or services are required.

## CONSTRAIN
Retain original DR IDs and F.2 tests. New P.1 clauses are derived refinements of observed boundary/system requirements, not invented stakeholder needs. Use P1-prefixed IDs to avoid collisions with P.2 CR IDs; record native IDs only after creation. No dependencies, external providers or scoring changes. Native changes limited to P.1 requirement specification and explicit parent/satisfaction relationships.

## PROMPT
Complete P.1 component boundary requirements and SWR-05 equivalence flow-down in the native model and technical repository record. Expand ICOM docstrings. Add requirement-named tests of input/output/context/interface clauses in the canonical file and equivalent browser coverage. Update traceability and optional presentation materials. Run existing suites and inspect CI for the exact new commit. Refresh the recording guide with real current screenshots.

## GENERATE
See commit diff and native component specification.

## REVIEW AND RECONCILE
Final results recorded in docs/request-verification.md; no live-provider or stakeholder-acceptance claim follows from controlled tests.
