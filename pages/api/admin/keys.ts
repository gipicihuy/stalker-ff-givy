import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdminSession } from '../../../lib/security/adminAuth';
import { deleteApiKey, issueApiKey, listApiKeys, setApiKeyRevoked } from '../../../lib/security/apiKeys';
import { getRequestOrigin } from '../../../lib/security/request';

const UNIT_MS: Record<string, number> = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
};

const MAX_DURATION_MS = 3650 * 24 * 60 * 60 * 1000;

function sameOrigin(req: NextApiRequest): boolean {
  const origin = req.headers['origin'] as string | undefined;
  return !origin || origin === getRequestOrigin(req);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (!(await isAdminSession(req))) {
    return res.status(404).json({ error: 'not_found' });
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ keys: await listApiKeys() });
    }

    if (!sameOrigin(req)) {
      return res.status(403).json({ error: 'bad_origin' });
    }

    if (req.method === 'POST') {
      const label = String(req.body?.label || '').trim().slice(0, 60);
      const unit = String(req.body?.unit || '');
      const amount = Math.floor(Number(req.body?.amount) || 0);
      if (!label) return res.status(400).json({ error: 'Nama pembeli wajib diisi' });
      let durationMs: number | null = null;
      if (unit !== 'forever') {
        const perUnit = UNIT_MS[unit];
        if (!perUnit) return res.status(400).json({ error: 'Satuan waktu tidak valid' });
        if (amount < 1) return res.status(400).json({ error: 'Durasi minimal 1' });
        durationMs = amount * perUnit;
        if (durationMs > MAX_DURATION_MS) return res.status(400).json({ error: 'Durasi maksimal 10 tahun' });
      }
      const issued = await issueApiKey(label, durationMs);
      return res.status(200).json(issued);
    }

    if (req.method === 'PATCH') {
      const id = String(req.body?.id || '');
      const ok = await setApiKeyRevoked(id, Boolean(req.body?.revoked));
      return res.status(ok ? 200 : 404).json({ ok });
    }

    if (req.method === 'DELETE') {
      const id = String(req.body?.id || '');
      const ok = await deleteApiKey(id);
      return res.status(ok ? 200 : 404).json({ ok });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('admin_keys_error', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
