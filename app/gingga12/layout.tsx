import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GINGGA12 - CC Epep',
  description: 'Info Tentang GINGGA12😋',
  openGraph: {
    title: 'GINGGA12 - CC Epep',
    description: 'Info tentang GINGGA12😋',
    images: ['/gingga12/data/gingga12.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'GINGGA12 - CC EPEP',
    description: 'Info tentang GINGGA12😋',
    images: ['/gingga12/data/gingga12.jpg'],
  },
};

export default function Gingga12Layout({ children }: { children: React.ReactNode }) {
  return children;
}
