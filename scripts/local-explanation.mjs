import { compareWithExplanationModel } from '../pmc2/browser/local-explanation.mjs';

const [stockA = 'AAPL', stockB = 'MSFT'] = process.argv.slice(2);
const run = await compareWithExplanationModel({ stockA, stockB });
console.log(JSON.stringify({
  state: run.history.at(-1),
  stocks: run.display?.stocks.map(({ symbol, display_score }) => ({ symbol, display_score })),
  explanation: run.explanation,
}, null, 2));
if (!run.display) process.exitCode = 1;
