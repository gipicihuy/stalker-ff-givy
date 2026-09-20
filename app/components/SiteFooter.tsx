import { Send } from 'lucide-react';
import { FooterLogo, WhatsAppIcon } from './icons';

// Footer shared, dipakai di halaman /stalk dan halaman statis (terms, privacy).
// Di-extract persis dari app/stalk/[[...uid]]/StalkClient.tsx.
export default function SiteFooter() {
  return (
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
                <a
                  href="/about"
                  className="icon-btn"
                  style={{ display: 'block', fontSize: 13, color: 'var(--muted-text)', marginBottom: 10, textDecoration: 'none' }}
                >
                  About Us
                </a>
                <p style={{ fontSize: 13, color: 'var(--muted-text)', cursor: 'default' }}>API</p>
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
                <a
                  href="/terms"
                  className="icon-btn"
                  style={{ display: 'block', fontSize: 13, color: 'var(--muted-text)', marginBottom: 10, textDecoration: 'none' }}
                >
                  Terms of Service
                </a>
                <a
                  href="/privacy"
                  className="icon-btn"
                  style={{ display: 'block', fontSize: 13, color: 'var(--muted-text)', textDecoration: 'none' }}
                >
                  Privacy Policy
                </a>
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
  );
}
