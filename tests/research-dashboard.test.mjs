import test from 'node:test';
import assert from 'node:assert/strict';
import { researchView } from '../website/research/research-data.mjs';
import { compareWithExplanationModel } from '../pmc2/browser/local-explanation.mjs';
import { CUTOFF } from '../pmc2/browser/system.mjs';
import { UNIVERSE } from '../pmc2/browser/evidence.mjs';

test('SR-01 / DR-05: rankings and stock details use the authoritative comparison window', async () => {
  const first = await compareWithExplanationModel({ stockA: 'AAPL', stockB: 'MSFT' });
  const second = await compareWithExplanationModel({ stockA: 'NVDA', stockB: 'TSLA' });
  const view = researchView(first);
  const ranks = ({ stocks }) => stocks.map(({ symbol, rank, score }) => ({ symbol, rank, score }));
  assert.deepEqual(ranks(view), ranks(researchView(second)));
  assert.deepEqual(view.stocks.map(stock => stock.symbol).sort(), [...UNIVERSE].sort());
  for (const stock of view.stocks) {
    assert.equal(stock.prices.length, 21);
    assert.ok(stock.prices.every(record => record.source_id && record.symbol === stock.symbol));
    assert.ok(stock.prices.every(record => record.observation_date <= CUTOFF));
  }
  for (const stock of view.comparison.stocks) {
    assert.equal(stock.score, view.stocks.find(row => row.symbol === stock.symbol).score);
  }
});

test('DR-04 / DR-08: failed core evidence hides results and explanation failure preserves them', async () => {
  const failed = await compareWithExplanationModel({ scenario: 'missing_unselected_stock' });
  assert.equal(researchView(failed), null);
  const limited = await compareWithExplanationModel({ scenario: 'no_news' }, () => null);
  const view = researchView(limited);
  assert.equal(view.stocks.length, UNIVERSE.length);
  assert.deepEqual(view.comparison.news, []);
  assert.equal(view.comparison.explanation.available, false);
  assert.equal(limited.history.at(-1).state, 'completed_with_limitations');
});
