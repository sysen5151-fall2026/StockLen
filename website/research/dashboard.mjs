import { MAX_IMPORT_STOCKS, UNIVERSE } from '../js/evidence.mjs';
import { CUTOFF } from '../js/system.mjs';
import { compareWithExplanationModel } from '../js/local-explanation.mjs';
import { prepareImport, readNews } from './local-import.mjs';
import { eventResponse, historicalEvents, sampleEvents } from './news-events.mjs';
import { researchView, selectedResearchStocks } from './research-data.mjs';

const company = {
  AAPL: 'Apple', MSFT: 'Microsoft', AMZN: 'Amazon', GOOGL: 'Alphabet',
  META: 'Meta Platforms', NVDA: 'NVIDIA', TSLA: 'Tesla', JPM: 'JPMorgan Chase',
  JNJ: 'Johnson & Johnson', XOM: 'Exxon Mobil',
};
const byId = id => document.getElementById(id);
const form = byId('research-form');
const results = byId('research-results');
const canvas = byId('price-chart');
const chartWindow = byId('chart-window');
const percent = value => (100 * value).toFixed(2) + '%';
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  if (className) node.className = className;
  return node;
};
const row = (...values) => {
  const entry = element('tr');
  for (const value of values) {
    const cell = element('td');
    cell.append(value);
    entry.append(cell);
  }
  return entry;
};

let view;
let dataset;
let comparisonSequence = 0;
let selectedStock;
let chartPrices = [];
const picker = byId('stock-picker');
function selection() {
  return [...picker.querySelectorAll('input:checked')].map(input => input.value);
}

function showSelectionCount() {
  byId('selection-count').textContent = `${selection().length} selected`;
}

function setStocks(universe) {
  const defaults = new Set(universe === UNIVERSE ? ['AAPL', 'MSFT', 'NVDA'] : universe);
  picker.replaceChildren(...universe.map(symbol => {
    const label = element('label', null, 'stock-choice');
    const box = element('input');
    box.type = 'checkbox';
    box.value = symbol;
    box.checked = defaults.has(symbol);
    label.append(box, symbol);
    return label;
  }));
  showSelectionCount();
}

picker.addEventListener('change', showSelectionCount);
for (const [id, checked] of [['select-all', true], ['clear-all', false]]) {
  byId(id).addEventListener('click', () => {
    for (const box of picker.querySelectorAll('input')) box.checked = checked;
    showSelectionCount();
  });
}
setStocks(UNIVERSE);
form.elements.analysisDate.add(new Option(CUTOFF, CUTOFF));

function drawChart() {
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height || !chartPrices.length) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext('2d');
  if (!context) return;
  context.scale(ratio, ratio);
  const left = 64;
  const right = width - 12;
  const top = 14;
  const bottom = height - 30;
  const values = chartPrices.map(point => point.adjusted_close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const low = min - spread * .15;
  const high = max + spread * .15;
  const y = price => bottom - (price - low) / (high - low) * (bottom - top);

  context.font = '12px system-ui';
  context.fillStyle = '#4c6667';
  context.textBaseline = 'middle';
  for (let index = 0; index <= 4; index += 1) {
    const price = low + (high - low) * index / 4;
    const position = y(price);
    context.fillText(usd.format(price), 0, position);
    context.strokeStyle = '#d8e6e0';
    context.beginPath();
    context.moveTo(left, position);
    context.lineTo(right, position);
    context.stroke();
  }
  context.textBaseline = 'alphabetic';
  context.fillText(chartPrices[0].observation_date, left, height - 7);
  context.textAlign = 'right';
  context.fillText(chartPrices.at(-1).observation_date, right, height - 7);

  context.strokeStyle = '#00644f';
  context.lineWidth = 3;
  context.beginPath();
  values.forEach((value, index) => {
    const position = left + index / (values.length - 1) * (right - left);
    if (index === 0) context.moveTo(position, y(value));
    else context.lineTo(position, y(value));
  });
  context.stroke();
}

function renderPriceWindow() {
  if (!selectedStock) return;
  chartPrices = selectedStock.prices.slice(-Number(chartWindow.value));
  const first = chartPrices[0];
  const last = chartPrices.at(-1);
  byId('chart-summary').textContent =
    `${chartPrices.length} observations from ${first.observation_date} to ${last.observation_date}. Adjusted close moved from ${usd.format(first.adjusted_close)} to ${usd.format(last.adjusted_close)}.`;
  byId('market-rows').replaceChildren(...chartPrices.map(point => row(
    point.observation_date, usd.format(point.adjusted_close), point.source_id,
  )));
  drawChart();
}

