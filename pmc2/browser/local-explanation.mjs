import {
  checkExplanation, compareStocks, renderComparison, reportStatus, syntheticExplanation,
} from './system.mjs';

// Training examples follow the design rule for absolute factor contributions.
// The one-dimensional nearest-centroid model classifies the signed difference.
const examples = [
  [-20, 'volatility'], [-8, 'volatility'], [-2, 'volatility'],
  [2, 'momentum'], [8, 'momentum'], [20, 'momentum'],
];
const centroid = label => {
  const points = examples.filter(([, factor]) => factor === label);
  return points.reduce((sum, [value]) => sum + value, 0) / points.length;
};
const decisionPoint = (centroid('momentum') + centroid('volatility')) / 2;

export function inferLocalExplanation(payload) {
  const examplesByFactor = Object.fromEntries(
    payload.drivers.map(driver => [driver.factor, Math.abs(driver.contribution_difference)]),
  );
  const difference = examplesByFactor.momentum - examplesByFactor.volatility;
  return {
    ...syntheticExplanation(payload),
    primary_factor: difference >= decisionPoint ? 'momentum' : 'volatility',
  };
}

/** Complete UC.1 using a separately supplied P.4 response adapter. */
export async function compareWithExplanationModel(options, infer = inferLocalExplanation) {
  const run = compareStocks({ ...options, explanationMode: 'unavailable' });
  if (!run.payload) return run;

  let candidate = null;
  try {
    candidate = await infer(structuredClone(run.payload));
  } catch {
    // A failed explanation must not block a completed score.
  }

  let explanation = checkExplanation(candidate, run.payload);
  if (explanation.available) {
    const primary = run.payload.drivers[0];
    if (candidate.primary_factor !== primary.factor) {
      explanation = {
        available: false, reason: 'unsupported_primary_factor', text: null, mode: 'unavailable',
      };
    } else {
      const [a, b] = run.payload.stocks;
      const gap = a.score - b.score;
      const lead = Math.abs(gap) <= 1e-6
        ? 'The two stocks are tied.'
        : `${gap > 0 ? a.symbol : b.symbol} has the higher calculated score.`;
      explanation = {
        available: true, reason: null, mode: 'local_checked_model',
        text: `${lead} The local model identified ${primary.factor} as the leading factor. Its checked absolute contribution difference is ${Math.abs(primary.contribution_difference).toFixed(2)} points.`,
      };
    }
  }

  const limited = run.evidence.evidence.limitations.length > 0 || !explanation.available;
  const state = limited ? 'completed_with_limitations' : 'completed';
  return {
    ...run,
    mode: 'controlled-local-inference',
    explanation,
    display: renderComparison(run.record, explanation),
    history: [...run.history.slice(0, -1), reportStatus(state, run.record.request_id)],
  };
}
