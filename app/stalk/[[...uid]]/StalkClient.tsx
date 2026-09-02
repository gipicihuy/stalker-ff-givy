'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, X, Tag, CalendarDays, Copy, Check, Heart, Clock, Users, RefreshCw, MessageSquare, ShieldAlert, ShieldCheck, PawPrint, Send, User, Shirt, ChevronDown, Trophy } from 'lucide-react';

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

function FFLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="var(--gold)" opacity="0.15" />
      <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
      <text x="14" y="18" textAnchor="middle" fill="var(--gold)" fontSize="11" fontWeight="700" fontFamily="sans-serif">FF</text>
    </svg>
  );
}

function FooterLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 0 C1.31216102 -0.00397441 2.62432204 -0.00794881 3.97624552 -0.01204365 C7.6028993 -0.02259536 11.22930534 -0.01452462 14.85594821 -0.00329316 C18.77273021 0.00556881 22.68948049 -0.00290022 26.60626221 -0.00915527 C34.27142196 -0.0186321 41.93648741 -0.01205411 49.60164015 0.00010767 C58.52473879 0.01373775 67.44781505 0.01208905 76.37092145 0.00997434 C92.28576265 0.00678637 108.20055904 0.01844331 124.11538696 0.03804016 C139.56787479 0.05706275 155.02031014 0.06412247 170.47280884 0.05854797 C187.29842244 0.05249609 204.12401298 0.05265491 220.94962466 0.06403381 C222.74191515 0.06524112 224.53420563 0.06644711 226.32649612 0.06765175 C227.64930706 0.06855706 227.64930706 0.06855706 228.99884146 0.06948065 C235.22368071 0.07336553 241.4485114 0.07296406 247.67335129 0.0710659 C255.25106074 0.06894833 262.82872417 0.07413522 270.40642063 0.08867946 C274.27500353 0.09594351 278.14351924 0.09998335 282.01210785 0.0954361 C286.19742916 0.09063598 290.38256515 0.10123565 294.56787109 0.11352539 C295.80169191 0.10974607 297.03551272 0.10596674 298.30672204 0.10207289 C299.42045714 0.10790509 300.53419223 0.11373728 301.68167686 0.11974621 C302.64866489 0.12061299 303.61565291 0.12147976 304.6119436 0.12237281 C306.90298462 0.3742218 306.90298462 0.3742218 308.90298462 2.3742218 C309.46294536 5.3944825 309.49187975 7.43969973 307.82144165 10.0905304 C306.26854156 11.98537269 304.64337878 13.77663462 302.96548462 15.5617218 C301.75853666 16.89655829 300.5528119 18.23250178 299.34829712 19.5695343 C298.75565063 20.21954407 298.16300415 20.86955383 297.55239868 21.53926086 C295.3960413 23.93819249 293.36164236 26.42332638 291.34048462 28.9367218 C287.93161474 33.14620699 284.43899394 37.27183152 280.90298462 41.3742218 C277.3484097 45.4988648 273.83506164 49.64630084 270.40298462 53.8742218 C248.35842553 80.91981516 248.35842553 80.91981516 237.90298462 83.3742218 C232.23195214 83.81752566 226.57482996 83.77116733 220.88955688 83.74311829 C219.15915692 83.74558863 217.42875846 83.74942941 215.69836426 83.75453186 C211.98304305 83.76284759 208.26787524 83.76208123 204.55255318 83.75434685 C198.67270486 83.74273116 192.79305249 83.75495371 186.91322327 83.77096558 C172.31053843 83.80710318 157.70785857 83.81339076 143.10513306 83.81086731 C131.75110394 83.80915474 120.39723563 83.81631269 109.04325145 83.85084587 C103.20330342 83.86760759 97.36374821 83.86587319 91.52380192 83.85002315 C87.88501595 83.84421233 84.24641492 83.85499101 80.6076622 83.87026978 C78.92631429 83.8739851 77.24493491 83.87091958 75.5636158 83.86039925 C65.49316699 83.80160736 57.11872014 83.96982292 49.09048462 90.7492218 C44.32648078 96.46602641 41.57276978 100.78458608 41.68423462 108.37812805 C42.11439772 112.30336633 44.01393746 114.59630554 46.90298462 117.1242218 C51.23665036 119.83276289 55.5211237 119.52127423 60.45048523 119.51898193 C61.77528441 119.5242722 61.77528441 119.5242722 63.12684721 119.52966934 C66.09788588 119.54037742 69.06889252 119.54404093 72.03994751 119.54780579 C74.16519812 119.55410926 76.29044741 119.56087483 78.41569519 119.56806946 C82.99758186 119.58275108 87.57946339 119.59447089 92.1613636 119.60401726 C99.39984167 119.61944253 106.63827566 119.64338991 113.87672424 119.66891479 C134.46170269 119.74019507 155.04670614 119.7999826 175.63174438 119.85102844 C186.99642644 119.87928542 198.36106442 119.91463867 209.72570032 119.95768219 C216.92810569 119.98452819 224.13046118 120.00238775 231.33290684 120.01371944 C235.80494922 120.02281471 240.27693072 120.04016134 244.74893761 120.05989838 C246.82990186 120.06740148 248.9108817 120.07145658 250.99185944 120.07189369 C253.82218432 120.07296869 256.65219591 120.08614808 259.48246765 120.10247803 C260.73132684 120.09855275 260.73132684 120.09855275 262.0054155 120.09454817 C267.6747701 120.14600728 267.6747701 120.14600728 269.90298462 122.3742218 C270.36782837 125.08125305 270.36782837 125.08125305 269.90298462 128.3742218 C268.16163869 130.83449904 266.50399754 132.8814418 264.46548462 135.0617218 C263.35113188 136.30425126 262.23785935 137.5477503 261.12564087 138.79219055 C260.57408325 139.40111145 260.02252563 140.01003235 259.45425415 140.6374054 C257.35641732 142.98616385 255.37668913 145.42072172 253.40298462 147.8742218 C249.46919892 152.72018969 245.41850702 157.45520708 241.34439087 162.18281555 C237.57615145 166.56471228 233.9082339 171.01949051 230.26626587 175.5070343 C226.92446195 179.56138814 223.49824515 183.54139152 220.06314087 187.51679993 C219.58103149 188.07560852 219.09892212 188.63441711 218.60220337 189.2101593 C218.13797974 189.74705383 217.6737561 190.28394836 217.19546509 190.83711243 C216.0273975 192.22626118 214.92367727 193.66889931 213.82876587 195.1164093 C211.82308042 197.46790259 210.12114765 198.69067007 207.40298462 200.1242218 C206.27376587 200.73523743 206.27376587 200.73523743 205.12173462 201.3585968 C200.58981739 203.43306596 196.36386373 203.5148549 191.43661499 203.49447632 C190.68182366 203.49533074 189.92703232 203.49618517 189.14936852 203.49706548 C186.61897426 203.49871324 184.08864622 203.49321042 181.55825806 203.48774719 C179.74488324 203.48746514 177.9315083 203.4876234 176.11813354 203.4881897 C171.19289767 203.48847698 166.26768608 203.4825914 161.34245586 203.47561574 C156.1961498 203.46937071 151.0498432 203.46877749 145.90353394 203.46759033 C136.15718757 203.46448042 126.4108524 203.45627158 116.66451097 203.44624084 C105.56910483 203.43506919 94.47369815 203.4295666 83.37828779 203.42454541 C60.55318052 203.4140887 37.7280832 203.39649581 14.90298462 203.3742218 C14.78778913 203.98346308 14.67259365 204.59270435 14.55390739 205.22040749 C13.38620277 211.24435229 11.98567347 217.15970889 10.3878479 223.0827179 C10.14348495 223.99861191 9.89912201 224.91450592 9.64735413 225.8581543 C8.84237268 228.87214435 8.03290031 231.88490773 7.22329712 234.8976593 C6.64931177 237.0423387 6.07557633 239.18708499 5.5020752 241.33189392 C4.29517977 245.8429383 3.08623198 250.35342563 1.87564087 254.86347961 C0.0659288 261.60564936 -1.73839519 268.34925391 -3.54232788 275.0929718 C-6.18445001 284.96846124 -8.84017928 294.84022831 -11.50197983 304.71043015 C-13.23613775 311.14928153 -14.95058105 317.59299133 -16.6487484 324.0414257 C-17.72504817 328.12136858 -18.81167714 332.1985177 -19.90021133 336.27521133 C-20.40492461 338.17537731 -20.90500265 340.07678156 -21.40005112 341.97948837 C-22.08127788 344.59576093 -22.77890299 347.20714815 -23.48031616 349.81806946 C-23.67211079 350.57199604 -23.86390541 351.32592262 -24.06151199 352.10269547 C-25.96500079 359.06388853 -29.36937727 365.37623192 -34.84701538 370.1867218 C-35.43998413 370.72941711 -36.03295288 371.27211243 -36.64389038 371.83125305 C-44.91084142 377.03100729 -55.49056947 377.8749877 -64.95248413 379.51094055 C-66.5844253 379.7976622 -68.2162854 380.08484568 -69.84806824 380.37246704 C-73.25216232 380.97092685 -76.65704155 381.56462237 -80.06259155 382.15473938 C-84.41831751 382.9097822 -88.77207749 383.6755346 -93.12533092 384.44468975 C-96.4884552 385.03790356 -99.85244611 385.62607372 -103.21673012 386.21267128 C-104.82247753 386.49314684 -106.42797986 386.77502943 -108.03322411 387.05837059 C-110.27654822 387.45343097 -112.52092832 387.84182762 -114.76571655 388.22846985 C-116.67691536 388.56131233 -116.67691536 388.56131233 -118.62672424 388.90087891 C-124.87797625 389.753541 -124.87797625 389.753541 -128.09701538 389.3742218 C-130.06269836 387.83534241 -130.06269836 387.83534241 -131.09701538 385.3742218 C-130.79692565 382.72907869 -130.35545182 380.53361463 -129.64608765 377.99629211 C-129.4543097 377.25265034 -129.26253176 376.50900856 -129.06494236 375.74283218 C-128.6450694 374.1256827 -128.21636916 372.51080548 -127.77995682 370.89804077 C-127.09868406 368.38038842 -126.44020941 365.85776931 -125.78741455 363.33259583 C-124.32195423 357.68833511 -122.81741513 352.05477018 -121.31185913 346.4210968 C-120.74166303 344.28022096 -120.17167682 342.1392892 -119.60188293 339.99830627 C-118.06890561 334.24077993 -116.53283411 328.48408336 -114.99611664 322.72755432 C-113.69757008 317.86161326 -112.40086221 312.99518301 -111.10417557 308.12874603 C-106.77350859 291.87588855 -102.43625385 275.62479264 -98.09701538 259.3742218 C-97.64094028 257.6660881 -97.64094028 257.6660881 -97.17565155 255.92344666 C-90.46088362 230.77486471 -83.73845104 205.62833817 -77.0102787 180.48333931 C-72.90589129 165.1437072 -68.80759946 149.80245628 -64.71297073 134.46021652 C-62.88960094 127.62878825 -61.06543246 120.7975732 -59.24128532 113.96635246 C-57.7999078 108.56825305 -56.35903066 103.17002127 -54.91946411 97.7714386 C-52.06851534 87.08109539 -49.21042572 76.39275584 -46.33403587 65.70922661 C-44.81151604 60.04978459 -43.3045711 54.38644045 -41.8075943 48.720191 C-40.82433259 45.00868407 -39.83007485 41.30018272 -38.83320618 37.59230995 C-38.3703774 35.86160719 -37.91210679 34.12967775 -37.45884705 32.39644432 C-31.5584811 9.85765302 -31.5584811 9.85765302 -21.09701538 3.3742218 C-14.01962481 0.0450012 -7.74645989 -0.0468067 0 0 Z" fill="var(--gold)" transform="translate(273.0970153808594,73.62577819824219)" />
      <path d="M0 0 C1.73139043 -0.00483667 1.73139043 -0.00483667 3.49775845 -0.00977105 C5.40862371 -0.00744815 5.40862371 -0.00744815 7.35809231 -0.00507832 C8.72044085 -0.00694565 10.08278886 -0.00924604 11.44513601 -0.01194364 C15.1970222 -0.01807748 18.94888616 -0.01792619 22.70077622 -0.01674926 C26.74374781 -0.01654566 30.78671219 -0.02206005 34.82968044 -0.02680683 C42.75283835 -0.03512208 50.67598882 -0.03786205 58.59915072 -0.03841921 C65.03594416 -0.03889385 71.47273513 -0.04094601 77.90952778 -0.04411983 C96.14305763 -0.05292795 114.37658158 -0.05753884 132.61011357 -0.05678936 C133.59360045 -0.0567494 134.57708734 -0.05670945 135.59037685 -0.05666828 C137.06739948 -0.05660696 137.06739948 -0.05660696 138.57426094 -0.0565444 C154.54504955 -0.05613764 170.51581462 -0.06571424 186.48659641 -0.07980665 C202.86962251 -0.09414926 219.25263711 -0.10107804 235.63566965 -0.10021287 C244.8398872 -0.09988022 254.04408006 -0.10265712 263.24829197 -0.11339092 C271.08229855 -0.12246805 278.91626923 -0.12469418 286.75027878 -0.1178815 C290.75047389 -0.11460242 294.75060002 -0.11460927 298.75078869 -0.12323475 C302.40786863 -0.13103965 306.06482419 -0.12973066 309.72190087 -0.12095062 C311.68173976 -0.11866502 313.64158233 -0.12629107 315.60140663 -0.13419026 C316.75305917 -0.12959147 317.90471171 -0.12499267 319.09126282 -0.12025452 C320.59137684 -0.12058057 320.59137684 -0.12058057 322.12179619 -0.12091321 C324.48271084 0.12863445 324.48271084 0.12863445 326.48271084 2.12863445 C326.99425213 5.07852259 327.07867014 7.15585263 325.47880459 9.76730633 C324.0449806 11.54182028 322.54186473 13.21318516 320.98271084 14.87863445 C319.86896667 16.11141717 318.75699185 17.34580065 317.64677334 18.58175945 C317.10182217 19.18310711 316.55687099 19.78445477 315.99540615 20.40402508 C313.97333306 22.70937116 312.1752198 25.16041241 310.35771084 27.62863445 C305.78641656 33.43360439 299.77499869 37.6024036 292.48271084 39.12863445 C291.12753478 39.21547187 289.76879511 39.25516918 288.41084003 39.2561264 C287.20114766 39.26063788 287.20114766 39.26063788 285.96701705 39.26524049 C285.08668056 39.26349012 284.20634407 39.26173975 283.29933071 39.25993633 C281.88983676 39.2631099 281.88983676 39.2631099 280.45186818 39.26634759 C277.295308 39.27235096 274.13878776 39.27134718 270.98222256 39.27048016 C268.72202391 39.27351147 266.46182587 39.27703285 264.20162868 39.28100872 C259.32948011 39.28890094 254.45733888 39.29404389 249.58518505 39.29729939 C241.87816278 39.30320776 234.17118673 39.31974704 226.46418667 39.33864117 C223.8257952 39.3449787 221.18740371 39.35130432 218.54901218 39.35761833 C217.88963292 39.35920209 217.23025366 39.36078586 216.55089321 39.36241761 C209.04607257 39.38035187 201.54124881 39.39657848 194.03642178 39.41159344 C193.35047487 39.41296931 192.66452797 39.41434518 191.9577948 39.41576274 C180.85208117 39.43767353 169.74637893 39.44844445 158.64064752 39.45596419 C147.22955042 39.46404658 135.81857356 39.48763728 124.40752709 39.52391785 C118.00430812 39.54367388 111.60125994 39.55608454 105.19800854 39.55108356 C99.17165864 39.54643439 93.14563227 39.56025789 87.11934757 39.58809566 C84.91112677 39.59500304 82.70287248 39.59513893 80.49465275 39.58789539 C77.47205024 39.57898418 74.45050943 39.59473825 71.42799282 39.61638165 C70.56104066 39.60793911 69.69408849 39.59949657 68.80086505 39.5907982 C60.58711993 39.69901046 52.39060517 42.18348824 46.48271084 48.12863445 C40.77779106 56.63193879 38.40756233 66.5712232 35.92021084 76.3591032 C35.4974719 77.97973785 35.0734704 79.60004359 34.64832973 81.22004986 C33.7309274 84.72567803 32.82175267 88.23329845 31.9189291 91.74270916 C30.44705666 97.46272016 28.95596503 103.17761782 27.46171474 108.89181805 C25.84559208 115.07482809 24.23035372 121.2580578 22.62080288 127.4427824 C16.73855082 150.03978753 10.7425027 172.60631783 4.74095058 195.17187786 C2.8528922 202.2709532 0.96665129 209.37051056 -0.91914463 216.47018719 C-1.55373578 218.85928163 -2.18832847 221.24837567 -2.82292271 223.63746929 C-3.1382785 224.82470781 -3.4536343 226.01194633 -3.77854633 227.23516178 C-4.73713082 230.84368143 -5.69591686 234.45214747 -6.65477085 238.06059551 C-10.15078736 251.21741156 -13.64458716 264.37481313 -17.13519692 277.5330646 C-20.0012084 288.33680613 -22.86897429 299.14008089 -25.73837948 309.94292164 C-27.33940859 315.97081505 -28.93958513 321.99893168 -30.53761387 328.02762127 C-32.02532076 333.63999131 -33.51544329 339.25171446 -35.00738621 344.86295986 C-35.55136545 346.91057545 -36.09447814 348.9584215 -36.63662815 351.00652218 C-46.71851511 389.08613825 -46.71851511 389.08613825 -56.337327 395.05557537 C-64.24110768 398.94611247 -74.02371805 399.89011565 -82.63447666 401.42550945 C-83.73526554 401.62340069 -84.83605442 401.82129192 -85.97020054 402.02517986 C-88.27390302 402.43742373 -90.57801705 402.84737394 -92.88252354 403.2550993 C-96.40593582 403.88105888 -99.92637899 404.5222139 -103.44697666 405.1637907 C-105.69681079 405.56446281 -107.9468055 405.96423447 -110.19697666 406.36300945 C-111.24392704 406.55562359 -112.29087742 406.74823772 -113.36955357 406.94668865 C-118.32672438 407.80789012 -122.57161152 408.54168521 -127.51728916 407.12863445 C-128.51728916 406.12863445 -128.51728916 406.12863445 -128.72399998 403.16636944 C-128.64812705 398.43465837 -127.4359115 394.07122834 -126.20991611 389.52487469 C-125.96435474 388.58739391 -125.71879337 387.64991314 -125.46579075 386.68402386 C-124.65487246 383.59925624 -123.83097356 380.51814926 -123.00557041 377.4372282 C-122.43431561 375.28692407 -121.86337197 373.13653725 -121.29272556 370.98607159 C-120.09579571 366.48481207 -118.89184425 361.98549826 -117.68354893 357.48727703 C-116.13799367 351.72940985 -114.6150138 345.9658382 -113.09788322 340.2004261 C-111.92573964 335.75964156 -110.73912971 331.32281825 -109.54840755 326.88698292 C-108.98082714 324.76370543 -108.41831786 322.6390655 -107.86103344 320.51306248 C-107.07960072 317.5387718 -106.27819242 314.57056042 -105.47163486 311.60299969 C-105.24649204 310.72854702 -105.02134922 309.85409435 -104.78938389 308.95314312 C-102.59099979 301.01951338 -98.73451258 296.713559 -92.01728916 291.87863445 C-90.9641251 291.10906414 -89.91096104 290.33949383 -88.82588291 289.5466032 C-88.28044834 289.15005535 -87.73501377 288.7535075 -87.17305088 288.34494305 C-84.44109877 286.33807407 -81.76128366 284.26467222 -79.07978916 282.19113445 C-77.98736795 281.34865191 -76.89491991 280.50620415 -75.80244541 279.6637907 C-75.25991123 279.24500652 -74.71737705 278.82622234 -74.15840244 278.39474773 C-71.98643916 276.71908549 -69.81211245 275.046511 -67.63716221 273.3747282 C-66.56363327 272.54891182 -65.49086913 271.72210021 -64.41890049 270.89425945 C-61.57714918 268.70144603 -58.72206651 266.5294206 -55.84541416 264.3825407 C-55.24664463 263.93201336 -54.6478751 263.48148602 -54.03096104 263.01730633 C-52.88035727 262.15212365 -51.72557229 261.29246567 -50.56611729 260.43918133 C-47.85190654 258.38912202 -46.61993572 257.43657414 -45.51728916 254.12863445 C-59.37728916 254.12863445 -73.23728916 254.12863445 -87.51728916 254.12863445 C-88.84142063 248.83210859 -88.23954286 245.8496936 -85.51728916 241.12863445 C-81.88553253 237.31689696 -77.74016734 234.24443088 -73.51728916 231.12863445 C-72.83037998 230.61703777 -72.1434708 230.10544109 -71.43574619 229.57834148 C-67.54282195 226.68267069 -63.63253356 223.81182382 -59.71260166 220.9528532 C-53.13012324 216.13439795 -46.66219231 211.16646917 -40.19526768 206.19455242 C-38.92960972 205.22413006 -38.92960972 205.22413006 -37.63838291 204.2341032 C-36.89000156 203.65813396 -36.14162022 203.08216473 -35.37056065 202.48874187 C-33.51728916 201.12863445 -33.51728916 201.12863445 -31.51728916 200.12863445 C-31.51728916 199.46863445 -31.51728916 198.80863445 -31.51728916 198.12863445 C-51.81228916 197.63363445 -51.81228916 197.63363445 -72.51728916 197.12863445 C-71.51728916 187.12863445 -71.51728916 187.12863445 -69.45478916 184.3981657 C-68.48541416 183.64922039 -67.51603916 182.90027508 -66.51728916 182.12863445 C-65.93721104 181.65732098 -65.35713291 181.1860075 -64.75947666 180.7004118 C-62.70349528 179.03825073 -60.61526926 177.42492318 -58.51728916 175.81613445 C-57.73982334 175.21583416 -56.96235752 174.61553387 -56.16133213 173.99704266 C-53.61715551 172.035854 -51.06803623 170.08126877 -48.51728916 168.12863445 C-47.62686924 167.44672039 -46.73644932 166.76480633 -45.81904697 166.0622282 C-29.22155136 153.36339352 -29.22155136 153.36339352 -23.52119541 149.1872282 C-22.66340488 148.55651409 -22.66340488 148.55651409 -21.78828526 147.91305828 C-20.33118077 146.84617743 -18.86787746 145.78777635 -17.40400791 144.73019695 C-16.78139072 144.20168133 -16.15877354 143.6731657 -15.51728916 143.12863445 C-15.51728916 142.46863445 -15.51728916 141.80863445 -15.51728916 141.12863445 C-16.65271152 141.11405193 -17.78813389 141.09946941 -18.95796299 141.084445 C-23.16824525 141.0264977 -27.37799066 140.94926504 -31.5878458 140.86618328 C-33.41034835 140.83291705 -35.23295435 140.80489039 -37.05561924 140.78219891 C-39.67480166 140.74868364 -42.29303464 140.69637094 -44.91182041 140.6403532 C-45.72754017 140.63396328 -46.54325993 140.62757336 -47.38369846 140.6209898 C-53.03197891 140.47398934 -53.03197891 140.47398934 -55.26588821 138.88430214 C-57.36621159 135.93762875 -56.46767114 133.34362205 -56.00590038 129.90492725 C-55.20711439 125.36621894 -54.0993505 120.94436076 -52.89692783 116.49753094 C-52.630107 115.4864024 -52.36328617 114.47527386 -52.08837986 113.43350506 C-51.21176024 110.12013131 -50.32391556 106.80989185 -49.43525791 103.4997282 C-48.81803922 101.18157866 -48.20129161 98.86330364 -47.58499241 96.54490948 C-46.29459144 91.69784066 -44.99863585 86.85230106 -43.69868565 82.00778484 C-42.03735992 75.8148216 -40.38973689 69.61831111 -38.74624252 63.42059517 C-37.475978 58.63634083 -36.19854294 53.85402365 -34.9189558 49.07225513 C-34.30880441 46.78880074 -33.70083286 44.50476267 -33.09512997 42.22012424 C-32.24594542 39.02153799 -31.38713949 35.82568399 -30.52583408 32.63034344 C-30.15703129 31.22970402 -30.15703129 31.22970402 -29.78077793 29.80076885 C-27.05897331 19.79026047 -23.56267762 9.60970873 -14.39228916 3.77707195 C-9.56041744 1.30784339 -5.46565828 0.00384923 0 0 Z" fill="var(--gold)" transform="translate(186.51728916168213,16.871365547180176)" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
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

