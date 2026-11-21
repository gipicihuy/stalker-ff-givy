import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdminSession } from '../../../lib/security/adminAuth';
import { deleteApiKey, issueApiKey, listApiKeys, setApiKeyRevoked } from '../../../lib/security/apiKeys';
import { getRequestOrigin } from '../../../lib/security/request';

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
      const days = Math.floor(Number(req.body?.days) || 0);
      if (!label) return res.status(400).json({ error: 'label wajib diisi' });
      if (days < 0 || days > 3650) return res.status(400).json({ error: 'durasi tidak valid' });
      const issued = await issueApiKey(label, days);
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