function showStock(symbol) {
  selectedStock = view.stocks.find(stock => stock.symbol === symbol);
  for (const button of document.querySelectorAll('[data-stock-detail]')) {
    button.setAttribute('aria-pressed', String(button.value === symbol));
  }
  byId('detail-title').textContent = company[symbol] ? `${symbol} · ${company[symbol]}` : symbol;
  byId('detail-summary').textContent =
    `Rank ${selectedStock.rank} of ${view.stocks.length} · Score ${selectedStock.score.toFixed(2)} · Momentum ${percent(selectedStock.momentum)} · Daily volatility ${percent(selectedStock.volatility)}`;
  renderPriceWindow();
}

function detailButton(symbol) {
  const button = element('button', symbol, 'ticker');
  button.type = 'button';
  button.value = symbol;
  button.dataset.stockDetail = '';
  button.setAttribute('aria-label', `View ${symbol} details`);
  button.addEventListener('click', () => {
    showStock(symbol);
    byId('detail-title').focus();
  });
  return button;
}

let analyzed = [];
let events = [];
let activeDataset;
const eventPicker = byId('event-picker');

function renderEventResults() {
  const checked = [...eventPicker.querySelectorAll('input:checked')];
  const cutoff = view.comparison.analysis_date;
  const history = activeDataset?.priceHistory ?? new Map(view.stocks.map(stock => [
    stock.symbol, new Map(stock.prices.map(price => [price.observation_date, price.adjusted_close])),
  ]));
  const horizon = Number(byId('event-horizon').value);
  const sections = checked.map(input => {
    const event = events[Number(input.value)];
    const section = element('section', null, 'event-result');
    section.append(element('h3', event.title));
    if (event.context) section.append(element('p', event.context));
    const scroll = element('div', null, 'table-scroll');
    const table = element('table');
    table.setAttribute('aria-label', event.title + ' stock moves');
    const header = element('tr');
    for (const label of ['Stock', 'Relationship', 'Before close', 'After close', 'Observed return']) {
      const cell = element('th', label);
      cell.scope = 'col';
      header.append(cell);
    }
    const head = element('thead');
    head.append(header);
    const body = element('tbody');
    if (event.url && !activeDataset) {
      section.append(element('p', 'Import historical prices covering this announcement to calculate observed returns.'));
      return section;
    }
    const changes = eventResponse(event, analyzed.map(stock => stock.symbol), history, cutoff, horizon);
    const covered = changes.filter(change => change.change !== null);
    const summary = covered.length
      ? `${covered.filter(change => change.change > 0).length} rose, ${covered.filter(change => change.change < 0).length} fell, and ${covered.filter(change => change.change === 0).length} were flat across ${covered.length} stocks with coverage.`
      : 'No selected stocks have both closing observations in the current price history and cutoff.';
    section.append(element('p', summary));
    body.append(...changes.map(change => row(
      change.symbol, change.direct ? 'Named company' : 'Comparison stock',
      change.before ?? '—', change.after ?? '—',
      change.change === null ? 'Insufficient prices' : percent(change.change),
    )));
    table.append(head, body);
    scroll.append(table);
    section.append(scroll);
    return section;
  });
  byId('event-results').replaceChildren(...(sections.length ? sections : [element('p', 'Select news above to see price moves.')]));
}

