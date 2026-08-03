import type { Metadata } from 'next';
import { headers } from 'next/headers';
import StalkClient from './StalkClient';

type PageProps = {
  params: { uid?: string[] };
};

function getUidFromParams(params: { uid?: string[] }) {
  return Array.isArray(params?.uid) ? params.uid[0] : undefined;
}

async function getBaseUrl() {
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const protocol = h.get('x-forwarded-proto') || 'https';
  return `${protocol}://${host}`;
}

async function fetchPlayerData(uid: string) {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/ff?uid=${encodeURIComponent(uid)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const uid = getUidFromParams(params);

  if (!uid || !/^\d{6,15}$/.test(uid)) {
    return {
      title: 'Givy - Stalk Epep',
      description: 'Cek info akun Free Fire lewat UID.',
    };
  }

  const data = await fetchPlayerData(uid);
  const nickname: string | undefined = data?.basicInfo?.nickname;
  const level: number | undefined = data?.basicInfo?.level;
  const region: string | undefined = data?.basicInfo?.region;
  const avatarUrl: string | undefined = data?.basicInfo?.avatarUrl;

  if (!nickname) {
    return {
      title: `UID ${uid} - Givy Stalk Epep`,
      description: 'Cek info akun Free Fire lewat UID.',
    };
  }

  const title = `${nickname} (Lv.${level ?? '-'}) - Givy Stalk Epep`;
  const description = `Info akun Free Fire UID ${uid}: ${nickname}, Level ${level ?? '-'}${region ? `, Region ${region}` : ''}. Cek statistik lengkapnya di Givy Stalk Epep.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: avatarUrl ? [{ url: avatarUrl }] : undefined,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: avatarUrl ? [avatarUrl] : undefined,
    },
  };
}

export default function Page() {
  return <StalkClient />;
}
