'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Crown,
  ShieldCheck,
  Swords,
  Radio,
  Users,
  Copy,
  Check,
  ExternalLink,
  ListOrdered,
} from 'lucide-react';

const LEADERSHIP = [
  { role: 'Founder Boy 1', name: 'FH4N' },
  { role: 'Founder Boy 2', name: 'GIVY' },
  { role: 'Founder LDS', name: '—' },
  { role: 'Own Boy', name: 'Dapz' },
  { role: 'Own LDS', name: '—' },
  { role: 'Pengurus War', name: 'All Admin / P.Inti' },
];

const P_INTI = [
  { name: 'Darr', tag: 'HP' },
  { name: 'Danz', tag: 'HP' },
  { name: 'Agus / Dika', tag: 'HP' },
];

const RULES = [
  'Age 12+',
  'No drama',
  'No bahas 18+',
  'No tag SW kecuali FF',
  'No sebar link GB — hama lo itu',
  'No promosi / jualan',
  'Attitude no.1',
  'War? Tag admin',
  'DB? Boleh, asal bisa bagi waktu',
  'Nabrak CC? Gash main antar ke-2 CC',
];

const LINKS = [
  {
    label: 'GB War',
    href: 'https://chat.whatsapp.com/FlyOVUmrkse1CZCnpxGzlb',
    icon: Swords,
  },
  {
    label: 'GB Optes',
    href: 'https://chat.whatsapp.com/LIaiRU3GXRt3xIL5KZu1QT',
    icon: Users,
  },
  {
    label: 'Info Channel',
    href: 'https://whatsapp.com/channel/0029Vb7xNBn0QeahCoaAw211',
    icon: Radio,
  },
];

function LinkRow({ label, href, icon: Icon }: { label: string; href: string; icon: any }) {
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="link-row">
      <a className="link-main" href={href} target="_blank" rel="noopener noreferrer">
        <span className="link-icon">
          <Icon size={16} strokeWidth={2} />
        </span>
        <span className="link-label">{label}</span>
        <ExternalLink size={13} strokeWidth={2} className="link-ext" />
      </a>
      <button className="copy-btn icon-btn" onClick={copy} aria-label={`Salin link ${label}`}>
        {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
      </button>
    </div>
  );
}

