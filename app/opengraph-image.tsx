import { ImageResponse } from 'next/og';

export const alt = 'Free Fire Stalk - Cek Info Akun Free Fire Lewat UID';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #14161b 0%, #1c1f26 60%, #14161b 100%)',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 128,
            height: 128,
            borderRadius: 32,
            background: 'linear-gradient(135deg, #fabf00, #ff9d00)',
            color: '#14161b',
            fontSize: 56,
            fontWeight: 700,
            marginBottom: 36,
          }}
        >
          FF
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: '0.01em',
            color: '#ffffff',
          }}
        >
          FREE FIRE STALK
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            fontSize: 30,
            color: '#d1d4da',
          }}
        >
          Cek Info Akun Free Fire Lewat UID
        </div>
      </div>
    ),
    { ...size }
  );
}
