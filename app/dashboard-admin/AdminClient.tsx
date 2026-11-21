'use client';

import { useCallback, useEffect, useState } from 'react';

type KeyRow = {
  id: string;
  label: string;
  prefix: string;
  createdAt: number;
  expiresAt: number | null;
  lastUsedAt: number | null;
  hits: number;
  revoked: boolean;
};

type Created = { key: string; record: KeyRow };

const DURATIONS = [
  { value: 0, label: 'Tanpa batas' },
  { value: 7, label: '7 hari' },
  { value: 30, label: '30 hari' },
  { value: 90, label: '90 hari' },
  { value: 365, label: '365 hari' },
];

const card: React.CSSProperties = {
  background: 'var(--panel-bg)',
  border: '1px solid var(--panel-border)',
  borderRadius: 12,
  padding: 18,
};

const input: React.CSSProperties = {
  background: 'var(--panel-bg-alt)',
  border: '1px solid var(--panel-border)',
  borderRadius: 8,
  color: 'var(--white)',
  padding: '10px 12px',
  fontSize: 14,
  outline: 'none',
  width: '100%',
};

const btn: React.CSSProperties = {
  background: 'var(--gold)',
  color: '#111',
  border: 'none',
  borderRadius: 8,
  padding: '10px 16px',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
};

const btnGhost: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--light-text)',
  border: '1px solid var(--panel-border)',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 12,
  cursor: 'pointer',
};

function fmt(ts: number | null) {
  if (!ts) return '-';
  return new Date(ts).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusOf(row: KeyRow): { text: string; color: string } {
  if (row.revoked) return { text: 'Dicabut', color: 'var(--error-text)' };
  if (row.expiresAt && Date.now() > row.expiresAt) return { text: 'Kadaluarsa', color: 'var(--muted-text)' };
  return { text: 'Aktif', color: 'var(--success)' };
}

async function api(path: string, method: string, body?: unknown): Promise<any> {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `http_${res.status}`);
  return data;
}