export default function Gingga12Page() {
  return (
    <div className="wrap">
      <section className="hero profile-card">
        <div className="emblem">
          <Image
            src="/gingga12/data/gingga12.jpg"
            alt="GINGGA12"
            width={88}
            height={88}
            className="emblem-img"
            priority
          />
        </div>
        <div className="hero-eyebrow">Free Fire · CC</div>
        <h1 className="hero-tag">GINGGA12</h1>
        <div className="hero-since">
          <span className="dot" />
          SINCE 26.05.2026
        </div>
        <p className="hero-motto">“Utamakan literasi ya.”</p>
      </section>

      <section className="panel">
        <h2 className="panel-title">
          <Crown size={16} strokeWidth={2} />
          Struktur
        </h2>
        <div className="roster">
          {LEADERSHIP.map((row) => (
            <div className="info-row roster-row" key={row.role}>
              <span className="roster-role">{row.role}</span>
              <span className="roster-name">{row.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">
          <ShieldCheck size={16} strokeWidth={2} />
          P.Inti All Base
        </h2>
        <div className="chips">
          {P_INTI.map((p) => (
            <span className="chip" key={p.name}>
              {p.name}
              <em>{p.tag}</em>
            </span>
          ))}
        </div>
        <p className="fine-print">P.Inti wajib main M3.</p>
      </section>

      <section className="panel">
        <h2 className="panel-title">
          <ShieldCheck size={16} strokeWidth={2} />
          Rules
        </h2>
        <ul className="rules">
          {RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="panel callout">
        <h2 className="panel-title">Syarat jadi P.Inti</h2>
        <p>
          SS MVP war 5× pas menang. P.Inti yang sudah absen langsung masuk <b>SUPTZY</b>.
        </p>
      </section>

      <section className="panel">
        <h2 className="panel-title">
          <ListOrdered size={16} strokeWidth={2} />
          List Babu
        </h2>
        <p className="fine-print" style={{ marginBottom: 14 }}>
          Rekap CC yang udah kita libas. Klik buat liat daftar lengkapnya.
        </p>
        <Link href="/gingga12/list-babu" className="cta-btn">
          Liat List Babu
          <ExternalLink size={14} strokeWidth={2} />
        </Link>
      </section>

      <section className="panel">
        <h2 className="panel-title">
          <Radio size={16} strokeWidth={2} />
          Link Penting
        </h2>
        <div className="links">
          {LINKS.map((l) => (
            <LinkRow key={l.label} {...l} />
          ))}
        </div>
      </section>

      <footer className="foot">GINGGA12 · sejak 26 Mei 2026</footer>

      <style jsx>{`
        .wrap {
          max-width: 480px;
          margin: 0 auto;
          padding: 28px 16px 48px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .hero {
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          border-radius: 18px;
          padding: 28px 22px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .emblem {
          width: 88px;
          height: 88px;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 14px;
          border: 1px solid rgba(250, 191, 0, 0.3);
          box-shadow: 0 8px 20px rgba(250, 191, 0, 0.2);
        }

        .emblem-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .hero-eyebrow {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--muted-text);
          margin-bottom: 6px;
        }

        .hero-tag {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 34px;
          letter-spacing: 1px;
          color: var(--white);
          margin: 0 0 10px;
        }

        .hero-since {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          letter-spacing: 1.5px;
          color: var(--gold);
          background: var(--gold-soft);
          border: 1px solid rgba(250, 191, 0, 0.25);
          padding: 5px 12px;
          border-radius: 999px;
          font-weight: 600;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gold);
        }

        .hero-motto {
          margin-top: 16px;
          font-size: 13.5px;
          font-style: italic;
          color: var(--light-text);
        }

        .panel {
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          border-radius: 16px;
          padding: 18px 18px 20px;
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--gold);
          margin: 0 0 14px;
        }

        .roster {
          display: flex;
          flex-direction: column;
        }

        .roster-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          gap: 12px;
        }

        .roster-role {
          font-size: 13px;
          color: var(--muted-text);
        }

        .roster-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--white);
          text-align: right;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--light-text);
          background: var(--panel-bg-alt);
          border: 1px solid var(--panel-border);
          border-radius: 999px;
          padding: 6px 12px;
        }

        .chip em {
          font-style: normal;
          font-size: 10px;
          font-weight: 700;
          color: var(--blue);
          background: var(--blue-soft);
          padding: 2px 6px;
          border-radius: 999px;
        }

        .fine-print {
          font-size: 12.5px;
          color: var(--muted-text);
        }

        .rules {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .rules li {
          position: relative;
          padding-left: 16px;
          font-size: 13.5px;
          color: var(--light-text);
          line-height: 1.4;
        }

        .rules li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          width: 5px;
          height: 5px;
          background: var(--gold);
          border-radius: 1px;
        }

        .callout {
          border-color: rgba(250, 191, 0, 0.25);
          background: linear-gradient(180deg, rgba(250, 191, 0, 0.06), var(--panel-bg));
        }

        .callout p {
          font-size: 13.5px;
          color: var(--light-text);
          line-height: 1.5;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 700;
          color: #14161b;
          background: linear-gradient(155deg, var(--gold), var(--gold-hover));
          border-radius: 12px;
          padding: 11px 16px;
          text-decoration: none;
        }

        .links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .link-row {
          display: flex;
          align-items: stretch;
          gap: 8px;
        }

        .link-main {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--panel-bg-alt);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--white);
          text-decoration: none;
        }

        .link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: var(--gold-soft);
          color: var(--gold);
          flex-shrink: 0;
        }

        .link-label {
          flex: 1;
        }

        .link-ext {
          color: var(--muted-text);
          flex-shrink: 0;
        }

        .copy-btn {
          width: 42px;
          border-radius: 12px;
          border: 1px solid var(--panel-border);
          background: var(--panel-bg-alt);
          color: var(--muted-text);
          display: flex;
          align-items: center;
          justify-content: center;
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
