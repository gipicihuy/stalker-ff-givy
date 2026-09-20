import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

// Shell buat halaman-halaman informasi statis (Terms of Service, Privacy
// Policy, dst) - styling-nya dicocokin sama tema gold/dark yang dipake di
// halaman /stalk, tapi komponennya sendiri berdiri sendiri (server
// component biasa, gak butuh 'use client') biar ringan.
export default function LegalPageShell({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 16px 0', background: 'var(--background)', color: 'var(--light-text)',
    }}>
      <SiteHeader />

      <div style={{ width: '100%', maxWidth: 760, margin: '0 auto', padding: '0 4px 80px' }}>
        <a
          href="/stalk"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
            color: 'var(--gold)', textDecoration: 'none', marginBottom: 28,
          }}
        >
          <ChevronLeft size={16} /> Kembali ke Beranda
        </a>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: '#ffffff',
          margin: '0 0 8px',
        }}>
          {title}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted-text)', margin: '0 0 32px' }}>
          Terakhir diperbarui: {updatedAt}
        </p>

        <div
          style={{
            display: 'flex', flexDirection: 'column', gap: 28,
            fontSize: 14.5, lineHeight: 1.75, color: 'var(--light-text)',
          }}
        >
          {children}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--gold)',
        margin: '0 0 10px',
      }}>
        {heading}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </section>
  );
}