function renderEventPicker() {
  const candidates = activeDataset
    ? [...historicalEvents, ...activeDataset.news]
    : [...sampleEvents, ...historicalEvents];
  const seen = new Set();
  events = candidates.filter(event => {
    const key = event.symbol + '|' + (event.url ?? event.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((first, second) => second.publication_date.localeCompare(first.publication_date));
  eventPicker.replaceChildren(...events.map((event, index) => {
    const container = element('div', null, 'event-option');
    const label = element('label', null, 'stock-choice');
    const box = element('input');
    box.type = 'checkbox';
    box.value = index;
    box.checked = index === 0;
    label.append(box, `${event.publication_date} · ${event.symbol} · ${event.title}${event.url ? '' : ' (fictional)'}`);
    container.append(label);
    if (event.url) {
      const source = element('a', 'Original source');
      source.href = event.url;
      source.referrerPolicy = 'no-referrer';
      container.append(source);
    }
    return container;
  }));
  renderEventResults();
}

eventPicker.addEventListener('change', renderEventResults);
byId('event-horizon').addEventListener('change', renderEventResults);

function renderDashboard(symbols) {
  const comparison = view.comparison;
  analyzed = selectedResearchStocks(view, symbols);
  const [first, second] = analyzed;
  const lastMarketDate = view.stocks[0].prices.at(-1).observation_date;
  byId('ranking-scope').textContent = `${view.stocks.length} ranked · ${analyzed.length} selected for analysis`;
  byId('comparison-dates').textContent =
    `Analysis date ${comparison.analysis_date} · Market data through ${lastMarketDate}`;
  byId('comparison-scores').replaceChildren(...analyzed.map(stock => row(
    detailButton(stock.symbol), stock.score.toFixed(2), percent(stock.momentum), percent(stock.volatility),
    `${stock.contributions.momentum.toFixed(2)} / ${stock.contributions.volatility.toFixed(2)}`,
  )));
  const gap = first.score - second.score;
  const leaders = analyzed.filter(stock => first.score - stock.score <= 1e-6);
  const momentumGap = first.contributions.momentum - second.contributions.momentum;
  const volatilityGap = first.contributions.volatility - second.contributions.volatility;
  byId('model-explanation').textContent = leaders.length > 1
    ? `${leaders.map(stock => stock.symbol).join(', ')} share the highest score of ${first.score.toFixed(2)}.`
    : `${first.symbol} leads ${second.symbol} by ${gap.toFixed(2)} points. Their contributions differ by ${momentumGap.toFixed(2)} momentum points and ${volatilityGap.toFixed(2)} low-volatility points.`;
  byId('ranking-rows').replaceChildren(...view.stocks.map(stock =>
    row(String(stock.rank), detailButton(stock.symbol), stock.score.toFixed(2))));
  results.hidden = false;
  showStock(first.symbol);
  renderEventPicker();
}

async function compare() {
  const sequence = ++comparisonSequence;
  const status = byId('research-status');
  const symbols = selection();
  if (symbols.length < 2) {
    results.hidden = true;
    status.textContent = 'Select at least two stocks.';
    form.querySelector('button[type="submit"]').disabled = false;
    return;
  }
  const workingDataset = dataset;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  results.hidden = true;
  status.textContent = 'Checking snapshot evidence…';
  try {
    const analysisDate = form.elements.analysisDate.value;
    const run = await compareWithExplanationModel({
      stockA: symbols[0], stockB: symbols[1], analysisDate,
      evidenceSource: workingDataset?.sourceFor(analysisDate),
    });
    if (sequence !== comparisonSequence) return;
    view = researchView(run);
    if (!view) {
      status.textContent = run.request.reason === 'duplicate_symbols'
        ? 'Choose two different stocks.'
        : 'A comparison is unavailable for this pair and date.';
      return;
    }
    activeDataset = workingDataset;
    renderDashboard(symbols);
    status.textContent = `Analysis ready for ${symbols.length} stocks.`;
  } catch (error) {
    if (sequence !== comparisonSequence) return;
    results.hidden = true;
    status.textContent = 'The snapshot could not be loaded. Try comparing again.';
    console.error(error);
  } finally {
    if (sequence === comparisonSequence) button.disabled = false;
  }
}

const importForm = byId('import-form');
const importStatus = byId('import-status');
const sampleButton = byId('sample-data');

function useDataset(nextDataset) {
  dataset = nextDataset;
  setStocks(dataset?.universe ?? UNIVERSE);
  const dates = dataset?.dates ?? [CUTOFF];
  form.elements.analysisDate.replaceChildren(...dates.map(date => new Option(date, date)));
  byId('data-source').textContent = dataset
    ? 'Imported historical data · Yahoo Finance CSV'
    : 'Sample data · Fictional prices and news';
  sampleButton.disabled = !dataset;
  void compare();
}

importForm.addEventListener('submit', async event => {
  event.preventDefault();
  const loadButton = importForm.querySelector('button[type="submit"]');
  loadButton.disabled = true;
  sampleButton.disabled = true;
  importStatus.textContent = 'Checking imported files…';
  try {
    const files = [...importForm.elements.prices.files];
    const newsFile = importForm.elements.news.files[0];
    if (files.length < 2 || files.length > MAX_IMPORT_STOCKS) throw new Error(`Choose between 2 and ${MAX_IMPORT_STOCKS} ticker CSVs.`);
    const priceFiles = await Promise.all(files.map(async file => ({ name: file.name, text: await file.text() })));
    const news = newsFile ? readNews(await newsFile.text()) : [];
    const imported = prepareImport(priceFiles, news);
    importForm.reset();
    useDataset(imported);
    importStatus.textContent = `Imported ${imported.universe.length} tickers and ${imported.dates.length} eligible analysis dates.`;
  } catch (error) {
    importStatus.textContent = `Import failed. ${error.message}`;
  } finally {
    loadButton.disabled = false;
    sampleButton.disabled = !dataset;
  }
});

sampleButton.addEventListener('click', () => {
  importForm.reset();
  importStatus.textContent = '';
  useDataset(undefined);
});

form.addEventListener('submit', event => {
  event.preventDefault();
  void compare();
});
chartWindow.addEventListener('change', renderPriceWindow);
new ResizeObserver(drawChart).observe(canvas);
void compare();
