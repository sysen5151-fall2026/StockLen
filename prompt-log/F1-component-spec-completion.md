# F.1 component specification record

## Model basis
F.1 269034 decomposes into F.1.1 269043 and F.1.2 269044. P.1 290841 performs F.1 through P.1.1 and P.1.2. IO.01 supplies stock pair/date; IO.10 supplies configuration; IF.01 passes the accepted context to P.2; LF.01 is internal.

## Component requirements
DR-01/02 retain their existing responsibilities. P1-IN-01/02, P1-OUT-01, P1-IF-01 and P1-NF-01 are native entities 308645–308649, with Approved status. P1-NF-01 derives SWR-05 by equivalence and is satisfied by P.1.

## Verification
31 Python tests, 15 Node tests and F.1/F.2 HTTP checks passed. Public signatures and runtime behavior are unchanged. Tests and ICOM mapping are recorded in docs/p1-component-specification.md and docs/traceability.md.
