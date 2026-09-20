'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Search, X, Tag, CalendarDays, Copy, Check, Heart, Clock, Users, RefreshCw, MessageSquare, ShieldAlert, ShieldCheck, PawPrint, User, Shirt, ChevronDown, ChevronRight, Trophy, Hash, LayoutGrid, Swords, Sparkles, Wind, Star, type LucideIcon } from 'lucide-react';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { buildHandshakeHeaders } from '@/lib/security/client';
import { GUARD_PATHS } from '@/lib/security/constants';

type PrimeInfo = { primeLevel?: number };
type ResolvedItem = { id: number; name: string; icon: string | null; type: string | null; description?: string | null };
type BasicInfo = {
  accountId: string;
  nickname: string;
  region?: string;
  level?: number;
  exp?: number;
  headPic?: number;
  rank?: number;
  rankingPoints?: number;
  csRank?: number;
  csRankingPoints?: number;
  badgeCnt?: number;
  hasElitePass?: boolean;
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
  equippedArrivalAnimationItems?: OutfitItem[];
  equippedBanner?: ResolvedItem | null;
  equippedTitle?: ResolvedItem | null;
  equippedPin?: ResolvedItem | null;
  equippedCharacter?: ResolvedItem | null;
  equippedAvatar?: ResolvedItem | null;
};
type OutfitItem = { id: number; name: string; icon: string | null; type?: string | null; description?: string | null };

// Clip-path notches buat kontainer bergaya "tag/flag" (identitas visual
// Stalker: tab, tombol search, avatar list, dst). N = ukuran potongan sudut
// dalam px. Ditaruh di module scope biar bisa dipake bareng-bareng sama
// komponen apapun (OutfitGrid, modal detail item, dll), gak cuma di dalam
// StalkClient.
const notchTag = (n: number) =>
  `polygon(0 0, calc(100% - ${n}px) 0, 100% ${n}px, 100% 100%, ${n}px 100%, 0 calc(100% - ${n}px))`;
const notchBL = (n: number) =>
  `polygon(0 0, 100% 0, 100% 100%, ${n}px 100%, 0 calc(100% - ${n}px))`;
const notchTR = (n: number) =>
  `polygon(0 0, calc(100% - ${n}px) 0, 100% ${n}px, 100% 100%, 0 100%)`;

// ID unik & stabil per item, dipakai sebagai `layoutId` di kartu item mana
// pun item itu dirender (section normal ATAU Grid View collection). Selama
// ID-nya sama, framer-motion otomatis bikin animasi "magic move" (FLIP) pas
// kartu itu pindah dari posisi di section normal ke posisi barunya di grid,
// dan sebaliknya - bukan sekadar fade.
const gridItemLayoutId = (category: string, id: number) => `stalk-item::${category}::${id}`;

// Konfigurasi spring yang sama persis dipakai di kartu versi normal
// (OutfitGrid) maupun versi Vault/grid (CompactGridItem), supaya kecepatan
// & "feel" animasi geraknya identik dari dua arah (ON->OFF dan
// OFF->ON) - bukan cuma soal layoutId yang sama, transition-nya juga harus
// sama biar gak ada "loncatan" kecepatan.
const gridItemLayoutTransition = { type: 'spring' as const, stiffness: 340, damping: 34, mass: 0.75 };

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
type NicknameSearchItem = {
  accountid: string;
  nickname: string;
  level?: number;
  region?: string;
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
    <svg width="100%" height="5" viewBox="0 0 560 5" preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block', margin: '28px 0' }}>
      <path d="M0 4H560" stroke="#fabf00" strokeMiterlimit="10" />
      <path d="M430 0H560V4H420L424.76 1.20615C425.66 0.429117 426.81 0.000859238 430 0Z" fill="#fabf00" />
    </svg>
  );
}

function AngleDividerDouble() {
  return (
    <svg width="100%" height="5" viewBox="0 0 560 5" preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block' }}>
      <path d="M0 4H560" stroke="#fabf00" strokeMiterlimit="10" />
      <path d="M430 0H560V4H420L424.76 1.20615C425.66 0.429117 426.81 0.000859238 430 0Z" fill="#fabf00" />
      <path d="M130 0H0V4H140L135.24 1.20615C134.34 0.429117 133.19 0.000859238 130 0Z" fill="#fabf00" />
    </svg>
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

function LoadingOverlay() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/loading/Loading.gif" alt="Loading" style={{ width: 80 }} />
      <span style={{
        color: 'var(--gold)', fontSize: '1.2rem', fontWeight: 800,
        marginTop: 15, fontStyle: 'italic', letterSpacing: 1,
      }}>
        LOADING...
      </span>
    </div>
  );
}

// Tabel ambang batas poin BR Ranking -> [file icon, label tier]. Cara
// bacanya: cari ambang batas TERTINGGI yang masih <= poin akun, itulah
// tier saat ini. Icon aslinya di-serve dari CDN eksternal, tapi
// di-proxy lewat /api/img/rank/ (lihat app/api/img/rank/[file]/route.ts)
// supaya origin CDN-nya tidak keliatan pas inspect / network tab.
const BR_RANK_ICON_BASE = '/api/img/rank';

const BR_RANKING_MAP: Array<[number, string, string]> = [
  [1000, 'br-bronze1.png', 'Bronze I'],
  [1100, 'br-bronze2.png', 'Bronze II'],
  [1200, 'br-bronze3.png', 'Bronze III'],
  [1310, 'br-silver1.png', 'Silver I'],
  [1410, 'br-silver2.png', 'Silver II'],
  [1600, 'br-silver3.png', 'Silver III'],
  [1610, 'br-gold1.png', 'Gold I'],
  [1735, 'br-gold2.png', 'Gold II'],
  [1860, 'br-gold3.png', 'Gold III'],
  [1985, 'br-gold4.png', 'Gold IV'],
  [2110, 'br-platinum1.png', 'Platinum I'],
  [2235, 'br-platinum2.png', 'Platinum II'],
  [2360, 'br-platinum3.png', 'Platinum III'],
  [2485, 'br-platinum4.png', 'Platinum IV'],
  [2610, 'br-platinum5.png', 'Platinum V'],
  [2760, 'br-diamond1.png', 'Diamond I'],
  [2910, 'br-diamond2.png', 'Diamond II'],
  [3060, 'br-diamond3.png', 'Diamond III'],
  [3210, 'br-diamond4.png', 'Diamond IV'],
  [3350, 'br-diamond5.png', 'Diamond V'],
  [3500, 'br-heroic1.png', 'Heroic I'],
  [4100, 'br-heroic2.png', 'Heroic II'],
  [4300, 'br-heroic3.png', 'Heroic III'],
  [4900, 'br-heroic4.png', 'Heroic IV'],
  [5500, 'br-heroic5.png', 'Heroic V'],
  [6300, 'br-master1.png', 'Master I'],
  [7100, 'br-master2.png', 'Master II'],
  [8000, 'br-master3.png', 'Master III'],
  [9000, 'br-master4.png', 'Master IV'],
  [10000, 'br-master5.png', 'Master V'],
];

