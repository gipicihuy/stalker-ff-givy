'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Skull, Loader2 } from 'lucide-react';

type BabuEntry = {
  cc: string;
  date: string;
  time: string;
  note?: string;
};

export default function ListBabuPage() {
  const [data, setData] = useState<BabuEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/gingga12/data/listbabu.json')
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then((json: BabuEntry[]) => setData(json))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="wrap">
      <section className="head">
        <Link href="/gingga12" className="back-btn">
          <span className="back-icon">
            <ArrowLeft size={14} strokeWidth={2.5} />
          </span>
          Kembali
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
        <h1 className="title">List Babu</h1>
        <p className="subtitle">Rekap CC yang udah kita libas, sesuai tanggal & jam war.</p>
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
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="foot">GINGGA12 · List Babu</footer>

      <style jsx>{`
        .wrap {
          max-width: 480px;
          margin: 0 auto;
          padding: 28px 16px 48px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-family: var(--font-display, 'Inter', system-ui, sans-serif);
        }

        .head {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
        }

        .back-btn {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--light-text, #d4d4d8);
          background: var(--panel-bg-alt, #1c1f26);
          border: 1px solid var(--panel-border, rgba(255, 255, 255, 0.08));
          border-radius: 999px;
          padding: 6px 14px 6px 6px;
          text-decoration: none;
          margin-bottom: 10px;
          transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
        }

        .back-btn:active {
          transform: scale(0.96);
          background: var(--gold-soft, rgba(250, 191, 0, 0.12));
          border-color: rgba(250, 191, 0, 0.35);
        }

        .back-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--gold-soft, rgba(250, 191, 0, 0.12));
          color: var(--gold, #fabf00);
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
          font-family: var(--font-display, 'Inter', system-ui, sans-serif);
          font-weight: 700;
          font-size: 26px;
          color: var(--white, #ffffff);
          margin: 0;
        }

        .subtitle {
          font-size: 13px;
          color: var(--muted-text, #9ca3af);
          max-width: 340px;
          margin: 0;
        }

        .panel {
          background: var(--panel-bg, #16181d);
          border: 1px solid var(--panel-border, rgba(255, 255, 255, 0.08));
          border-radius: 16px;
          padding: 10px 14px;
        }

        .state-text {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          font-size: 13px;
          color: var(--muted-text, #9ca3af);
          padding: 24px 0;
          margin: 0;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
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
          border-top: 1px solid var(--panel-border, rgba(255, 255, 255, 0.08));
        }

        .item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: var(--error-bg, rgba(248, 113, 113, 0.12));
          color: var(--error-text, #f87171);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .item-body {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .item-cc {
          font-size: 14px;
          font-weight: 700;
          color: var(--white, #ffffff);
          letter-spacing: 0.3px;
        }

        .item-meta {
          font-size: 12px;
          color: var(--muted-text, #9ca3af);
        }

        .item-note {
          font-size: 12px;
          color: var(--gold, #fabf00);
          font-style: italic;
        }

        .foot {
          text-align: center;
          font-size: 11.5px;
          color: var(--muted-text, #9ca3af);
          letter-spacing: 0.5px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
