import type { NextApiRequest, NextApiResponse } from 'next';

const SOURCE_API = 'https://adenpedia.my.id/adencs/info.php';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} tidak diizinkan` });
  }

  const { uid } = req.query;

  if (!uid || !/^\d{6,15}$/.test(String(uid))) {
    return res.status(400).json({ error: 'UID tidak valid. Masukkan UID Free Fire yang benar (angka saja).' });
  }

  try {
    const upstream = await fetch(`${SOURCE_API}?uid=${encodeURIComponent(String(uid))}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return res.status(upstream.status === 404 ? 404 : 502).json({
        error: upstream.status === 404
          ? 'Akun tidak ditemukan. Cek lagi UID-nya.'
          : 'Server data lagi bermasalah, coba lagi sebentar.',
      });
    }

    const data = await upstream.json();

    if (!data || !data.basicInfo || !data.basicInfo.accountId) {
      return res.status(404).json({ error: 'Data tidak ditemukan untuk UID ini.' });
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: 'Gagal mengambil data. Coba lagi nanti.' });
  }
}
