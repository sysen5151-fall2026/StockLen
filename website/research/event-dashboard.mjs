import { universe } from './universe.mjs';
import { hydrateSessions, rankReaction } from './event-ranking.mjs';
import { analyzeNews, compareNewsEvidence, explainAvailableEvidence, predictNewsOutlook, compareOutlookWithActual, refineNewsOutlook } from './news-ai.mjs';

const get = id => document.getElementById(id);
const form = get('news-search');
const list = get('news-list');
const sentinel = get('news-sentinel');
const status = get('rank-status');
const percent = value => `${(100 * value).toFixed(2)}%`;
const points = value => `${(100 * value).toFixed(2)} pp`;
const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
let market = new Map();
let currentRanking = null;
let currentForecast = null;
const outlookLabels = {
  outperformance: 'Likely outperform',
  underperformance: 'Likely underperform',
  neutral: 'Neutral signal',
  insufficient: 'Insufficient evidence',
};
let newsSequence = 0;
let rankingSequence = 0;
let articles = [];
let selectedArticle = null;
let newsLoading = false;
let emptyBatches = 0;
let search = null;
let cursor = null;
const selection = new Set(['AAPL', 'MSFT', 'NVDA']);
let analysisSequence = 0;
let localAiRunning = false;
let localModelState = 'unavailable';
const browserModel = globalThis.LanguageModel;

function element(tag, value) {
  const node = document.createElement(tag);
  if (value !== undefined) node.textContent = value;
  return node;
}

function clearRanking() {
  rankingSequence += 1;
  get('rank-button').disabled = false;
  get('rank-content').hidden = true;
  get('rankings').hidden = true;
  get('forecast').hidden = true;
  get('actual-button').disabled = false;
  currentForecast = null;
  get('forecast-status').textContent = '';
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
  if (!selectedArticle) throw new Error('Find and choose a historical article.');
  return selectedArticle;
}

function renderNewsAnalysis() {
  const content = get('news-analysis-content');
  const message = get('news-analysis-status');
  const source = selectedArticle;
  const canInterpret = localModelState !== 'unavailable' && (source?.description?.trim().length ?? 0) >= 30;
  get('local-ai').hidden = !canInterpret;
  get('ai-button').disabled = !canInterpret || localAiRunning;
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
  const explanation = explainAvailableEvidence(source, rows, currentRanking)
    .map(line => element('li', line));
  get('news-analysis-summary').replaceChildren(...explanation);
  const excerpt = source.description?.trim();
  get('news-source-excerpt').hidden = !excerpt;
  get('news-source-excerpt').textContent = excerpt ?? '';
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
  if (!response.ok) {
    const error = new Error(data.error ?? 'The data request failed.');
    error.status = response.status;
    throw error;
  }
  return data;
}

function showSource() {
  const source = get('article-source');
  source.replaceChildren();
  get('analysis-workspace').hidden = !selectedArticle;
  if (!selectedArticle) return;
  const link = element('a', selectedArticle.publisher ? 'Read at ' + selectedArticle.publisher : 'Read original story');
  link.href = selectedArticle.url;
  link.referrerPolicy = 'no-referrer';
  source.append(element('h3', selectedArticle.title), element('p', selectedArticle.date), link);
  if (selectedArticle.description) source.append(element('p', selectedArticle.description));
}

function addStory(item) {
  const entry = element('li');
  const button = element('button');
  button.type = 'button';
  button.className = 'story';
  button.setAttribute('aria-pressed', 'false');
  const meta = [item.publisher, item.date, item.tickers.slice(0, 3).join(' · ')].filter(Boolean).join(' · ');
  button.append(element('span', meta), element('strong', item.title));
  if (item.description) button.append(element('p', item.description));
  button.addEventListener('click', () => {
    selectedArticle = item;
    for (const story of list.querySelectorAll('[aria-pressed="true"]')) story.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-pressed', 'true');
    showSource();
    clearArticleOutputs();
  });
  entry.append(button);
  list.append(entry);
}

const observer = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting) && !newsLoading && cursor) void loadNews(true);
}, { root: get('news-scroll') });

