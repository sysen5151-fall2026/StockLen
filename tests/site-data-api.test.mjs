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
      insights: [
        { ticker: 'BRK.B', sentiment: 'positive', sentiment_reasoning: 'Earnings increased.' },
        { ticker: 'ABBV', sentiment: 'unexpected', sentiment_reasoning: 'Malformed.' },
      ],
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
  assert.deepEqual(data.articles[0].insights, {'BRK-B': { sentiment: 'positive', reasoning: 'Earnings increased.' }});
  assert.equal(data.cursor, 'page-two');
  assert.equal(calls[0].searchParams.get('ticker'), 'BRK.B');
  assert.equal(calls[0].searchParams.get('published_utc.gte'), '2025-03-09T05:00:00.000Z');
  assert.equal(calls[0].searchParams.get('published_utc.lt'), '2025-03-10T04:00:00.000Z');
  const keywordMatch = await api(browserRequest('news', { date: '2025-03-09', keyword: 'ISSUER results' }), env);
  assert.equal((await keywordMatch.json()).articles.length, 1);
  assert.equal(calls.at(-1).searchParams.get('limit'), '200');
  const keywordMiss = await api(browserRequest('news', { date: '2025-03-09', keyword: 'unrelated' }), env);
  assert.deepEqual((await keywordMiss.json()).articles, []);
  const second = browserRequest('news', { date: '2025-03-09', cursor: data.cursor });
  await api(second, env);
  assert.equal(calls.at(-1).searchParams.get('cursor'), 'page-two');
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

test('article evidence is joined to selected tickers and never fills missing sentiment', async () => {
  const { compareNewsEvidence } = await import('../website/research/news-ai.mjs');
  const article = { tickers: ['BRK.B'], insights: { 'BRK-B': { sentiment: 'positive', reasoning: 'Earnings increased.' } } };
  const ranking = { covered: [{ ticker: 'NVDA', relative: -.05 }, { ticker: 'BRK-B', relative: -.02 }] };
  const rows = compareNewsEvidence(article, ['BRK-B', 'AAPL', 'NVDA'], ranking);
  assert.deepEqual(rows.map(row => row.ticker), ['NVDA', 'BRK-B', 'AAPL']);
  assert.equal(rows[0].insight, null);
  assert.equal(rows[0].reaction.relative, -.05);
  assert.equal(rows[1].mentioned, true);
  assert.equal(rows[1].insight.sentiment, 'positive');
  assert.equal(rows[2].reaction, null);
});

test('keyword-first search defaults to seven Eastern dates and recognizes company ticker aliases', async () => {
  let params;
  const api = createMarketApi(universe, async url => {
    params = url.searchParams;
    return Response.json({ results: [
      { id: 'tagged', title: 'Chip earnings preview', tickers: ['NVDA'],
        published_utc: '2026-11-20T15:00:00Z', article_url: 'https://example.com/tagged' },
      { id: 'title', title: 'Nvidia earnings', tickers: ['NVDA'],
        published_utc: '2026-11-19T15:00:00Z', article_url: 'https://example.com/title' },
    ] });
  });
  const result = await api(browserRequest('news', { keyword: 'Nvidia' }), env, new Date('2026-11-23T15:00:00Z'));
  assert.equal(params.get('published_utc.gte'), '2026-11-17T05:00:00.000Z');
  assert.equal(params.get('published_utc.lt'), '2026-11-24T05:00:00.000Z');
  assert.equal(params.get('ticker'), 'NVDA');
  assert.deepEqual((await result.json()).articles.map(item => item.id), ['title', 'tagged']);
});
