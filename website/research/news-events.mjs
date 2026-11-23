export const historicalEvents = [
  {
    symbol: 'MSFT', publication_date: '2025-01-29', title: 'Microsoft reports fiscal 2025 second-quarter results',
    context: 'Microsoft reported growth in cloud services. Watch MSFT for the direct company response and other selected stocks for contemporaneous moves.',
    url: 'https://news.microsoft.com/source/2025/01/29/microsoft-cloud-and-ai-strength-drives-second-quarter-results-2/',
  },
  {
    symbol: 'AAPL', publication_date: '2025-01-30', title: 'Apple releases fiscal 2025 first-quarter earnings',
    context: 'Apple reported its quarterly results and services revenue. The announcement directly concerns AAPL.',
    url: 'https://www.apple.com/newsroom/2025/01/apple-reports-first-quarter-results/',
  },
  {
    symbol: 'NVDA', publication_date: '2025-02-26', title: 'NVIDIA releases fiscal 2025 fourth-quarter earnings',
    context: 'NVIDIA reported higher data center revenue. The announcement directly concerns NVDA.',
    url: 'https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-fourth-quarter-and-fiscal-2025',
  },
];

export const sampleEvents = [
  { symbol: 'MSFT', publication_date: '2026-09-08', title: 'Sample cloud business update' },
  { symbol: 'NVDA', publication_date: '2026-09-11', title: 'Sample chip product announcement' },
  { symbol: 'AAPL', publication_date: '2026-09-16', title: 'Sample quarterly business update' },
];

export function eventResponse(event, symbols, priceHistory, cutoff, horizon) {
  const dates = [...new Set(symbols.flatMap(symbol => [...(priceHistory.get(symbol)?.keys() ?? [])]))]
    .filter(date => date <= cutoff).sort();
  const before = dates.findLast(date => date < event.publication_date);
  const after = dates.filter(date => date > event.publication_date)[horizon - 1];
  return symbols.map(symbol => {
    const prices = priceHistory.get(symbol);
    const first = prices?.get(before);
    const last = prices?.get(after);
    const change = first > 0 && last > 0 ? last / first - 1 : null;
    return { symbol, before, after, change, direct: symbol === event.symbol };
  });
}