function getBrRankInfo(points?: number): { icon: string; label: string; points: number } {
  const p = points ?? 0;
  let best = BR_RANKING_MAP[0];
  for (const entry of BR_RANKING_MAP) {
    if (entry[0] <= p) best = entry;
    else break;
  }
  return { icon: `${BR_RANK_ICON_BASE}/${best[1]}`, label: best[2], points: p };
}

// ============================================================
// CS (Clash Squad) Rank — sama seperti proxy BR rank, cuma
// filenya beda. Rumusnya diadaptasi dari adenpedia.my.id/script.js:
//
// - rankId (csRank) >= 320  => tier tinggi (Heroic ke atas), bintang
//   yang ditampilkan = csRankingPoints - 90 (bukan csRankingPoints
//   mentah / rankId, itu yang bikin salah baca +3).
// - rankId < 320             => tier awal (Bronze..Diamond), dan
//   csRankingPoints dipakai LANGSUNG sebagai index ke tabel rank
//   (bukan hasil pengurangan apa pun).
// Kuirk asli adenpedia dipertahankan: point 0 → Bronze I bintang 0
// (bukan entry index-0 di tabel, itu sengaja diloncatin / dead code
// di source aslinya).
const CS_RANK_ORDER: Array<{ file: string; label: string; star: number }> = (() => {
  const out: Array<{ file: string; label: string; star: number }> = [];
  const push = (file: string, label: string, count: number) => {
    for (let star = 1; star <= count; star++) out.push({ file, label, star });
  };
  push('Bronze1.png', 'Bronze', 3);
  push('Bronze2.png', 'Bronze', 3);
  push('Bronze3.png', 'Bronze', 3);
  push('Silver1.png', 'Silver', 4);
  push('Silver2.png', 'Silver', 4);
  push('Silver3.png', 'Silver', 4);
  push('Gold1.png', 'Gold', 4);
  push('Gold2.png', 'Gold', 4);
  push('Gold3.png', 'Gold', 4);
  push('Gold4.png', 'Gold', 4);
  push('Platinum1.png', 'Platinum', 5);
  push('Platinum2.png', 'Platinum', 5);
  push('Platinum3.png', 'Platinum', 5);
  push('Platinum4.png', 'Platinum', 5);
  push('Platinum5.png', 'Platinum', 5);
  push('Diamond1.png', 'Diamond', 5);
  push('Diamond2.png', 'Diamond', 5);
  push('Diamond3.png', 'Diamond', 5);
  push('Diamond4.png', 'Diamond', 5);
  push('Diamond5.png', 'Diamond', 5);
  return out;
})();

function getCsHighTierInfo(displayStars: number): { icon: string; label: string; star: number } {
  if (displayStars >= 100) return { icon: `${BR_RANK_ICON_BASE}/Master2.png`, label: 'Elite Master', star: displayStars };
  if (displayStars >= 50) return { icon: `${BR_RANK_ICON_BASE}/br-master1.png`, label: 'Master', star: displayStars };
  if (displayStars >= 24) return { icon: `${BR_RANK_ICON_BASE}/Heroic2.png`, label: 'Elite Heroic', star: displayStars };
  return { icon: `${BR_RANK_ICON_BASE}/br-heroic1.png`, label: 'Heroic', star: displayStars };
}

function getCsRankInfo(csRank?: number, csRankingPoints?: number): { icon: string; label: string; star: number } {
  const rankId = Math.max(0, csRank ?? 0);
  const raw = Math.max(0, csRankingPoints ?? 0);
  const isHighTier = rankId >= 320;

  if (isHighTier) {
    return getCsHighTierInfo(Math.max(0, raw - 90));
  }

  if (raw <= 0) {
    return { icon: `${BR_RANK_ICON_BASE}/Bronze1.png`, label: 'Bronze', star: 0 };
  }
  if (raw < CS_RANK_ORDER.length) {
    const entry = CS_RANK_ORDER[raw];
    return { icon: `${BR_RANK_ICON_BASE}/${entry.file}`, label: entry.label, star: entry.star };
  }
  // Fallback: index sudah lewat tabel tapi rankId belum nyampe 320 → anggap Heroic.
  return getCsHighTierInfo(Math.max(0, raw - 90));
}