async function loadNews(append = false) {
  const sequence = ++newsSequence;
  const newsStatus = get('news-status');
  observer.unobserve(sentinel);
  sentinel.hidden = true;
  if (!append) {
    search = {
      date: get('news-date').value,
      ticker: get('news-ticker').value,
      keyword: get('news-keyword').value.trim(),
    };
    articles = [];
    selectedArticle = null;
    cursor = null;
    emptyBatches = 0;
    list.replaceChildren();
    showSource();
    clearArticleOutputs();
    get('news-results').hidden = false;
  }
  newsLoading = true;
  if (!append) newsStatus.textContent = 'Searching market news…';
  try {
    const page = append ? cursor : null;
    const response = await queryApi('/api/news', { ...search, ...(page && { cursor: page }) });
    if (sequence !== newsSequence) return;
    const seen = new Set(articles.map(item => item.id));
    const previousCount = articles.length;
    for (const item of response.articles) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      addStory(item);
      articles.push(item);
    }
    emptyBatches = previousCount === articles.length ? emptyBatches + 1 : 0;
    cursor = response.cursor !== page && emptyBatches < 3 ? response.cursor : null;
    const scope = search.date ? ' · ' + search.date : ' · Past 7 days';
    newsStatus.textContent = articles.length
      ? `${articles.length} matching articles loaded${scope}`
      : cursor ? 'Looking for matches…' : emptyBatches >= 3 && response.cursor
        ? 'No matches in the pages searched. Try a more specific date or company.'
        : 'No stories matched this search.';
  } catch (error) {
    if (sequence !== newsSequence) return;
    cursor = null;
    newsStatus.textContent = error.message;
  } finally {
    if (sequence === newsSequence) {
      newsLoading = false;
      sentinel.hidden = !cursor;
      if (cursor) observer.observe(sentinel);
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
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!get('news-keyword').value.trim() && !get('news-date').value && !get('news-ticker').value) {
    get('news-keyword').focus();
    return;
  }
  void loadNews();
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

function renderForecast({ group, horizon, predictions }) {
  const directional = predictions.filter(row => ['outperformance', 'underperformance'].includes(row.outlook)).length;
  get('forecast-status').textContent = `${directional} of ${group.length} selected stocks have a directional forecast for ${horizon} trading session${horizon === 1 ? '' : 's'}. This view uses the selected story’s signals only.`;
  get('forecast-rows').replaceChildren(...predictions.map(prediction => {
    const row = element('tr');
    for (const text of [prediction.ticker, outlookLabels[prediction.outlook], prediction.explanation]) {
      row.append(element('td', text));
    }
    return row;
  }));
  get('forecast').hidden = false;
}

get('rank-button').addEventListener('click', async () => {
  clearRanking();
  const sequence = rankingSequence;
  try {
    const source = article();
    if (selection.size < 2) throw new Error('Select at least two stocks.');
    const group = universe.filter(stock => selection.has(stock.ticker));
    const horizon = Number(get('horizon').value);
    const forecast = { source, group, horizon, predictions: predictNewsOutlook(source, group) };
    currentForecast = forecast;
    renderForecast(forecast);
    if (localModelState === 'available' && source.description?.trim().length >= 30) {
      get('actual-button').disabled = true;
      get('forecast-status').textContent += ' Checking the article with on-device AI…';
      const refined = await refineNewsOutlook(browserModel, source, forecast.predictions, horizon)
        .catch(() => forecast.predictions);
      if (sequence !== rankingSequence) return;
      currentForecast = { ...forecast, predictions: refined };
      renderForecast(currentForecast);
      get('actual-button').disabled = false;
    }
  } catch (error) {
    if (sequence !== rankingSequence) return;
    get('forecast').hidden = false;
    get('actual-button').disabled = true;
    get('forecast-rows').replaceChildren();
    get('forecast-status').textContent = error.message;
  }
});

get('actual-button').addEventListener('click', async () => {
  const forecast = currentForecast;
  if (!forecast) return;
  const { source, group, horizon, predictions } = forecast;
  const sequence = rankingSequence;
  const button = get('actual-button');
  button.disabled = true;
  get('rankings').hidden = false;
  get('rank-content').hidden = true;
  status.textContent = 'Checking whether the observation window is complete…';
  try {
    const response = await queryApi('/api/market-window', {
      date: source.date, symbols: group.map(stock => stock.ticker).join(','), horizon,
    });
    if (sequence !== rankingSequence) return;
    market = hydrateSessions(response.sessions);
    const result = rankReaction(group, market, source.date, horizon);
    if (!result.covered.length) throw new Error('No stock has prices for both window endpoints.');
    const checks = new Map(compareOutlookWithActual(predictions, result).map(row => [row.ticker, row]));
    status.textContent = `${result.covered.length} of ${group.length} selected stocks ranked · ${result.before} to ${result.after} · SPY ${percent(result.benchmarkReturn)}`;
    const most = result.covered[0];
    get('rank-summary').textContent = `${most.ticker} moved furthest from SPY in this window (${points(most.relative)} relative return).`;
    get('reaction-rows').replaceChildren(...result.covered.map((stock, index) => {
      const button = element('button', stock.ticker);
      button.type = 'button';
      button.addEventListener('click', () => showDetail(stock, result));
      const row = element('tr');
      const check = checks.get(stock.ticker);
      for (const value of [String(index + 1), button, stock.sector, percent(stock.priceReturn), points(stock.relative), points(stock.magnitude), check.assessment + '. ' + check.explanation]) {
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
  } catch (error) {
    if (sequence === rankingSequence) {
      status.textContent = error.status === 422
        ? 'Actual returns are not available for the full window yet. The forecast above remains available.'
        : error.message;
    }
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
    const result = await analyzeNews(browserModel, source, source.description, fraction => {
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
    renderNewsAnalysis();
  }
}

get('ai-button').addEventListener('click', () => void runLocalAi());

if (browserModel?.availability) {
  Promise.resolve().then(() => browserModel.availability()).then(state => {
    if (['available', 'downloadable', 'downloading'].includes(state)) {
      localModelState = state;
      renderNewsAnalysis();
    }
  }).catch(() => {});
}
