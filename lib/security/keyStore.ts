export interface KvLike {
  get<T>(key: string): Promise<T | undefined>;
  put(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<unknown>;
  list<T>(options: { prefix: string }): Promise<Map<string, T>>;
}

export interface KeyRecord {
  id: string;
  label: string;
  prefix: string;
  hash: string;
  createdAt: number;
  expiresAt: number | null;
  lastUsedAt: number | null;
  hits: number;
  revoked: boolean;
}

export type PublicKeyRecord = Omit<KeyRecord, 'hash'>;

export type KeyCheckResult =
  | { valid: true; id: string; label: string }
  | { valid: false; reason: 'unknown' | 'revoked' | 'expired' };

const REC = 'rec:';
const HASH = 'hash:';

function toPublic(rec: KeyRecord): PublicKeyRecord {
  const { hash: _hash, ...rest } = rec;
  return rest;
}

export async function storeCreateKey(kv: KvLike, rec: KeyRecord): Promise<PublicKeyRecord> {
  await kv.put(`${REC}${rec.id}`, rec);
  await kv.put(`${HASH}${rec.hash}`, rec.id);
  return toPublic(rec);
}

export async function storeListKeys(kv: KvLike): Promise<PublicKeyRecord[]> {
  const all = await kv.list<KeyRecord>({ prefix: REC });
  return [...all.values()].map(toPublic).sort((a, b) => b.createdAt - a.createdAt);
}

export async function storeSetRevoked(kv: KvLike, id: string, revoked: boolean): Promise<boolean> {
  const rec = await kv.get<KeyRecord>(`${REC}${id}`);
  if (!rec) return false;
  await kv.put(`${REC}${id}`, { ...rec, revoked });
  return true;
}

export async function storeDeleteKey(kv: KvLike, id: string): Promise<boolean> {
  const rec = await kv.get<KeyRecord>(`${REC}${id}`);
  if (!rec) return false;
  await kv.delete(`${REC}${id}`);
  await kv.delete(`${HASH}${rec.hash}`);
  return true;
}

export async function storeCheckKey(kv: KvLike, hash: string): Promise<KeyCheckResult> {
  const id = await kv.get<string>(`${HASH}${hash}`);
  if (!id) return { valid: false, reason: 'unknown' };
  const rec = await kv.get<KeyRecord>(`${REC}${id}`);
  if (!rec) return { valid: false, reason: 'unknown' };
  if (rec.revoked) return { valid: false, reason: 'revoked' };
  const now = Date.now();
  if (rec.expiresAt !== null && now > rec.expiresAt) return { valid: false, reason: 'expired' };
  await kv.put(`${REC}${id}`, { ...rec, hits: rec.hits + 1, lastUsedAt: now });
  return { valid: true, id: rec.id, label: rec.label };
}
