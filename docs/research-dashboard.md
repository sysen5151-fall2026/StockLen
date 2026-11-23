# Public news reaction workflow

Select a publication date and optional ticker and keyword to search the historical news feed. Select 2–100 stocks from the OEF universe and choose a return window. A single button generates the comparison and refreshes the news analysis. An already-available browser model can also generate its interpretation from that action. The website backend loads news, prices and volumes through a licensed Massive account. Visitors do not upload data.

The fixed universe is a snapshot of the November 20, 2026 iShares S&P 100 ETF equity holdings. Alphabet Class A is retained and Class C is omitted. Berkshire Class B uses display symbol BRK-B and provider symbol BRK.B. This research universe is fixed for every analysis date. [Holdings source](https://www.ishares.com/us/products/239723/ishares-s-p-100-etf/latest-holdings.csv)

SPY defines the window. Use the last trading close strictly before publication day and the first, third, or fifth trading close strictly after that day. The data are split-adjusted prices, excluding dividends. Every ranked stock has prices on both dates. Rank the absolute size of the return difference against SPY and show the signed difference in percentage points. Mark missing coverage. Observed reactions do not establish causation.

The website displays Massive’s ticker-level sentiment and rationale alongside observed stock reactions when the news provider supplies those fields. Missing sentiment is shown as unavailable. An available browser language model analyzes the provider summary. It labels the topic and tone and supports its interpretation with a quotation checked against the summary. The interpretation does not change the rank or supply prices. [Browser support](https://developer.chrome.com/docs/ai/prompt-api)

The data routes are same-origin and the provider key is a Worker secret. Provision a Massive account approved for the intended site audience before enabling it. [Massive market data redistribution terms](https://massive.com/knowledge-base/article/how-can-i-redistribute-massives-market-data)

The engineering workflow below records the submitted F.1–F.5 and v0.1 baseline. Its two-stock verification rules are distinct from this public event study.

---

# Research dashboard implementation

The dashboard uses the team’s submitted v0.1 system requirements (§5.4), the F.1–F.5 functional architecture and the same-host decision documented in the Systems Analysis and Risk Assessment. [Innoslate TD-01](https://cloud.innoslate.com/cornell/p/659/database/entity/319237)

| Dashboard behavior | Model and software trace | Verification |
| --- | --- | --- |
| Select two distinct tickers and a common date | UC.1, SR-01, DR-01–02, IF.01 | Pair/date checks and incorrect-input cases in the functional and comparison tests |
| Publish aligned prices and dated, bounded news evidence | SR-03, DR-03–04, IF.02 | F.2 evidence tests and dashboard check for missing unselected stock |
| Rank all stocks in the fixed dataset and show the pair and factor contributions from one calculation | SR-01–02, DR-05–06, IF.03 | Dashboard check for consistent rankings across different pairs |
| Explain the leading driver locally | SR-02, SR-08, DR-07–08, IF.04, TD-01 A | Local-model and guardrail tests, dashboard check for unavailable explanation |
| Display date, scores, source IDs, price history and status | SR-01–03, DR-09–10, IO.02/06 | Dashboard data tests and Pages build |

The ranking view uses unrounded scores. The dashboard applies the comparison’s 0.000001-point tolerance to rank groups, measured from the highest score in each group. Within a group the order follows unrounded score, then ticker for exactly equal scores. The chosen chart range only changes display. Scoring still uses all 21 observations.

## Operation

Run `python3 scripts/build_site.py` and `python3 -m http.server 8080 --bind 127.0.0.1 --directory .site`. Open `http://127.0.0.1:8080/`. Choose two different stocks and compare them. Select any ticker in the ranking table, change the chart window, and expand the dated market records. Stop the server with Ctrl+C. For handover and the FastAPI engineering workflow, see the [operating guide](operations.md).

Run `python scripts/verify.py` after installing the backend requirements. CI runs Python and Node checks before packaging the static site.

## Historical data import

The Project Description sets the product capacity at up to 100 U.S. stocks. System Requirements Definition §5.4, P-01 and P-02 establish a ten-stock v0.1 verification configuration. The sample and engineering comparison retain that configuration. The product import fixes the research universe to the submitted ticker set before the first comparison, then normalizes scores with the same 50/50 method over that set. A different set requires a new import. Imported stock identities and exchange coverage come from the supplied files.


1. Predefine a set of 2–100 U.S. stocks and obtain authorized daily USD historical exports for those tickers. Use the same date range for all tickers and include at least 21 consecutive trading sessions. Name each file after its ticker, such as `AAPL.csv`. Each export needs `Date` in YYYY-MM-DD and `Adj Close`.
2. Select all files in the predefined universe in the dashboard. Optionally add a JSON array of news objects with `symbol`, `publication_date` (YYYY-MM-DD), `title` and an HTTPS `url`. Include only evidence you can use and verify. The dashboard shows at most two qualifying items per selected ticker in the seven calendar dates ending on the analysis date.
3. Select **Load data**, then choose two or more stocks and an eligible date. The browser computes the current ranking and comparison for that date and uses the same adjusted closes for the price chart and market evidence table. Reloading the page clears the import.

The import checks ticker coverage, positive adjusted closes, duplicate dates, and aligned 21-observation windows. It derives observed sessions from the supplied files. A session absent in all files cannot be detected by alignment alone. Supply exports with complete exchange coverage. Historical adjusted prices are used as supplied, so these views do not establish point-in-time backtest validity.

## Evidence and open verification

Files are read in browser memory. StockLens does not automatically acquire Yahoo data, bundle downloaded files, or send imported evidence to a remote model. The dashboard includes dated links to three official earnings announcements and accepts an optional additional news file. The event view distinguishes the named company from other selected stocks and reports observed returns over the same window. It does not establish causation. The two-stock engineering route still uses the seven-day F.2 evidence limits. Automatic acquisition and public redistribution still require a provider arrangement that permits the intended uses. See the [service-use record](service-use.md).

The dashboard implements the submitted v0.1 scoring rules. The original sentiment and event scoring concepts require separate factor definitions and assessment. The earlier historical lab is available in the local engineering build at `research-lab.html` and uses its own illustrative method. The model topology follows [ADR-01](architecture-decision-explanation.md). Human MOEs, real-data service use and broader operating acceptance still require their respective assessment evidence.
