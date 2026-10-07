# Current walking-skeleton contracts

These describe the existing executable fixture. They do not replace the submitted requirements or constitute an approved production schema.

## User and HTTP boundary

`GET /` serves the comparison form. `POST /compare` accepts a JSON object with `stock_a`, `stock_b`, `analysis_date`, all strings. The HTML uses a date input; the backend currently checks types, not date semantics or universe eligibility. FastAPI's existing request validation is transport behavior, not a claimed stakeholder acceptance rule.

The internal query is `{"stock_pair": [stock_a, stock_b], "analysis_date": analysis_date}`. The response retains it under `requested_query` and separately returns `ranking`, `explanation`, and `mode: "walking-skeleton-fixed-fixture"`.

## External participant stubs

| Participant | Input | Output |
|---|---|---|
| X.02 Market Data Provider | Internal query | `fixture: true`, `stock_pair: ["DEMO_A", "DEMO_B"]`, `analysis_date` and `observation_date: "2026-09-18"`, `market_bars` containing symbol/close pairs 100.0 and 80.0 |
| X.03 News Provider | Same internal query | List containing `id: "FIXTURE-01"`, `published_at: "2026-09-18"`, fictional title and excerpt |
| X.04 AI Model Service | Existing ranking/evidence dictionary | `fixture: true`, fixed `text`, `source_ids: ["FIXTURE-01"]` |

The fixture's close values are illustrative numbers, not verified prices; no production currency, source or accuracy is asserted. The dates use ISO date strings. All requests return the same fixture, and changing a query must not relabel fictional data as a real result.

## Internal AI Explanation Module

StockLens combines provider outputs and returns fixed scores of 60.0 and 40.0 with the label `Fixed demonstration factor`. The ranking/evidence dictionary contains `fixture`, `stock_pair`, `analysis_date`, `observation_date`, `scores`, and `sources`. The internal coordinator forwards this dictionary to external X.04 and returns its response. It neither computes nor changes the ranking.

No score formula, actual indicator values, approved payload field list or rejection policy is established by this stub. A-08 input gating, missing/stale-source treatment and malformed AI response handling require the model/schema decisions already identified in submitted report Sections 3.1 and 4.1. Do not mark SR-08 as satisfied by pass-through coordination.

## Production contracts still open

Confirm eligible stocks, factor definitions, normalization/weights, driver selection, missing/stale-input rules, providers/conditions, permitted AI fields and access, and pass/fail/rejection behavior. Retain their approved versions and native-model updates before implementing those decisions. No additional numerical or timing target is invented in this increment.
