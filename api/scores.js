const DAY_MS    = 24 * 60 * 60 * 1000;
const STORE_KEY = 'tatu:store';

const REDIS_URL   = (process.env.UPSTASH_REDIS_REST_URL   || '').replace(/^["']|["']$/g, '').trim();
const REDIS_TOKEN = (process.env.UPSTASH_REDIS_REST_TOKEN || '').replace(/^["']|["']$/g, '').trim();

// In-memory cache — used within the same warm Lambda instance
let mem = null;

async function redisCmd(...args) {
  if (!REDIS_URL) return null;
  try {
    const r = await fetch(REDIS_URL, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
    const j = await r.json();
    return j.result ?? null;
  } catch (e) { return null; }
}

async function loadStore() {
  if (mem) return; // already cached this instance
  const raw = await redisCmd('GET', STORE_KEY);
  if (raw) {
    try { mem = JSON.parse(raw); } catch (e) {}
  }
  if (!mem || !mem.players) {
    mem = { players: [], companyTotal: 0, rateLimit: {} };
  }
  mem.players     = mem.players     || [];
  mem.companyTotal = mem.companyTotal || 0;
  mem.rateLimit   = mem.rateLimit   || {};
}

async function saveStore() {
  await redisCmd('SET', STORE_KEY, JSON.stringify(mem));
}

function buildPayload() {
  const sectorTotals = {};
  for (const p of mem.players) {
    sectorTotals[p.setorId] = (sectorTotals[p.setorId] || 0) + p.score;
  }
  return { players: mem.players, companyTotal: mem.companyTotal, sectorTotals };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  await loadStore();

  if (req.method === 'GET') {
    const qs = new URL(req.url, 'http://localhost').searchParams;
    if (qs.get('debug') === '1') {
      let redisOk = false, redisError = null, redisRaw = null, redisStatus = null;
      try {
        const r = await fetch(REDIS_URL, {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' },
          body: JSON.stringify(['SET', 'tatu:ping', 'pong'])
        });
        redisStatus = r.status;
        redisRaw = await r.json();
        redisOk = redisRaw && redisRaw.result === 'OK';
      } catch(e) { redisError = String(e); }
      return res.status(200).json({
        redisConfigured: !!REDIS_URL,
        redisUrlPrefix: REDIS_URL ? REDIS_URL.slice(0, 35) + '…' : null,
        redisStatus,
        redisRaw,
        redisOk,
        redisError,
        players: mem.players.length
      });
    }
    return res.status(200).json(buildPayload());
  }

  if (req.method === 'POST') {
    const b       = req.body || {};
    const name    = String(b.name    || 'Anônimo').slice(0, 20);
    const setor   = String(b.setor   || '');
    const setorId = String(b.setorId || '');
    const score   = Math.max(0, parseInt(b.score, 10) || 0);

    const key      = name.toLowerCase().trim() + ':' + setorId;
    const lastPlay = mem.rateLimit[key];
    if (lastPlay && (Date.now() - lastPlay) < DAY_MS) {
      return res.status(200).json({ ...buildPayload(), rateLimited: true, nextAllowed: lastPlay + DAY_MS });
    }

    mem.rateLimit[key] = Date.now();
    const entry = { name, setor, setorId, score, ts: Date.now() };
    mem.companyTotal += score;
    mem.players.push(entry);
    mem.players.sort((a, b) => b.score - a.score);
    const rank = mem.players.indexOf(entry) + 1;
    if (mem.players.length > 500) mem.players = mem.players.slice(0, 500);

    await saveStore();
    return res.status(200).json({ ...buildPayload(), rank });
  }

  if (req.method === 'DELETE') {
    const qs = new URL(req.url, 'http://localhost').searchParams;
    if (qs.get('ratelimit') === '1') {
      mem.rateLimit = {};
      await saveStore();
      return res.status(200).json({ ok: true, cleared: 'ratelimit', players: mem.players.length });
    }
    mem = { players: [], companyTotal: 0, rateLimit: {} };
    await saveStore();
    return res.status(200).json({ ok: true, cleared: 'all' });
  }

  return res.status(405).end();
};
