import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

execFileSync(process.env.PYTHON || 'python', ['scripts/build_site.py']);
const { UNIVERSE, IMPORT_CONFIG_ID } = await import('../.site/js/evidence.mjs');
const { compareWithExplanationModel } = await import('../.site/js/local-explanation.mjs');
const { prepareImport, readNews, readYahooPrices } = await import('../.site/research/local-import.mjs');
const { researchView, selectedResearchStocks } = await import('../.site/research/research-data.mjs');
const dates = Array.from({ length: 31 }, (_, index) => new Date(Date.UTC(2025, 9, index + 1)))
  .filter(date => date.getUTCDay() > 0 && date.getUTCDay() < 6)
  .map(date => date.toISOString().slice(0, 10));
const files = UNIVERSE.map((symbol, index) => ({
  name: symbol + '.csv',
  text: '\uFEFF"Date",Close,"Adj Close"\r\n' + dates.map((date, offset) =>
    `${date},999,${90 + index + offset * (index + 1)}`).reverse().join('\r\n'),
}));

test('import uses Adj Close, aligned historical windows, local scoring and dated links', async () => {
  const news = readNews(JSON.stringify([
    ...['2025-10-28', '2025-10-29', '2025-10-30', '2025-10-31'].map((date, index) => ({
      symbol: 'AAPL', title: 'Headline ' + index,
      publication_date: date, url: 'https://example.com/' + index,
    })),
    { symbol: 'MSFT', title: 'Microsoft headline', publication_date: '2025-10-28', url: 'https://example.com/msft' },
    { symbol: 'NVDA', title: 'Another ticker', publication_date: '2025-10-29', url: 'https://example.com/nvda' },
  ]));
  const dataset = prepareImport(files, news);
  assert.deepEqual(dataset.dates, dates.slice(20).reverse());
  const analysisDate = '2025-10-30';
  const run = await compareWithExplanationModel({ analysisDate, evidenceSource: dataset.sourceFor(analysisDate) });
  const view = researchView(run);
  assert.equal(run.history.at(-1).configuration_id, IMPORT_CONFIG_ID);
  assert.equal(run.history.at(-1).state, 'completed');
  assert.equal(view.stocks.length, 10);
  assert.ok(view.comparison.explanation.available);
  const apple = view.stocks.find(stock => stock.symbol === 'AAPL');
  assert.equal(apple.prices.length, 21);
  assert.equal(apple.prices.at(-1).observation_date, analysisDate);
  assert.equal(apple.prices.at(-1).adjusted_close, 111);
  assert.deepEqual(view.comparison.news.map(item => item.url),
    ['https://example.com/2', 'https://example.com/1', 'https://example.com/msft']);
});

test('missing observations in unselected stocks prevent eligibility', () => {
  const incomplete = files.map(file => file.name === 'XOM.csv'
    ? { ...file, text: file.text.split('\r\n').filter(line => !line.startsWith('2025-10-15')).join('\r\n') }
    : file);
  assert.throws(() => prepareImport(incomplete), /No complete/);
  assert.throws(() => prepareImport(files.slice(0, 1)), /between 2 and 100/);
});

test('malformed price and unsafe article inputs are rejected', () => {
  assert.throws(() => readYahooPrices('AAPL.csv', 'Date,Close\n2025-10-15,100'), /Adj Close/);
  assert.throws(() => readYahooPrices('AAPL.csv', 'Date,Adj Close\n2025-10-15,100\n2025-10-15,110'), /duplicate/);
  assert.throws(() => readNews(JSON.stringify([{ symbol: 'AAPL', title: 'Bad',
    publication_date: '2025-10-15', url: 'javascript:alert(1)' }])), /HTTPS/);
});

test('original product scope: a predefined 100-stock set can be scored without altering sample scope', async () => {
  const largeUniverse = Array.from({ length: 100 }, (_, index) => ({
    ...files[index % files.length], name: 'US' + index + '.csv',
  }));
  assert.throws(() => prepareImport([...largeUniverse, { ...files[0], name: 'EXTRA.csv' }]), /100/);
  const dataset = prepareImport(largeUniverse);
  const analysisDate = dataset.dates[0];
  const run = await compareWithExplanationModel({
    stockA: 'US0', stockB: 'US99', analysisDate, evidenceSource: dataset.sourceFor(analysisDate),
  });
  const group = selectedResearchStocks(researchView(run), dataset.universe);
  assert.equal(group.length, 100);
  assert.ok(group.some(row => row.symbol === 'US50'));
  assert.ok(run.scores.every(row => row.score >= 0 && row.score <= 100));
  assert.equal(run.evidence.evidence.market_records.length, 2100);
  const fixture = await compareWithExplanationModel();
  assert.equal(researchView(fixture).stocks.length, 10);
});

test('Pages package contains only the StockLens product and connects its research views', () => {
  assert.deepEqual(readdirSync('.site').sort(), ['.nojekyll', 'index.html', 'js', 'research']);
  const html = readFileSync('.site/index.html', 'utf8');
  for (const element of ['research-form', 'ranking-rows', 'comparison-scores', 'price-chart', 'model-explanation', 'event-results']) {
    assert.ok(html.includes(`id="${element}"`), element);
  }
  assert.doesNotMatch(html, /(?:compare|evidence|research-lab|skeleton)\.html/);
});

test('selected historical events evaluate all selected stocks with common dates and no future data', async () => {
  const { eventResponse, historicalEvents } = await import('../.site/research/news-events.mjs');
  const event = historicalEvents.find(entry => entry.symbol === 'AAPL');
  const symbols = ['AAPL', 'MSFT', 'NVDA'];
  const prices = new Map([
    ['AAPL', new Map([['2025-01-29', 100], ['2025-01-30', 150], ['2025-01-31', 110], ['2025-02-03', 200]])],
    ['MSFT', new Map([['2025-01-29', 100], ['2025-01-31', 90]])],
    ['NVDA', new Map([['2025-01-29', 100], ['2025-02-03', 140]])],
  ]);
  const moves = eventResponse(event, symbols, prices, '2025-01-31', 1);
  assert.equal(moves.length, 3);
  assert.equal(moves[0].direct, true);
  assert.ok(Math.abs(moves[0].change - .1) < 1e-9);
  assert.ok(Math.abs(moves[1].change + .1) < 1e-9);
  assert.equal(moves[2].change, null);
  assert.ok(eventResponse(event, symbols, prices, '2025-01-31', 3).every(row => row.change === null));
});
