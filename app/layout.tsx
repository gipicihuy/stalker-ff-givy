import './globals.css';
import type { Metadata, Viewport } from 'next';
import {
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  THEME_COLOR,
  BACKGROUND_COLOR,
  getConfiguredSiteUrl,
} from './lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(getConfiguredSiteUrl()),
  title: {
    default: `${SITE_NAME} - ${SITE_TAGLINE}`,
    template: `%s - ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: 'Next.js',
  keywords: [
    'Free Fire Stalk',
    'cek UID Free Fire',
    'stalk akun Free Fire',
    'cek nickname Free Fire',
    'cek rank Free Fire',
    'info akun Free Fire',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: SITE_NAME,
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <body>{children}</body>
    </html>
  );
}
