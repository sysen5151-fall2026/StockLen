import { isoDate } from './market-csv.mjs';

export function hydrateSessions(sessions) {
  const market = new Map();
  for (const { day, stocks } of sessions) {
    for (const { ticker, close, volume } of stocks) {
      if (!market.has(ticker)) market.set(ticker, { prices: new Map(), volumes: new Map() });
      const history = market.get(ticker);
      history.prices.set(day, close);
      if (volume != null) history.volumes.set(day, volume);
    }
  }
  return market;
}

export function rankReaction(universe, market, eventDate, sessions) {
  const event = isoDate(eventDate);
  if (![1, 3, 5].includes(sessions)) throw new Error('Choose a supported reaction window.');
  const benchmark = market.get('SPY')?.prices;
  if (!benchmark) throw new Error('SPY data are required to adjust returns for the broad market.');
  const dates = [...benchmark.keys()].sort();
  const before = dates.findLast(date => date < eventDate);
  const after = dates.filter(date => date > eventDate)[sessions - 1];
  const days = date => Math.abs(isoDate(date) - event) / 86400000;
  if (!before || !after || days(before) > 7 || days(after) > 14) {
    throw new Error('SPY data do not cover the selected event window.');
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
