import { isoDate } from './market-csv.mjs';

export const yahooArticles = [
  {
    title: 'Nvidia beats quarterly revenue and earnings estimates',
    date: '2025-02-26',
    url: 'https://finance.yahoo.com/video/nvidia-tops-q4-revenue-earnings-213116219.html',
  },
  {
    title: 'Apple reports record quarterly revenue amid lower China sales',
    date: '2025-01-30',
    url: 'https://finance.yahoo.com/news/apple-reports-record-124-3-214435443.html',
  },
];

export function validateYahooArticle({ title, date, url }) {
  const link = URL.parse(url.trim());
  if (!link || link.protocol !== 'https:' || link.hostname !== 'finance.yahoo.com'
    || link.username || link.password || link.port || !/^\/(news|video)\/[^/]+\.html$/.test(link.pathname)) {
    throw new Error('Enter the original finance.yahoo.com news or video article URL.');
  }
  if (!title.trim()) throw new Error('Enter the article title.');
  isoDate(date);
  link.search = '';
  link.hash = '';
  return { title: title.trim(), date, url: link.href };
}

export function rankReaction(universe, market, eventDate, sessions) {
  const event = isoDate(eventDate);
  if (![1, 3, 5].includes(sessions)) throw new Error('Choose a supported reaction window.');
  const benchmark = market.get('SPY')?.prices;
  if (!benchmark) throw new Error('Import SPY.csv to adjust returns for the broad market.');
  const dates = [...benchmark.keys()].sort();
  const before = dates.findLast(date => date < eventDate);
  const after = dates.filter(date => date > eventDate)[sessions - 1];
  const days = date => Math.abs(isoDate(date) - event) / 86400000;
  if (!before || !after || days(before) > 7 || days(after) > 14) {
    throw new Error('The SPY file does not cover the selected event window.');
  }

  const benchmarkReturn = benchmark.get(after) / benchmark.get(before) - 1;
  const covered = [];
  const missing = [];
  for (const stock of universe) {
    const history = market.get(stock.ticker);
    if (!history?.prices.has(before) || !history.prices.has(after)) {
      missing.push(stock);
      continue;
    }
    const priceReturn = history.prices.get(after) / history.prices.get(before) - 1;
    const relative = priceReturn - benchmarkReturn;
    covered.push({ ...stock, priceReturn, relative, magnitude: Math.abs(relative), volume: history.volumes.get(after) });
  }
  covered.sort((a, b) => b.magnitude - a.magnitude || a.ticker.localeCompare(b.ticker));
  return { before, after, benchmarkReturn, covered, missing };
}
