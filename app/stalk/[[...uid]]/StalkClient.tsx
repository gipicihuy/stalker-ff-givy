'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, X, Tag, CalendarDays, Copy, Check, Heart, Clock, Users, RefreshCw, MessageSquare, ShieldAlert, ShieldCheck, PawPrint } from 'lucide-react';

type PrimeInfo = { primeLevel?: number };
type ResolvedItem = { id: number; name: string; icon: string | null; type: string | null };
type BasicInfo = {
  accountId: string;
  nickname: string;
  region?: string;
  level?: number;
  exp?: number;
  headPic?: number;
  rank?: number;
  csRank?: number;
  badgeCnt?: number;
  liked?: number;
  createAt?: string;
  lastLoginAt?: string;
  primeInfo?: PrimeInfo;
  avatarUrl?: string | null;
  titleIconUrl?: string | null;
  equippedCharacterIconUrl?: string | null;
  equippedSkinIconUrls?: (string | null)[];
  equippedWeaponSkinIconUrls?: (string | null)[];
  equippedOutfitItems?: OutfitItem[];
  equippedWeaponOutfitItems?: OutfitItem[];
  equippedLookChangerItems?: OutfitItem[];
  equippedBanner?: ResolvedItem | null;
  equippedTitle?: ResolvedItem | null;
  equippedPin?: ResolvedItem | null;
  equippedCharacter?: ResolvedItem | null;
  equippedAvatar?: ResolvedItem | null;
};
type OutfitItem = { id: number; name: string; icon: string | null };
type GuildInfo = { guildName?: string; guildLevel?: number; memberNum?: number; capacity?: number };
type SocialInfo = { signature?: string };
type CreditInfo = { creditScore?: number };
type BanInfo = { isBanned?: boolean; lastLoginAt?: string | null; banPeriod?: number | null; status?: string | null };
type PetInfo = {
  id?: number;
  name?: string;
  speciesName?: string | null;
  level?: number;
  exp?: number;
  isSelected?: boolean;
  skinId?: number;
  skinName?: string | null;
  skinIconUrl?: string;
  selectedSkillId?: number;
  skillName?: string | null;
} | null;
type FfResponse = {
  basicInfo: BasicInfo;
  guildBasicInfo?: GuildInfo;
  socialInfo?: SocialInfo;
  creditScoreInfo?: CreditInfo;
  banInfo?: BanInfo | null;
  petInfo?: PetInfo;
};

// API /api/ff mengembalikan schema milik Free Fire Stalk sendiri (player,
// guild, social, credit, ban, pet). Adapter ini memetakan ke bentuk internal
// yang dipakai komponen di bawah, biar logic render nggak perlu diubah.
function adaptApiResponse(raw: any): FfResponse {
  return {
    basicInfo: raw?.player,
    guildBasicInfo: raw?.guild,
    socialInfo: raw?.social,
    creditScoreInfo: raw?.credit,
    banInfo: raw?.ban ?? null,
    petInfo: raw?.pet ?? null,
  };
}

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const REGION_NAMES: Record<string, string> = {
  ID: 'Indonesia', SG: 'Singapura', MY: 'Malaysia', TH: 'Thailand', VN: 'Vietnam',
  PH: 'Filipina', BR: 'Brasil', US: 'Amerika Serikat', IN: 'India', ME: 'Timur Tengah',
  RU: 'Rusia', PK: 'Pakistan', BD: 'Bangladesh', NA: 'North America', EU: 'Eropa',
  SAC: 'South & Central America', TW: 'Taiwan',
};
const PRIME_BASE_PRICES: Record<number, number> = {
  1: 12600, 2: 126000, 3: 378000, 4: 1260000, 5: 3780000, 6: 7560000, 7: 15120000,
};
const CUSTOM_TAGS: Record<string, { badge?: string; label: string; color?: string }> = {};

