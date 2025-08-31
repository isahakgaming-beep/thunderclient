// electron/services/auth.ts
import path from 'path';
import os from 'os';
import fs from 'fs';
import { Authflow } from 'prismarine-auth';

const APP_DIR = path.join(os.homedir(), 'AppData', 'Roaming', 'thunderclient');
const CACHE_FILE = path.join(APP_DIR, 'auth-cache.json');
const DEBUG_FILE = path.join(APP_DIR, 'auth-debug.log');

// Title Xbox “système” stable pour SISU (Microsoft/Xbox)
// (c’est ce qui manquait quand tu avais “Please specify an authTitle…”)
const SISU_AUTH_TITLE = '00000000402b5328'; // Xbox app title id

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function log(line: string) {
  ensureDir(APP_DIR);
  const ts = new Date().toISOString();
  fs.appendFileSync(DEBUG_FILE, `[${ts}] ${line}\n`);
}

export type McSession = {
  ok: true;
  uuid: string;
  name: string;
  accessToken: string;
} | {
  ok: false;
  error: string;
};

export async function authenticate(): Promise<McSession> {
  try {
    ensureDir(APP_DIR);
    log('===== NEW AUTH ATTEMPT (SISU first, LIVE fallback) =====');

    // 1) SISU (fenêtre système) — c’est ce que le message t’indiquait d’activer
    try {
      log('SISU FLOW: start');
      const sisu = new Authflow('thunderclient', CACHE_FILE, {
        flow: 'sisu',
        authTitle: SISU_AUTH_TITLE,    // OBLIGATOIRE en SISU
        deviceType: 'Win32',           // pour Windows
        fetchProfile: true
      });

      log('Step A (SISU): getMinecraftJavaToken START');
      const sisuRes = await sisu.getMinecraftJavaToken({ fetchProfile: true });
      log('SISU FLOW: success');

      return {
        ok: true,
        uuid: sisuRes.profile?.id || sisuRes.mcUser?.id || '',
        name: sisuRes.profile?.name || sisuRes.mcUser?.name || '',
        accessToken: sisuRes.mclc?.accessToken || sisuRes.accessToken
      };
    } catch (e: any) {
      log(`SISU FLOW FAILED ${safeErr(e)}`);
    }

    // 2) LIVE (appareil, code à entrer) — secours
    try {
      log('LIVE FLOW: start');
      // on purge le cache msal/xbl pour éviter de retester un mauvais jeton
      purgeCacheIfAny();
      log('LIVE FLOW: cache purged');

      const live = new Authflow('thunderclient', CACHE_FILE, {
        flow: 'live',
        fetchProfile: true
      });

      log('Step B (LIVE): getMinecraftJavaToken START');
      const liveRes = await live.getMinecraftJavaToken({ fetchProfile: true });
      log('LIVE FLOW: success');

      return {
        ok: true,
        uuid: liveRes.profile?.id || liveRes.mcUser?.id || '',
        name: liveRes.profile?.name || liveRes.mcUser?.name || '',
        accessToken: liveRes.mclc?.accessToken || liveRes.accessToken
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

function purgeCacheIfAny() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const content = fs.readFileSync(CACHE_FILE, 'utf8');
      if (content.trim().length > 0) {
        fs.writeFileSync(CACHE_FILE, '{}', 'utf8');
      }
    }
  } catch {}
}

function safeErr(e: any) {
  try {
    return typeof e === 'string' ? e : JSON.stringify({ message: e?.message, code: e?.code });
  } catch {
    return String(e);
  }
}
