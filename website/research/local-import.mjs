import { MAX_IMPORT_STOCKS, isImportSymbol, importConfiguration, isoDate, requestDatedRecords, validateEvidence } from '../js/evidence.mjs';

function csvRow(line) {
  // Yahoo exports one record per line. Allow quoted cells and escaped quotes.
  const fields = [];
  const field = /(?:"((?:[^"]|"")*)"|([^",]*))(,|$)/gy;
  let position = 0;
  do {
    field.lastIndex = position;
    const match = field.exec(line);
    if (!match) throw new Error('Malformed CSV field.');
    fields.push(match[1] === undefined ? match[2].trim() : match[1].replaceAll('""', '"').trim());
    position = field.lastIndex;
    if (!match[3]) return fields;
  } while (position <= line.length);
}

export function readYahooPrices(filename, text) {
  const symbol = filename.replace(/\.csv$/i, '').toUpperCase();
  if (!/\.csv$/i.test(filename) || !isImportSymbol(symbol)) throw new Error('Use a ticker filename such as AAPL.csv: ' + filename);
  const [header, ...lines] = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim());
  const columns = csvRow(header ?? '').map(column => column.toLowerCase());
  const dateIndex = columns.indexOf('date');
  const priceIndex = columns.indexOf('adj close');
  if (dateIndex < 0 || priceIndex < 0) throw new Error(symbol + ': CSV needs Date and Adj Close columns.');
  const prices = new Map();
  for (const line of lines) {
    const cells = csvRow(line);
    const date = cells[dateIndex];
    const price = Number(cells[priceIndex]);
    const day = isoDate(date).getUTCDay();
    if (day === 0 || day === 6) throw new Error(symbol + ': expected a US weekday on ' + date);
    if (cells.length !== columns.length || !Number.isFinite(price) || price <= 0) {
      throw new Error(symbol + ': invalid adjusted close on ' + date);
    }
    if (prices.has(date)) throw new Error(symbol + ': duplicate observation on ' + date);
    prices.set(date, price);
  }
  if (!prices.size) throw new Error(symbol + ': no price records.');
  return { symbol, prices };
}

export function readNews(text) {
  const input = JSON.parse(text);
  if (!Array.isArray(input)) throw new Error('News JSON must contain an array.');
  return input.map(item => {
    if (!item || !isImportSymbol(item.symbol) || typeof item.title !== 'string' || !item.title.trim()) {
      throw new Error('Each news item needs an eligible ticker and title.');
    }
    isoDate(item.publication_date);
    const link = typeof item.url === 'string' ? URL.parse(item.url) : null;
    if (!link || link.protocol !== 'https:' || link.username || link.password) {
      throw new Error('Each news item needs an HTTPS source URL without credentials.');
    }
    return { symbol: item.symbol, title: item.title.trim(), publication_date: item.publication_date, url: link.href };
  });
}

export function prepareImport(priceFiles, news = []) {
  if (priceFiles.length < 2 || priceFiles.length > MAX_IMPORT_STOCKS) {
    throw new Error(`Choose between 2 and ${MAX_IMPORT_STOCKS} ticker CSVs.`);
  }
  const bySymbol = new Map();
  for (const file of priceFiles) {
    const { symbol, prices } = readYahooPrices(file.name, file.text);
    if (bySymbol.has(symbol)) throw new Error('More than one CSV for ' + symbol + '.');
    bySymbol.set(symbol, prices);
  }
  const universe = [...bySymbol.keys()].sort();

  // Include every supplied market date so a gap in one ticker cannot be skipped.
  const dates = [...new Set([...bySymbol.values()].flatMap(prices => [...prices.keys()]))].sort();
  const windows = new Map();
  for (let end = 20; end < dates.length; end += 1) {
    const window = dates.slice(end - 20, end + 1);
    if (window.every(date => universe.every(symbol => bySymbol.get(symbol).has(date)))) {
      windows.set(dates[end], window);
    }
  }
  if (!windows.size) throw new Error('No complete 21-observation window across the selected universe.');

  return {
    universe,
    news,
    priceHistory: bySymbol,
    dates: [...windows.keys()].reverse(),
    sourceFor(date) {
      if (!windows.has(date)) throw new Error('This date has no complete scoring window.');
      return {
        configuration: importConfiguration(windows.get(date), universe),
        acquire(request, config) {
          const queries = requestDatedRecords(request, config);
          const { market_query: marketQuery, news_query: newsQuery } = queries;
          const association = query => ({
            request_id: query.request_id,
            configuration_id: query.configuration_id,
            query_id: query.query_id,
            provider_id: query.provider_id,
            conditions_id: query.conditions_id,
          });
          const market = universe.flatMap(symbol => config.observation_dates.map(day => ({
            ...association(marketQuery),
            symbol,
            observation_date: day,
            adjusted_close: bySymbol.get(symbol).get(day),
            currency: 'USD',
            source_id: `${symbol}.csv · ${day}`,
          })));
          const items = news.filter(item => newsQuery.symbols.includes(item.symbol)
            && item.publication_date >= newsQuery.start_date
            && item.publication_date <= newsQuery.end_date).map(item => ({
            ...association(newsQuery), ...item,
            source_id: item.symbol + ' · ' + item.url,
            permitted: true,
          }));
          return { queries, evidence: validateEvidence(queries.context, market, items, config) };
        },
      };
    },
  };
}
