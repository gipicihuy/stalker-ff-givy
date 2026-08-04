import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'List Babu - GINGGA12',
  description: 'Rekap CC yang udah dilibas GINGGA12, sesuai tanggal & jam war.',
  openGraph: {
    title: 'List Babu - GINGGA12',
    description: 'Rekap CC yang udah dilibas GINGGA12, sesuai tanggal & jam war.',
    images: ['/gingga12/data/gingga12.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'List Babu - GINGGA12',
    description: 'Rekap CC yang udah dilibas GINGGA12, sesuai tanggal & jam war.',
    images: ['/gingga12/data/gingga12.jpg'],
  },
};

export default function ListBabuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
