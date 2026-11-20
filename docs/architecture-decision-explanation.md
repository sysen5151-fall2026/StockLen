# ADR-01: Run the controlled explanation model locally

StockLens preserves the F.1–F.5 scoring baseline and uses local inference by default on the comparison page. The decision is whether this explanation path should run on the application host or cross a provider API boundary. Both options take the approved F.4 package from IO.05 and check IO.09 before sending IF.04 to F.5. See [TD-01 in Innoslate](https://cloud.innoslate.com/cornell/p/659/diagrams/asset/319237).

| Measure | A. Same host | B. Hosted API topology |
| --- | ---: | ---: |
| External model recipients in the deployment design | 0 | 1 |
| Inference runtimes managed by the team | 1 | 0 in a managed deployment |
| Four-week inference cash scenario | USD 0 with existing compute | USD 0.06 in estimated token charges |
| Checked results in a controlled 20-run replay | 20 | 20 |
| P95 at the checked result boundary | 2.384 ms | 5.047 ms with a loopback provider fixture |

Select A. Under the stated cost scenario the swing scores are 65 and 49.955. A avoids sending the evidence to another organization and adds one runtime responsibility. B would require a managed endpoint, approved terms, server-side credentials, spending limits and network failure handling.

A runs a nearest-centroid classifier fitted to six labeled contribution-difference examples. Its output selects the leading factor. F.4 accepts the selection only when it matches the scored factors and the rest of the response matches the authorized package. F.5 preserves the calculated comparison if the response is missing or wrong. The model works with synthetic records and can be run from the repository root with Node 24:

```sh
node scripts/local-explanation.mjs AAPL MSFT
node --test tests/local-explanation.test.mjs tests/explanation-guardrail.test.mjs
node scripts/benchmark-explanation.mjs
```

See [individual measurements](explanation-benchmark.json). The benchmark compares local inference against the same model behind a separate process and an HTTP fixture on loopback. It measures the checked IO.02 result object. It supplies no cloud latency, vendor price, browser-rendering time, or real-market performance evidence.

B uses the [GPT-6 Luna standard list price](https://developers.openai.com/api/docs/models/gpt-6-luna), checked November 20, 2026: USD 0.10 per million input tokens and USD 0.50 per million output tokens. The budget allows 2,500 input and 1,000 output tokens per attempt, including model instructions and response overhead. At 80 attempts, the resulting inference allowance is USD 0.06. This estimate excludes a separately billed adapter, market and news services, taxes, and retries. It assumes these resources are provided within the recorded demonstration budget. No paid hosted request was made.

The comparison page test uses the actual form handler with a lightweight DOM harness to check the default model, incorrect-response fallback, and unavailable-response fallback. Run `node --test tests/compare-page-explanation.test.mjs`.
