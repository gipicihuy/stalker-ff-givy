'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './admin.css';

type KeyRow = {
  id: string;
  label: string;
  prefix: string;
  key?: string;
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

function Svg({ children, size = 16 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg className="adm-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

const IconKey = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </Svg>
);

const IconCopy = () => (
  <Svg>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </Svg>
);

const IconCheck = () => (
  <Svg>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

const IconCheckCircle = () => (
  <Svg>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

const IconBan = () => (
  <Svg>
    <circle cx="12" cy="12" r="10" />
    <path d="m4.9 4.9 14.2 14.2" />
  </Svg>
);

const IconRestore = () => (
  <Svg>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
);

const IconTrash = () => (
  <Svg>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </Svg>
);

const IconLogout = () => (
  <Svg>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </Svg>
);

const IconPlus = () => (
  <Svg>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Svg>
);

const IconX = () => (
  <Svg>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Svg>
);

const IconAlert = () => (
  <Svg>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </Svg>
);

const IconShield = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

const IconLock = () => (
  <Svg>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const IconUser = () => (
  <Svg>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
);

const IconActivity = () => (
  <Svg size={18}>
    <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
  </Svg>
);

const IconSlash = () => (
  <Svg size={18}>
    <circle cx="12" cy="12" r="10" />
    <path d="m4.9 4.9 14.2 14.2" />
  </Svg>
);

function fmtDate(ts: number | null) {
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

function isExpired(row: KeyRow) {
  return row.expiresAt !== null && Date.now() > row.expiresAt;
}

function statusOf(row: KeyRow): { text: string; tone: 'on' | 'off' | 'idle' } {
  if (row.revoked) return { text: 'Dicabut', tone: 'off' };
  if (isExpired(row)) return { text: 'Kadaluarsa', tone: 'idle' };
  return { text: 'Aktif', tone: 'on' };
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
  const [toast, setToast] = useState('');
  const [confirmId, setConfirmId] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const notify = (text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1800);
  };

  const copy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(message);
    } catch {
      setError('Browser menolak akses clipboard, salin manual.');
    }
  };

  const login = async () => {
    setBusy(true);
    setError('');
    try {
      await api('/api/admin/session', 'POST', { password });
      setPassword('');
      await loadKeys();
      setState('in');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal masuk');
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
      setError(e instanceof Error ? e.message : 'Gagal membuat key');
    } finally {
      setBusy(false);
    }
  };

  const toggleRevoke = async (row: KeyRow) => {
    setError('');
    try {
      await api('/api/admin/keys', 'PATCH', { id: row.id, revoked: !row.revoked });
      await loadKeys();
      notify(row.revoked ? 'Key diaktifkan' : 'Key dicabut');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengubah status');
    }
  };

  const remove = async (row: KeyRow) => {
    setError('');
    try {
      await api('/api/admin/keys', 'DELETE', { id: row.id });
      setConfirmId('');
      await loadKeys();
      notify('Key dihapus');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus');
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const exampleUrl = created ? `${origin}/api/v1/player?uid=12345678&apikey=${created.key}` : '';
  const activeCount = keys.filter((k) => !k.revoked && !isExpired(k)).length;
  const revokedCount = keys.filter((k) => k.revoked).length;
  const totalHits = keys.reduce((sum, k) => sum + k.hits, 0);

  if (state === 'loading') {
    return (
      <main className="adm-login">
        <p className="adm-muted">Memuat...</p>
      </main>
    );
  }

  if (state === 'off') {
    return (
      <main className="adm-login">
        <p className="adm-muted">Halaman tidak tersedia.</p>
      </main>
    );
  }

  if (state === 'out') {
    return (
      <main className="adm-login">
        <div className="adm-login-box">
          <div className="adm-login-head">
            <span className="adm-brand-mark">
              <IconShield size={22} />
            </span>
            Masuk ke dashboard admin
          </div>
          <div className="adm-stack">
            <div className="adm-field">
              <IconLock />
              <input
                className="adm-input"
                type="password"
                placeholder="Password admin"
                aria-label="Password admin"
                value={password}
                autoComplete="current-password"
                autoFocus
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && password && !busy && login()}
              />
            </div>
            <button className="adm-btn" disabled={busy || !password} onClick={login}>
              Masuk
            </button>
          </div>
          {error && (
            <div className="adm-alert" role="alert">
              <IconAlert />
              <span>{error}</span>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="adm">
      <header className="adm-top">
        <div className="adm-brand">
          <span className="adm-brand-mark">
            <IconKey size={18} />
          </span>
          Manajemen API key
        </div>
        <button className="adm-iconbtn" onClick={logout} title="Keluar" aria-label="Keluar">
          <IconLogout />
        </button>
      </header>

      <div className="adm-summary">
        <div className="adm-stat">
          <span className="adm-stat-icon">
            <IconCheckCircle />
          </span>
          <div>
            <span className="adm-stat-value">{activeCount.toLocaleString('id-ID')}</span>
            <span className="adm-stat-label">Key aktif</span>
          </div>
        </div>
        <div className="adm-stat">
          <span className="adm-stat-icon">
            <IconActivity />
          </span>
          <div>
            <span className="adm-stat-value">{totalHits.toLocaleString('id-ID')}</span>
            <span className="adm-stat-label">Total request</span>
          </div>
        </div>
        <div className="adm-stat">
          <span className="adm-stat-icon">
            <IconSlash />
          </span>
          <div>
            <span className="adm-stat-value">{revokedCount.toLocaleString('id-ID')}</span>
            <span className="adm-stat-label">Key dicabut</span>
          </div>
        </div>
      </div>

      <section className="adm-section" aria-labelledby="adm-new">
        <div className="adm-section-head">
          <h2 className="adm-h2" id="adm-new">
            Buat key baru
          </h2>
        </div>
        <div className="adm-form">
          <div className="adm-field">
            <IconUser />
            <input
              className="adm-input"
              placeholder="Nama pembeli"
              aria-label="Nama pembeli"
              value={label}
              maxLength={60}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && label.trim() && !busy && generate()}
            />
          </div>
          <select className="adm-select" aria-label="Masa aktif" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <button className="adm-btn" disabled={busy || !label.trim()} onClick={generate}>
            <IconPlus />
            Buat key
          </button>
        </div>

        {error && (
          <div className="adm-alert" role="alert">
            <IconAlert />
            <span>{error}</span>
          </div>
        )}

        {created && (
          <div className="adm-created">
            <div className="adm-created-head">
              <span className="adm-created-title">
                <IconCheckCircle />
                Key untuk {created.record.label} sudah dibuat
              </span>
              <button className="adm-iconbtn" onClick={() => setCreated(null)} title="Tutup" aria-label="Tutup">
                <IconX />
              </button>
            </div>
            <div className="adm-copyrow">
              <span className="adm-code">{created.key}</span>
              <button className="adm-iconbtn" onClick={() => copy(created.key, 'Key disalin')} title="Salin key" aria-label="Salin key">
                <IconCopy />
              </button>
            </div>
            <div className="adm-copyrow">
              <span className="adm-code adm-code-dim">{exampleUrl}</span>
              <button className="adm-iconbtn" onClick={() => copy(exampleUrl, 'URL disalin')} title="Salin URL contoh" aria-label="Salin URL contoh">
                <IconCopy />
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="adm-section" aria-labelledby="adm-list">
        <div className="adm-section-head">
          <h2 className="adm-h2" id="adm-list">
            Daftar key
          </h2>
          <span className="adm-muted">{keys.length} total</span>
        </div>

        <div className="adm-tablewrap">
          {keys.length === 0 ? (
            <div className="adm-empty">
              <span className="adm-empty-mark">
                <IconKey size={20} />
              </span>
              <strong style={{ color: 'var(--white)' }}>Belum ada key</strong>
              <span>Isi nama pembeli di atas lalu klik Buat key.</span>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Pembeli</th>
                  <th>API key</th>
                  <th>Status</th>
                  <th>Masa aktif</th>
                  <th>Pemakaian</th>
                  <th aria-label="Aksi" />
                </tr>
              </thead>
              <tbody>
                {keys.map((row) => {
                  const st = statusOf(row);
                  return (
                    <tr key={row.id}>
                      <td data-label="Pembeli">
                        <div>
                          <span className="adm-name">{row.label}</span>
                          <span className="adm-muted">Dibuat {fmtDate(row.createdAt)}</span>
                        </div>
                      </td>
                      <td data-label="API key">
                        <div className="adm-keycell">
                          {row.key ? (
                            <>
                              <span className="adm-code">{row.key}</span>
                              <button
                                className="adm-iconbtn"
                                onClick={() => copy(row.key as string, 'Key disalin')}
                                title="Salin key"
                                aria-label={`Salin key ${row.label}`}
                              >
                                <IconCopy />
                              </button>
                            </>
                          ) : (
                            <span className="adm-code adm-code-dim">Tidak tersimpan (dibuat sebelum update)</span>
                          )}
                        </div>
                      </td>
                      <td data-label="Status">
                        <span className="adm-status">
                          <span className={`adm-dot ${st.tone === 'on' ? 'adm-dot-on' : st.tone === 'off' ? 'adm-dot-off' : ''}`} />
                          {st.text}
                        </span>
                      </td>
                      <td data-label="Masa aktif">{row.expiresAt ? fmtDate(row.expiresAt) : 'Tanpa batas'}</td>
                      <td data-label="Pemakaian">
                        <div>
                          <span className="adm-name" style={{ fontWeight: 400 }}>
                            {row.hits.toLocaleString('id-ID')} request
                          </span>
                          <span className="adm-muted">Terakhir {fmtDate(row.lastUsedAt)}</span>
                        </div>
                      </td>
                      <td data-label="Aksi">
                        <div className="adm-actions">
                          {confirmId === row.id ? (
                            <>
                              <button className="adm-textbtn adm-textbtn-danger" onClick={() => remove(row)}>
                                Hapus
                              </button>
                              <button className="adm-textbtn" onClick={() => setConfirmId('')}>
                                Batal
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="adm-iconbtn"
                                onClick={() => toggleRevoke(row)}
                                title={row.revoked ? 'Aktifkan lagi' : 'Cabut akses'}
                                aria-label={row.revoked ? `Aktifkan ${row.label}` : `Cabut ${row.label}`}
                              >
                                {row.revoked ? <IconRestore /> : <IconBan />}
                              </button>
                              <button
                                className="adm-iconbtn adm-iconbtn-danger"
                                onClick={() => setConfirmId(row.id)}
                                title="Hapus permanen"
                                aria-label={`Hapus ${row.label}`}
                              >
                                <IconTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {toast && (
        <div className="adm-toast" role="status">
          <IconCheck />
          {toast}
        </div>
      )}
    </main>
  );
}
