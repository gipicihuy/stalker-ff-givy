import { NextRequest, NextResponse } from 'next/server';

// Proxy untuk icon rank BR. Tujuannya supaya origin CDN asli tidak
// terlihat di tab Network / saat inspect elemen — browser cuma lihat
// request ke domain sendiri (/api/img/rank/...).
const RANK_ICON_ORIGIN = 'https://ff-items-givy-coy.vercel.app/rank';

// Whitelist nama file yang valid (harus sinkron dengan BR_RANKING_MAP di
// app/stalk/[[...uid]]/StalkClient.tsx) supaya route ini tidak jadi open
// proxy yang bisa dipakai fetch sembarang URL.
const ALLOWED_FILES = new Set([
  'br-bronze1.png', 'br-bronze2.png', 'br-bronze3.png',
  'br-silver1.png', 'br-silver2.png', 'br-silver3.png',
  'br-gold1.png', 'br-gold2.png', 'br-gold3.png', 'br-gold4.png',
  'br-platinum1.png', 'br-platinum2.png', 'br-platinum3.png', 'br-platinum4.png', 'br-platinum5.png',
  'br-diamond1.png', 'br-diamond2.png', 'br-diamond3.png', 'br-diamond4.png', 'br-diamond5.png',
  'br-heroic1.png', 'br-heroic2.png', 'br-heroic3.png', 'br-heroic4.png', 'br-heroic5.png',
  'br-master1.png', 'br-master2.png', 'br-master3.png', 'br-master4.png', 'br-master5.png',
]);

export async function GET(
  _req: NextRequest,
  { params }: { params: { file: string } }
) {
  const file = params.file;

  if (!ALLOWED_FILES.has(file)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const upstream = await fetch(`${RANK_ICON_ORIGIN}/${file}`).catch(() => null);

  if (!upstream || !upstream.ok || !upstream.body) {
    return new NextResponse('Not found', { status: 404 });
  }

  const contentType = upstream.headers.get('content-type') || 'image/png';

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
    },
  });
}