function getRegionName(code?: string) {
  if (!code) return '—';
  return REGION_NAMES[code] || code;
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function getJakartaParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    weekday: 'short',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
  return {
    weekdayShort: get('weekday'),
    day: Number(get('day')),
    month: Number(get('month')) - 1,
    year: Number(get('year')),
    hour: get('hour') === '24' ? 0 : Number(get('hour')),
    minute: Number(get('minute')),
  };
}

const WEEKDAY_SHORT_TO_ID: Record<string, string> = {
  Sun: 'Minggu', Mon: 'Senin', Tue: 'Selasa', Wed: 'Rabu', Thu: 'Kamis', Fri: "Jum'at", Sat: 'Sabtu',
};

function formatFullDate(timestamp?: string) {
  if (!timestamp) return '—';
  const date = new Date(Number(timestamp) * 1000);
  if (Number.isNaN(date.getTime())) return '—';
  const p = getJakartaParts(date);
  return `${WEEKDAY_SHORT_TO_ID[p.weekdayShort] ?? p.weekdayShort}, ${p.day} ${MONTHS_ID[p.month]} ${p.year}`;
}

function formatFullDateTime(timestamp?: string) {
  if (!timestamp) return '—';
  const date = new Date(Number(timestamp) * 1000);
  if (Number.isNaN(date.getTime())) return '—';
  const p = getJakartaParts(date);
  return `${p.day} ${MONTHS_ID[p.month]} ${p.year}, ${pad2(p.hour)}.${pad2(p.minute)}`;
}

