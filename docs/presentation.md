# StockLens Milestone 1 presentation

Use this as a rehearsal aid and adapt it to your own speaking style. The live review is a short core-proof demo, not a full slide presentation. Aim for about 2 minutes 20 seconds including clicks. Speak slowly; do not read the screen instructions aloud.

## Before the visitor arrives

- Start the local FastAPI demo and open the default comparison form. Use the [operating guide](operations.md). Prefer this version for showing the real UI-to-HTTP-to-service path.
- Open Innoslate project 659 at the native SR-02 requirement diagram. Have N-02, SR-02, UC.1.6 (186309) and UC.1.7 (186503) ready to point to. If you only have a PDF export, say so; it is not a live-model inspection.
- Open SPEC at N-02 and the code mapping as backup. Do not use these instead of showing the actual model when the reviewer asks for it.
- Keep the [browser-only demo](https://yihanzhou818.github.io/SYSEN5151/skeleton.html) ready as a fallback. It does not call the Python API. Do not present the historical research lab as the fixed walking skeleton.

## 1. Introduce the system — about 20 seconds

Hi, we are Group 29, StockLens. Our system helps students and beginner investors compare stocks and understand the reasons behind a ranking. It supports research. It does not place trades or manage portfolios.

## 2. Run the skeleton — about 1 minute

**Screen cue: show the default DEMO_A / DEMO_B form, then click Compare fixture.**

Here is our walking skeleton. I choose two stocks and a date, then click Compare.

The request goes through our system, the market-data stub, the news stub, and the ranking stub. Our internal AI module then calls the external AI-service stub.

**Screen cue: point to the two scores, explanation, and source evidence. Pause briefly.**

The dashboard shows scores of 60 and 40, an explanation, and a dated source. These are fixed sample results. We are not calling real data or AI services yet. This demo shows that the full path is connected.

## 3. Trace one need — about 1 minute

**Screen cue: switch to the native model; point to N-02, then SR-02.**

Now I will trace one need in our model. N-02 is the user's need to understand why one stock ranks above another.

It leads to SR-02, which requires an explanation of the main computed drivers and their values.

**Screen cue: point to UC.1.6 and UC.1.7, then return to the result.**

This links to UC.1.6 for the explanation and UC.1.7 for the dashboard. Here are the matching parts in our demo.

They are still stubs, so this shows the link from the model to the product. It does not prove the full requirement is satisfied yet.

## Memory card

**Purpose → Click → Result → Need → Requirement → Model → Demo**

中文记忆：帮助谁 → 点比较 → 看结果 → 指 N-02 → 指 SR-02 → 指两个 Action → 回到演示。

The spoken description above is a simple summary. Keep these exact submitted statements on screen; do not replace them with the summary in SPEC or the model:

- **N-02:** I need to understand a displayed ranking through the computed drivers that explain the difference between the stocks.
- **SR-02:** StockLens shall provide an explanation of each displayed ranking that identifies the ranking’s main computed drivers and their corresponding indicator values.

## Short answers to likely questions

**Is the AI working now?**
The AI service is a stub. It returns fixed text. Real AI calls come later.

**What is real in this demo?**
The request path and display work. The data, scores, and explanation are fixed samples. In the local version, the browser also makes a real HTTP request to our API.

**Why are the scores 60 and 40?**
They are fixed test values. They are not calculated from real stock data.

**What is the difference between your AI module and X.04?**
Our internal module handles the request. X.04 is the external service that generates the explanation. The code separates them; we still need to finish the matching model update.

**Does SR-02 already pass?**
Not yet. We can show the model link and stub path. We still need real driver values and the planned assessment to validate the full requirement.

**Why does another stock selection return the same result?**
The skeleton always returns the same labelled fixture. We keep the requested input separate, so it is not mistaken for real stock data.

**What still needs work for this milestone?**
We need to finish the AI allocation update in the model and confirm the remaining baseline definitions. Our end-to-end stub path already runs.

**Are all the red acceptance checks code failures?**
No. Those checks mark the full stakeholder assessments as not yet done. Our wiring checks pass. Milestone 1 allows stubs.

## Team rehearsal check

Each speaker should run one full practice with the actual model and demo open. Confirm that the four model items can be found without searching, that the demo is responsive, and that the speaker can explain what is fixed versus implemented. Record actual practice/review results yourselves. No mandatory slide deck is specified in the Student Package. DL teams record the demo according to the Canvas instructions; on-campus teams repeat it at their station.
