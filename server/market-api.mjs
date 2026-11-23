/** The browser reaches a same-site API. The licensed provider key stays server-side. */
const provider = 'https://api.massive.com';
const eastern = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'longOffset' });
const localDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
});
const horizons = [1, 3, 5];
const dayMs = 86400000;

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function parseDay(value) {
  const date = new Date(value + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '') || !Number.isFinite(+date) || date.toISOString().slice(0, 10) !== value) {
    throw new ApiError(400, 'Choose a valid news date.');
  }
  return date;
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function easternDate(date) {
  const parts = Object.fromEntries(localDay.formatToParts(date).map(part => [part.type, part.value]));
  return [parts.year, parts.month, parts.day].join('-');
}

function easternMidnight(date) {
  // Midnight in New York occurs at either 04:00 UTC or 05:00 UTC.
  const utc = new Date(+date + 5 * 3600000);
  const offset = eastern.formatToParts(utc).find(part => part.type === 'timeZoneName').value;
  const hours = Number(offset.slice(4, 6));
  return new Date(+date + hours * 3600000).toISOString();
}

function httpsLink(value) {
  const url = typeof value === 'string' ? URL.parse(value) : null;
  return url?.protocol === 'https:' && !url.username && !url.password ? url.href : null;
}

function articleRecord(article, date) {
  const url = httpsLink(article.article_url);
  const time = new Date(article.published_utc);
  if (!url || !Number.isFinite(+time) || easternDate(time) !== date || !article.id || !article.title) return null;
  const insights = Object.create(null);
  if (Array.isArray(article.insights)) {
    for (const item of article.insights) {
      if (typeof item?.ticker !== 'string' || !['positive', 'neutral', 'negative'].includes(item.sentiment)) continue;
      const ticker = item.ticker.replace('.', '-');
      if (!/^[A-Z][A-Z0-9-]{0,14}$/.test(ticker) || insights[ticker]) continue;
      insights[ticker] = {
        sentiment: item.sentiment,
        reasoning: typeof item.sentiment_reasoning === 'string' ? item.sentiment_reasoning.trim().slice(0, 1000) : '',
      };
    }
  }
  return {
    id: article.id,
    title: article.title,
    description: typeof article.description === 'string' ? article.description.slice(0, 3500) : '',
    date,
    publishedAt: time.toISOString(),
    publisher: article.publisher?.name || '',
    tickers: Array.isArray(article.tickers) ? article.tickers.filter(ticker => typeof ticker === 'string') : [],
    url,
    insights,
  };
}