function formatDateTime(timestamp?: string) {
  if (!timestamp) return '—';
  const date = new Date(Number(timestamp) * 1000);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function calculateAccountAgeDays(timestamp?: string) {
  if (!timestamp) return null;
  const created = new Date(Number(timestamp) * 1000);
  const now = new Date();
  const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null;
}

function calculateAgeBreakdown(timestamp?: string) {
  if (!timestamp) return null;
  const created = new Date(Number(timestamp) * 1000);
  const now = new Date();
  if (Number.isNaN(created.getTime())) return null;
  let years = now.getFullYear() - created.getFullYear();
  let months = now.getMonth() - created.getMonth();
  let days = now.getDate() - created.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return null;
  return { years, months, days };
}

function formatNumber(n?: number) {
  const num = Number(n);
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString('id-ID');
}

function getPrimePrice(primeLevel: number, createAt?: string) {
  if (!primeLevel) return 0;
  if (primeLevel >= 8) {
    const year = createAt ? new Date(Number(createAt) * 1000).getFullYear() : 2020;
    const min = 25200000;
    const max = year <= 2018 ? 42521219 : 35125241;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return PRIME_BASE_PRICES[primeLevel] || 50000;
}

function estimateTopupPrice(basicInfo: BasicInfo) {
  const primeLevel = basicInfo.primeInfo?.primeLevel || 0;
  let price = getPrimePrice(primeLevel, basicInfo.createAt);
  price += (basicInfo.liked || 0) * 12;
  price += (basicInfo.level || 0) * 8500;
  return Math.floor(price / 1000) * 1000;
}

function formatRupiah(n: number) {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
}

type SignatureSegment = { text: string; bold: boolean; italic: boolean; color: string | null };
type SignatureLine = { segments: SignatureSegment[] };

function parseSignatureLine(line: string): SignatureLine {
  let bold = false;
  let italic = false;
  let color: string | null = null;
  const segments: SignatureSegment[] = [];
  let buffer = '';
  let i = 0;

  const flush = () => {
    if (buffer) {
      segments.push({ text: buffer, bold, italic, color });
      buffer = '';
    }
  };

  while (i < line.length) {
    if (line[i] === '[') {
      const end = line.indexOf(']', i);
      if (end !== -1) {
        const tag = line.slice(i + 1, end);
        const lower = tag.toLowerCase();
        if (lower === 'b') { flush(); bold = true; i = end + 1; continue; }
        if (lower === '/b') { flush(); bold = false; i = end + 1; continue; }
        if (lower === 'i') { flush(); italic = true; i = end + 1; continue; }
        if (lower === '/i') { flush(); italic = false; i = end + 1; continue; }
        if (lower === 'c' || lower === 'l' || lower === 'r') { i = end + 1; continue; }
        if (/^#?[0-9a-fA-F]{6}$/.test(tag)) {
          flush();
          color = tag.startsWith('#') ? tag : `#${tag}`;
          i = end + 1;
          continue;
        }
        i = end + 1;
        continue;
      }
    }
    buffer += line[i];
    i += 1;
  }
  flush();
  return { segments };
}

function parseSignature(text: string): SignatureLine[] {
  return text.split('\n').map(parseSignatureLine);
}

function SignatureText({ text }: { text: string }) {
  const lines = parseSignature(text);
  return (
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 13 }}>
      {lines.map((line, li) => (
        <div key={li} style={{ lineHeight: '19px', minHeight: '19px', wordBreak: 'break-word' }}>
          {line.segments.map((seg, si) => (
            <span
              key={si}
              style={{
                fontWeight: seg.bold ? 700 : 400,
                fontStyle: seg.italic ? 'italic' : 'normal',
                color: seg.color || 'var(--light-text)',
              }}
            >
              {seg.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function AngleDivider() {
  return (
    <div style={{ position: 'relative', height: 4, margin: '28px 0' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#fabf00' }} />
      <div
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '25%',
          background: 'var(--background)',
          clipPath: 'polygon(0 0, 100% 0, 82% 100%, 0 100%)',
        }}
      />
    </div>
  );
}

function AngleDividerDouble() {
  return (
    <div style={{ position: 'relative', height: 4 }}>
      <div style={{ position: 'absolute', inset: 0, background: '#fabf00' }} />
      <div
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '25%',
          background: 'var(--background)',
          clipPath: 'polygon(0 0, 100% 0, 82% 100%, 0 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: '25%',
          background: 'var(--background)',
          clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0 100%)',
        }}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontWeight: 600, fontSize: 10.5, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
      {children}
    </p>
  );
}

function SectionDividerLabel({ children }: { children: React.ReactNode }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [lineWidth, setLineWidth] = useState(73);

  useEffect(() => {
    if (textRef.current) {
      setLineWidth(textRef.current.offsetWidth);
    }
  }, [children]);

  return (
    <div style={{ marginBottom: 8 }}>
      <p
        ref={textRef}
        style={{
          fontWeight: 600, fontSize: 10.5, color: 'var(--gold)', textTransform: 'uppercase',
          letterSpacing: '0.12em', marginBottom: 8, display: 'inline-block',
        }}
      >
        {children}
      </p>
      <svg width={lineWidth} height="4" viewBox="0 0 73 4" preserveAspectRatio="none" fill="none" aria-hidden="true" style={{ display: 'block' }}>
        <path d="M57.2497 0L53.6572 3.60889H0V0H57.2497Z" fill="var(--gold)" />
        <path d="M62.4526 0L58.8601 3.60889H56.8293L60.4218 0H62.4526Z" fill="var(--gold)" />
        <path d="M67.6555 0L64.063 3.60889H62.0278L65.6247 0H67.6555Z" fill="var(--gold)" />
        <path d="M72.8583 0L69.2614 3.60889H67.2307L70.8276 0H72.8583Z" fill="var(--gold)" />
      </svg>
    </div>
  );
}

function FFLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="var(--gold)" opacity="0.15" />
      <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
      <text x="14" y="18" textAnchor="middle" fill="var(--gold)" fontSize="11" fontWeight="700" fontFamily="sans-serif">FF</text>
    </svg>
  );
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14,
      border: '2px solid rgba(20,22,27,0.35)', borderTop: '2px solid #14161b',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      verticalAlign: 'middle',
    }} />
  );
}

function StatCard({ icon, label, value, sub, accent }: { icon?: string; label?: string; value: React.ReactNode; sub?: string; accent?: string }) {
  return (
    <div style={{ background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)', borderRadius: 12, padding: '13px 10px', textAlign: 'center' }}>
      {icon ? (
        <img src={icon} alt="" style={{ width: 30, height: 30, objectFit: 'contain', margin: '0 auto 7px' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      ) : null}
      {label ? <p style={{ fontSize: 10.5, color: 'var(--muted-text)', marginBottom: 4 }}>{label}</p> : null}
      <p style={{ fontSize: 15, fontWeight: 700, color: accent || 'var(--white)', fontFamily: 'var(--font-display)' }}>{value}</p>
      {sub ? <p style={{ fontSize: 10.5, color: 'var(--light-text)', marginTop: 3 }}>{sub}</p> : null}
    </div>
  );
}

function PetStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 10,
      padding: '8px 10px', minWidth: 0,
    }}>
      <p style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
        {label}
      </p>
      <p style={{
        fontSize: 12.5, fontWeight: 700, color: 'var(--white)', overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }} title={typeof value === 'string' ? value : undefined}>
        {value ?? '—'}
      </p>
    </div>
  );
}

