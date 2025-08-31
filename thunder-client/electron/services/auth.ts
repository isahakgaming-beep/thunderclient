// electron/services/auth.ts
import path from 'path';
import os from 'os';
import fs from 'fs';
import { Authflow } from 'prismarine-auth';

const APP_DIR = path.join(os.homedir(), 'AppData', 'Roaming', 'thunderclient');
const CACHE_FILE = path.join(APP_DIR, 'auth-cache.json');
const DEBUG_FILE = path.join(APP_DIR, 'auth-debug.log');

// Titre Xbox “système” pour SISU (on force any pour éviter l’erreur de type)
const SISU_AUTH_TITLE = '00000000402b5328' as any;

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
function log(line: string) {
  ensureDir(APP_DIR);
  const ts = new Date().toISOString();
  fs.appendFileSync(DEBUG_FILE, `[${ts}] ${line}\n`);
}

// La session que l’on renvoie au renderer
export type McSession =
  | { ok: true; uuid: string; name: string; accessToken: string }
  | { ok: false; error: string };

export async function authenticate(): Promise<McSession> {
  try {
    ensureDir(APP_DIR);
    log('===== NEW AUTH ATTEMPT (SISU first, LIVE fallback) =====');

    // 1) SISU d’abord
    try {
      log('SISU FLOW: start');
      const sisu = new Authflow('thunderclient', CACHE_FILE, {
        flow: 'sisu',
        authTitle: SISU_AUTH_TITLE,
        deviceType: 'Win32',
      });

      log('Step A (SISU): getMinecraftJavaToken START');
      const sisuRes = await sisu.getMinecraftJavaToken({ fetchProfile: true });
      log('SISU FLOW: success');

      return {
        ok: true,
        uuid: sisuRes.profile?.id || '',
        name: sisuRes.profile?.name || '',
        accessToken: sisuRes.token, // on prend le token standard
      };
    } catch (e: any) {
      log(`SISU FLOW FAILED ${safeErr(e)}`);
    }

    // 2) LIVE en secours
    try {
      log('LIVE FLOW: start');
      purgeCacheIfAny();
      log('LIVE FLOW: cache purged');

      const live = new Authflow('thunderclient', CACHE_FILE, { flow: 'live' });

      log('Step B (LIVE): getMinecraftJavaToken START');
      const liveRes = await live.getMinecraftJavaToken({ fetchProfile: true });
      log('LIVE FLOW: success');

      return {
        ok: true,
        uuid: liveRes.profile?.id || '',
        name: liveRes.profile?.name || '',
        accessToken: liveRes.token,
      };
    } catch (e: any) {
      log(`AUTH LIVE FAILED ${safeErr(e)}`);
      return { ok: false, error: e?.message || 'Auth failed (LIVE + SISU)' };
    }
  } catch (e: any) {
    log(`FATAL AUTH ERROR ${safeErr(e)}`);
    return { ok: false, error: e?.message || 'Auth crashed' };
  }
}

// Petit helper pour satisfaire d’éventuelles références
// (si tu n’en as plus besoin, tu peux l’ignorer)
export function getSavedProfile(): { name: string; uuid: string } | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const buf = fs.readFileSync(CACHE_FILE, 'utf8');
    if (!buf.trim()) return null;
    const j = JSON.parse(buf);
    // on tente de retrouver un profil mis en cache (si présent)
    if (j?.profile?.name && j?.profile?.id) {
      return { name: j.profile.name, uuid: j.profile.id };
    }
  } catch {}
  return null;
}

function purgeCacheIfAny() {
  try {
    if (fs.existsSync(CACHE_FILE)) fs.writeFileSync(CACHE_FILE, '{}', 'utf8');
  } catch {}
}
function safeErr(e: any) {
  try {
    return typeof e === 'string' ? e : JSON.stringify({ message: e?.message, code: e?.code });
  } catch {
    return String(e);
  }
}
