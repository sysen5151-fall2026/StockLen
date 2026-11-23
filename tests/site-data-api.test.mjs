import assert from 'node:assert/strict';
import test from 'node:test';
import { createMarketApi } from '../server/market-api.mjs';
import { universe } from '../website/research/universe.mjs';
import { hydrateSessions, rankReaction } from '../website/research/event-ranking.mjs';

const env = { MASSIVE_API_KEY: 'test-only' };
const browserRequest = (route, params) => new Request('https://stocklens.example/api/' + route + '?' + new URLSearchParams(params));
test('historical news search supports ticker filters, Eastern dates, safe source links and pages', async () => {
  const calls = [];
  const api = createMarketApi(universe, async (url, options) => {
    calls.push(url);
    assert.equal(url.hostname, 'api.massive.com');
    assert.equal(options.headers.Authorization, 'Bearer test-only');
    assert.equal(options.redirect, 'manual');
    const result = {
      id: 'id', article_url: 'https://example.com/report', title: 'Issuer results',
      publisher: { name: 'Publisher' }, published_utc: '2025-03-09T05:00:00Z',
    };
    return Response.json({
      results: [result, { ...result, id: 'wrong-day', published_utc: '2025-03-10T04:00:00Z' },
        { ...result, id: 'unsafe-link', article_url: 'javascript:alert(1)' }],
      next_url: 'https://api.massive.com/v2/reference/news?cursor=page-two',
    });
  });
  const request = browserRequest('news', { date: '2025-03-09', ticker: 'BRK-B' });
  const response = await api(request, env);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.articles.length, 1);
  assert.equal(data.cursor, 'page-two');
  assert.equal(calls[0].searchParams.get('ticker'), 'BRK.B');
  assert.equal(calls[0].searchParams.get('published_utc.gte'), '2025-03-09T05:00:00.000Z');
  assert.equal(calls[0].searchParams.get('published_utc.lt'), '2025-03-10T04:00:00.000Z');
  const second = browserRequest('news', { date: '2025-03-09', cursor: data.cursor });
  await api(second, env);
  assert.equal(calls[1].searchParams.get('cursor'), 'page-two');
  assert.equal((await api(request, {})).status, 503);
});

test('data routes compare 2, 99, and 100 selected tickers and omit unselected prices', async () => {
  const eligible = ['SPY', ...universe.map(stock => stock.ticker.replace('-', '.')), 'UNRELATED'];
  const requested = [];
  const api = createMarketApi(universe, async url => {
    const date = url.pathname.split('/').at(-1);
    requested.push(date);
    const before = date === '2025-02-25';
    return Response.json({
      adjusted: true,
      results: eligible.map(ticker => ({ T: ticker, c: before ? 100 : ticker === 'SPY' ? 101 : 103, v: 30 })),
    });
  });
  for (const count of [2, 99, 100]) {
    const selected = universe.slice(0, count);
    const response = await api(browserRequest('market-window', {
      date: '2025-02-26', horizon: 1, symbols: selected.map(stock => stock.ticker).join(','),
    }), env, new Date('2025-03-10T20:00:00Z'));
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.deepEqual(data.sessions.map(session => session.day), ['2025-02-25', '2025-02-27']);
    const market = hydrateSessions(data.sessions);
    assert.equal(market.size, count + 1);
    const rankings = rankReaction(selected, market, '2025-02-26', 1);
    assert.equal(rankings.covered.length, count);
    assert.ok(rankings.covered.every(stock => Math.abs(stock.relative - .02) < 1e-10));
  }
  const invalid = await api(browserRequest('market-window', { date: '2025-02-26', horizon: 1, symbols: 'AAPL' }), env);
  assert.equal(invalid.status, 400);
  assert.equal(requested.length, 6);
});