function StatCard({ icon, label, value, sub, accent, valueSize }: { icon?: string; label?: string; value: React.ReactNode; sub?: string; accent?: string; valueSize?: number }) {
  return (
    <div style={{ background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)', borderRadius: 12, padding: '13px 10px', textAlign: 'center' }}>
      {icon ? (
        <img src={icon} alt="" style={{ width: 30, height: 30, objectFit: 'contain', margin: '0 auto 7px' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      ) : null}
      {label ? <p style={{ fontSize: 10.5, color: 'var(--muted-text)', marginBottom: 4 }}>{label}</p> : null}
      <p style={{ fontSize: valueSize || 15, fontWeight: 700, color: accent || 'var(--white)', fontFamily: 'var(--font-display)' }}>{value}</p>
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

function HowToUseSection() {
  const steps = [
    { title: 'Enter Your UID', desc: 'Type or paste your Free Fire UID into the search field above.' },
    { title: 'Click Search', desc: 'Tap the search icon or press Enter to fetch the player\u2019s data.' },
    { title: 'View The Results', desc: 'Full profile stats load in seconds: level, guild, outfit, and pet.' },
  ];

  return (
    <section style={{ width: '100%', maxWidth: 720, marginTop: 40 }}>
      <SectionDividerLabel>How To Use</SectionDividerLabel>
      <div style={{
        background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 16,
        padding: 18, display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {steps.map((step, i) => (
          <div key={step.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
              background: 'var(--gold-soft)', border: '1px solid var(--gold)', color: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
            }}>
              {i + 1}
            </div>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>{step.title}</p>
              <p style={{ fontSize: 12.5, color: 'var(--light-text)', lineHeight: 1.55 }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function InfoCategoriesSection() {
  const items = [
    { label: 'Profile & Level', desc: 'Nickname, level, EXP, and account creation date.', icon: User, color: '#fabf00' },
    { label: 'Guild', desc: 'Guild name, guild level, and member count.', icon: Users, color: '#5aa9e6' },
    { label: 'Outfit & Skin', desc: 'Currently equipped character, outfit, and weapon skins.', icon: Shirt, color: '#c084fc' },
    { label: 'Pet Info', desc: 'Pet name, level, skin, and active skill.', icon: PawPrint, color: '#4ade80' },
    { label: 'Account Status', desc: 'Credit score and ban status.', icon: ShieldCheck, color: '#ff8a5c' },
    { label: 'Account Age', desc: 'Account age, likes received, and last login time.', icon: Clock, color: '#fabf00' },
  ];

  return (
    <section style={{ width: '100%', maxWidth: 720, marginTop: 28, marginBottom: 40 }}>
      <SectionDividerLabel>What You Can Check</SectionDividerLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} style={{
              position: 'relative', overflow: 'hidden',
              background: `linear-gradient(155deg, ${item.color}1c, var(--background) 55%)`,
              border: '1px solid var(--panel-border)', borderRadius: 12, padding: '14px',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <div style={{
                position: 'absolute', top: 8, left: 8, width: 10, height: 10,
                borderTop: `1px solid ${item.color}80`, borderLeft: `1px solid ${item.color}80`,
              }} />
              <div style={{
                position: 'absolute', bottom: 8, right: 8, width: 10, height: 10,
                borderBottom: `1px solid ${item.color}80`, borderRight: `1px solid ${item.color}80`,
              }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${item.color}70, transparent)`,
              }} />
              <div style={{
                flexShrink: 0, width: 34, height: 34, borderRadius: 10,
                background: `${item.color}29`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} color={item.color} />
              </div>
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>{item.label}</p>
                <p style={{ fontSize: 11.5, color: 'var(--light-text)', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    {
      q: 'Is this tool free to use?',
      a: 'Yes, checking a Free Fire profile with this tool is completely free. No login, no download, and no hidden fees. Just enter a UID and search.',
    },
    {
      q: 'Where does the player data come from?',
      a: "Data is pulled directly from Free Fire's servers based on the UID you search, so it reflects the player's live in-game profile.",
    },
    {
      q: 'Is it safe to check someone else\u2019s profile?',
      a: 'Yes. This tool only reads public profile data that\u2019s already visible in-game, such as level, guild, outfit, and pet. It cannot access passwords, linked accounts, or private information.',
    },
    {
      q: 'Why does my search return no results?',
      a: 'This usually means the UID was typed incorrectly, or the account doesn\u2019t exist. Double-check the number on your profile in-game and try again.',
    },
    {
      q: 'Can I check a player\u2019s rank or match history?',
      a: 'Not yet. This tool currently focuses on profile info: level, guild, outfit, weapon skins, and pet details. Rank and match history may be added in a future update.',
    },
  ];

  return (
    <section style={{ width: '100%', maxWidth: 720, marginTop: 28, marginBottom: 40 }}>
      <SectionDividerLabel>FAQ</SectionDividerLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {faqs.map((item) => (
          <details key={item.q} className="faq-item" style={{
            background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: 12,
          }}>
            <summary style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', cursor: 'pointer',
            }}>
              <span className="faq-question" style={{
                flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--white)',
                fontFamily: 'var(--font-display)', transition: 'color 0.2s ease',
              }}>
                {item.q}
              </span>
              <ChevronDown className="faq-chevron" size={16} color="var(--muted-text)" style={{ flexShrink: 0 }} />
            </summary>
            <div style={{ padding: '0 16px 16px', fontSize: 12.5, color: 'var(--light-text)', lineHeight: 1.6 }}>
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function OutfitGrid({
  items,
  category,
  onSelect,
}: {
  items: (OutfitItem & { _cat?: string })[];
  category: string;
  onSelect: (item: OutfitItem, category: string) => void;
}) {
  const [brokenIds, setBrokenIds] = useState<Set<number>>(new Set());

  if (!items || items.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: 10 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((item) => {
          const isBroken = brokenIds.has(item.id);
          const showImage = Boolean(item.icon) && !isBroken;
          return (
            <motion.button
              key={`${item._cat ?? category}-${item.id}`}
              layout
              layoutId={gridItemLayoutId(item._cat ?? category, item.id)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ layout: gridItemLayoutTransition, opacity: { duration: 0.18 }, scale: { duration: 0.18 } }}
              type="button"
              title={item.name}
              onClick={() => onSelect(item, item._cat ?? category)}
              className="icon-btn"
              style={{
                background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)', borderRadius: 12,
                padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                cursor: 'pointer', textAlign: 'center', width: '100%',
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
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// --- Grid View khusus section CHARACTER ---
// Fitur ini nambahin cara pandang alternatif buat item-item yang udah ada
// (Character, Profile Items, Outfit, Weapon, dst) TANPA ngubah section
// masing-masing yang udah ada di bawahnya (itu semua tetep dirender apa
// adanya lewat OutfitGrid biasa). Grid View di sini murni nambah, bukan
// gantiin.
type GridCategoryDef = {
  key: string;
  label: string;
  icon: LucideIcon;
  items: (OutfitItem & { _cat?: string })[];
};

// Kartu compact di Grid View. Pake framer-motion `layout` + AnimatePresence
// biar pas ganti kategori, item lama animasi keluar dan item baru animasi
// masuk sambil "settle" ke posisi grid masing-masing (bukan cuma ganti
// konten secara instan) - ini pattern standar framer-motion buat
// "animated filterable grid".
function CompactGridItem({
  item,
  layoutId,
  onSelect,
}: {
  item: OutfitItem & { _cat?: string };
  layoutId: string;
  onSelect: () => void;
}) {
  const [imgBroken, setImgBroken] = useState(false);
  const showImage = Boolean(item.icon) && !imgBroken;

  return (
    <motion.button
      layout
      layoutId={layoutId}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ layout: gridItemLayoutTransition, opacity: { duration: 0.18 }, scale: { duration: 0.18 } }}
      type="button"
      title={item.name}
      onClick={onSelect}
      className="icon-btn"
      style={{
        background: 'transparent', border: 'none', padding: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        cursor: 'pointer', textAlign: 'center', width: '100%', minWidth: 0,
      }}
    >
      {/* "Card" beneran: cuma bungkus image + nama. Border/background di
          sini doang, jadi tingginya cuma ditentuin sama 2 elemen ini -
          nama tetap dikasih tinggi fixed (bukan min-height) biar box card
          antar kolom selalu sama tinggi walau nama 1 vs 2 baris. */}
      <div style={{
        background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)', borderRadius: 14,
        padding: '9px 6px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        width: '100%',
      }}>
        <div style={{ width: '100%', aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {showImage ? (
            <img
              src={item.icon as string}
              alt={item.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={() => setImgBroken(true)}
            />
          ) : (
            <span style={{
              width: '68%', aspectRatio: '1 / 1', borderRadius: 8, background: 'var(--gold-soft)', color: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9,
            }}>
              N/A
            </span>
          )}
        </div>
        <div style={{
          width: '100%', height: 25, flexShrink: 0,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        }}>
          <p style={{
            fontSize: 10, fontWeight: 600, color: 'var(--light-text)', textAlign: 'center', margin: 0, lineHeight: 1.25,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', width: '100%',
          }}>
            {item.name}
          </p>
        </div>
      </div>
      {/* Badge type/category: DI LUAR card, di bawahnya (bukan numpuk ke
          gambar lagi). Tetap dikasih pill/border kayak versi numpuk tadi,
          cuma posisinya balik ke bawah. Ukurannya (font-size + padding)
          selalu tetap, jadi otomatis sejajar antar card di satu baris
          karena tinggi card di atasnya udah dijamin sama. */}
      <span
        style={{
          padding: '3px 8px', borderRadius: 999, fontSize: 7.5, fontWeight: 700,
          color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.03em',
          background: 'var(--panel-bg-alt)', border: '1px solid var(--gold)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
        }}
      >
        {item.type || '\u00A0'}
      </span>
    </motion.button>
  );
}

// Grid collection Vault - 4 kolom di mobile (naik proporsional di layar
// lebih lebar lewat class .vault-grid di globals.css), card lebih besar &
// gambar lebih menonjol dibanding versi sebelumnya, tapi tetap compact.
function CompactCollectionGrid({
  items,
  onSelectItem,
}: {
  items: (OutfitItem & { _cat?: string })[];
  onSelectItem: (item: OutfitItem, category: string) => void;
}) {
  if (items.length === 0) {
    return <p style={{ fontSize: 11.5, color: 'var(--muted-text)', margin: '8px 0' }}>Kosong.</p>;
  }
  return (
    <motion.div layout transition={{ layout: gridItemLayoutTransition }} className="vault-grid">
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((item) => (
          <CompactGridItem
            key={`${item._cat ?? ''}-${item.id}`}
            item={item}
            layoutId={gridItemLayoutId(item._cat || 'Item', item.id)}
            onSelect={() => onSelectItem(item, item._cat || 'Item')}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Section CHARACTER - default-nya identik sama sebelumnya (cuma
// <OutfitGrid items={characterItems} .../>). Yang baru: tombol Grid View di
// pojok kanan judul section, dan kalau diaktifin, muncul selector kategori
// (chip ber-icon) buat lompat lihat koleksi Profile Items/Outfit/Weapon/dst
// dalam bentuk grid compact TANPA pindah section/reload halaman.
function CharacterSection({
  characterItems,
  gridCategories,
  gridViewOn,
  setGridViewOn,
  onSelectItem,
}: {
  characterItems: ResolvedItem[];
  gridCategories: GridCategoryDef[];
  gridViewOn: boolean;
  setGridViewOn: (updater: boolean | ((prev: boolean) => boolean)) => void;
  onSelectItem: (item: OutfitItem, category: string) => void;
}) {
  if (characterItems.length === 0) return null;

  // Selector kategori (Character/Profile Items/Outfit/Weapon/dst) dihapus -
  // Vault sekarang selalu nampilin SEMUA item digabung. "All" cuma
  // ditinggalin sebagai indikator total jumlah item, bukan tombol filter.
  const allCategory = gridCategories.find((c) => c.key === 'all') ?? null;

  return (
    <>
      <div style={{ height: 1, background: 'var(--panel-border)', margin: '16px 0' }} />
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <SectionDividerLabel>{gridViewOn ? 'Vault' : 'Character'}</SectionDividerLabel>
          {gridCategories.length > 0 ? (
            <button
              type="button"
              onClick={() => setGridViewOn((v) => !v)}
              title={gridViewOn ? 'Kembali ke tampilan Character' : 'Buka Vault (Grid View)'}
              aria-pressed={gridViewOn}
              className="icon-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: 27, height: 27,
                borderRadius: 8, cursor: 'pointer', flexShrink: 0,
                background: gridViewOn ? 'var(--gold-soft)' : 'var(--panel-bg-alt)',
                border: `1px solid ${gridViewOn ? 'var(--gold)' : 'var(--panel-border)'}`,
                color: gridViewOn ? 'var(--gold)' : 'var(--muted-text)',
              }}
            >
              <LayoutGrid size={13} />
            </button>
          ) : null}
        </div>

        {/* `layout` di wrapper ini bikin PERUBAHAN TINGGI section ikut smooth.
            Konten di dalam SENGAJA gak dibungkus fade container terpisah lagi -
            tiap kartu item (motion.button di OutfitGrid / CompactGridItem di
            Vault) udah punya `layoutId` yang SAMA persis di kedua tampilan,
            jadi framer-motion otomatis "magic move"-in tiap item dari posisi
            lamanya ke posisi barunya sendiri-sendiri (bukan container yang
            fade in/out). Item yang gak ada pasangannya di sisi lain tetap
            fade halus lewat initial/animate/exit masing-masing. */}
        <motion.div layout transition={{ layout: gridItemLayoutTransition }} style={{ overflow: 'hidden' }}>
          {!gridViewOn ? (
            <OutfitGrid items={characterItems} category="Character" onSelect={onSelectItem} />
          ) : (
            <CompactCollectionGrid items={allCategory?.items ?? []} onSelectItem={onSelectItem} />
          )}
        </motion.div>
      </div>
    </>
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

// Modal detail item - dipicu klik kartu di OutfitGrid manapun (Character,
// Outfit, Weapon, Look Changer, Arrival Animation, Profile Item, dst).
// Desainnya ngikutin visual language Stalker sendiri (notch/flag shape,
// gold accent, dark panel) - bukan niru style referensi manapun.
function ItemDetailModal({
  item,
  category,
  onClose,
}: {
  item: OutfitItem | null;
  category: string | null;
  onClose: () => void;
}) {
  const [imgBroken, setImgBroken] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setImgBroken(false);
    setCopied(false);
  }, [item?.id]);

  // Kunci scroll body + tutup pake Escape selama modal kebuka, sama kayak
  // pola yang udah dipake buat overlay loading.
  useEffect(() => {
    if (!item) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

  const copyId = () => {
    navigator.clipboard?.writeText(String(item.id)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth: 300, background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)', clipPath: notchTag(16), padding: '24px 18px 18px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="icon-btn"
          style={{
            position: 'absolute', top: 8, right: 8, width: 30, height: 30, display: 'flex',
            alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none',
            borderRadius: 8, color: 'var(--muted-text)', cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        <div style={{
          width: 108, height: 108, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--panel-bg-alt)', clipPath: notchTag(10), marginBottom: 12,
        }}>
          {item.icon && !imgBroken ? (
            <img
              src={item.icon}
              alt={item.name}
              style={{ width: '80%', height: '80%', objectFit: 'contain' }}
              onError={() => setImgBroken(true)}
            />
          ) : (
            <span style={{ fontSize: 11, color: 'var(--muted-text)' }}>N/A</span>
          )}
        </div>

        <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--white)', textAlign: 'center', margin: 0, lineHeight: 1.35 }}>
          {item.name}
        </p>
        {(() => {
          // Label section di bawah nama item lebih berguna kalau nunjukin
          // tipe spesifik item itu sendiri (Head, Top, Bottom, Shoe, dst -
          // datang dari field "type" di itemData.json), bukan cuma nama
          // kategori grid-nya yang generik ("Outfit"). Kalau item nggak
          // punya type terdeteksi, tetap fallback ke category lama.
          const displayLabel = item.type || category;
          if (!displayLabel) return null;
          return (
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'var(--gold)', background: 'var(--gold-soft)',
              padding: '3px 10px', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.05em',
              clipPath: notchTR(4),
            }}>
              {displayLabel}
            </span>
          );
        })()}
        {item.description ? (
          <p style={{
            fontSize: 11.5, color: 'var(--muted-text)', textAlign: 'center', margin: '10px 0 0',
            lineHeight: 1.45,
          }}>
            {item.description}
          </p>
        ) : null}

        <div style={{ width: '100%', height: 1, background: 'var(--panel-border)', margin: '16px 0 4px' }} />

        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 2px' }}>
          <span style={{ fontSize: 11.5, color: 'var(--muted-text)' }}>Item ID</span>
          <button
            type="button"
            onClick={copyId}
            className="icon-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none',
              borderRadius: 6, padding: '4px 6px', cursor: 'pointer',
              color: copied ? 'var(--success)' : 'var(--light-text)', fontSize: 12.5, fontWeight: 600,
            }}
          >
            {item.id}
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>
      </div>
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
  const [selectedItem, setSelectedItem] = useState<{ item: OutfitItem; category: string } | null>(null);
  // Grid View: state-nya dipegang di sini (parent), bukan di dalam
  // CharacterSection, karena begitu aktif, section lain (Profile Items,
  // Outfit, Weapon, Pet Info) di bawahnya perlu ikut disembunyikan.
  const [gridViewOn, setGridViewOn] = useState(false);
  const [searchMode, setSearchMode] = useState<'uid' | 'nickname'>('uid');
  const [nickname, setNickname] = useState('');
  const [nicknameResults, setNicknameResults] = useState<NicknameSearchItem[]>([]);
  const [nicknameLoading, setNicknameLoading] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  // true = pencarian nickname lagi diputus (Garena nolak login) -> tab
  // By Nickname dikasih label Maintenance & inputnya di-disable. Diisi dari
  // /api/search?status=1 dan dari respons 503 { maintenance: true }.
  const [nicknameMaintenance, setNicknameMaintenance] = useState(false);
  const lastCheckRef = useRef(0);
  const didInitRef = useRef(false);
  const lastRequestedUidRef = useRef<string | undefined>(initialUid);

  const copySignature = useCallback((text: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, []);

  // Kunci scroll body selama overlay loading tampil, biar nggak keliatan
  // aneh (overlay fixed tapi konten di belakangnya masih bisa digeser).
  // Dipicu oleh loading UID ATAU loading nickname, karena overlay-nya sama
  // buat kedua mode pencarian.
  useEffect(() => {
    if (!loading && !nicknameLoading) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [loading, nicknameLoading]);

  // Cek status pencarian nickname. Kalau request-nya gagal (jaringan / kena
  // rate limit) status TIDAK diubah: lebih baik tampilan tetap seperti
  // sebelumnya daripada nge-disable fitur gara-gara pengecekannya sendiri gagal.
  const checkNicknameStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/search?status=1', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { maintenance?: unknown };
      if (typeof data?.maintenance === 'boolean') setNicknameMaintenance(data.maintenance);
    } catch {
      /* abaikan */
    }
  }, []);

  useEffect(() => {
    checkNicknameStatus();
  }, [checkNicknameStatus]);

  // Selama maintenance, cek ulang tiap 45 detik (cuma kalau tab-nya kelihatan)
  // supaya begitu Garena pulih, label hilang & input nyala lagi sendiri
  // tanpa user harus refresh.
  useEffect(() => {
    if (!nicknameMaintenance) return;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') checkNicknameStatus();
    }, 45_000);
    return () => clearInterval(id);
  }, [nicknameMaintenance, checkNicknameStatus]);

  const cekID = useCallback(async (overrideUid?: string) => {
    const trimmed = (overrideUid ?? uid).trim();
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
    lastRequestedUidRef.current = trimmed;

    setLoading(true);
    setError(null);
    setResult(null);

    if (trimmed !== initialUid) {
      router.push(`/stalk/${trimmed}`, { scroll: false });
    }

    try {
      const headers = await buildHandshakeHeaders(GUARD_PATHS.ff);
      const res = await fetch(`/api/ff?uid=${encodeURIComponent(trimmed)}`, { headers });
      const data = (await res.json()) as any;

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

  const searchNickname = useCallback(async () => {
    if (nicknameMaintenance) return;
    const trimmed = nickname.trim();
    if (trimmed.length < 3) {
      setNicknameError('Masukkan nickname minimal 3 karakter.');
      setNicknameResults([]);
      return;
    }

    setNicknameLoading(true);
    setNicknameError(null);
    setNicknameResults([]);

    try {
      const headers = await buildHandshakeHeaders(GUARD_PATHS.search);
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { headers });
      const data = (await res.json()) as any;

      if (!res.ok) {
        if (data?.maintenance) {
          setNicknameMaintenance(true);
          return;
        }
        setNicknameError(data?.error || 'Gagal mencari akun.');
        return;
      }
      if (!data.results || data.results.length === 0) {
        setNicknameError('Tidak ada akun ditemukan.');
        return;
      }
      setNicknameResults(data.results);
    } catch {
      setNicknameError('Gagal terhubung ke server. Coba lagi.');
    } finally {
      setNicknameLoading(false);
    }
  }, [nickname, nicknameMaintenance]);

  const selectNicknameResult = useCallback((accountid: string) => {
    setSearchMode('uid');
    setUid(accountid);
    setNickname('');
    setNicknameResults([]);
    setNicknameError(null);
    cekID(accountid);
  }, [cekID]);

  const switchSearchMode = (mode: 'uid' | 'nickname') => {
    if (mode === searchMode) return;
    setSearchMode(mode);
    setError(null);
    setNicknameError(null);
    setNicknameResults([]);

    if (mode === 'nickname' && initialUid) {
      // Pindah ke tab "By Nickname" tapi URL masih nyangkut di /stalk/{uid}
      // dari hasil sebelumnya -> ikut dibersihkan biar URL & tampilan sinkron.
      // lastRequestedUidRef ditandai duluan biar effect sync URL gak nganggep
      // ini navigasi dari luar dan nge-reset ulang / refetch.
      lastRequestedUidRef.current = undefined;
      router.push('/stalk', { scroll: false });
      setUid('');
      setResult(null);
    }
  };

  const nicknameBlocked = searchMode === 'nickname' && nicknameMaintenance;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    if (searchMode === 'uid') cekID();
    else searchNickname();
  };

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    if (initialUid && /^\d{6,15}$/.test(initialUid)) {
      cekID();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sinkronkan state kalau URL berubah dari LUAR aksi app ini sendiri —
  // misalnya user pencet tombol Back/Forward browser abis pilih hasil
  // pencarian nickname. router.push() di cekID() juga mengubah initialUid,
  // makanya lastRequestedUidRef dipakai buat bedain: kalau initialUid yang
  // baru sama dengan yang barusan kita minta sendiri, skip (biar gak
  // double-fetch); kalau beda (navigasi dari luar), baru sync ulang.
  useEffect(() => {
    if (!didInitRef.current) return;
    if (initialUid === lastRequestedUidRef.current) return;
    lastRequestedUidRef.current = initialUid;

    if (initialUid && /^\d{6,15}$/.test(initialUid)) {
      setUid(initialUid);
      setSearchMode('uid');
      cekID(initialUid);
    } else {
      // Balik ke /stalk tanpa UID -> reset total ke state kosong.
      setSearchMode('uid');
      setUid('');
      setResult(null);
      setError(null);
      setCopied(false);
      setNickname('');
      setNicknameResults([]);
      setNicknameError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUid]);

  const basic = result?.basicInfo;

  // Reset Grid View tiap ganti akun yang dilihat, biar gak "nyangkut" aktif
  // pas pindah ke profil lain.
  useEffect(() => {
    setGridViewOn(false);
  }, [basic?.accountId]);

  const social = result?.socialInfo;
  const guild = result?.guildBasicInfo;
  const credit = result?.creditScoreInfo;
  const ban = result?.banInfo;
  const pet = result?.petInfo;
  const customTag = basic ? CUSTOM_TAGS[basic.accountId] : null;
  const accountAgeDays = basic ? calculateAccountAgeDays(basic.createAt) : null;
  const ageBreakdown = basic ? calculateAgeBreakdown(basic.createAt) : null;
  const estimatedTopup = basic ? estimateTopupPrice(basic) : 0;
  const brRankInfo = basic ? getBrRankInfo(basic.rankingPoints) : null;
  const csRankInfo = basic ? getCsRankInfo(basic.csRank, basic.csRankingPoints) : null;
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

  // Kategori buat Grid View di section Character - murni nyusun ulang data
  // yang udah ada (characterItems/profileItems/basic.equipped*/pet) jadi
  // satu daftar yang bisa dipilih dari selector kategori, gak nambah field
  // baru dari backend. Cuma kategori yang beneran punya item yang muncul.
  const petGridItems: (OutfitItem & { _cat?: string })[] =
    pet && pet.skinIconUrl
      ? [{
          id: pet.skinId ?? pet.id ?? -1,
          name: pet.name || pet.speciesName || 'Pet',
          icon: pet.skinIconUrl,
          type: 'Pet Skin',
          _cat: 'Pet',
        }]
      : [];
  const specificGridCategories: GridCategoryDef[] = [
    { key: 'character', label: 'Character', icon: User, items: characterItems.map((i) => ({ ...i, _cat: 'Character' })) },
    { key: 'profile', label: 'Profile Items', icon: Tag, items: profileItems.map((i) => ({ ...i, _cat: 'Profile Item' })) },
    { key: 'outfit', label: 'Outfit', icon: Shirt, items: (basic?.equippedOutfitItems ?? []).map((i) => ({ ...i, _cat: 'Outfit' })) },
    { key: 'weapon', label: 'Weapon', icon: Swords, items: (basic?.equippedWeaponOutfitItems ?? []).map((i) => ({ ...i, _cat: 'Weapon' })) },
    { key: 'lookchanger', label: 'Look Changer', icon: Sparkles, items: (basic?.equippedLookChangerItems ?? []).map((i) => ({ ...i, _cat: 'Look Changer' })) },
    { key: 'arrival', label: 'Arrival Animation', icon: Wind, items: (basic?.equippedArrivalAnimationItems ?? []).map((i) => ({ ...i, _cat: 'Arrival Animation' })) },
    { key: 'pet', label: 'Pet', icon: PawPrint, items: petGridItems },
  ].filter((cat) => cat.items.length > 0);

  // "All" digabung dari semua kategori yang ada & ditaruh PALING DEPAN biar
  // jadi kategori aktif default begitu Grid View ditoggle - jadi begitu
  // diklik langsung berdempetan nampilin semua item sekaligus (kayak
  // referensi Adenpedia yang dikasih), bukan nunggu pilih kategori dulu.
  // Chip kategori spesifik di baris selector tetap ada buat filter kalau
  // mau fokus lihat satu jenis item aja.
  const gridCategories: GridCategoryDef[] =
    specificGridCategories.length > 0
      ? [
          { key: 'all', label: 'All', icon: LayoutGrid, items: specificGridCategories.flatMap((c) => c.items) },
          ...specificGridCategories,
        ]
      : [];

  // Avatar inisial nickname (bukan avatar dari FF) - warnanya gantian antara
  // gold/biru (dua-duanya udah ada di palet Stalker) berdasarkan accountid,
  // biar list hasil search ada ritme visualnya, gak monoton satu warna terus.
  const avatarPalette = [
    { bg: 'var(--gold-soft)', fg: 'var(--gold)' },
    { bg: 'var(--blue-soft)', fg: 'var(--blue)' },
  ];
  const avatarStyleFor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % avatarPalette.length;
    return avatarPalette[hash];
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 16px 0' }}>
      {(loading || nicknameLoading) ? <LoadingOverlay /> : null}
      <SiteHeader />

      <div style={{ margin: '28px 0' }}>
        <AngleDividerDouble />
      </div>

      <section style={{ width: '100%', maxWidth: 720 }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <button
            type="button"
            onClick={() => switchSearchMode('uid')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 12.5,
              fontWeight: 700, letterSpacing: '0.03em', transition: 'color 0.15s ease, background 0.15s ease',
              border: searchMode === 'uid' ? 'none' : '1px solid var(--panel-border)',
              background: searchMode === 'uid' ? 'var(--gold)' : 'transparent',
              color: searchMode === 'uid' ? '#14161b' : 'var(--muted-text)',
              clipPath: searchMode === 'uid' ? notchTag(9) : 'none',
              borderRadius: searchMode === 'uid' ? 0 : 6,
            }}
          >
            <Hash size={14} />
            By UID
          </button>
          <div style={{ position: 'relative', display: 'flex' }}>
          <button
            type="button"
            onClick={() => switchSearchMode('nickname')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 12.5,
              fontWeight: 700, letterSpacing: '0.03em', transition: 'color 0.15s ease, background 0.15s ease',
              border: searchMode === 'nickname' ? 'none' : '1px solid var(--panel-border)',
              background: searchMode === 'nickname' ? 'var(--gold)' : 'transparent',
              color: searchMode === 'nickname' ? '#14161b' : 'var(--muted-text)',
              clipPath: searchMode === 'nickname' ? notchTag(9) : 'none',
              borderRadius: searchMode === 'nickname' ? 0 : 6,
            }}
          >
            <Search size={14} />
            By Nickname
          </button>
          {nicknameMaintenance ? (
            <span
              style={{
                position: 'absolute', top: -9, right: 10, padding: '2px 7px', borderRadius: 4,
                background: '#d93636', color: '#fff', fontSize: 10, fontWeight: 700, lineHeight: 1.3,
                letterSpacing: '0.03em', pointerEvents: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
              }}
            >
              Maintenance
            </span>
          ) : null}
          </div>
        </div>

        <SectionLabel>{searchMode === 'uid' ? 'Masukkan UID' : 'Masukkan Nickname'}</SectionLabel>
        <div style={{ position: 'relative', width: '100%', clipPath: notchBL(10), background: 'var(--panel-border)', padding: 1 }}>
          <div style={{ clipPath: notchBL(9), background: 'var(--panel-bg)' }}>
            <input
              type="text"
              inputMode={searchMode === 'uid' ? 'numeric' : 'text'}
              maxLength={searchMode === 'uid' ? 12 : 20}
              placeholder={
                searchMode === 'uid' ? 'Contoh: 903474122' : nicknameBlocked ? 'Sedang maintenance' : 'Contoh: Givy'
              }
              disabled={nicknameBlocked}
              value={searchMode === 'uid' ? uid : nickname}
              onChange={(e) => {
                if (searchMode === 'uid') setUid(e.target.value.replace(/[^0-9]/g, ''));
                else setNickname(e.target.value);
              }}
              onKeyDown={onKeyDown}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                padding: '13px 84px 13px 16px', fontSize: 15, color: 'var(--white)', outline: 'none',
                cursor: nicknameBlocked ? 'not-allowed' : 'text', opacity: nicknameBlocked ? 0.5 : 1,
              }}
            />
          </div>
          <div style={{ position: 'absolute', right: 6, top: 6, bottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            {(searchMode === 'uid' ? uid : nickname) && !nicknameBlocked ? (
              <button
                type="button"
                aria-label="Bersihkan"
                onClick={() => {
                  if (searchMode === 'uid') {
                    setUid('');
                    setError(null);
                    setResult(null);
                    if (initialUid) router.push('/stalk', { scroll: false });
                  } else {
                    setNickname('');
                    setNicknameError(null);
                    setNicknameResults([]);
                  }
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
              aria-label={searchMode === 'uid' ? 'Cek ID' : 'Cari Nickname'}
              onClick={() => (searchMode === 'uid' ? cekID() : searchNickname())}
              disabled={searchMode === 'uid' ? loading : nicknameLoading || nicknameMaintenance}
              className="icon-btn"
              style={{
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: (searchMode === 'uid' ? loading : nicknameLoading) ? 'var(--gold-hover)' : 'var(--gold)',
                border: 'none', clipPath: notchTR(6),
                color: '#14161b', opacity: nicknameBlocked ? 0.35 : (searchMode === 'uid' ? loading : nicknameLoading) ? 0.85 : 1,
                cursor: nicknameBlocked ? 'not-allowed' : undefined,
              }}
            >
              {(searchMode === 'uid' ? loading : nicknameLoading) ? <Spinner /> : <Search size={16} />}
            </button>
          </div>
        </div>

        {searchMode === 'uid' && error ? (
          <div style={{
            marginTop: 14, background: 'var(--error-bg)', border: '1px solid var(--error-border)',
            color: 'var(--error-text)', borderRadius: 10, padding: '12px 14px', fontSize: 14,
          }}>
            {error}
          </div>
        ) : null}

        {nicknameBlocked ? (
          <div role="status" style={{
            marginTop: 14, background: 'var(--error-bg)', border: '1px solid var(--error-border)',
            color: 'var(--error-text)', borderRadius: 10, padding: '12px 14px', fontSize: 14,
          }}>
            Pencarian nickname sedang dalam pemeliharaan, untuk sementara gunakan <b>By UID</b> terlebih dahulu,
            fitur akan aktif kembali secara otomatis setelah pemeliharaan selesai
          </div>
        ) : null}

        {searchMode === 'nickname' && nicknameError && !nicknameMaintenance ? (
          <div style={{
            marginTop: 14, background: 'var(--error-bg)', border: '1px solid var(--error-border)',
            color: 'var(--error-text)', borderRadius: 10, padding: '12px 14px', fontSize: 14,
          }}>
            {nicknameError}
          </div>
        ) : null}

        {searchMode === 'nickname' && nicknameResults.length > 0 && !nicknameMaintenance ? (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
            {nicknameResults.map((p, idx) => {
              const avatar = avatarStyleFor(p.accountid);
              const initial = (p.nickname || '?').trim().charAt(0).toUpperCase() || '?';
              return (
                <button
                  key={p.accountid}
                  type="button"
                  onClick={() => selectNicknameResult(p.accountid)}
                  className="icon-btn"
                  style={{
                    display: 'flex', alignItems: 'center', width: '100%',
                    textAlign: 'left', background: 'transparent', border: 'none',
                    borderBottom: idx === nicknameResults.length - 1 ? 'none' : '1px solid var(--panel-border)',
                    padding: '12px 4px', cursor: 'pointer', gap: 12,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: avatar.bg, color: avatar.fg, fontSize: 14.5, fontWeight: 700,
                      clipPath: notchTag(6),
                    }}
                  >
                    {initial}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, flex: 1 }}>
                    <span style={{
                      fontSize: 13.5, fontWeight: 600, color: 'var(--white)', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {p.nickname}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--muted-text)' }}>
                      UID {p.accountid} • {getRegionName(p.region)}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#14161b', background: 'var(--gold)',
                    padding: '4px 10px 4px 8px', flexShrink: 0, marginLeft: 6,
                    clipPath: notchTR(5),
                  }}>
                    Lv.{p.level ?? '-'}
                  </span>
                  <ChevronRight size={16} style={{ color: 'var(--muted-text)', flexShrink: 0, marginLeft: 4 }} />
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      {!basic ? (
        <>
          <HowToUseSection />
          <InfoCategoriesSection />
        </>
      ) : null}

      {basic ? (
        <section className="profile-card" style={{
          width: '100%', maxWidth: 720, marginTop: 28, marginBottom: 40, background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)', borderRadius: 20, padding: 18, animation: 'fadeUp 0.35s ease',
        }}>
          <button
            type="button"
            aria-label="Refresh data"
            onClick={() => cekID()}
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

          {brRankInfo ? (
            <div style={{
              marginTop: 10, background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)',
              borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <img
                src={brRankInfo.icon}
                alt={brRankInfo.label}
                style={{ width: 42, height: 42, objectFit: 'contain', flexShrink: 0 }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 10, fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase',
                  letterSpacing: '0.05em', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <Trophy size={12} /> BR Rank
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
                  {brRankInfo.label}
                </p>
                <span style={{
                  display: 'inline-flex', fontSize: 11.5, fontWeight: 700, color: 'var(--gold-hover)',
                  background: 'var(--gold-soft)', padding: '3px 9px', lineHeight: 1, borderRadius: 6,
                }}>
                  {formatNumber(brRankInfo.points)}
                </span>
              </div>
            </div>
          ) : null}

          {csRankInfo ? (
            <div style={{
              marginTop: 10, background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)',
              borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <img
                src={csRankInfo.icon}
                alt={csRankInfo.label}
                style={{ width: 42, height: 42, objectFit: 'contain', flexShrink: 0 }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 10, fontWeight: 600, color: 'var(--blue)', textTransform: 'uppercase',
                  letterSpacing: '0.05em', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <Swords size={12} /> CS Rank
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
                  {csRankInfo.label}
                </p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 11.5, fontWeight: 700, color: 'var(--gold-hover)', background: 'var(--gold-soft)',
                  padding: '3px 9px 3px 7px', lineHeight: 1, borderRadius: 6,
                }}>
                  <Star size={11} fill="var(--gold)" stroke="var(--gold)" />
                  {formatNumber(csRankInfo.star)}
                </span>
              </div>
            </div>
          ) : null}

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
              <StatCard
                icon={basic.hasElitePass ? '/image/bphidup.png' : '/image/bpmati.png'}
                label="Booyah Pass"
                value={basic.hasElitePass ? 'Aktif' : 'Tidak Aktif'}
                accent={basic.hasElitePass ? 'var(--gold)' : 'var(--muted-text)'}
                sub={`Badge: ${basic.badgeCnt ?? '—'}`}
              />
              <StatCard
                icon={`/image/prime${basic.primeInfo?.primeLevel || 1}.png`}
                label="Prime Level"
                value={basic.primeInfo?.primeLevel ?? '—'}
                valueSize={22}
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

          <LayoutGroup id="stalk-collection">
            <CharacterSection
              key={basic?.accountId ?? 'none'}
              characterItems={characterItems}
              gridCategories={gridCategories}
              gridViewOn={gridViewOn}
              setGridViewOn={setGridViewOn}
              onSelectItem={(item, cat) => setSelectedItem({ item, category: cat })}
            />

            {!gridViewOn && profileItems.length > 0 ? (
              <>
                <div style={{ height: 1, background: 'var(--panel-border)', margin: '16px 0' }} />
                <div>
                  <SectionDividerLabel>Profile Items</SectionDividerLabel>
                  <OutfitGrid items={profileItems} category="Profile Item" onSelect={(item, cat) => setSelectedItem({ item, category: cat })} />
                </div>
              </>
            ) : null}

            {!gridViewOn && basic?.equippedOutfitItems && basic.equippedOutfitItems.length > 0 ? (
              <>
                <div style={{ height: 1, background: 'var(--panel-border)', margin: '16px 0' }} />
                <div>
                  <SectionDividerLabel>Outfit</SectionDividerLabel>
                  <OutfitGrid items={basic.equippedOutfitItems} category="Outfit" onSelect={(item, cat) => setSelectedItem({ item, category: cat })} />
                </div>
              </>
            ) : null}

            {!gridViewOn && ((basic?.equippedWeaponOutfitItems && basic.equippedWeaponOutfitItems.length > 0) ||
            (basic?.equippedLookChangerItems && basic.equippedLookChangerItems.length > 0) ||
            (basic?.equippedArrivalAnimationItems && basic.equippedArrivalAnimationItems.length > 0)) ? (
              <>
                <div style={{ height: 1, background: 'var(--panel-border)', margin: '16px 0' }} />
                <div>
                  <SectionDividerLabel>
                    {[
                      basic?.equippedWeaponOutfitItems && basic.equippedWeaponOutfitItems.length > 0 ? 'Weapon' : null,
                      basic?.equippedLookChangerItems && basic.equippedLookChangerItems.length > 0 ? 'Look Changer' : null,
                      basic?.equippedArrivalAnimationItems && basic.equippedArrivalAnimationItems.length > 0 ? 'Arrival Animation' : null,
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </SectionDividerLabel>
                  <OutfitGrid
                    items={[
                      ...(basic?.equippedWeaponOutfitItems ?? []).map((i) => ({ ...i, _cat: 'Weapon' })),
                      ...(basic?.equippedLookChangerItems ?? []).map((i) => ({ ...i, _cat: 'Look Changer' })),
                      ...(basic?.equippedArrivalAnimationItems ?? []).map((i) => ({ ...i, _cat: 'Arrival Animation' })),
                    ]}
                    category="Weapon"
                    onSelect={(item, cat) => setSelectedItem({ item, category: cat })}
                  />
                </div>
              </>
            ) : null}

            {!gridViewOn && pet ? (
              <>
                <div style={{ height: 1, background: 'var(--panel-border)', margin: '16px 0' }} />
                <div>
                  <SectionDividerLabel>Pet Info</SectionDividerLabel>
                  <PetInfoCard data={pet} />
                </div>
              </>
            ) : null}
          </LayoutGroup>
        </section>
      ) : null}

      <FaqSection />

      <SiteFooter />

      <ItemDetailModal
        item={selectedItem?.item ?? null}
        category={selectedItem?.category ?? null}
        onClose={() => setSelectedItem(null)}
      />
    </main>
  );
}
