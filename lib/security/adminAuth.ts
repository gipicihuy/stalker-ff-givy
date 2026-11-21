import type { NextApiRequest } from 'next';
import { hmacSha256Hex, sha256Hex, timingSafeEqual } from './crypto';
import { getGuardEnv, getSigningSecret } from './env';

export const ADMIN_COOKIE = 'ff_admin';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function getAdminPassword(): string {
  return getGuardEnv().ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
}

export function isAdminConfigured(): boolean {
  return getAdminPassword().length >= 8;
}

export async function checkAdminPassword(input: string): Promise<boolean> {
  const pw = getAdminPassword();
  if (pw.length < 8 || !input) return false;
  const a = await sha256Hex(input);
  const b = await sha256Hex(pw);
  return timingSafeEqual(a, b);
}

function sessionSecret(): string {
  return `${getAdminPassword()}|${getSigningSecret()}`;
}

export async function createAdminSessionCookie(): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS;
  const sig = await hmacSha256Hex(sessionSecret(), `admin|${exp}`);
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  return `${ADMIN_COOKIE}=${exp}.${sig}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function clearAdminSessionCookie(): string {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

function readCookie(req: NextApiRequest, name: string): string {
  const raw = String(req.headers.cookie || '');
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return '';
}

export async function isAdminSession(req: NextApiRequest): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const value = readCookie(req, ADMIN_COOKIE);
  const dot = value.indexOf('.');
  if (dot <= 0) return false;
  const expStr = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = await hmacSha256Hex(sessionSecret(), `admin|${exp}`);
  return timingSafeEqual(expected, sig);
}
