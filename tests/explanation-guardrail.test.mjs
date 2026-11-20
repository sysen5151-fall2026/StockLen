import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkExplanation,
  compareStocks,
  syntheticExplanation,
} from '../pmc2/browser/system.mjs';

const request = {
  stockA: 'AAPL',
  stockB: 'MSFT',
  analysisDate: '2026-09-21',
  requestId: 'r02-guardrail',
};

test('the controlled valid response produces an explanation', () => {
  const valid = compareStocks(request);
  assert.equal(valid.explanation.available, true);
  assert.equal(valid.history.at(-1).state, 'completed');
});

for (const [mode, reason] of [
  ['invalid', 'unsupported_explanation_content'],
  ['unavailable', 'explanation_unavailable'],
]) {
  test(`F.4 rejects the ${mode} response and F.5 keeps the comparison`, () => {
    const valid = compareStocks(request);
    const result = compareStocks({ ...request, explanationMode: mode });
    assert.equal(result.explanation.available, false);
    assert.equal(result.explanation.reason, reason);
    assert.equal(result.explanation.text, null);
    assert.equal(result.history.at(-1).state, 'completed_with_limitations');
    assert.deepEqual(result.record, valid.record);
    assert.deepEqual(result.display.stocks, valid.display.stocks);
  });
}

const wrongDate = candidate => { candidate.analysis_date = '2026-09-22'; };
const wrongDriver = candidate => { candidate.drivers[0].first_value += 1; };
const unknownSource = candidate => { candidate.source_ids.push('unsupported'); };
const missingScores = candidate => { delete candidate.scores; };

for (const [failure, change, reason] of [
  ['wrong date', wrongDate, 'explanation_context_mismatch'],
  ['wrong driver value', wrongDriver, 'unsupported_explanation_content'],
  ['unknown source', unknownSource, 'unsupported_explanation_content'],
  ['missing scores', missingScores, 'unsupported_explanation_content'],
]) {
  test(`F.4 withholds a candidate with ${failure}`, () => {
    const { payload } = compareStocks(request);
    const candidate = syntheticExplanation(payload);
    change(candidate);
    const result = checkExplanation(candidate, payload);
    assert.equal(result.available, false);
    assert.equal(result.reason, reason);
    assert.equal(result.text, null);
  });
}
