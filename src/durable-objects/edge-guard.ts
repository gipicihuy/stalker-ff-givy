// Durable Object per-IP buat tiga hal sekaligus (satu DO instance = satu
// IP, id-nya di-derive dari IP lewat idFromName): rate limiting yang
// konsisten di seluruh edge (bukan in-memory Map per-isolate yang gampang
// dihindari dengan gonta-ganti PoP/region), replay guard buat handshake
// token (single-use), dan flag blacklist buat IP yang kena honeypot.
//
// Nggak dipisah jadi 3 DO class karena semuanya per-IP dan saling berkaitan
// (mis. "sudah kena rate limit N kali" bisa jadi sinyal tambahan), dan biar
// nggak nambah binding + migration yang nggak perlu.

interface RateBucket {
  count: number;
  windowStart: number;
}

const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
const MAX_TRACKED_NONCES = 500; // hard cap jaga-jaga per DO instance

export class EdgeGuardDO {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    try {
      switch (url.pathname) {
        case '/rate':
          return await this.handleRate(request);
        case '/consume-nonce':
          return await this.handleConsumeNonce(request);
        case '/blacklist':
          return await this.handleBlacklist(request);
        case '/status':
          return await this.handleStatus();
        default:
          return new Response(JSON.stringify({ error: 'not_found' }), { status: 404 });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: 'guard_internal_error', detail: String(err) }), {
        status: 500,
      });
    }
  }

  // Sliding-ish fixed-window counter. Cukup buat tujuan "bikin scraper
  // effort lebih" - nggak perlu presisi token-bucket buat use case ini.
  private async handleRate(request: Request): Promise<Response> {
    const { limit, windowMs } = (await request.json()) as { limit: number; windowMs: number };
    const now = Date.now();
    const stored = (await this.state.storage.get<RateBucket>('rate')) || null;

    let bucket: RateBucket;
    if (!stored || now - stored.windowStart > windowMs) {
      bucket = { count: 1, windowStart: now };
    } else {
      bucket = { count: stored.count + 1, windowStart: stored.windowStart };
    }
    await this.state.storage.put('rate', bucket);
    await this.scheduleSweep();

    const allowed = bucket.count <= limit;
    const retryAfterMs = allowed ? 0 : Math.max(0, bucket.windowStart + windowMs - now);
    return Response.json({ allowed, remaining: Math.max(0, limit - bucket.count), retryAfterMs });
  }

  // Single-use enforcement buat handshake token: token/nonce yang sama
  // cuma boleh "fresh" sekali. Request kedua dst dengan nonce yang sama
  // dianggap replay dan ditolak.
  private async handleConsumeNonce(request: Request): Promise<Response> {
    const { nonce, ttlMs } = (await request.json()) as { nonce: string; ttlMs: number };
    const key = `nonce:${nonce}`;
    const now = Date.now();
    const existingExpiry = await this.state.storage.get<number>(key);

    if (existingExpiry && existingExpiry > now) {
      return Response.json({ fresh: false });
    }

    await this.state.storage.put(key, now + ttlMs);
    await this.enforceNonceCap();
    await this.scheduleSweep();
    return Response.json({ fresh: true });
  }

  private async handleBlacklist(request: Request): Promise<Response> {
    const { ttlMs, reason } = (await request.json()) as { ttlMs: number; reason?: string };
    const until = Date.now() + ttlMs;
    await this.state.storage.put('blacklistedUntil', until);
    await this.state.storage.put('blacklistReason', reason || 'unspecified');
    await this.scheduleSweep();
    return Response.json({ blacklisted: true, until });
  }

  private async handleStatus(): Promise<Response> {
    const until = (await this.state.storage.get<number>('blacklistedUntil')) || 0;
    const reason = (await this.state.storage.get<string>('blacklistReason')) || null;
    const blacklisted = until > Date.now();
    return Response.json({ blacklisted, until: blacklisted ? until : 0, reason: blacklisted ? reason : null });
  }

  // Jaga-jaga kalau ada IP yang spam bikin nonce baru terus-terusan tanpa
  // pernah "istirahat" (window rate limit harusnya udah nyekek ini duluan,
  // tapi hard cap ini backstop kedua).
  private async enforceNonceCap() {
    const all = await this.state.storage.list<number>({ prefix: 'nonce:' });
    if (all.size <= MAX_TRACKED_NONCES) return;
    const entries = [...all.entries()].sort((a, b) => a[1] - b[1]);
    const toDelete = entries.slice(0, entries.length - MAX_TRACKED_NONCES).map(([k]) => k);
    if (toDelete.length) await this.state.storage.delete(toDelete);
  }

  private async scheduleSweep() {
    const current = await this.state.storage.getAlarm();
    if (current === null) {
      await this.state.storage.setAlarm(Date.now() + SWEEP_INTERVAL_MS);
    }
  }

  // Nyapu nonce yang udah expired biar storage DO nggak numpuk buat IP
  // yang aktif dalam waktu lama.
  async alarm() {
    const all = await this.state.storage.list<number>({ prefix: 'nonce:' });
    const now = Date.now();
    const toDelete: string[] = [];
    for (const [key, expiresAt] of all) {
      if (expiresAt < now) toDelete.push(key);
    }
    if (toDelete.length) await this.state.storage.delete(toDelete);
  }
}
