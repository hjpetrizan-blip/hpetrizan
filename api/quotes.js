export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const symbols = (req.query.symbols || '^VIX,^VVIX').split(',');
  const results = {};
  await Promise.all(symbols.map(async (sym) => {
    try {
      const r = await fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=1d&range=1d',
        { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }
      );
      const d = await r.json();
      const meta = d?.chart?.result?.[0]?.meta;
      results[sym] = {
        price: meta?.regularMarketPrice,
        prev: meta?.chartPreviousClose,
        change: meta?.regularMarketPrice && meta?.chartPreviousClose
          ? ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100).toFixed(2)
          : null
      };
    } catch(e) { results[sym] = { price: null, prev: null, change: null }; }
  }));
  return res.status(200).json(results);
}
