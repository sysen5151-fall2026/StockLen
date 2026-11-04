# PMC2 baseline and source register

## Source precedence

Read for this increment: all six PDFs supplied in `已交作业.zip`. Their submitted contents remain historical records. The implementation uses the later refinements below rather than silently rewriting earlier proposal language.

| Submitted source | Baseline retained | Consequence for this increment |
|---|---|---|
| StockLens Project Description(4).pdf | Students and beginners; predefined daily U.S. stock coverage, up to 100; no trading/personal portfolios | The later ten-stock v0.1 is a bounded design choice within this scope |
| Business_or_Mission_Analysis (7).pdf | UC.1; provider boundaries; AI explains calculated results | No brokerage integration; generated explanation does not own ranking |
| Stakeholder_Needs_and_Requirements_Definition (3).pdf | N-01–08, SR-01–08 and proposed MOEs | Software tests do not establish human comprehension or stakeholder acceptance |
| StockLens_System_Requirements_Definition.pdf | Sixteen original system requirements, controlled evidence and v0.1 supplement §5.4 | Preserve original IDs and evidence limits; use 21 adjusted closes / 20 simple returns, fixed ten-stock average-tie ranks, 50% momentum + 50% lower volatility |
| StockLens_Architecture Definition Function.pdf | F.1–F.5; F.2.1/F.2.2; IF.01–04; LF.02; authoritative IF.03 fan-out | Query acquisition and evidence validation remain separate responsibilities |
| StockLens_NewVersion_Revised.pdf | Physical design §§1.4, 2.1.4–5, 4.1–2; F.2 as main example; P.2.1/P.2.2; DR/CR/SWR | Primary source for this selected component and its tests |

The form report names the system obligations SYS-IN/OUT/IF/F and adds system-wide SWR rules. These are the report's later identifiers; they must not be confused with the earlier stakeholder SR identifiers. For example, SR-02 is ranking explanation, SYS-F-02 is evidence acquisition. CR-12 belongs to P.4; the P.2 specification is **DR-03, DR-04 and sixteen CRs: CR-01–11 and CR-13–17**. Do not accidentally add CR-12 to P.2 or treat LF.02 as an eighth boundary I/O.

## Innoslate observations

Observed through the signed-in UI during the PMC2 review:

- F.2: 269035; children F.2.1 269045 and F.2.2 269046; performed by P.2 290840.
- F.2 native description explicitly requires full ten-stock coverage, 21 aligned prices and invalid-core non-release.
- F.2 native satisfies list includes SYS-F-02 290910 as well as retained earlier requirement allocations.
- F.2 IDEF0 displays both leaf functions, provider queries, market/news inputs, research configuration and the two performing module mechanisms.
- P.2 hierarchy displays P.2.1 Provider Acquisition Module and P.2.2 Evidence Validation Module.
- Top-level F.0 264782 has first-level functional decomposition and mechanism arrows.

These are scoped observations, not a fresh global Intelligence pass. The native diagrams have long wrapped/truncated labels at the saved zoom. Fit the view and read full names in the sidebar while presenting. No new model entities or satisfaction verdicts are needed merely to represent the new controlled code tests. A relationship means allocation, not a passed real-service test.

## Constraints carried forward

1. AAPL, MSFT, AMZN, GOOGL, META, NVDA, TSLA, JPM, JNJ, XOM are the frozen v0.1 normalization universe. Missing an unselected stock blocks scoring too.
2. Both stocks share analysis cutoff and versioned configuration. All ten have the same 21 explicitly supplied dates. The synthetic demonstration dates are **not a trading calendar**; a real adapter still needs the reviewed exchange/calendar and cutoff contract.
3. News is restricted to seven inclusive calendar dates, at most two supported items per selected symbol. News and AI availability never rescue invalid core data or change numerical scores.
4. No news means an explicit limitation; invalid core means no score-ready records. IF.02 failure still carries request/configuration/date context and a reason.
5. System states ready/processing/completed/completed_with_limitations/failed belong to P.0/P.5. The F.2 `accepted`/`accepted_with_limitations` envelope states describe the local release decision, not a completed comparison.
6. The recorded 3s offline / 15s external-AI P95, 20 serial trials, 20s per AI attempt, at most one AI retry and $5 demo budget remain system-level plans. No invented P.2 budget or new timing pass is assigned.
7. Only generated synthetic records are included. Real service conditions, source support, calendar suitability, AI behavior and user studies remain unassessed for this new increment.
