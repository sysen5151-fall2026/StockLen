# StockLens Demo

Updated controlled product demo: maximum drawdown, normalized price comparison, and a two-column news panel.

## Open online

https://sysen5151-fall2026.github.io/StockLen/demo/

## OpsCon diagram (Innoslate)

[StockLens Universe Context (OpsCon / SCD)](https://cloud.innoslate.com/cornell/p/659/diagrams/asset/199029)

System context diagram showing StockLens, the Research User, Market Data Provider, News Provider, AI Model Service, and System Maintainer. Requires an Innoslate account with access to project 659.

## Run

Download `index.html` and open it in a modern browser. Everything needed for the comparison is bundled into this file; no API key or installation is required.

Alternatively, from the repository root:

```sh
python -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080/demo/ and click **Compare stocks**.

## Try it

- AAPL / MSFT, analysis date 2026-09-21: compare scores, maximum drawdown and indexed price paths (both start at 100).
- Expand the price table to inspect all 21 observations.
- Inspect each fictional news source record.
- Under controlled options, choose **No qualifying news** or **Incorrect synthetic response** to inspect limited results.

## Scope

Synthetic prices and fictional news only. No live market, news or AI APIs. The original 50/50 momentum and low-volatility scoring is unchanged. Drawdown and chart views are descriptive and do not enter the score. The existing rising price fixture produces zero maximum drawdown; this is not a claim of zero risk. News does not establish a causal relationship with price changes.

The file bundles the existing evidence and comparison modules plus the new presentation helpers. This demo is separate from the existing deployed comparison page.
