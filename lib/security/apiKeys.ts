import { getGuardEnv } from './env';
import { randomHex, sha256Hex } from './crypto';
import {
  storeCheckKey,
  storeCreateKey,
  storeDeleteKey,
  storeListKeys,
  storeSetRevoked,
  type KeyCheckResult,
  type KeyRecord,
  type KvLike,
  type PublicKeyRecord,
} from './keyStore';

const STORE_NAME = '__api_keys_store__';
const KEY_PREFIX = 'ffk_';

const devStore = new Map<string, unknown>();

const devKv: KvLike = {
  async get<T>(key: string) {
    return devStore.get(key) as T | undefined;
  },
  async put(key: string, value: unknown) {
    devStore.set(key, value);
  },
  async delete(key: string) {
    return devStore.delete(key);
  },
  async list<T>(options: { prefix: string }) {
    const out = new Map<string, T>();
    for (const [k, v] of devStore) {
      if (k.startsWith(options.prefix)) out.set(k, v as T);
    }
    return out;
  },
};

function getStoreStub() {
  const env = getGuardEnv();
  if (!env.EDGE_GUARD) return null;
  return env.EDGE_GUARD.get(env.EDGE_GUARD.idFromName(STORE_NAME));
}

async function callStore<T>(path: string, body: unknown): Promise<T | null> {
  const stub = getStoreStub();
  if (!stub) return null;
  const res = await stub.fetch(`https://edge-guard.internal${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`key_store_${res.status}`);
  return (await res.json()) as T;
}

export async function issueApiKey(label: string, durationMs: number | null): Promise<{ key: string; record: PublicKeyRecord }> {
  const key = `${KEY_PREFIX}${randomHex(24)}`;
  const now = Date.now();
  const rec: KeyRecord = {
    id: randomHex(6),
    label,
    prefix: `${key.slice(0, 8)}...${key.slice(-4)}`,
    key,
    hash: await sha256Hex(key),
    createdAt: now,
    expiresAt: durationMs ? now + durationMs : null,
    lastUsedAt: null,
    hits: 0,
    revoked: false,
  };
  const remote = await callStore<PublicKeyRecord>('/key-create', rec);
  const record = remote ?? (await storeCreateKey(devKv, rec));
  return { key, record };
}

export async function listApiKeys(): Promise<PublicKeyRecord[]> {
  const remote = await callStore<PublicKeyRecord[]>('/key-list', {});
  return remote ?? (await storeListKeys(devKv));
}

export async function setApiKeyRevoked(id: string, revoked: boolean): Promise<boolean> {
  const remote = await callStore<{ ok: boolean }>('/key-revoke', { id, revoked });
  return remote ? remote.ok : storeSetRevoked(devKv, id, revoked);
}

export async function deleteApiKey(id: string): Promise<boolean> {
  const remote = await callStore<{ ok: boolean }>('/key-delete', { id });
  return remote ? remote.ok : storeDeleteKey(devKv, id);
}

export async function verifyApiKey(key: string): Promise<KeyCheckResult> {
  if (!key || key.length > 128 || !key.startsWith(KEY_PREFIX)) return { valid: false, reason: 'unknown' };
  const hash = await sha256Hex(key);
  const remote = await callStore<KeyCheckResult>('/key-check', { hash });
  return remote ?? storeCheckKey(devKv, hash);
}