export default function AdminClient() {
  const [state, setState] = useState<'loading' | 'out' | 'in' | 'off'>('loading');
  const [password, setPassword] = useState('');
  const [label, setLabel] = useState('');
  const [days, setDays] = useState(30);
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [created, setCreated] = useState<Created | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');

  const loadKeys = useCallback(async () => {
    const data = await api('/api/admin/keys', 'GET');
    setKeys(data.keys || []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const s = await api('/api/admin/session', 'GET');
        if (s.loggedIn) {
          await loadKeys();
          setState('in');
        } else {
          setState('out');
        }
      } catch {
        setState('off');
      }
    })();
  }, [loadKeys]);

  const login = async () => {
    setBusy(true);
    setError('');
    try {
      await api('/api/admin/session', 'POST', { password });
      setPassword('');
      await loadKeys();
      setState('in');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'gagal login');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await api('/api/admin/session', 'DELETE').catch(() => null);
    setCreated(null);
    setKeys([]);
    setState('out');
  };

  const generate = async () => {
    setBusy(true);
    setError('');
    try {
      const data = await api('/api/admin/keys', 'POST', { label, days });
      setCreated(data);
      setLabel('');
      await loadKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'gagal membuat key');
    } finally {
      setBusy(false);
    }
  };

  const toggleRevoke = async (row: KeyRow) => {
    setError('');
    try {
      await api('/api/admin/keys', 'PATCH', { id: row.id, revoked: !row.revoked });
      await loadKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'gagal');
    }
  };

  const remove = async (row: KeyRow) => {
    if (!window.confirm(`Hapus permanen key "${row.label}"?`)) return;
    setError('');
    try {
      await api('/api/admin/keys', 'DELETE', { id: row.id });
      await loadKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'gagal');
    }
  };

  const copy = async (text: string, tag: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      setCopied('');
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const exampleUrl = created ? `${origin}/api/v1/player?uid=12345678&apikey=${created.key}` : '';

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: '32px 16px 64px', color: 'var(--light-text)' }}>
      <h1 style={{ color: 'var(--white)', fontSize: 22, marginBottom: 20 }}>Dashboard Admin</h1>

      {state === 'loading' && <p style={{ color: 'var(--muted-text)' }}>Memuat...</p>}

      {state === 'off' && <p style={{ color: 'var(--muted-text)' }}>Halaman tidak tersedia.</p>}

      {state === 'out' && (
        <div style={{ ...card, maxWidth: 380 }}>
          <label style={{ fontSize: 13, color: 'var(--muted-text)' }}>Password admin</label>
          <input
            style={{ ...input, margin: '8px 0 12px' }}
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && password && !busy && login()}
          />
          <button style={{ ...btn, width: '100%', opacity: busy || !password ? 0.6 : 1 }} disabled={busy || !password} onClick={login}>
            Masuk
          </button>
          {error && <p style={{ color: 'var(--error-text)', fontSize: 13, marginTop: 10 }}>{error}</p>}
        </div>
      )}

      {state === 'in' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <strong style={{ color: 'var(--white)' }}>Buat API key baru</strong>
              <button style={btnGhost} onClick={logout}>
                Keluar
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) auto', gap: 10 }}>
              <input
                style={input}
                placeholder="Nama pembeli / label"
                value={label}
                maxLength={60}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && label.trim() && !busy && generate()}
              />
              <select style={input} value={days} onChange={(e) => setDays(Number(e.target.value))}>
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              <button style={{ ...btn, opacity: busy || !label.trim() ? 0.6 : 1 }} disabled={busy || !label.trim()} onClick={generate}>
                Generate
              </button>
            </div>
            {error && <p style={{ color: 'var(--error-text)', fontSize: 13, marginTop: 10 }}>{error}</p>}
          </div>

          {created && (
            <div style={{ ...card, borderColor: 'var(--gold)' }}>
              <p style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 6 }}>Key untuk {created.record.label}</p>
              <p style={{ fontSize: 12, color: 'var(--muted-text)', marginBottom: 10 }}>
                Salin sekarang. Key lengkap hanya ditampilkan sekali dan tidak bisa dilihat lagi setelah halaman ini ditutup.
              </p>
              <code style={{ display: 'block', background: 'var(--panel-bg-alt)', padding: 10, borderRadius: 8, wordBreak: 'break-all', fontSize: 13 }}>
                {created.key}
              </code>
              <div style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
                <button style={btnGhost} onClick={() => copy(created.key, 'key')}>
                  {copied === 'key' ? 'Tersalin' : 'Salin key'}
                </button>
                <button style={btnGhost} onClick={() => copy(exampleUrl, 'url')}>
                  {copied === 'url' ? 'Tersalin' : 'Salin contoh URL'}
                </button>
              </div>
              <code style={{ display: 'block', fontSize: 12, color: 'var(--muted-text)', wordBreak: 'break-all' }}>{exampleUrl}</code>
            </div>
          )}

          <div style={{ ...card, overflowX: 'auto' }}>
            <strong style={{ color: 'var(--white)', display: 'block', marginBottom: 12 }}>Daftar key ({keys.length})</strong>
            {keys.length === 0 ? (
              <p style={{ color: 'var(--muted-text)', fontSize: 14 }}>Belum ada key.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 700 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--muted-text)' }}>
                    {['Label', 'Key', 'Status', 'Dibuat', 'Kadaluarsa', 'Terakhir dipakai', 'Hit', ''].map((h) => (
                      <th key={h} style={{ padding: '6px 8px', fontWeight: 500 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {keys.map((row) => {
                    const st = statusOf(row);
                    return (
                      <tr key={row.id} style={{ borderTop: '1px solid var(--panel-border)' }}>
                        <td style={{ padding: '8px' }}>{row.label}</td>
                        <td style={{ padding: '8px', fontFamily: 'monospace' }}>{row.prefix}</td>
                        <td style={{ padding: '8px', color: st.color }}>{st.text}</td>
                        <td style={{ padding: '8px' }}>{fmt(row.createdAt)}</td>
                        <td style={{ padding: '8px' }}>{row.expiresAt ? fmt(row.expiresAt) : 'Tanpa batas'}</td>
                        <td style={{ padding: '8px' }}>{fmt(row.lastUsedAt)}</td>
                        <td style={{ padding: '8px' }}>{row.hits}</td>
                        <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                          <button style={{ ...btnGhost, marginRight: 6 }} onClick={() => toggleRevoke(row)}>
                            {row.revoked ? 'Aktifkan' : 'Cabut'}
                          </button>
                          <button style={btnGhost} onClick={() => remove(row)}>
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
