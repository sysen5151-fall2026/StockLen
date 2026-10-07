# ADR 0002 — Split providers; separate Pages illustration from local API

Status: implemented design decision, pending human team review. Date: 2026-09-24.

The revised UC.1 uses X.02, X.03 and X.04. The earlier aggregate external_api module disagreed with that baseline. Replace it with three named stub modules and retain StockLens ownership of scoring. Both dated source records reach the explanation payload.

User requested free github.io hosting in the existing SYSEN5151 repository. Publish website/ as static Pages content. Keep the FastAPI skeleton locally runnable; a JavaScript mirror supports the public nominal demo, checked for fixture parity. Pages does not execute walking_skeleton/backend/main.py. This is a deployment difference, not an added model actor.

The migrated historical site contains editable weights, 2–5 stock selection, template explanations and later outcome views. These exceed the Chapter 2 fixed-stub slice and are explicitly exploratory. Data provenance is incomplete. Hide outcome paths as well as later returns until reveal; the scoring function ignores outcome fields. Formula documentation uses inverse-normalized volatility, matching code.

The alternative of pretending Pages hosts FastAPI was rejected. Live data/AI hosting is deferred until the relevant increment and provider access are specified. No paid service or domain is purchased.
