'use client';

import { useState, useCallback, useRef } from 'react';

type PrimeInfo = { primeLevel?: number };
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
};
type ClanInfo = { clanName?: string; clanLevel?: number; memberNum?: number; capacity?: number };
type SocialInfo = { signature?: string };
type CreditInfo = { creditScore?: number };
type FfResponse = {
  basicInfo: BasicInfo;
  clanBasicInfo?: ClanInfo;
  socialInfo?: SocialInfo;
  creditScoreInfo?: CreditInfo;
};

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
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

function formatFullDate(timestamp?: string) {
  if (!timestamp) return '—';
  const date = new Date(Number(timestamp) * 1000);
  if (Number.isNaN(date.getTime())) return '—';
  return `${DAYS_ID[date.getDay()]}, ${date.getDate()} ${MONTHS_ID[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDateTime(timestamp?: string) {
  if (!timestamp) return '—';
  const date = new Date(Number(timestamp) * 1000);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function calculateAccountAgeDays(timestamp?: string) {
  if (!timestamp) return null;
  const created = new Date(Number(timestamp) * 1000);
  const now = new Date();
  const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null;
}

function formatNumber(n?: number) {
  const num = Number(n);
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString('id-ID');
}

function timeAgoFromDays(days: number | null) {
  if (days === null || days === undefined) return '';
  if (days === 0) return 'Hari ini';
  if (days === 1) return '1 hari yang lalu';
  return `${formatNumber(days)} hari yang lalu`;
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

function AngleDivider() {
  return (
    <svg width="100%" height="5" viewBox="0 0 560 5" preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block', margin: '28px 0' }}>
      <path d="M0 4H560" stroke="#fabf00" strokeMiterlimit="10" />
      <path d="M430 0H560V4H420L424.76 1.20615C425.66 0.429117 426.81 0.000859238 430 0Z" fill="#fabf00" />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontWeight: 500, fontSize: 12, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
      {children}
    </p>
  );
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 15, height: 15,
      border: '2px solid rgba(20,22,27,0.35)', borderTop: '2px solid #14161b',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      verticalAlign: 'middle', marginRight: 8,
    }} />
  );
}

function StatCard({ icon, label, value, sub, accent }: { icon?: string; label: string; value: React.ReactNode; sub?: string; accent?: string }) {
  return (
    <div style={{ background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)', borderRadius: 16, padding: '24px 16px', textAlign: 'center' }}>
      {icon ? (
        <img src={icon} alt="" style={{ width: 56, height: 56, objectFit: 'contain', margin: '0 auto 12px' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      ) : null}
      <p style={{ fontSize: 13, color: 'var(--muted-text)', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color: accent || 'var(--white)' }}>{value}</p>
      {sub ? <p style={{ fontSize: 13, color: 'var(--light-text)', marginTop: 4 }}>{sub}</p> : null}
    </div>
  );
}

export default function Page() {
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FfResponse | null>(null);
  const lastCheckRef = useRef(0);

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

    try {
      const res = await fetch(`/api/ff?uid=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || 'Gagal mengambil data.');
        return;
      }
      setResult(data);
    } catch {
      setError('Gagal terhubung ke server. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') cekID();
  };

  const basic = result?.basicInfo;
  const social = result?.socialInfo;
  const clan = result?.clanBasicInfo;
  const credit = result?.creditScoreInfo;
  const customTag = basic ? CUSTOM_TAGS[basic.accountId] : null;
  const accountAgeDays = basic ? calculateAccountAgeDays(basic.createAt) : null;
  const estimatedTopup = basic ? estimateTopupPrice(basic) : 0;
  const avatarSrc = basic?.headPic ? `https://ff.garena.com/avatar/${basic.headPic}.png` : '/image/avatar1.jpg';

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 16px 64px' }}>
      <header style={{ width: '100%', maxWidth: 720, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--gold), #ff9d00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, color: '#14161b', fontSize: 16,
          }}>
            FF
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)', letterSpacing: '0.02em' }}>GIVY - STALK EPEP</h1>
            <p style={{ fontSize: 12, color: 'var(--muted-text)' }}>Cek info akun Free Fire lewat UID</p>
          </div>
        </div>
      </header>

      <AngleDivider />

      <section style={{ width: '100%', maxWidth: 720 }}>
        <SectionLabel>Masukkan UID</SectionLabel>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={12}
            placeholder="Contoh: 903474122"
            value={uid}
            onChange={(e) => setUid(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={onKeyDown}
            style={{
              flex: '1 1 240px', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
              borderRadius: 12, padding: '14px 16px', fontSize: 16, color: 'var(--white)', outline: 'none',
            }}
          />
          <button
            onClick={cekID}
            disabled={loading}
            style={{
              background: loading ? 'var(--gold-hover)' : 'var(--gold)', color: '#14161b',
              fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 12,
              padding: '14px 28px', opacity: loading ? 0.85 : 1, transition: 'background 0.15s ease',
            }}
          >
            {loading ? (<><Spinner />Memeriksa...</>) : 'CEK ID'}
          </button>
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
        <section style={{
          width: '100%', maxWidth: 720, marginTop: 32, background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)', borderRadius: 20, padding: 24, animation: 'fadeUp 0.35s ease',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', paddingBottom: 20, borderBottom: '1px solid var(--panel-border)' }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--gold)', flexShrink: 0, background: 'var(--panel-bg-alt)' }}>
              <img
                src={avatarSrc}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.src = '/image/avatar1.jpg'; }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--white)', wordBreak: 'break-word' }}>{basic.nickname}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--muted-text)', marginTop: 2 }}>UID: {basic.accountId}</div>
              {customTag ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  {customTag.badge ? (
                    <img src={customTag.badge} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : null}
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                    background: 'var(--gold-soft)', color: customTag.color || 'var(--gold)',
                    border: '1px solid rgba(250,191,0,0.3)',
                  }}>
                    {customTag.label}
                  </span>
                </div>
              ) : null}
            </div>
            {basic.liked !== undefined ? (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: 'var(--muted-text)', textTransform: 'uppercase' }}>Likes</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>{formatNumber(basic.liked)}</p>
              </div>
            ) : null}
          </div>

          {clan?.clanName ? (
            <div style={{
              marginTop: 18, background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)',
              borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 8,
            }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--muted-text)', textTransform: 'uppercase', marginBottom: 4 }}>Clan</p>
                <p style={{ fontWeight: 700, color: 'var(--white)' }}>{clan.clanName}</p>
              </div>
              <div style={{ fontSize: 13, color: 'var(--light-text)' }}>
                Level {clan.clanLevel ?? '—'} · {clan.memberNum ?? '—'}/{clan.capacity ?? '—'} member
              </div>
            </div>
          ) : null}

          <div style={{
            marginTop: 18, background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)',
            borderRadius: 14, padding: '18px 18px 14px', display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18,
          }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                🏷️ Estimasi Topup Kamu
              </p>
              <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--white)' }}>{formatRupiah(estimatedTopup)}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                📅 Dibuat Pada
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)' }}>{formatFullDate(basic.createAt)}</p>
              {accountAgeDays !== null ? (
                <p style={{ fontSize: 12, color: 'var(--muted-text)', marginTop: 4 }}>{timeAgoFromDays(accountAgeDays)}</p>
              ) : null}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <SectionLabel>Signature</SectionLabel>
            <div style={{
              background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)', borderRadius: 12,
              padding: '12px 14px', fontSize: 13, color: 'var(--light-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {social?.signature ? social.signature : 'Tidak ada signature / bio.'}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <SectionLabel>Statistik Akun</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <StatCard icon="/image/prime.png" label="Prime Level" value={basic.primeInfo?.primeLevel ?? '—'} />
              <StatCard icon="/image/like.png" label="Jumlah Like" value={formatNumber(basic.liked)} />
              <StatCard icon="/image/badge1.png" label="Booyah Pass" value="BooyahPass" accent="var(--gold)" sub={`Badge: ${basic.badgeCnt ?? '—'}`} />
              <StatCard icon="/image/level.png" label="Level Player" value={basic.level ?? '—'} />
              <StatCard icon="/image/exp.png" label="Exp Level" value={formatNumber(basic.exp)} />
              <StatCard icon="/image/region.png" label="Server Region" value={getRegionName(basic.region)} />
              <StatCard icon="/image/skor.png" label="Credit Score" value={credit?.creditScore ?? '—'} accent="var(--success)" />
              <StatCard label="Rank BR" value={basic.rank ? `#${formatNumber(basic.rank)}` : '—'} />
              <StatCard label="Rank CS" value={basic.csRank ? `#${formatNumber(basic.csRank)}` : '—'} />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ background: 'var(--panel-bg-alt)', border: '1px solid var(--panel-border)', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 11, color: 'var(--muted-text)', textTransform: 'uppercase', marginBottom: 6 }}>Terakhir login</p>
              <p style={{ fontWeight: 700, color: 'var(--white)', fontSize: 14 }}>{formatDateTime(basic.lastLoginAt)}</p>
            </div>
          </div>
        </section>
      ) : (!loading && !error) ? (
        <section style={{ width: '100%', maxWidth: 720, marginTop: 48, textAlign: 'center', color: 'var(--muted-text)' }}>
          <div style={{ fontSize: 46, marginBottom: 12, opacity: 0.5 }}>🔍</div>
          <p>Masukkan UID Free Fire di atas buat lihat detail akun.</p>
        </section>
      ) : null}

      <footer style={{ marginTop: 56, fontSize: 12, color: 'var(--muted-text)', textAlign: 'center' }}>
        Fan-made, tidak berafiliasi dengan Garena.
      </footer>
    </main>
  );
}
