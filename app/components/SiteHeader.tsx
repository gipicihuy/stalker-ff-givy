import { FFLogo } from './icons';

// Header shared, dipakai di halaman /stalk dan halaman statis (terms, privacy).
// Di-extract persis dari app/stalk/[[...uid]]/StalkClient.tsx.
export default function SiteHeader() {
  return (
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
  );
}