// Nama item dari dataset asli sering dibungkus kategori, misal
// "Pet Skin: Golden Night Panther" atau "Pet Skill: Stay Chill". Prefix itu
// mubazir di kartu ini karena labelnya sendiri udah bilang "Skin"/"Skill",
// jadi dipotong biar teksnya lebih pendek & gak gampang kepotong ellipsis.
function stripNamePrefix(name?: string | null): string | null {
  if (!name) return null;
  const idx = name.indexOf(':');
  if (idx === -1) return name;
  return name.slice(idx + 1).trim() || name;
}

function PetInfoCard({ data }: { data: PetInfo }) {
  if (!data) return null;
  const skinName = stripNamePrefix(data.skinName);
  const skillName = stripNamePrefix(data.skillName);
  return (
    <div style={{
      background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)', borderRadius: 14,
      padding: '14px 14px 12px',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12, background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
        }}>
          {data.skinIconUrl ? (
            <img src={data.skinIconUrl} alt={data.name || 'Pet'} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <PawPrint size={22} color="var(--gold)" />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
            Nama Pet
          </p>
          <p style={{
            fontSize: 15, fontWeight: 700, color: 'var(--white)', fontFamily: 'var(--font-display)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {data.name || '—'}
          </p>
          {data.speciesName ? (
            <p style={{ fontSize: 11.5, color: 'var(--light-text)', marginTop: 2 }}>Spesies: {data.speciesName}</p>
          ) : null}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        <PetStat label="Level" value={formatNumber(data.level)} />
        <PetStat label="Exp" value={formatNumber(data.exp)} />
        <PetStat label="Skin" value={skinName} />
        <PetStat label="Skill" value={skillName} />
      </div>
    </div>
  );
}

function OutfitGrid({ items }: { items: OutfitItem[] }) {
  const [brokenIds, setBrokenIds] = useState<Set<number>>(new Set());

  if (!items || items.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 12 }}>
      {items.map((item) => {
        const isBroken = brokenIds.has(item.id);
        const showImage = Boolean(item.icon) && !isBroken;
        return (
          <div
            key={item.id}
            title={item.name}
            style={{
              background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)', borderRadius: 12,
              padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}
          >
            {showImage ? (
              <img
                src={item.icon as string}
                alt={item.name}
                style={{ width: 64, height: 64, objectFit: 'contain' }}
                onError={() => {
                  setBrokenIds((prev) => {
                    const next = new Set(prev);
                    next.add(item.id);
                    return next;
                  });
                }}
              />
            ) : (
              <span style={{
                width: 64, height: 64, borderRadius: 8, background: 'var(--gold-soft)', color: 'var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
              }}>
                N/A
              </span>
            )}
            <p style={{
              fontSize: 9.5, color: 'var(--muted-text)', textAlign: 'center', margin: 0, lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%',
            }}>
              {item.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="info-row" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 2px' }}>
      <span style={{
        width: 24, height: 24, borderRadius: 8, background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0,
      }}>
        {icon}
      </span>
      <span style={{ fontSize: 12.5, color: 'var(--light-text)', lineHeight: 1.35 }}>{children}</span>
    </div>
  );
}

export default function StalkClient() {
  const params = useParams<{ uid?: string | string[] }>();
  const router = useRouter();
  const initialUid = Array.isArray(params?.uid) ? params.uid[0] : undefined;
  const [uid, setUid] = useState(initialUid || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FfResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const lastCheckRef = useRef(0);
  const didInitRef = useRef(false);

  const copySignature = useCallback((text: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, []);

  const cekID = useCallback(async () => {
    const trimmed = uid.trim();
    if (!/^\d{6,15}$/.test(trimmed)) {
      setError('Masukkan UID Free Fire yang valid (angka, minimal 6 digit).');
      setResult(null);
      return;
    }

    const now = Date.now();
    if (now - lastCheckRef.current < 3000) {
      setError('Tunggu sebentar sebelum cek lagi.');
      return;
    }
    lastCheckRef.current = now;

    setLoading(true);
    setError(null);
    setResult(null);

    if (trimmed !== initialUid) {
      router.push(`/stalk/${trimmed}`, { scroll: false });
    }

    try {
      const res = await fetch(`/api/ff?uid=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || 'Gagal mengambil data.');
        return;
      }
      setResult(adaptApiResponse(data));
    } catch {
      setError('Gagal terhubung ke server. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [uid, initialUid, router]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') cekID();
  };

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    if (initialUid && /^\d{6,15}$/.test(initialUid)) {
      cekID();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const basic = result?.basicInfo;
  const social = result?.socialInfo;
  const guild = result?.guildBasicInfo;
  const credit = result?.creditScoreInfo;
  const ban = result?.banInfo;
  const pet = result?.petInfo;
  const customTag = basic ? CUSTOM_TAGS[basic.accountId] : null;
  const accountAgeDays = basic ? calculateAccountAgeDays(basic.createAt) : null;
  const ageBreakdown = basic ? calculateAgeBreakdown(basic.createAt) : null;
  const estimatedTopup = basic ? estimateTopupPrice(basic) : 0;
  const avatarSrc =
    basic?.avatarUrl ||
    (basic?.headPic ? `https://ff.garena.com/avatar/${basic.headPic}.png` : null) ||
    basic?.equippedCharacterIconUrl ||
    '/image/avatar1.jpg';
  const characterItems: ResolvedItem[] = [basic?.equippedCharacter].filter(
    (item): item is ResolvedItem => Boolean(item)
  );
  const profileItems: ResolvedItem[] = [
    basic?.equippedBanner,
    basic?.equippedTitle,
    basic?.equippedPin,
  ].filter((item): item is ResolvedItem => Boolean(item));

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 16px 64px' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, width: '100%',
        background: 'var(--panel-bg, #1a1c20)', borderBottom: '1px solid rgba(153,153,153,0.15)',
        marginBottom: 24,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', height: 52, display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' }}>
          <FFLogo />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#ffffff', letterSpacing: '0.04em', fontFamily: 'var(--font-display)' }}>
            Stalker
          </span>
        </div>
        <p style={{ maxWidth: 720, margin: '0 auto', padding: '0 4px 10px', fontSize: 11, color: 'var(--muted-text)' }}>
          Cek info akun Free Fire lewat UID
        </p>
      </header>

      <div style={{ margin: '28px 0' }}>
        <AngleDividerDouble />
      </div>

      <section style={{ width: '100%', maxWidth: 720 }}>
        <SectionLabel>Masukkan UID</SectionLabel>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={12}
            placeholder="Contoh: 903474122"
            value={uid}
            onChange={(e) => setUid(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={onKeyDown}
            style={{
              width: '100%', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
              borderRadius: 12, padding: '13px 84px 13px 16px', fontSize: 15, color: 'var(--white)', outline: 'none',
            }}
          />
          <div style={{ position: 'absolute', right: 6, top: 6, bottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            {uid ? (
              <button
                type="button"
                aria-label="Bersihkan"
                onClick={() => {
                  setUid('');
                  setError(null);
                  setResult(null);
                  if (initialUid) router.push('/stalk', { scroll: false });
                }}
                className="icon-btn"
                style={{
                  width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', border: 'none', borderRadius: 9, color: 'var(--muted-text)',
                }}
              >
                <X size={17} />
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Cek ID"
              onClick={cekID}
              disabled={loading}
              className="icon-btn"
              style={{
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: loading ? 'var(--gold-hover)' : 'var(--gold)', border: 'none', borderRadius: 9,
                color: '#14161b', opacity: loading ? 0.85 : 1,
              }}
            >
              {loading ? <Spinner /> : <Search size={16} />}
            </button>
          </div>
        </div>

        {error ? (
          <div style={{
            marginTop: 14, background: 'var(--error-bg)', border: '1px solid var(--error-border)',
            color: 'var(--error-text)', borderRadius: 10, padding: '12px 14px', fontSize: 14,
          }}>
            {error}
          </div>
        ) : null}
      </section>

      {basic ? (
        <section className="profile-card" style={{
          width: '100%', maxWidth: 720, marginTop: 28, background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)', borderRadius: 20, padding: 18, animation: 'fadeUp 0.35s ease',
        }}>
          <button
            type="button"
            aria-label="Refresh data"
            onClick={cekID}
            disabled={loading}
            className="icon-btn"
            style={{
              position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(0,0,0,0.35)', border: '1px solid var(--panel-border)', color: 'var(--light-text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
            }}
          >
            <RefreshCw size={13} style={{ transform: loading ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
          </button>

          <div style={{
            width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center',
            filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.35))',
          }}>
            <img
              src={avatarSrc}
              alt="Avatar"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              onError={(e) => {
                const fallback = basic?.equippedCharacterIconUrl || '/image/avatar1.jpg';
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                } else if (fallback !== '/image/avatar1.jpg') {
                  e.currentTarget.src = '/image/avatar1.jpg';
                }
              }}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--white)', wordBreak: 'break-word', fontFamily: 'var(--font-display)' }}>
                {basic.nickname}
              </h2>
              {basic.level ? (
                <span style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--gold)', background: 'var(--gold-soft)',
                  border: '1px solid rgba(250,191,0,0.35)', borderRadius: 999, padding: '2px 10px', fontFamily: 'var(--font-display)',
                }}>
                  Lv.{basic.level}
                </span>
              ) : null}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6, flexWrap: 'wrap', fontSize: 12, color: 'var(--muted-text)' }}>
              <span>ID: {basic.accountId}</span>
              {basic.liked !== undefined ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--light-text)' }}>
                  <Heart size={12} color="#ff6b6b" fill="#ff6b6b" /> Likes: {formatNumber(basic.liked)}
                </span>
              ) : null}
              {basic.region ? <span>Region: {basic.region}</span> : null}
            </div>

            {(accountAgeDays !== null && ageBreakdown) || ban ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9, flexWrap: 'wrap' }}>
                {accountAgeDays !== null && ageBreakdown ? (
                  <span style={{
                    display: 'inline-block', fontSize: 11, fontWeight: 600, color: 'var(--gold)',
                    border: '1px solid rgba(250,191,0,0.4)', borderRadius: 999, padding: '3px 12px',
                  }}>
                    {ageBreakdown.years} Years Old
                  </span>
                ) : null}

                {ban ? (
                  ban.isBanned ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
                      color: '#ff5c5c', background: 'rgba(255,92,92,0.12)', border: '1px solid rgba(255,92,92,0.4)',
                      borderRadius: 999, padding: '3px 12px',
                    }}>
                      <ShieldAlert size={13} /> Banned
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
                      color: 'var(--success)', background: 'rgba(80,200,120,0.12)', border: '1px solid rgba(80,200,120,0.4)',
                      borderRadius: 999, padding: '3px 12px',
                    }}>
                      <ShieldCheck size={13} /> Not Banned
                    </span>
                  )
                ) : null}
              </div>
            ) : null}

            {customTag ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                {customTag.badge ? (
                  <img src={customTag.badge} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : null}
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                  background: 'var(--gold-soft)', color: customTag.color || 'var(--gold)',
                  border: '1px solid rgba(250,191,0,0.3)',
                }}>
                  {customTag.label}
                </span>
              </div>
            ) : null}
          </div>

          <div style={{
            marginTop: 14, background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)',
            borderRadius: 14, padding: '2px 12px',
          }}>
            <InfoRow icon={<CalendarDays size={13} />}>
              Akun dibuat pada {formatFullDateTime(basic.createAt)}
            </InfoRow>
            {ageBreakdown ? (
              <InfoRow icon={<CalendarDays size={13} />}>
                berusia {ageBreakdown.years} tahun, {ageBreakdown.months} bulan dan {ageBreakdown.days} hari
              </InfoRow>
            ) : null}
            <InfoRow icon={<Clock size={13} />}>
              Login terakhir {formatFullDateTime(basic.lastLoginAt)}
            </InfoRow>
          </div>

          <div style={{ height: 1, background: 'var(--panel-border)', margin: '16px 0' }} />

          <div>
            <SectionDividerLabel>Estimasi &amp; Statistik</SectionDividerLabel>
            <div style={{
              background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)',
              borderRadius: 14, padding: '14px 14px 10px', display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 12,
            }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Tag size={12} /> Estimasi Topup Kamu
                </p>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)', fontFamily: 'var(--font-display)' }}>{formatRupiah(estimatedTopup)}</p>
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MessageSquare size={12} /> Bio
                </p>
                <div style={{
                  position: 'relative', background: 'var(--panel-bg)', border: '1px solid rgba(90,169,230,0.25)',
                  borderRadius: 10, padding: '8px 26px 8px 10px',
                }}>
                  {social?.signature ? (
                    <SignatureText text={social.signature} />
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--light-text)', fontFamily: 'var(--font-display)' }}>
                      Tidak ada signature / bio.
                    </p>
                  )}
                  {social?.signature ? (
                    <button
                      type="button"
                      aria-label="Salin signature"
                      onClick={() => copySignature(social.signature || '')}
                      className="icon-btn"
                      style={{
                        position: 'absolute', top: 6, right: 6, width: 20, height: 20,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'transparent', border: 'none', borderRadius: 6, color: copied ? 'var(--success)' : 'var(--muted-text)',
                      }}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <StatCard icon="/image/bpmati.png" value="Booyah Pass" accent="var(--gold)" sub={`Badge: ${basic.badgeCnt ?? '—'}`} />
              <StatCard
                icon={`/image/prime${basic.primeInfo?.primeLevel || 1}.png`}
                label="Prime Level"
                value={basic.primeInfo?.primeLevel ? `Prime ${basic.primeInfo.primeLevel}` : '—'}
                accent="var(--blue)"
              />
              <StatCard icon="/image/exp.png" label="Exp Level" value={formatNumber(basic.exp)} />
              <StatCard icon="/image/skor.png" label="Credit Score" value={credit?.creditScore ?? '—'} accent="var(--success)" />
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--panel-border)', margin: '16px 0' }} />

          <div>
            <SectionDividerLabel>Guild</SectionDividerLabel>
            {guild?.guildName ? (
              <>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--blue-soft)',
                  border: '1px solid rgba(90,169,230,0.4)', color: 'var(--blue)', borderRadius: 999,
                  padding: '5px 13px', fontSize: 12.5, fontWeight: 700,
                }}>
                  <Users size={13} /> {guild.guildName}
                </div>
                <div style={{
                  marginTop: 10, background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)',
                  borderRadius: 12, padding: '10px 13px', display: 'flex', gap: 16, flexWrap: 'wrap',
                  fontSize: 12, color: 'var(--light-text)',
                }}>
                  <span>Level: <strong style={{ color: 'var(--white)' }}>{guild.guildLevel ?? '—'}</strong></span>
                  <span>Anggota: <strong style={{ color: 'var(--white)' }}>{guild.memberNum ?? '—'}/{guild.capacity ?? '—'}</strong></span>
                </div>
              </>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--muted-text)' }}>Tidak tergabung dalam guild.</p>
            )}
          </div>

          {characterItems.length > 0 ? (
            <>
              <div style={{ height: 1, background: 'var(--panel-border)', margin: '16px 0' }} />
              <div>
                <SectionDividerLabel>Character</SectionDividerLabel>
                <OutfitGrid items={characterItems} />
              </div>
            </>
          ) : null}

          {profileItems.length > 0 ? (
            <>
              <div style={{ height: 1, background: 'var(--panel-border)', margin: '16px 0' }} />
              <div>
                <SectionDividerLabel>Profile Items</SectionDividerLabel>
                <OutfitGrid items={profileItems} />
              </div>
            </>
          ) : null}

          {basic?.equippedOutfitItems && basic.equippedOutfitItems.length > 0 ? (
            <>
              <div style={{ height: 1, background: 'var(--panel-border)', margin: '16px 0' }} />
              <div>
                <SectionDividerLabel>Outfit</SectionDividerLabel>
                <OutfitGrid items={basic.equippedOutfitItems} />
              </div>
            </>
          ) : null}

          {basic?.equippedWeaponOutfitItems && basic.equippedWeaponOutfitItems.length > 0 ? (
            <>
              <div style={{ height: 1, background: 'var(--panel-border)', margin: '16px 0' }} />
              <div>
                <SectionDividerLabel>Weapon Skin</SectionDividerLabel>
                <OutfitGrid items={basic.equippedWeaponOutfitItems} />
              </div>
            </>
          ) : null}

          {basic?.equippedLookChangerItems && basic.equippedLookChangerItems.length > 0 ? (
            <>
              <div style={{ height: 1, background: 'var(--panel-border)', margin: '16px 0' }} />
              <div>
                <SectionDividerLabel>Look Changer</SectionDividerLabel>
                <OutfitGrid items={basic.equippedLookChangerItems} />
              </div>
            </>
          ) : null}

          {pet ? (
            <>
              <div style={{ height: 1, background: 'var(--panel-border)', margin: '16px 0' }} />
              <div>
                <SectionDividerLabel>Pet Info</SectionDividerLabel>
                <PetInfoCard data={pet} />
              </div>
            </>
          ) : null}
        </section>
      ) : (!loading && !error) ? (
        <section style={{ width: '100%', maxWidth: 720, marginTop: 48, textAlign: 'center', color: 'var(--muted-text)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.5 }}>
            <Search size={36} />
          </div>
          <p>Masukkan UID Free Fire</p>
        </section>
      ) : null}

      <footer style={{ marginTop: 56, textAlign: 'center' }}>
        <div style={{ marginBottom: 10 }}>
          <AngleDividerDouble />
        </div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 500, letterSpacing: '0.01em', color: 'var(--light-text)' }}>
          Free Fire Stalk
        </p>
      </footer>
    </main>
  );
}
