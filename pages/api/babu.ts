import type { NextApiRequest, NextApiResponse } from 'next';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'gipicihuy';
const GITHUB_REPO = process.env.GITHUB_REPO || 'stalker-ff-givy';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_FILE_PATH = 'public/gingga12/data/listbabu.json';
const BABU_ACCESS_CODE = process.env.BABU_ACCESS_CODE || '';

type BabuEntry = {
  cc: string;
  date: string;
  time: string;
  note?: string;
};

function githubHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

function formatToday() {
  const now = new Date();
  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const jakartaOffsetMs = 7 * 60 * 60 * 1000;
  const jakartaNow = new Date(now.getTime() + jakartaOffsetMs);
  const date = `${jakartaNow.getUTCDate()} ${bulan[jakartaNow.getUTCMonth()]} ${jakartaNow.getUTCFullYear()}`;
  const time = `${String(jakartaNow.getUTCHours()).padStart(2, '0')}:${String(jakartaNow.getUTCMinutes()).padStart(2, '0')}`;
  return { date, time };
}

async function getCurrentList() {
  const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
  const getRes = await fetch(`${apiBase}?ref=${GITHUB_BRANCH}`, {
    headers: githubHeaders(),
    cache: 'no-store',
  });
  if (!getRes.ok) {
    const errBody = await getRes.text();
    throw new Error(`github_get_failed_${getRes.status}: ${errBody.slice(0, 200)}`);
  }
  const getData = await getRes.json();
  const currentContent = Buffer.from(getData.content, 'base64').toString('utf-8');
  const currentList: BabuEntry[] = JSON.parse(currentContent);
  return { list: currentList, sha: getData.sha, apiBase };
}

async function commitList(apiBase: string, sha: string, list: BabuEntry[], message: string) {
  const updatedContent = JSON.stringify(list, null, 2) + '\n';
  const updatedContentBase64 = Buffer.from(updatedContent, 'utf-8').toString('base64');

  const putRes = await fetch(apiBase, {
    method: 'PUT',
    headers: githubHeaders(),
    body: JSON.stringify({
      message,
      content: updatedContentBase64,
      sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!putRes.ok) {
    const errBody = await putRes.text();
    throw new Error(`github_put_failed_${putRes.status}: ${errBody.slice(0, 200)}`);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'POST, DELETE');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ ok: false, error: 'github_token_not_configured' });
  }

  const { code } = req.body || {};
  if (!code || code !== BABU_ACCESS_CODE) {
    return res.status(401).json({ ok: false, error: 'invalid_code' });
  }

  // Verifikasi kode doang (dipake pas mau "buka" mode kelola, gak nyentuh GitHub)
  if (req.method === 'POST' && req.body?.verifyOnly === true) {
    return res.status(200).json({ ok: true });
  }

  try {
    if (req.method === 'POST') {
      const { cc, note, date: customDate, time: customTime } = req.body || {};
      const ccTrimmed = typeof cc === 'string' ? cc.trim() : '';
      if (!ccTrimmed) return res.status(400).json({ ok: false, error: 'cc_required' });
      if (ccTrimmed.length > 80) return res.status(400).json({ ok: false, error: 'cc_too_long' });
      const noteTrimmed = typeof note === 'string' ? note.trim().slice(0, 200) : '';

      const { list, sha, apiBase } = await getCurrentList();
      const auto = formatToday();
      const date = typeof customDate === 'string' && customDate.trim() ? customDate.trim() : auto.date;
      const time = typeof customTime === 'string' && customTime.trim() ? customTime.trim() : auto.time;
      const newEntry: BabuEntry = { cc: ccTrimmed, date, time };
      if (noteTrimmed) newEntry.note = noteTrimmed;

      const updatedList = [...list, newEntry];
      await commitList(apiBase, sha, updatedList, `Tambah babu: ${ccTrimmed} (via web)`);

      return res.status(200).json({ ok: true, entry: newEntry });
    }

    // DELETE
    const { index } = req.body || {};
    if (typeof index !== 'number' || index < 0) {
      return res.status(400).json({ ok: false, error: 'index_required' });
    }

    const { list, sha, apiBase } = await getCurrentList();
    if (index >= list.length) {
      return res.status(400).json({ ok: false, error: 'index_out_of_range' });
    }

    const removed = list[index];
    const updatedList = list.filter((_, i) => i !== index);
    await commitList(apiBase, sha, updatedList, `Hapus babu: ${removed.cc} (via web)`);

    return res.status(200).json({ ok: true, removed });
  } catch (err: any) {
    console.error('babu_api_error', err);
    return res.status(500).json({ ok: false, error: err?.message || 'unknown_error' });
  }
}
