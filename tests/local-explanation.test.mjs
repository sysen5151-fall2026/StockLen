import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compareWithExplanationModel, inferLocalExplanation,
} from '../pmc2/browser/local-explanation.mjs';
import { compareStocks } from '../pmc2/browser/system.mjs';

const options = { stockA: 'AAPL', stockB: 'MSFT', requestId: 'local-model' };
const baseline = compareStocks(options);

test('local inference returns a checked explanation and preserves calculated scores', async () => {
  const result = await compareWithExplanationModel(options);
  assert.equal(result.explanation.mode, 'local_checked_model');
  assert.equal(result.history.at(-1).state, 'completed');
  assert.deepEqual(result.record, baseline.record);
});

for (const [name, adapter, reason] of [
  ['wrong primary factor', payload => {
    const response = inferLocalExplanation(payload);
    response.primary_factor = response.primary_factor === 'momentum' ? 'volatility' : 'momentum';
    return response;
  }, 'unsupported_primary_factor'],
  ['changed score', payload => {
    const response = inferLocalExplanation(payload);
    response.scores[0].score += 1;
    return response;
  }, 'unsupported_explanation_content'],
  ['unavailable service', () => { throw new Error('service unavailable'); }, 'explanation_unavailable'],
]) {
  test(`local inference rejects ${name} without losing the comparison`, async () => {
    const result = await compareWithExplanationModel(options, adapter);
    assert.equal(result.explanation.available, false);
    assert.equal(result.explanation.reason, reason);
    assert.equal(result.explanation.text, null);
    assert.equal(result.history.at(-1).state, 'completed_with_limitations');
    assert.deepEqual(result.display.stocks, baseline.display.stocks);
  });
}
