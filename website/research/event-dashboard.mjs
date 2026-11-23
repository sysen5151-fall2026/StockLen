import { universe } from './universe.mjs';
import { hydrateSessions, rankReaction } from './event-ranking.mjs';
import { analyzeNews, compareNewsEvidence } from './news-ai.mjs';

const get = id => document.getElementById(id);
const form = get('news-search');
const picker = get('article-picker');
const status = get('rank-status');
const percent = value => `${(100 * value).toFixed(2)}%`;
const points = value => `${(100 * value).toFixed(2)} pp`;
const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
let market = new Map();
let currentRanking = null;
let newsSequence = 0;
let rankingSequence = 0;
let articles = [];
let search = null;
let cursor = null;
const selection = new Set(['AAPL', 'MSFT', 'NVDA']);
let analysisSequence = 0;
let localAiRunning = false;

function element(tag, value) {
  const node = document.createElement(tag);
  if (value !== undefined) node.textContent = value;
  return node;
}

function clearRanking() {
  rankingSequence += 1;
  get('rank-button').disabled = false;
  get('rank-content').hidden = true;
  get('stock-details').hidden = true;
  status.textContent = 'Run the ranking for the current inputs.';
  currentRanking = null;
  renderNewsAnalysis();
}

function clearArticleOutputs() {
  clearRanking();
  analysisSequence += 1;
  get('ai-result').hidden = true;
  get('ai-status').textContent = '';
}

function article() {
  const selected = picker.value === '' ? null : articles[Number(picker.value)];
  if (!selected) throw new Error('Find and choose a historical article.');
  return selected;
}

function renderNewsAnalysis() {
  const content = get('news-analysis-content');
  const message = get('news-analysis-status');
  const source = picker.value === '' ? null : articles[Number(picker.value)];
  get('ai-button').disabled = !source || localAiRunning;
  content.hidden = !source;
  if (!source) {
    message.textContent = 'Select an article to see its company references and available sentiment.';
    return;
  }
  const rows = compareNewsEvidence(source, selection, currentRanking);
  const count = rows.filter(row => row.insight).length;
  message.textContent = count
    ? `Massive supplied stock-specific sentiment for ${count} of ${rows.length} selected stocks.`
    : 'Massive did not supply stock-specific sentiment for the selected stocks in this article.';
  const top = currentRanking?.covered[0];
  get('news-analysis-summary').textContent = top
    ? `${top.ticker} had the largest absolute difference from SPY (${points(top.relative)} signed). Rank uses the observed price difference.`
    : 'Run the ranking to compare the article evidence with observed price moves.';
  get('news-analysis-rows').replaceChildren(...rows.map(({ticker, mentioned, insight, reaction}) => {
    const row = element('tr');
    const coverage = mentioned || insight ? 'Linked by provider' : 'No provider association';
    const sentiment = insight
      ? insight.sentiment + (insight.reasoning ? ' · ' + insight.reasoning : '')
      : 'Not available';
    const movement = reaction
      ? `#${reaction.rank} · ${points(reaction.relative)}`
      : currentRanking ? 'Missing price coverage' : 'Ranking pending';
    for (const value of [ticker, coverage, sentiment, movement]) row.append(element('td', value));
    return row;
  }));
}

async function queryApi(path, params) {
  const response = await fetch(path + '?' + new URLSearchParams(params));
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('The historical data service is unavailable on this deployment.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'The data request failed.');
  return data;
}

function showSource() {
  const source = get('article-source');
  source.replaceChildren();
  if (picker.value === '') return;
  const selected = article();
  const link = element('a', selected.publisher || 'Read original story');
  link.href = selected.url;
  link.referrerPolicy = 'no-referrer';
  source.append(link);
  if (selected.description) source.append(element('p', selected.description));
}

async function loadNews(append = false) {
  const sequence = ++newsSequence;
  const newsStatus = get('news-status');
  const more = get('more-news');
  if (!append) {
    search = {
      date: get('news-date').value,
      ticker: get('news-ticker').value,
      keyword: get('news-keyword').value.trim(),
    };
    articles = [];
    cursor = null;
    picker.replaceChildren(new Option('Choose an article', ''));
    picker.disabled = true;
    showSource();
    clearArticleOutputs();
  }
  newsStatus.textContent = 'Searching the historical news archive…';
  more.disabled = true;
  try {
    const response = await queryApi('/api/news', { ...search, ...(append && cursor && { cursor }) });
    if (sequence !== newsSequence) return;
    const seen = new Set(articles.map(item => item.id));
    for (const item of response.articles) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      picker.add(new Option(item.title, String(articles.length)));
      articles.push(item);
    }
    cursor = response.cursor;
    picker.disabled = !articles.length;
    newsStatus.textContent = articles.length
      ? `${articles.length} matching articles loaded.`
      : cursor ? 'No matches in this batch. Load more articles to continue the search.'
        : 'No stories matched this date and search.';
  } catch (error) {
    if (sequence !== newsSequence) return;
    newsStatus.textContent = error.message;
  } finally {
    if (sequence === newsSequence) {
      more.hidden = !cursor;
      more.disabled = false;
    }
  }
}