export function createMarketApi(universe, requestProvider = (url, options) => globalThis.fetch(url.href, options)) {
  const eligible = new Set(universe.map(stock => stock.ticker));

  async function get(path, params, key) {
    const url = new URL(path, provider);
    url.search = new URLSearchParams(params).toString();
    let response;
    try {
      response = await requestProvider(url, {
        headers: { Authorization: 'Bearer ' + key },
        signal: AbortSignal.timeout(15000),
        redirect: 'manual',
      });
    } catch (error) {
      console.error('Market data connection failed:', error?.name, error?.message);
      throw new ApiError(502, 'The market data service could not be reached.');
    }
    if (response.status === 429) throw new ApiError(429, 'The data provider rate limit was reached. Try again shortly.');
    if ([401, 403].includes(response.status)) throw new ApiError(503, 'The data provider has not authorized this request.');
    if (!response.ok) throw new ApiError(502, 'The market data service returned an error.');
    const result = await response.json();
    if (result.status === 'ERROR') throw new ApiError(502, 'The market data service returned an error.');
    return result;
  }

  async function news(query, key) {
    const date = parseDay(query.get('date'));
    const ticker = query.get('ticker');
    const cursor = query.get('cursor');
    const keyword = (query.get('keyword') ?? '').trim();
    if (keyword.length > 120) throw new ApiError(400, 'The news search must be 120 characters or fewer.');
    const terms = keyword.toLowerCase().split(/\s+/).filter(Boolean);
    if (ticker && !eligible.has(ticker)) throw new ApiError(400, 'The ticker is outside the research universe.');
    if (cursor && !/^[A-Za-z0-9_+=/.-]{1,1024}$/.test(cursor)) throw new ApiError(400, 'Invalid news page.');
    const result = await get('/v2/reference/news', {
      'published_utc.gte': easternMidnight(date),
      'published_utc.lt': easternMidnight(new Date(+date + dayMs)),
      limit: terms.length ? 200 : 50, sort: 'published_utc', order: 'desc', ...(ticker && { ticker: ticker.replace('-', '.') }),
      ...(cursor && { cursor }),
    }, key);
    const next = httpsLink(result.next_url);
    return {
      articles: (result.results ?? []).map(item => articleRecord(item, dateKey(date))).filter(article => {
        if (!article) return false;
        const searchable = [article.title, article.description, article.publisher, ...article.tickers].join(' ').toLowerCase();
        return terms.every(term => searchable.includes(term));
      }),
      cursor: next ? new URL(next).searchParams.get('cursor') : null,
    };
  }

  async function window(query, key, now) {
    const eventDate = parseDay(query.get('date'));
    const horizon = Number(query.get('horizon'));
    const selected = [...new Set((query.get('symbols') ?? '').split(','))];
    if (!horizons.includes(horizon) || selected.length < 2 || selected.length > eligible.size
      || selected.some(symbol => !eligible.has(symbol))) throw new ApiError(400, 'Select 2–100 eligible stocks and a valid window.');
    const requested = new Set(['SPY', ...selected]);
    const today = easternDate(now);
    if (dateKey(eventDate) >= today) throw new ApiError(422, 'Choose a historical event date with completed trading sessions.');

    async function fetchDay(day) {
      const payload = await get('/v2/aggs/grouped/locale/us/market/stocks/' + day, {
        adjusted: 'true', include_otc: 'false',
      }, key);
      if (!payload.results?.length) return null;
      if (payload.adjusted !== true) throw new ApiError(502, 'The provider did not confirm split-adjusted prices.');
      const stocks = (payload.results ?? []).flatMap(({ T, c, v }) => {
        const ticker = T?.replace('.', '-');
        return requested.has(ticker) && Number.isFinite(c) && c > 0
          ? [{ ticker, close: c, volume: Number.isFinite(v) && v >= 0 ? v : null }] : [];
      });
      return stocks.some(stock => stock.ticker === 'SPY') ? { day, stocks } : null;
    }

    const event = +eventDate;
    let before;
    for (let offset = -1; offset >= -7 && !before; offset -= 1) {
      const date = new Date(event + offset * dayMs);
      if (date.getUTCDay() % 6 !== 0) before = await fetchDay(dateKey(date));
    }
    const after = [];
    for (let offset = 1; offset <= 14 && after.length < horizon; offset += 1) {
      const date = new Date(event + offset * dayMs);
      const day = dateKey(date);
      if (day >= today) break;
      if (date.getUTCDay() % 6 === 0) continue;
      const data = await fetchDay(day);
      if (data) after.push(data);
    }
    if (!before || after.length !== horizon) throw new ApiError(422, 'No complete SPY event window was available for this date.');
    return { sessions: [before, ...after] };
  }

  return async function route(request, env, now = new Date()) {
    const url = new URL(request.url);
    if (!['/api/news', '/api/market-window'].includes(url.pathname)) return null;
    if (request.method !== 'GET') return Response.json({ error: 'Method not allowed.' }, { status: 405 });
    if (!env.MASSIVE_API_KEY) {
      return Response.json({ error: 'The licensed market data connection is awaiting setup. This site does not use demo data.' }, { status: 503 });
    }
    try {
      const data = url.pathname === '/api/news'
        ? await news(url.searchParams, env.MASSIVE_API_KEY)
        : await window(url.searchParams, env.MASSIVE_API_KEY, now);
      return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 502;
      return Response.json({ error: error instanceof ApiError ? error.message : 'Invalid or unavailable provider response.' }, { status });
    }
  };
}
