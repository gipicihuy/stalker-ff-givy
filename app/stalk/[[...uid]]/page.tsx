import type { Metadata } from 'next';
import { headers } from 'next/headers';
import StalkClient from './StalkClient';
import { SITE_NAME, SITE_DESCRIPTION } from '../../lib/seo';

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
  const canonicalPath = uid ? `/stalk/${uid}` : '/stalk';

  if (!uid || !/^\d{6,15}$/.test(uid)) {
    const title = `Stalk UID - ${SITE_NAME}`;
    return {
      title,
      description: SITE_DESCRIPTION,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title,
        description: SITE_DESCRIPTION,
        url: canonicalPath,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: SITE_DESCRIPTION,
      },
    };
  }

  const data = await fetchPlayerData(uid);
  const nickname: string | undefined = data?.player?.nickname;
  const level: number | undefined = data?.player?.level;
  const region: string | undefined = data?.player?.region;
  const avatarUrl: string | undefined = data?.player?.avatarUrl;

  if (!nickname) {
    const title = `UID ${uid} - ${SITE_NAME}`;
    return {
      title,
      description: SITE_DESCRIPTION,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title,
        description: SITE_DESCRIPTION,
        url: canonicalPath,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: SITE_DESCRIPTION,
      },
    };
  }

  const title = `${nickname} (Lv.${level ?? '-'}) - ${SITE_NAME}`;
  const description = `Info akun Free Fire UID ${uid}: ${nickname}, Level ${level ?? '-'}${region ? `, Region ${region}` : ''}. Cek statistik lengkapnya di ${SITE_NAME}.`;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      images: avatarUrl ? [{ url: avatarUrl }] : undefined,
    },
    twitter: {
      card: avatarUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: avatarUrl ? [avatarUrl] : undefined,
    },
  };
}

export default function Page() {
  return <StalkClient />;
}
