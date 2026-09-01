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
    const res = await fetch(`${baseUrl}/api/ff?uid=${encodeURIComponent(uid)}`, {
      cache: 'no-store',
      headers: { 'x-internal-ssr': '1' },
    });
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

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this tool free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, checking a Free Fire profile with this tool is completely free. No login, no download, and no hidden fees — just enter a UID and search.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where does the player data come from?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Data is pulled directly from Free Fire's servers based on the UID you search, so it reflects the player's live in-game profile.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is it safe to check someone else\u2019s profile?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. This tool only reads public profile data that\u2019s already visible in-game, such as level, guild, outfit, and pet. It cannot access passwords, linked accounts, or private information.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why does my search return no results?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'This usually means the UID was typed incorrectly, or the account doesn\u2019t exist. Double-check the number on your profile in-game and try again.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I check a player\u2019s rank or match history?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Not yet — this tool currently focuses on profile info: level, guild, outfit, weapon skins, and pet details. Rank and match history may be added in a future update.',
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <StalkClient />
    </>
  );
}
