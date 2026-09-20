// Circuit breaker buat pencarian nickname.
//
// Pencarian nickname bergantung ke login guest ke server Garena (lewat
// ffapis). Kalau Garena nolak semua login (mis. abis update OB baru), tiap
// klik search cuma nembak Garena berkali-kali tanpa hasil. Modul ini nyimpen
// status "diputus" (down) supaya:
//   1. request berikutnya langsung dijawab "maintenance" tanpa nyentuh Garena,
//   2. frontend bisa nampilin label Maintenance + nge-disable input,
//   3. sistem ngecek ulang sendiri tiap beberapa menit dan otomatis nyambung
//      lagi begitu Garena normal (tanpa deploy / tanpa intervensi manual).
//
// Alur status:
//   up   --(pencarian gagal total)--> down (cooldown 1 mnt -> 2 -> 5 -> 10 mnt)
//   down --(cooldown habis, satu request "probe" berhasil)--> up
//   down --(probe gagal)--> down lagi dengan cooldown lebih lama
//
// Penyimpanan: Cache API Cloudflare (`caches.default`) supaya semua isolate di
// satu datacenter lihat status yang sama, plus salinan in-memory per-isolate
// sebagai cadangan (dev lokal / kalau Cache API nggak nyimpen apa-apa). Kalau
// dua sumber itu beda, yang timestamp `t`-nya lebih baru menang, makanya
// "nyambung lagi" ditulis sebagai catatan eksplisit `down:false`, bukan
// sekadar hapus data.

export type SearchHealth = {
  down: boolean;
  until: number; // kapan cooldown habis (ms epoch); sebelum itu tidak ada yang boleh nge-probe
  level: number; // sudah berapa kali gagal beruntun (menentukan panjang cooldown)
  lease: number; // sampai kapan ada request yang lagi ngetes Garena (biar nggak barengan)
  t: number; // kapan data ini ditulis (buat nentuin sumber mana yang lebih baru)
};

const COOLDOWNS_MS = [60_000, 120_000, 300_000, 600_000];
const PROBE_LEASE_MS = 20_000;
const CACHE_URL = 'https://search-health.internal/state';
const CACHE_TTL_S = 3600;

const UP: SearchHealth = { down: false, until: 0, level: 0, lease: 0, t: 0 };
let memory: SearchHealth = UP;

function edgeCache(): { match(url: string): Promise<Response | undefined>; put(url: string, res: Response): Promise<void> } | null {
  const c = (globalThis as { caches?: { default?: unknown } }).caches?.default;
  return (c as ReturnType<typeof edgeCache>) ?? null;
}

async function load(): Promise<SearchHealth> {
  let fromCache: SearchHealth = UP;
  const cache = edgeCache();
  if (cache) {
    try {
      const hit = await cache.match(CACHE_URL);
      if (hit) fromCache = (await hit.json()) as SearchHealth;
    } catch {
      /* Cache API error: pakai salinan memory saja */
    }
  }
  return fromCache.t >= memory.t ? fromCache : memory;
}

async function save(next: SearchHealth): Promise<SearchHealth> {
  memory = next;
  const cache = edgeCache();
  if (cache) {
    try {
      await cache.put(
        CACHE_URL,
        new Response(JSON.stringify(next), {
          headers: { 'content-type': 'application/json', 'cache-control': `max-age=${CACHE_TTL_S}` },
        })
      );
    } catch {
      /* gagal nulis ke edge cache: memory tetap terisi */
    }
  }
  return next;
}

export async function getHealth(): Promise<SearchHealth> {
  return load();
}

// Pencarian gagal total -> putus (atau perpanjang kalau probe sebelumnya gagal).
export async function markDown(now = Date.now()): Promise<SearchHealth> {
  const prev = await load();
  const level = prev.down ? prev.level + 1 : 1;
  const cooldown = COOLDOWNS_MS[Math.min(level, COOLDOWNS_MS.length) - 1];
  return save({ down: true, until: now + cooldown, level, lease: 0, t: now });
}

// Pencarian berhasil lagi -> nyambung.
export async function markUp(now = Date.now()): Promise<SearchHealth> {
  return save({ down: false, until: 0, level: 0, lease: 0, t: now });
}

// Cuma boleh SATU request yang ngetes Garena setelah cooldown habis; sisanya
// tetap dijawab "maintenance". Panggilan di dalam satu isolate diantrekan
// (jadi bareng-bareng pun cuma satu yang lolos). Antar-isolate bukan lock
// atomik: dua request yang persis barengan di isolate berbeda masih bisa
// sama-sama lolos, dampaknya cuma satu probe ekstra.
let acquireQueue: Promise<unknown> = Promise.resolve();

export function acquireProbe(now = Date.now()): Promise<boolean> {
  const run = acquireQueue.then(async () => {
    const h = await load();
    if (!h.down || now < h.until || now < h.lease) return false;
    await save({ ...h, lease: now + PROBE_LEASE_MS, t: now });
    return true;
  });
  acquireQueue = run.catch(() => {});
  return run;
}

export function retryAfterSec(h: SearchHealth, now = Date.now()): number {
  return h.down ? Math.max(1, Math.ceil((h.until - now) / 1000)) : 0;
}

// Cuma buat tes.
export function __resetSearchHealthForTests() {
  memory = UP;
}
