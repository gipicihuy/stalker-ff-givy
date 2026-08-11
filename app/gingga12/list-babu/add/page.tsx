'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Skull, Loader2, Lock, Unlock, Trash2 } from 'lucide-react';

type BabuEntry = {
  cc: string;
  date: string;
  time: string;
  note?: string;
};

export default function AddBabuPage() {
  const [data, setData] = useState<BabuEntry[] | null>(null);
  const [error, setError] = useState(false);

  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');

  const [cc, setCc] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/gingga12/data/listbabu.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then((json: BabuEntry[]) => setData(json))
      .catch(() => setError(true));
  }, []);

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setUnlocked(true);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!cc.trim()) return;

    setSubmitting(true);
    setFormMsg(null);

    try {
      const res = await fetch('/api/babu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cc, note, code }),
      });
      const result = await res.json();

      if (!res.ok || !result.ok) {
        if (result?.error === 'invalid_code') {
          setUnlocked(false);
          setFormMsg({ type: 'err', text: 'Kode salah, masukin lagi.' });
        } else {
          setFormMsg({ type: 'err', text: 'Gagal nambahin, coba lagi.' });
        }
        return;
      }

      setCc('');
      setNote('');
      setFormMsg({ type: 'ok', text: 'Ditambahin! Situs keupdate dalam 1-2 menit.' });
    } catch {
      setFormMsg({ type: 'err', text: 'Gagal nambahin, coba lagi.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(index: number) {
    setDeletingIndex(index);
    setFormMsg(null);

    try {
      const res = await fetch('/api/babu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index, code }),
      });
      const result = await res.json();

      if (!res.ok || !result.ok) {
        if (result?.error === 'invalid_code') {
          setUnlocked(false);
          setFormMsg({ type: 'err', text: 'Kode salah, masukin lagi.' });
        } else {
          setFormMsg({ type: 'err', text: 'Gagal ngehapus, coba lagi.' });
        }
        return;
      }

      setFormMsg({ type: 'ok', text: 'Dihapus! Situs keupdate dalam 1-2 menit.' });
    } catch {
      setFormMsg({ type: 'err', text: 'Gagal ngehapus, coba lagi.' });
    } finally {
      setDeletingIndex(null);
    }
  }

  return (
    <div className="wrap">
      <section className="head">
        <Link
          href="/gingga12/list-babu"
          style={{ alignSelf: 'flex-start', display: 'inline-flex', textDecoration: 'none', marginBottom: '10px' }}
        >
          <span className="back-btn">
            <span className="back-icon">
              <ArrowLeft size={14} strokeWidth={2.5} />
            </span>
            Kembali
          </span>
        </Link>
        <div className="emblem">
          <Image
            src="/gingga12/data/gingga12.jpg"
            alt="GINGGA12"
            width={64}
            height={64}
            className="emblem-img"
          />
        </div>
        <h1 className="title">Kelola Babu</h1>
        <p className="subtitle">Tambah atau hapus entri, tanggal & jam otomatis kecatet.</p>
      </section>

      <section className="panel kelola-panel">
        {!unlocked ? (
          <form className="unlock-row" onSubmit={handleUnlock}>
            <Lock size={14} strokeWidth={2} className="lock-icon" />
            <input
              type="password"
              placeholder="Kode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button type="submit" className="unlock-btn">Buka</button>
          </form>
        ) : (
          <>
            <div className="unlock-row unlocked-row">
              <Unlock size={14} strokeWidth={2} className="lock-icon unlocked" />
              <span className="unlocked-text">Terbuka</span>
              <button type="button" className="lock-btn" onClick={() => { setUnlocked(false); setCode(''); }}>
                Kunci
              </button>
            </div>

            <form className="add-form" onSubmit={handleAdd}>
              <input
                type="text"
                placeholder="Nama CC"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                maxLength={80}
                required
              />
              <input
                type="text"
                placeholder="Catatan (opsional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
              />
              <button type="submit" className="add-submit-btn" disabled={submitting}>
                {submitting ? <Loader2 size={14} strokeWidth={2} className="spin" /> : '+ Tambah'}
              </button>
            </form>
          </>
        )}

        {formMsg && (
          <p className={`form-msg ${formMsg.type === 'ok' ? 'ok' : 'err'}`}>{formMsg.text}</p>
        )}
      </section>

      <section className="panel">
        {error && <p className="state-text">Gagal ambil data, coba refresh lagi.</p>}
        {!error && !data && (
          <p className="state-text">
            <Loader2 size={14} strokeWidth={2} className="spin" />
            Lagi ambil data...
          </p>
        )}
        {data && data.length === 0 && <p className="state-text">Belum ada babu tercatat.</p>}
        {data && data.length > 0 && (
          <div className="list">
            {data.map((entry, i) => (
              <div className="item" key={`${entry.cc}-${i}`}>
                <span className="item-icon">
                  <Skull size={15} strokeWidth={2} />
                </span>
                <div className="item-body">
                  <span className="item-cc">{entry.cc}</span>
                  <span className="item-meta">
                    {entry.date} · {entry.time}
                  </span>
                  {entry.note && <span className="item-note">{entry.note}</span>}
                </div>
                {unlocked && (
                  <button
                    type="button"
                    className="delete-btn"
                    disabled={deletingIndex === i}
                    onClick={() => handleDelete(i)}
                    aria-label={`Hapus ${entry.cc}`}
                  >
                    {deletingIndex === i ? (
                      <Loader2 size={13} strokeWidth={2} className="spin" />
                    ) : (
                      <Trash2 size={13} strokeWidth={2} />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="foot">GINGGA12 · Kelola Babu</footer>

      <style jsx>{`
        .wrap {
          max-width: 480px;
          margin: 0 auto;
          padding: 28px 16px 48px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .head {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--light-text);
          background: var(--panel-bg-alt);
          border: 1px solid var(--panel-border);
          border-radius: 999px;
          padding: 6px 14px 6px 6px;
          transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
        }

        .back-btn:active {
          transform: scale(0.96);
          background: var(--gold-soft);
          border-color: rgba(250, 191, 0, 0.35);
        }

        .back-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--gold-soft);
          color: var(--gold);
          flex-shrink: 0;
        }

        .emblem {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(250, 191, 0, 0.3);
          margin-bottom: 6px;
        }

        .emblem-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 26px;
          color: var(--white);
          margin: 0;
        }

        .subtitle {
          font-size: 13px;
          color: var(--muted-text);
          max-width: 340px;
        }

        .panel {
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          border-radius: 16px;
          padding: 10px 14px;
        }

        .kelola-panel {
          padding: 12px 14px;
        }

        .unlock-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lock-icon {
          color: var(--muted-text);
          flex-shrink: 0;
        }

        .lock-icon.unlocked {
          color: var(--gold);
        }

        .unlocked-row {
          justify-content: space-between;
        }

        .unlocked-text {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--gold);
          flex: 1;
        }

        .unlock-row input {
          flex: 1;
          background: var(--panel-bg-alt);
          border: 1px solid var(--panel-border);
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 13px;
          color: var(--white);
          outline: none;
          min-width: 0;
        }

        .unlock-row input:focus {
          border-color: rgba(250, 191, 0, 0.5);
        }

        .unlock-btn,
        .lock-btn {
          font-size: 12px;
          font-weight: 700;
          color: #1a1200;
          background: var(--gold);
          border: none;
          border-radius: 999px;
          padding: 8px 14px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .lock-btn {
          color: var(--light-text);
          background: var(--panel-bg-alt);
          border: 1px solid var(--panel-border);
        }

        .add-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
        }

        .add-form input {
          background: var(--panel-bg-alt);
          border: 1px solid var(--panel-border);
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 13.5px;
          color: var(--white);
          outline: none;
        }

        .add-form input:focus {
          border-color: rgba(250, 191, 0, 0.5);
        }

        .add-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #1a1200;
          background: var(--gold);
          border: none;
          border-radius: 10px;
          padding: 10px;
          cursor: pointer;
        }

        .add-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-msg {
          margin: 10px 0 0;
          font-size: 12.5px;
          text-align: center;
        }

        .form-msg.ok {
          color: #4ade80;
        }

        .form-msg.err {
          color: var(--error-text);
        }

        .state-text {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          font-size: 13px;
          color: var(--muted-text);
          padding: 24px 0;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        .list {
          display: flex;
          flex-direction: column;
        }

        .item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 4px;
        }

        .item + .item {
          border-top: 1px solid var(--panel-border);
        }

        .item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: var(--error-bg);
          color: var(--error-text);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .item-body {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          min-width: 0;
        }

        .item-cc {
          font-size: 14px;
          font-weight: 700;
          color: var(--white);
          letter-spacing: 0.3px;
        }

        .item-meta {
          font-size: 12px;
          color: var(--muted-text);
        }

        .item-note {
          font-size: 12px;
          color: var(--gold);
          font-style: italic;
        }

        .delete-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: var(--panel-bg-alt);
          border: 1px solid var(--panel-border);
          color: var(--error-text);
          flex-shrink: 0;
          margin-top: 1px;
          cursor: pointer;
        }

        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .foot {
          text-align: center;
          font-size: 11.5px;
          color: var(--muted-text);
          letter-spacing: 0.5px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
