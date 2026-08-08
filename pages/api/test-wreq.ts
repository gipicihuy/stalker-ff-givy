import type { NextApiRequest, NextApiResponse } from 'next';
import { fetch as wreqFetch } from 'wreq-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const upstream = await wreqFetch(
      'https://mobileverso.com.br/api/freefire/jogador/wishlist?uid=903474122',
      { browser: 'chrome_142', os: 'windows' }
    );
    const text = await upstream.text();
    res.status(200).json({
      status: upstream.status,
      contentType: upstream.headers.get('content-type'),
      bodyPreview: text.slice(0, 500),
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) });
  }
}
