import { UNIVERSE } from '../js/evidence.mjs';
import { CUTOFF } from '../js/system.mjs';
import { compareWithExplanationModel } from '../js/local-explanation.mjs';
import { prepareImport, readNews } from './local-import.mjs';
import { researchView } from './research-data.mjs';

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
for (const name of ['stockA', 'stockB']) {
  for (const symbol of UNIVERSE) {
    form.elements[name].add(new Option(symbol + ' · ' + company[symbol], symbol));
  }
}
form.elements.stockB.value = 'MSFT';
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
  for (const button of byId('ranking-rows').querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.value === symbol));
  }
  byId('detail-title').textContent = `${symbol} · ${company[symbol]}`;
  byId('detail-summary').textContent =
    `Rank ${selectedStock.rank} of ${view.stocks.length} · Score ${selectedStock.score.toFixed(2)} · Momentum ${percent(selectedStock.momentum)} · Daily volatility ${percent(selectedStock.volatility)}`;
  renderPriceWindow();
}

function renderDashboard() {
  const comparison = view.comparison;
  const [first, second] = comparison.stock_pair;
  const [firstScore, secondScore] = comparison.stocks;
  const lastMarketDate = view.stocks[0].prices.at(-1).observation_date;
  byId('comparison-dates').textContent =
    `Analysis date ${comparison.analysis_date} · Market data through ${lastMarketDate}`;
  byId('comparison-scores').replaceChildren(...comparison.stocks.map(stock => {
    const card = element('div', null, 'score-card');
    card.append(
      element('h3', stock.symbol),
      element('p', company[stock.symbol]),
      element('p', stock.display_score, 'score-number'),
    );
    return card;
  }));
  byId('model-explanation').textContent =
    comparison.explanation.text || 'Local model explanation unavailable. The calculated factors are shown below.';
  byId('driver-first').textContent = first;
  byId('driver-second').textContent = second;
  byId('driver-rows').replaceChildren(...comparison.drivers.map(driver => row(
    driver.factor === 'momentum' ? 'Momentum' : 'Volatility',
    `${percent(driver.first_value)} · ${firstScore.contributions[driver.factor].toFixed(2)} pts`,
    `${percent(driver.second_value)} · ${secondScore.contributions[driver.factor].toFixed(2)} pts`,
    driver.contribution_difference.toFixed(2),
  )));
  byId('news-evidence').replaceChildren(...comparison.stock_pair.map(symbol => {
    const evidence = comparison.news.filter(item => item.symbol === symbol);
    const list = element('ul');
    for (const item of evidence) {
      const line = element('li');
      if (item.url) {
        const link = element('a', item.title);
        link.href = item.url;
        link.referrerPolicy = 'no-referrer';
        line.append(link, ' · Published ' + item.publication_date);
      } else {
        line.append(`${item.title} · Published ${item.publication_date} · Source ${item.source_id}`);
      }
      list.append(line);
    }
    const section = element('div');
    section.append(element('strong', symbol), evidence.length ? list : element('p', 'No qualifying news is available.'));
    return section;
  }));

  byId('ranking-rows').replaceChildren(...view.stocks.map(stock => {
    const button = element('button', stock.symbol);
    button.type = 'button';
    button.value = stock.symbol;
    button.setAttribute('aria-label', `View ${company[stock.symbol]} (${stock.symbol}) details`);
    button.addEventListener('click', () => {
      showStock(stock.symbol);
      byId('detail-title').focus();
    });
    return row(String(stock.rank), button, stock.score.toFixed(2));
  }));
  results.hidden = false;
  showStock(first);
}

async function compare() {
  const sequence = ++comparisonSequence;
  const status = byId('research-status');
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  results.hidden = true;
  status.textContent = 'Checking snapshot evidence…';
  try {
    const options = Object.fromEntries(new FormData(form));
    const run = await compareWithExplanationModel({
      ...options, evidenceSource: dataset?.sourceFor(options.analysisDate),
    });
    if (sequence !== comparisonSequence) return;
    view = researchView(run);
    if (!view) {
      status.textContent = run.request.reason === 'duplicate_symbols'
        ? 'Choose two different stocks.'
        : 'A comparison is unavailable for this pair and date.';
      return;
    }
    renderDashboard();
    status.textContent = run.history.at(-1).state === 'completed_with_limitations'
      ? 'Comparison ready with evidence or explanation limitations.'
      : 'Comparison ready.';
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
    if (files.length !== UNIVERSE.length) throw new Error('Select one CSV per ticker (ten files).');
    const priceFiles = await Promise.all(files.map(async file => ({ name: file.name, text: await file.text() })));
    const news = newsFile ? readNews(await newsFile.text()) : [];
    const imported = prepareImport(priceFiles, news);
    importForm.reset();
    useDataset(imported);
    importStatus.textContent = `Imported ten tickers and ${imported.dates.length} eligible analysis dates.`;
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
