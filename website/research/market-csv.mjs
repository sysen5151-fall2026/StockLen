export const isImportSymbol = symbol => typeof symbol === 'string' && /^[A-Z][A-Z0-9]{0,9}(?:[-.][A-Z0-9]{1,4})?$/.test(symbol);

export function isoDate(value) {
  const date = new Date(value + 'T00:00:00Z');
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)
    || !Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('Use a valid date in YYYY-MM-DD format.');
  }
  return date;
}

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
  const volumes = new Map();
  const volumeIndex = columns.indexOf('volume');
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
    const volume = cells[volumeIndex] === '' ? NaN : Number(cells[volumeIndex]);
    if (Number.isSafeInteger(volume) && volume >= 0) volumes.set(date, volume);
  }
  if (!prices.size) throw new Error(symbol + ': no price records.');
  return { symbol, prices, volumes };
}
