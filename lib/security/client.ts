'use client';

// Helper sisi browser buat "handshake" ke endpoint utama (/api/ff,
// /api/search, /api/babu). Dipanggil sesaat sebelum tiap request ke
// endpoint-endpoint itu - token single-use & expired 30 detik, jadi selalu
// ambil token baru per request, jangan di-cache/dipakai ulang.
//
// Ini SENGAJA bukan mekanisme "aman" secara kriptografis (kode ini kebaca
// oleh siapapun yang buka DevTools) - tujuannya cuma bikin scraper harus
// benar-benar menjalankan JS ini (bukan sekadar curl UID berurutan), sesuai
// yang diminta: "bukan diblok total, cuma bikin effort lebih".

import { sha256Hex } from './crypto';
import { TOKEN_HEADER, POW_NONCE_HEADER, SIG_HEADER } from './constants';

interface TokenResponse {
  token: string;
  challenge: string;
  difficulty: number;
  exp: number;
}

async function fetchHandshakeToken(): Promise<TokenResponse> {
  const res = await fetch('/api/token', { cache: 'no-store' });
  if (!res.ok) throw new Error('token_fetch_failed');
  return res.json();
}

// Cari powNonce sederhana lewat brute-force sampai sha256(challenge:nonce)
// diawali `difficulty` karakter hex nol. Dengan difficulty=4 ini rata-rata
// cuma butuh puluhan-ratusan milidetik di browser modern.
async function solvePow(challenge: string, difficulty: number): Promise<string> {
  const prefix = '0'.repeat(difficulty);
  for (let i = 0; ; i++) {
    const candidate = i.toString(36);
    const hash = await sha256Hex(`${challenge}:${candidate}`);
    if (hash.startsWith(prefix)) return candidate;
  }
}

// Bangun header handshake buat satu request ke `path` (path logis endpoint,
// mis. '/api/ff' - HARUS sama persis dengan GUARD_PATHS di server).
export async function buildHandshakeHeaders(path: string): Promise<Record<string, string>> {
  const { token, challenge, difficulty } = await fetchHandshakeToken();
  const powNonce = await solvePow(challenge, difficulty);
  const reqSig = await sha256Hex(`${token}|${path}|${powNonce}`);

  return {
    [TOKEN_HEADER]: token,
    [POW_NONCE_HEADER]: powNonce,
    [SIG_HEADER]: reqSig,
  };
}