function renderStocks() {
  const term = get('stock-filter').value.trim().toLowerCase();
  get('selection-count').textContent = `${selection.size} of 100 selected`;
  get('stock-picker').replaceChildren(...universe
    .filter(stock => `${stock.ticker} ${stock.name}`.toLowerCase().includes(term))
    .map(stock => {
      const label = element('label');
      const input = element('input');
      input.type = 'checkbox';
      input.value = stock.ticker;
      input.checked = selection.has(stock.ticker);
      input.setAttribute('aria-label', `${stock.ticker} ${stock.name}`);
      label.append(input, stock.ticker);
      return label;
    }));
}

for (const stock of universe) get('news-ticker').add(new Option(stock.ticker, stock.ticker));
const initialDate = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
get('news-date').value = initialDate;
form.addEventListener('submit', event => {
  event.preventDefault();
  void loadNews();
});
get('more-news').addEventListener('click', () => void loadNews(true));
picker.addEventListener('change', () => {
  showSource();
  clearArticleOutputs();
});
get('horizon').addEventListener('change', clearRanking);
get('stock-filter').addEventListener('input', renderStocks);
get('stock-picker').addEventListener('change', event => {
  const { value, checked } = event.target;
  if (checked) selection.add(value);
  else selection.delete(value);
  get('selection-count').textContent = `${selection.size} of 100 selected`;
  clearRanking();
});
for (const [id, all] of [['select-all', true], ['clear-stocks', false]]) {
  get(id).addEventListener('click', () => {
    selection.clear();
    if (all) for (const stock of universe) selection.add(stock.ticker);
    renderStocks();
    clearRanking();
  });
}
get('universe-list').textContent = universe.map(stock => stock.ticker).join(' · ');
renderStocks();
void loadNews();

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

get('rank-button').addEventListener('click', async () => {
  clearRanking();
  const sequence = rankingSequence;
  const button = get('rank-button');
  button.disabled = true;
  try {
    const source = article();
    if (selection.size < 2) throw new Error('Select at least two stocks.');
    const group = universe.filter(stock => selection.has(stock.ticker));
    const horizon = Number(get('horizon').value);
    status.textContent = 'Loading historical prices and calculating reactions…';
    const response = await queryApi('/api/market-window', {
      date: source.date, symbols: group.map(stock => stock.ticker).join(','), horizon,
    });
    if (sequence !== rankingSequence) return;
    market = hydrateSessions(response.sessions);
    const result = rankReaction(group, market, source.date, horizon);
    if (!result.covered.length) throw new Error('No stock has prices for both window endpoints.');
    status.textContent = `${result.covered.length} of ${group.length} selected stocks ranked · ${result.before} to ${result.after} · SPY ${percent(result.benchmarkReturn)}`;
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
    currentRanking = result;
    renderNewsAnalysis();
    const browserModel = globalThis.LanguageModel;
    if (source.description.length >= 30 && browserModel) {
      const state = await browserModel.availability().catch(() => 'unavailable');
      if (sequence === rankingSequence && state === 'available') void runLocalAi();
    }
  } catch (error) {
    if (sequence === rankingSequence) status.textContent = error.message;
  } finally {
    if (sequence === rankingSequence) button.disabled = false;
  }
});

async function runLocalAi() {
  if (localAiRunning) return;
  const sequence = ++analysisSequence;
  const aiStatus = get('ai-status');
  const button = get('ai-button');
  get('ai-result').hidden = true;
  localAiRunning = true;
  button.disabled = true;
  aiStatus.textContent = 'Checking on-device AI…';
  try {
    const source = article();
    if (!source.description) throw new Error('The provider has no summary for this article.');
    const result = await analyzeNews(globalThis.LanguageModel, source, source.description, fraction => {
      if (sequence === analysisSequence) aiStatus.textContent = `Downloading the browser model… ${Math.round(fraction * 100)}%`;
    });
    if (sequence !== analysisSequence) return;
    get('ai-classification').textContent = `Topic: ${result.topic}. Article tone: ${result.tone}.`;
    get('ai-evidence').textContent = result.evidence;
    get('ai-result').hidden = false;
    aiStatus.textContent = 'On-device interpretation of the provider summary.';
  } catch (error) {
    if (sequence === analysisSequence) aiStatus.textContent = error.message;
  } finally {
    localAiRunning = false;
    button.disabled = picker.value === '';
  }
}

get('ai-button').addEventListener('click', () => void runLocalAi());
