import { universe } from './universe.mjs';
import { readYahooPrices } from './market-csv.mjs';
import { rankReaction, validateYahooArticle, yahooArticles } from './event-ranking.mjs';
import { analyzeNews } from './news-ai.mjs';

const get = id => document.getElementById(id);
const form = get('article-form');
const picker = get('article-picker');
const status = get('rank-status');
const marketInput = get('market-files');
const percent = value => `${(100 * value).toFixed(2)}%`;
const points = value => `${(100 * value).toFixed(2)} pp`;
const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const eligible = new Set(['SPY', ...universe.map(stock => stock.ticker)]);
let market = new Map();
let importSequence = 0;
let analysisSequence = 0;

function element(tag, value) {
  const node = document.createElement(tag);
  if (value !== undefined) node.textContent = value;
  return node;
}

function clearRanking() {
  get('rank-content').hidden = true;
  get('stock-details').hidden = true;
  status.textContent = 'Run the ranking for the current inputs.';
}

function clearArticleOutputs() {
  clearRanking();
  analysisSequence += 1;
  get('ai-result').hidden = true;
  get('ai-status').textContent = '';
}

function article() {
  return validateYahooArticle(Object.fromEntries(new FormData(form)));
}

function showSource() {
  const source = get('article-source');
  source.replaceChildren();
  try {
    const link = element('a', 'Read on Yahoo Finance');
    link.href = article().url;
    link.referrerPolicy = 'no-referrer';
    source.append(link);
  } catch {
    // The link appears once all article inputs are valid.
  }
}

for (const [index, entry] of yahooArticles.entries()) {
  picker.add(new Option(entry.title, String(index)));
}
picker.addEventListener('change', () => {
  const entry = picker.value === '' ? {} : yahooArticles[Number(picker.value)];
  for (const key of ['title', 'date', 'url']) form.elements[key].value = entry[key] ?? '';
  get('article-excerpt').value = '';
  showSource();
  clearArticleOutputs();
});
form.addEventListener('input', () => {
  picker.value = '';
  showSource();
  clearArticleOutputs();
});
form.addEventListener('submit', event => event.preventDefault());
get('article-excerpt').addEventListener('input', () => {
  analysisSequence += 1;
  get('ai-result').hidden = true;
  get('ai-status').textContent = '';
});
get('horizon').addEventListener('change', clearRanking);
get('universe-list').textContent = universe.map(stock => stock.ticker).join(' · ');

marketInput.addEventListener('change', async () => {
  const sequence = ++importSequence;
  const files = [...marketInput.files];
  marketInput.value = '';
  clearRanking();
  get('market-status').textContent = 'Reading price files…';
  get('rank-button').disabled = true;
  try {
    if (!files.length || files.length > eligible.size) throw new Error('Choose up to 101 distinct ticker CSV files.');
    const next = new Map(market);
    const seen = new Set();
    for (const file of files) {
      const record = readYahooPrices(file.name.replace(/^(BRK)[ .]B\.csv$/i, '$1-B.csv'), await file.text());
      if (!eligible.has(record.symbol)) throw new Error(record.symbol + ' is outside the fixed universe.');
      if (seen.has(record.symbol)) throw new Error('Duplicate file for ' + record.symbol + '.');
      seen.add(record.symbol);
      next.set(record.symbol, record);
    }
    if (sequence !== importSequence) return;
    market = next;
    const benchmark = market.has('SPY') ? 1 : 0;
    get('market-status').textContent = `${market.size - benchmark} of 100 stocks loaded. SPY ${benchmark ? 'loaded' : 'missing'}.`;
  } catch (error) {
    if (sequence === importSequence) get('market-status').textContent = error.message + ' Previously loaded files are unchanged.';
  } finally {
    if (sequence === importSequence) get('rank-button').disabled = false;
  }
});

function showDetail(stock, result) {
  const history = market.get(stock.ticker).prices;
  get('stock-details').hidden = false;
  get('stock-title').textContent = `${stock.ticker} · ${stock.name}`;
  get('stock-summary').textContent = `${result.before}: ${price.format(history.get(result.before))}. ${result.after}: ${price.format(history.get(result.after))}. Closing volume: ${stock.volume?.toLocaleString('en-US') ?? 'unavailable'}.`;
  const canvas = get('event-chart');
  const width = Math.max(canvas.clientWidth, 240);
  canvas.width = width;
  canvas.height = 180;
  const context = canvas.getContext('2d');
  const observations = [...history.entries()].filter(([date]) => date >= result.before && date <= result.after)
    .sort(([first], [second]) => first.localeCompare(second));
  const values = observations.map(([, value]) => value);
  const min = Math.min(...values);
  const range = Math.max(...values) - min;
  context.strokeStyle = '#00644f';
  context.lineWidth = 3;
  context.beginPath();
  for (const [index, value] of values.entries()) {
    const x = 18 + index * (width - 36) / (values.length - 1);
    const y = range ? 145 - 120 * (value - min) / range : 85;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
  get('stock-title').focus();
}

get('rank-button').addEventListener('click', () => {
  clearRanking();
  if (!form.reportValidity()) return;
  try {
    const source = article();
    const result = rankReaction(universe, market, source.date, Number(get('horizon').value));
    if (!result.covered.length) throw new Error('No stock has prices for both window endpoints.');
    status.textContent = `${result.covered.length} of 100 stocks ranked · ${result.before} to ${result.after} · SPY ${percent(result.benchmarkReturn)}`;
    const most = result.covered[0];
    get('rank-summary').textContent = `${most.ticker} moved furthest from SPY in this window (${points(most.relative)} relative return).`;
    get('reaction-rows').replaceChildren(...result.covered.map((stock, index) => {
      const button = element('button', stock.ticker);
      button.type = 'button';
      button.addEventListener('click', () => showDetail(stock, result));
      const row = element('tr');
      for (const value of [String(index + 1), button, stock.sector, percent(stock.priceReturn), points(stock.relative), points(stock.magnitude)]) {
        const cell = element('td');
        cell.append(value);
        row.append(cell);
      }
      return row;
    }));
    get('missing-data').hidden = !result.missing.length;
    get('missing-stocks').textContent = result.missing.map(stock => stock.ticker).join(', ');
    get('rank-content').hidden = false;
  } catch (error) {
    status.textContent = error.message;
  }
});

get('ai-button').addEventListener('click', async () => {
  const sequence = ++analysisSequence;
  const aiStatus = get('ai-status');
  const button = get('ai-button');
  get('ai-result').hidden = true;
  if (!form.reportValidity()) return;
  button.disabled = true;
  aiStatus.textContent = 'Checking on-device AI…';
  try {
    const result = await analyzeNews(globalThis.LanguageModel, article(), get('article-excerpt').value, fraction => {
      if (sequence === analysisSequence) aiStatus.textContent = `Downloading the browser model… ${Math.round(fraction * 100)}%`;
    });
    if (sequence !== analysisSequence) return;
    get('ai-classification').textContent = `Topic: ${result.topic}. Article tone: ${result.tone}.`;
    get('ai-evidence').textContent = result.evidence;
    get('ai-result').hidden = false;
    aiStatus.textContent = 'On-device interpretation of the supplied excerpt.';
  } catch (error) {
    if (sequence === analysisSequence) aiStatus.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
