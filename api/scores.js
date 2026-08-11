const DAY_MS = 24 * 60 * 60 * 1000;

let store = { players: [], companyTotal: 0, rateLimit: {} };

function buildPayload() {
  const sectorTotals = {};
  for (const p of store.players) {
    sectorTotals[p.setorId] = (sectorTotals[p.setorId] || 0) + p.score;
  }
  return { players: store.players, companyTotal: store.companyTotal, sectorTotals };
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json(buildPayload());
  }

  if (req.method === 'POST') {
    const b = req.body || {};
    const name    = String(b.name    || 'Anônimo').slice(0, 20);
    const setor   = String(b.setor   || '');
    const setorId = String(b.setorId || '');
    const score   = Math.max(0, parseInt(b.score, 10) || 0);

    const key = name.toLowerCase().trim() + ':' + setorId;
    const lastPlay = store.rateLimit[key];
    if (lastPlay && (Date.now() - lastPlay) < DAY_MS) {
      return res.status(200).json({ ...buildPayload(), rateLimited: true, nextAllowed: lastPlay + DAY_MS });
    }

    store.rateLimit[key] = Date.now();
    const entry = { name, setor, setorId, score, ts: Date.now() };
    store.companyTotal += score;
    store.players.push(entry);
    store.players.sort((a, b) => b.score - a.score);
    const rank = store.players.indexOf(entry) + 1;
    if (store.players.length > 500) store.players = store.players.slice(0, 500);
    return res.status(200).json({ ...buildPayload(), rank });
  }

  if (req.method === 'DELETE') {
    store = { players: [], companyTotal: 0, rateLimit: {} };
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
};