// Tabel ambang batas poin BR Ranking -> [file icon, label tier]. Cara
// bacanya: cari ambang batas TERTINGGI yang masih <= poin akun, itulah
// tier saat ini. File icon disimpan manual di public/image/rank/.
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
  return { icon: `/image/rank/${best[1]}`, label: best[2], points: p };
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
  const brRankInfo = basic ? getBrRankInfo(basic.rank) : null;
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
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 16px 0' }}>
      <header style={{
        position: 'relative', width: '100%', maxWidth: 720,
        padding: '22px 20px 18px',
        marginBottom: 24,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* HUD corner accents — decorative only, standalone, do not affect content layout */}
        <span aria-hidden="true" style={{
          position: 'absolute', top: 0, left: 0, width: 22, height: 22,
          borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)',
          pointerEvents: 'none',
        }} />
        <span aria-hidden="true" style={{
          position: 'absolute', bottom: 0, right: 0, width: 22, height: 22,
          borderBottom: '2px solid var(--gold)', borderRight: '2px solid var(--gold)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FFLogo />
          <span style={{ fontWeight: 700, fontSize: 17, color: '#ffffff', letterSpacing: '0.04em', fontFamily: 'var(--font-display)' }}>
            Stalker UID
          </span>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--muted-text)', textAlign: 'center' }}>
          Cek info akun Free Fire lewat UID
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 10.5, color: 'var(--gold)', letterSpacing: '0.05em', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
          • By Givy •
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

          {brRankInfo ? (
            <div style={{
              marginTop: 10, background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)',
              borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
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
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', fontFamily: 'var(--font-display)' }}>
                  {brRankInfo.label}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)', fontFamily: 'var(--font-display)' }}>
                  {formatNumber(brRankInfo.points)}
                </p>
                <p style={{ fontSize: 10, color: 'var(--muted-text)' }}>Points</p>
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
      ) : null}

      <FaqSection />

      <footer
        style={{
          marginTop: 'auto',
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          background: 'var(--panel-bg)',
          borderTop: '1px solid var(--panel-border)',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 24px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 32,
            }}
          >
            <div style={{ maxWidth: 320 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14 }}>
                <FooterLogo />
                <span style={{ fontWeight: 700, fontSize: 17, color: '#ffffff', letterSpacing: '0.04em', fontFamily: 'var(--font-display)' }}>
                  Stalker
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--muted-text)', lineHeight: 1.6, margin: '0 0 18px' }}>
                Cek statistik akun Free Fire secara instan. Lookup profil, ranked, guild, dan koleksi item hanya dengan Player ID.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <a
                  href="https://t.me/givyo"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="icon-btn"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '1px solid var(--panel-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--light-text)',
                  }}
                >
                  <Send size={16} />
                </a>
                <a
                  href="https://wa.me/62895423300395"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="icon-btn"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '1px solid var(--panel-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--light-text)',
                  }}
                >
                  <WhatsAppIcon />
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48 }}>
              <div style={{ minWidth: 130 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: 14,
                  }}
                >
                  Information
                </p>
                <p style={{ fontSize: 13, color: 'var(--muted-text)', marginBottom: 10, cursor: 'default' }}>About</p>
                <p style={{ fontSize: 13, color: 'var(--muted-text)', cursor: 'default' }}>Status</p>
              </div>
              <div style={{ minWidth: 130 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: 14,
                  }}
                >
                  Legal
                </p>
                <p style={{ fontSize: 13, color: 'var(--muted-text)', marginBottom: 10, cursor: 'default' }}>Terms of Service</p>
                <p style={{ fontSize: 13, color: 'var(--muted-text)', cursor: 'default' }}>Privacy Policy</p>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--panel-border)',
              marginTop: 32,
              paddingTop: 18,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <p style={{ fontSize: 11.5, color: 'var(--muted-text)', margin: 0 }}>
              © 2026 Free Fire Stalk. All rights reserved.
            </p>
            <p style={{ fontSize: 11.5, color: 'var(--muted-text)', margin: 0 }}>
              Not affiliated with Garena International.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
