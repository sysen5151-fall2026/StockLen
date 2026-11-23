export function researchView(run) {
  if (!run.display || !run.evidence?.evidence.score_ready) return null;

  const { market_records: market } = run.evidence.evidence;
  const rankings = [...run.scores].sort(
    (first, second) => second.score - first.score || first.symbol.localeCompare(second.symbol),
  );
  // Group near-equal scores using the same tolerance as the comparison.
  let rank = 0;
  let groupScore = Infinity;
  const stocks = rankings.map((row, index) => {
    if (groupScore - row.score > 1e-6) {
      rank = index + 1;
      groupScore = row.score;
    }
    const prices = market.filter(record => record.symbol === row.symbol)
      .sort((first, second) => first.observation_date.localeCompare(second.observation_date));
    return { ...row, rank, prices };
  });

  return { comparison: run.display, stocks };
}

export function selectedResearchStocks(view, symbols) {
  const selected = new Set(symbols);
  const rows = view.stocks.filter(stock => selected.has(stock.symbol));
  if (rows.length < 2 || rows.length !== selected.size) {
    throw new Error('Select at least two stocks in the current ranking universe.');
  }
  return rows;
}
