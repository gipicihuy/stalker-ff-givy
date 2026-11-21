'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
type Unit = 'minute' | 'hour' | 'day' | 'forever';
type Filter = 'all' | 'active' | 'revoked' | 'expired';
type KeyState = 'active' | 'revoked' | 'expired';

const UNITS: { value: Unit; label: string; ms: number }[] = [
  { value: 'minute', label: 'Menit', ms: 60 * 1000 },
  { value: 'hour', label: 'Jam', ms: 60 * 60 * 1000 },
  { value: 'day', label: 'Hari', ms: 24 * 60 * 60 * 1000 },
  { value: 'forever', label: 'Tanpa batas', ms: 0 },
];

const STATE_LABEL: Record<KeyState, string> = {
  active: 'Aktif',
  revoked: 'Dicabut',
  expired: 'Kedaluwarsa',
};

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

const IconBook = () => (
  <Svg>
    <path d="M12 7v14" />
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
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

const IconLock = () => (
  <Svg>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const IconSearch = () => (
  <Svg>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
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

function remaining(ts: number) {
  const diff = ts - Date.now();
  if (diff <= 0) return 'sudah lewat';
  const minutes = Math.ceil(diff / 60000);
  if (minutes < 60) return `${minutes} menit lagi`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} jam lagi`;
  return `${Math.floor(hours / 24)} hari lagi`;
}

function stateOf(row: KeyRow): KeyState {
  if (row.revoked) return 'revoked';
  if (row.expiresAt !== null && Date.now() > row.expiresAt) return 'expired';
  return 'active';
}

function computeExpiry(amount: number, unit: Unit): number | null {
  const found = UNITS.find((u) => u.value === unit);
  if (!found || unit === 'forever' || !Number.isFinite(amount) || amount < 1) return null;
  return Date.now() + Math.floor(amount) * found.ms;
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
  const [view, setView] = useState<'keys' | 'docs'>('keys');
  const [password, setPassword] = useState('');
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('30');
  const [unit, setUnit] = useState<Unit>('day');
  const [created, setCreated] = useState<Created | null>(null);
  const [error, setError] = useState('');
  const [dialogError, setDialogError] = useState('');
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

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDialog();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog]);

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
    setKeys([]);
    setCreated(null);
    setState('out');
  };

  const openDialog = () => {
    setCreated(null);
    setDialogError('');
    setLabel('');
    setDialog(true);
  };

  function closeDialog() {
    setDialog(false);
    setCreated(null);
    setDialogError('');
  }

  const generate = async () => {
    setBusy(true);
    setDialogError('');
    try {
      const data = await api('/api/admin/keys', 'POST', { label, amount: Number(amount), unit });
      setCreated(data);
      await loadKeys();
    } catch (e) {
      setDialogError(e instanceof Error ? e.message : 'Gagal membuat key');
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

  const counts = useMemo(() => {
    const c = { all: keys.length, active: 0, revoked: 0, expired: 0 };
    for (const k of keys) c[stateOf(k)] += 1;
    return c;
  }, [keys]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return keys.filter((k) => {
      if (filter !== 'all' && stateOf(k) !== filter) return false;
      if (!q) return true;
      return k.label.toLowerCase().includes(q) || (k.key || '').toLowerCase().includes(q);
    });
  }, [keys, filter, query]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const exampleUrl = created ? `${origin}/api/v1/player?uid=12345678&apikey=${created.key}` : '';
  const previewExpiry = computeExpiry(Number(amount), unit);
  const amountInvalid = unit !== 'forever' && !(Number(amount) >= 1);

  if (state === 'loading' || state === 'off') {
    return (
      <main className="adm-login">
        <p style={{ color: 'var(--muted-text)' }}>{state === 'loading' ? 'Memuat...' : 'Halaman tidak tersedia.'}</p>
      </main>
    );
  }

  if (state === 'out') {
    return (
      <main className="adm-login">
        <div className="adm-login-box">
          <h1>Masuk</h1>
          <p>Dashboard admin API key.</p>
          {error && (
            <div className="adm-alert" role="alert">
              <IconAlert />
              <span>{error}</span>
            </div>
          )}
          <div className="adm-field">
            <IconLock />
            <input
              className="adm-input"
              type="password"
              placeholder="Password"
              aria-label="Password"
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
      </main>
    );
  }

  const tabs: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Semua' },
    { id: 'active', label: 'Aktif' },
    { id: 'revoked', label: 'Dicabut' },
    { id: 'expired', label: 'Kedaluwarsa' },
  ];

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-logo">
          <IconKey size={20} />
          <span>
            Free Fire API
            <span className="adm-logo-sub">Admin</span>
          </span>
        </div>
        <nav className="adm-nav" aria-label="Menu">
          <button className="adm-navitem" aria-current={view === 'keys' ? 'page' : undefined} onClick={() => setView('keys')}>
            <IconKey />
            API key
          </button>
          <button className="adm-navitem" aria-current={view === 'docs' ? 'page' : undefined} onClick={() => setView('docs')}>
            <IconBook />
            Dokumentasi
          </button>
        </nav>
        <div className="adm-side-foot">
          <button className="adm-navitem" onClick={logout}>
            <IconLogout />
            Keluar
          </button>
        </div>
      </aside>

      <main className="adm-main">
        {view === 'keys' && (
          <>
            <div className="adm-head">
              <div>
                <h1 className="adm-title">API key</h1>
                <p className="adm-sub">Akses pembeli ke endpoint /api/v1/player.</p>
              </div>
              <button className="adm-btn" onClick={openDialog}>
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

            <div className="adm-toolbar">
              <div className="adm-tabs" role="tablist">
                {tabs.map((t) => (
                  <button key={t.id} className="adm-tab" role="tab" aria-selected={filter === t.id} onClick={() => setFilter(t.id)}>
                    {t.label}
                    <span className="adm-count">{counts[t.id]}</span>
                  </button>
                ))}
              </div>
              <div className="adm-search">
                <IconSearch />
                <input
                  className="adm-input"
                  placeholder="Cari nama atau key"
                  aria-label="Cari nama atau key"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="adm-empty">
                <strong>{keys.length === 0 ? 'Belum ada key' : 'Tidak ada key yang cocok'}</strong>
                {keys.length === 0 ? 'Klik Buat key untuk menambahkan akses pembeli pertama.' : 'Ubah filter atau kata kunci pencarian.'}
              </div>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Pembeli</th>
                    <th>API key</th>
                    <th>Status</th>
                    <th>Berlaku sampai</th>
                    <th>Request</th>
                    <th aria-label="Aksi" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => {
                    const st = stateOf(row);
                    return (
                      <tr key={row.id}>
                        <td data-label="Pembeli">
                          <div>
                            <span className="adm-cell-title">{row.label}</span>
                            <span className="adm-cell-sub">Dibuat {fmtDate(row.createdAt)}</span>
                          </div>
                        </td>
                        <td data-label="API key">
                          <div className="adm-keycell">
                            {row.key ? (
                              <>
                                <span className="adm-mono">{row.key}</span>
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
                              <span className="adm-mono adm-dim">Tidak tersimpan</span>
                            )}
                          </div>
                        </td>
                        <td data-label="Status">
                          <span className={`adm-badge adm-badge-${st}`}>{STATE_LABEL[st]}</span>
                        </td>
                        <td data-label="Berlaku sampai">
                          <div>
                            <span className="adm-cell-title" style={{ fontWeight: 400 }}>
                              {row.expiresAt ? fmtDate(row.expiresAt) : 'Tanpa batas'}
                            </span>
                            {row.expiresAt && st !== 'expired' && <span className="adm-cell-sub">{remaining(row.expiresAt)}</span>}
                          </div>
                        </td>
                        <td data-label="Request">
                          <div>
                            <span className="adm-cell-title" style={{ fontWeight: 400 }}>
                              {row.hits.toLocaleString('id-ID')}
                            </span>
                            <span className="adm-cell-sub">{row.lastUsedAt ? `Terakhir ${fmtDate(row.lastUsedAt)}` : 'Belum dipakai'}</span>
                          </div>
                        </td>
                        <td data-label="Aksi">
                          <div className="adm-actions">
                            {confirmId === row.id ? (
                              <>
                                <button className="adm-link adm-link-danger" onClick={() => remove(row)}>
                                  Hapus permanen
                                </button>
                                <button className="adm-link" onClick={() => setConfirmId('')}>
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
                                  title="Hapus"
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
          </>
        )}

        {view === 'docs' && (
          <>
            <div className="adm-head">
              <div>
                <h1 className="adm-title">Dokumentasi</h1>
                <p className="adm-sub">Ringkasan yang bisa dikirim ke pembeli.</p>
              </div>
            </div>
            <div className="adm-doc">
              <section>
                <h2>Endpoint</h2>
                <pre className="adm-pre adm-mono">GET {origin}/api/v1/player</pre>
              </section>
              <section>
                <h2>Parameter</h2>
                <table className="adm-params">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="adm-mono">uid</td>
                      <td>ID akun Free Fire, 6 sampai 15 digit. Wajib.</td>
                    </tr>
                    <tr>
                      <td className="adm-mono">apikey</td>
                      <td>API key dari admin. Wajib.</td>
                    </tr>
                  </tbody>
                </table>
              </section>
              <section>
                <h2>Contoh request</h2>
                <pre className="adm-pre adm-mono">{`curl "${origin}/api/v1/player?uid=12345678&apikey=ffk_xxxxxxxx"`}</pre>
              </section>
              <section>
                <h2>Respon</h2>
                <p>
                  JSON berisi data akun lengkap di <span className="adm-mono">player</span> dan ringkasan outfit di{' '}
                  <span className="adm-mono">outfit</span> (id, nama, dan URL gambar tiap item). URL gambar berlaku 30 hari.
                </p>
              </section>
              <section>
                <h2>Kode error</h2>
                <table className="adm-params">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Arti</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="adm-mono">401</td>
                      <td>Key tidak valid, dicabut, atau sudah kedaluwarsa.</td>
                    </tr>
                    <tr>
                      <td className="adm-mono">429</td>
                      <td>Lebih dari 20 request per 10 detik. Tunggu sesuai header Retry-After.</td>
                    </tr>
                    <tr>
                      <td className="adm-mono">400 / 404</td>
                      <td>UID tidak valid atau akun tidak ditemukan.</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </div>
          </>
        )}
      </main>

      {dialog && (
        <div className="adm-overlay" onMouseDown={(e) => e.target === e.currentTarget && closeDialog()}>
          <div className="adm-dialog" role="dialog" aria-modal="true" aria-labelledby="adm-dialog-title">
            <div className="adm-dialog-head">
              <h2 className="adm-dialog-title" id="adm-dialog-title">
                {created ? 'Key berhasil dibuat' : 'Buat key baru'}
              </h2>
              <button className="adm-iconbtn" onClick={closeDialog} title="Tutup" aria-label="Tutup">
                <IconX />
              </button>
            </div>

            {created ? (
              <>
                <div className="adm-dialog-body">
                  <div>
                    <span className="adm-label">API key {created.record.label}</span>
                    <div className="adm-copyrow">
                      <span className="adm-mono">{created.key}</span>
                      <button className="adm-iconbtn" onClick={() => copy(created.key, 'Key disalin')} title="Salin key" aria-label="Salin key">
                        <IconCopy />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="adm-label">Contoh URL</span>
                    <div className="adm-copyrow">
                      <span className="adm-mono adm-dim">{exampleUrl}</span>
                      <button className="adm-iconbtn" onClick={() => copy(exampleUrl, 'URL disalin')} title="Salin URL" aria-label="Salin URL">
                        <IconCopy />
                      </button>
                    </div>
                    <p className="adm-hint">
                      {created.record.expiresAt ? `Berlaku sampai ${fmtDate(created.record.expiresAt)}.` : 'Key ini tidak punya batas waktu.'}
                    </p>
                  </div>
                </div>
                <div className="adm-dialog-foot">
                  <button className="adm-btn" onClick={closeDialog}>
                    Selesai
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="adm-dialog-body">
                  {dialogError && (
                    <div className="adm-alert" role="alert" style={{ margin: 0 }}>
                      <IconAlert />
                      <span>{dialogError}</span>
                    </div>
                  )}
                  <div>
                    <label className="adm-label" htmlFor="adm-label">
                      Nama pembeli
                    </label>
                    <input
                      id="adm-label"
                      className="adm-input"
                      value={label}
                      maxLength={60}
                      autoFocus
                      onChange={(e) => setLabel(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && label.trim() && !amountInvalid && !busy && generate()}
                    />
                  </div>
                  <div>
                    <label className="adm-label" htmlFor="adm-amount">
                      Masa aktif
                    </label>
                    <div className="adm-duration">
                      <input
                        id="adm-amount"
                        className="adm-input"
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={unit === 'forever' ? '' : amount}
                        disabled={unit === 'forever'}
                        onChange={(e) => setAmount(e.target.value)}
                        aria-label="Jumlah"
                      />
                      <select className="adm-select" value={unit} onChange={(e) => setUnit(e.target.value as Unit)} aria-label="Satuan waktu">
                        {UNITS.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="adm-hint">
                      {unit === 'forever'
                        ? 'Key tidak akan kedaluwarsa sampai dicabut.'
                        : previewExpiry
                          ? `Berlaku sampai ${fmtDate(previewExpiry)}.`
                          : 'Isi jumlah minimal 1.'}
                    </p>
                  </div>
                </div>
                <div className="adm-dialog-foot">
                  <button className="adm-btn adm-btn-quiet" onClick={closeDialog}>
                    Batal
                  </button>
                  <button className="adm-btn" disabled={busy || !label.trim() || amountInvalid} onClick={generate}>
                    Buat key
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="adm-toast" role="status">
          <IconCheck />
          {toast}
        </div>
      )}
    </div>
  );
}
