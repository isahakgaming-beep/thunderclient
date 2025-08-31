// electron/services/auth.ts
import path from 'path';
import os from 'os';
import fs from 'fs';
import { Authflow } from 'prismarine-auth';

const APP_DIR = path.join(os.homedir(), 'AppData', 'Roaming', 'thunderclient');
const CACHE_FILE = path.join(APP_DIR, 'auth-cache.json');
const DEBUG_FILE = path.join(APP_DIR, 'auth-debug.log');

// SISU demande un "titleId" (Xbox Live). On caste en any pour calmer le typage.
const SISU_AUTH_TITLE = '00000000402b5328' as any;

type Flow = 'auto' | 'sisu' | 'live';

export type McSession =
  | { ok: true; uuid: string; name: string; accessToken: string }
  | { ok: false; error: string };

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
function log(line: string) {
  ensureDir(APP_DIR);
  const ts = new Date().toISOString();
  fs.appendFileSync(DEBUG_FILE, `[${ts}] ${line}\n`);
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

// Ajoute un "garde temps" : on n’attend pas indéfiniment
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout waiting for ${label}`)), ms);
    p.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

export async function authenticate(params?: { flow?: Flow }): Promise<McSession> {
  const flow: Flow = params?.flow ?? 'auto';
  try {
    ensureDir(APP_DIR);
    log(`===== AUTH START (flow=${flow}) =====`);

    // Helper pour exécuter un flow avec timeout
    const runFlow = async (which: 'sisu' | 'live'): Promise<McSession> => {
      if (which === 'sisu') {
        log('SISU FLOW: start');
        const sisu = new Authflow('thunderclient', CACHE_FILE, {
          flow: 'sisu',
          authTitle: SISU_AUTH_TITLE,
          deviceType: 'Win32',
        });
        log('Step (SISU): getMinecraftJavaToken START');
        const res = await withTimeout(
          sisu.getMinecraftJavaToken({ fetchProfile: true }),
          120000,
          'SISU getMinecraftJavaToken'
        );
        log('SISU FLOW: success');
        return {
          ok: true,
          uuid: res.profile?.id || '',
          name: res.profile?.name || '',
          accessToken: res.token,
        };
      } else {
        log('LIVE FLOW: start');
        purgeCacheIfAny();
        log('LIVE FLOW: cache purged');
        const live = new Authflow('thunderclient', CACHE_FILE, { flow: 'live' });
        log('Step (LIVE): getMinecraftJavaToken START');
        const res = await withTimeout(
          live.getMinecraftJavaToken({ fetchProfile: true }),
          120000,
          'LIVE getMinecraftJavaToken'
        );
        log('LIVE FLOW: success');
        return {
          ok: true,
          uuid: res.profile?.id || '',
          name: res.profile?.name || '',
          accessToken: res.token,
        };
      }
    };

    // Ordonnancement des flows
    if (flow === 'sisu') {
      try {
        return await runFlow('sisu');
      } catch (e: any) {
        log(`SISU FAILED ${safeErr(e)}`);
        return { ok: false, error: e?.message || 'SISU failed' };
      }
    }
    if (flow === 'live') {
      try {
        return await runFlow('live');
      } catch (e: any) {
        log(`LIVE FAILED ${safeErr(e)}`);
        return { ok: false, error: e?.message || 'LIVE failed' };
      }
    }

    // flow === 'auto' → SISU puis LIVE
    try {
      return await runFlow('sisu');
    } catch (e: any) {
      log(`SISU FAILED ${safeErr(e)} — falling back to LIVE`);
      try {
        return await runFlow('live');
      } catch (e2: any) {
        log(`LIVE FAILED ${safeErr(e2)}`);
        return { ok: false, error: e2?.message || 'Auth failed (SISU + LIVE)' };
      }
    }
  } catch (e: any) {
    log(`FATAL AUTH ERROR ${safeErr(e)}`);
    return { ok: false, error: e?.message || 'Auth crashed' };
  }
}

// Optionnel : pour compat si c’est appelé quelque part
export function getSavedProfile(): { name: string; uuid: string } | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const j = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    if (j?.profile?.name && j?.profile?.id) return { name: j.profile.name, uuid: j.profile.id };
  } catch {}
  return null;
}
