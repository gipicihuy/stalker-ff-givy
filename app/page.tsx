export default function ComingSoonPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: '#0b0b0f',
        color: '#ffffff',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <div style={{ fontSize: 14, letterSpacing: 4, color: '#8a8a95', textTransform: 'uppercase' }}>
        Free Fire ID
      </div>
      <h1 style={{ fontSize: 40, fontWeight: 800, margin: 0 }}>Coming Soon</h1>
      <p style={{ fontSize: 15, color: '#a3a3ad', maxWidth: 420, margin: 0 }}>
        Website utama masih dalam pengembangan. Balik lagi nanti ya.
      </p>
    </div>
  );
}
