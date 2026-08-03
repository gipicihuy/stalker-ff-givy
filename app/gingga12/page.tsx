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
  ChevronRight,
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
    desc: 'Grup utama koordinasi war',
    href: 'https://chat.whatsapp.com/FlyOVUmrkse1CZCnpxGzlb',
    icon: Swords,
    accent: 'gold',
  },
  {
    label: 'GB Optes',
    desc: 'Grup diskusi & optes squad',
    href: 'https://chat.whatsapp.com/LIaiRU3GXRt3xIL5KZu1QT',
    icon: Users,
    accent: 'blue',
  },
  {
    label: 'Info Channel',
    desc: 'Pengumuman & update resmi',
    href: 'https://whatsapp.com/channel/0029Vb7xNBn0QeahCoaAw211',
    icon: Radio,
    accent: 'green',
  },
];

function LinkRow({
  label,
  desc,
  href,
  icon: Icon,
  accent,
}: {
  label: string;
  desc: string;
  href: string;
  icon: any;
  accent: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`link-row accent-${accent}`}>
      <a className="link-main" href={href} target="_blank" rel="noopener noreferrer">
        <span className="link-icon">
          <Icon size={17} strokeWidth={2} />
        </span>
        <span className="link-text">
          <span className="link-label">{label}</span>
          <span className="link-desc">{desc}</span>
        </span>
        <ExternalLink size={14} strokeWidth={2} className="link-ext" />
      </a>
      <button
        className={`copy-btn icon-btn ${copied ? 'is-copied' : ''}`}
        onClick={copy}
        aria-label={`Salin link ${label}`}
      >
        {copied ? <Check size={15} strokeWidth={2.5} /> : <Copy size={15} strokeWidth={2} />}
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
        <p className="hero-motto">"Utamakan literasi ya."</p>
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
        <Link href="/gingga12/list-babu" className="cta-btn">
          <span className="cta-icon">
            <ListOrdered size={19} strokeWidth={2} />
          </span>
          <span className="cta-text">
            <span className="cta-title">Liat List Babu</span>
            <span className="cta-sub">Rekap CC yang udah kita libas</span>
          </span>
          <span className="cta-arrow">
            <ChevronRight size={18} strokeWidth={2.2} />
          </span>
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
          font-family: var(--font-display, 'Inter', system-ui, sans-serif);
        }

        .hero {
          background: var(--panel-bg, #16181d);
          border: 1px solid var(--panel-border, rgba(255, 255, 255, 0.08));
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
          color: var(--muted-text, #9ca3af);
          margin-bottom: 6px;
        }

        .hero-tag {
          font-family: var(--font-display, 'Inter', system-ui, sans-serif);
          font-weight: 700;
          font-size: 34px;
          letter-spacing: 1px;
          color: var(--white, #ffffff);
          margin: 0 0 10px;
        }

        .hero-since {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          letter-spacing: 1.5px;
          color: var(--gold, #fabf00);
          background: var(--gold-soft, rgba(250, 191, 0, 0.12));
          border: 1px solid rgba(250, 191, 0, 0.25);
          padding: 5px 12px;
          border-radius: 999px;
          font-weight: 600;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gold, #fabf00);
        }

        .hero-motto {
          margin-top: 16px;
          font-size: 13.5px;
          font-style: italic;
          color: var(--light-text, #d4d4d8);
        }

        .panel {
          background: var(--panel-bg, #16181d);
          border: 1px solid var(--panel-border, rgba(255, 255, 255, 0.08));
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
          color: var(--gold, #fabf00);
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

        .roster-row + .roster-row {
          border-top: 1px solid var(--panel-border, rgba(255, 255, 255, 0.08));
        }

        .roster-role {
          font-size: 13px;
          color: var(--muted-text, #9ca3af);
        }

        .roster-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--white, #ffffff);
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
          color: var(--light-text, #d4d4d8);
          background: var(--panel-bg-alt, #1c1f26);
          border: 1px solid var(--panel-border, rgba(255, 255, 255, 0.08));
          border-radius: 999px;
          padding: 6px 12px;
        }

        .chip em {
          font-style: normal;
          font-size: 10px;
          font-weight: 700;
          color: var(--blue, #60a5fa);
          background: var(--blue-soft, rgba(96, 165, 250, 0.12));
          padding: 2px 6px;
          border-radius: 999px;
        }

        .fine-print {
          font-size: 12.5px;
          color: var(--muted-text, #9ca3af);
        }

        .rules {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .rules li {
          position: relative;
          padding-left: 16px;
          font-size: 13.5px;
          color: var(--light-text, #d4d4d8);
          line-height: 1.4;
        }

        .rules li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          width: 5px;
          height: 5px;
          background: var(--gold, #fabf00);
          border-radius: 1px;
        }

        .callout {
          border-color: rgba(250, 191, 0, 0.25);
          background: linear-gradient(180deg, rgba(250, 191, 0, 0.06), var(--panel-bg, #16181d));
        }

        .callout p {
          font-size: 13.5px;
          color: var(--light-text, #d4d4d8);
          line-height: 1.5;
          margin: 0;
        }

        .cta-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(155deg, var(--gold, #fabf00), var(--gold-hover, #ffcf33));
          border-radius: 14px;
          padding: 14px 16px;
          text-decoration: none;
          box-shadow: 0 10px 24px -8px rgba(250, 191, 0, 0.45);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .cta-btn:active {
          transform: scale(0.98);
          box-shadow: 0 4px 14px -6px rgba(250, 191, 0, 0.4);
        }

        .cta-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: rgba(20, 22, 27, 0.14);
          color: #14161b;
          flex-shrink: 0;
        }

        .cta-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .cta-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #14161b;
        }

        .cta-sub {
          font-size: 11.5px;
          font-weight: 600;
          color: rgba(20, 22, 27, 0.62);
        }

        .cta-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(20, 22, 27, 0.55);
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }

        .cta-btn:active .cta-arrow {
          transform: translateX(2px);
        }

        .links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .link-row {
          display: flex;
          align-items: stretch;
          gap: 8px;
          --row-accent: var(--gold, #fabf00);
          --row-accent-soft: var(--gold-soft, rgba(250, 191, 0, 0.12));
        }

        .link-row.accent-blue {
          --row-accent: var(--blue, #60a5fa);
          --row-accent-soft: var(--blue-soft, rgba(96, 165, 250, 0.12));
        }

        .link-row.accent-green {
          --row-accent: var(--success, #4ade80);
          --row-accent-soft: rgba(74, 222, 128, 0.12);
        }

        .link-main {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          background: var(--panel-bg-alt, #1c1f26);
          border: 1px solid var(--panel-border, rgba(255, 255, 255, 0.08));
          border-radius: 13px;
          padding: 12px 14px;
          text-decoration: none;
          transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease;
        }

        .link-main:active {
          transform: scale(0.98);
          background: var(--row-accent-soft);
          border-color: var(--row-accent);
        }

        .link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: var(--row-accent-soft);
          color: var(--row-accent);
          flex-shrink: 0;
        }

        .link-text {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .link-label {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--white, #ffffff);
        }

        .link-desc {
          font-size: 11.5px;
          color: var(--muted-text, #9ca3af);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .link-ext {
          color: var(--muted-text, #9ca3af);
          flex-shrink: 0;
        }

        .copy-btn {
          width: 44px;
          border-radius: 13px;
          border: 1px solid var(--panel-border, rgba(255, 255, 255, 0.08));
          background: var(--panel-bg-alt, #1c1f26);
          color: var(--muted-text, #9ca3af);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
        }

        .copy-btn.is-copied {
          color: var(--success, #4ade80);
          border-color: rgba(74, 222, 128, 0.4);
          background: rgba(74, 222, 128, 0.1);
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
