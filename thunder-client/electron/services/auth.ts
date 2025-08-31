// electron/services/auth.ts
import { app } from 'electron';
import fsp from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { Authflow, Titles } from 'prismarine-auth';

type FlowMode = 'auto' | 'sisu' | 'live';

export type SimpleProfile = {
  id: string;
  name: string;
  uuid?: string;
  username?: string;
  mclId?: string;
};

// ---------------------------------------------------------------------------
// Dossiers & logs (toujours en écriture)
// ---------------------------------------------------------------------------
const AUTH_DIR =
  process.env.THUNDER_AUTH_DIR ||
  path.join(app.getPath('userData'), 'auth-cache');

const SESSION_FILE = path.join(AUTH_DIR, 'session.json');
const LOG_FILE = path.join(AUTH_DIR, 'auth-debug.log');

function log(...a: any[]) {
  try {
    fs.appendFileSync(
      LOG_FILE,
      `[${new Date().toISOString()}] ${a.map(String).join(' ')}\n`
    );
  } catch {}
}

async function ensureDir() {
  await fsp.mkdir(AUTH_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function normalizeProfile(raw: any): SimpleProfile | null {
  if (!raw) return null;
  const rawId = String(raw.id ?? raw.uuid ?? raw.profileId ?? '').trim();
  const id = rawId.replace(/-/g, '');
  const name = String(raw.name ?? raw.username ?? raw.profileName ?? 'Player').trim();
  return {
    id,
    name,
    uuid: rawId || id,
    username: name,
    mclId: String(raw.mclId ?? rawId ?? id),
  };
}

function is403(err: any): boolean {
  const msg = String(err?.message || err || '').toLowerCase();
  return msg.includes('403') || msg.includes('forbidden');
}
function needLiveAuthTitle(err: any): boolean {
  const msg = String(err?.message || err || '').toLowerCase();
  return msg.includes('authtitle') && msg.includes('live');
}

// Options compatibles avec plusieurs versions de prismarine-auth
function buildOptions(mode: FlowMode): any {
  const base: any = {
    // on met les deux noms au cas où
    cacheDirectory: AUTH_DIR,
    cacheDir: AUTH_DIR,
  };

  if (mode === 'live') {
    base.authTitle = Titles.MinecraftNintendoSwitch;
    base.deviceType = 'Win32';
  } else if (mode === 'sisu') {
    base.enableSisu = true as any;
  }
  return base;
}

// Auth dans un mode donné, en forçant le CWD vers AUTH_DIR (évite app.asar)
async function tryAuth(mode: FlowMode) {
  log(`FLOW ${mode}: start`);
  const oldCwd = process.cwd();
  process.chdir(AUTH_DIR);
  try {
    const af = new Authflow('thunder-client', buildOptions(mode));
    const mc = await af.getMinecraftJavaToken({ fetchProfile: true } as any);
    log(`FLOW ${mode}: getMinecraftJavaToken OK`);
    return mc;
  } finally {
    process.chdir(oldCwd);
  }
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
export async function authenticate(opts?: { flow?: FlowMode }) {
  await ensureDir();
  const flow: FlowMode = opts?.flow ?? 'auto';
  log('===== NEW AUTH ATTEMPT =====');

  try {
    let mc: any;

    if (flow === 'live') {
      mc = await tryAuth('live');
    } else if (flow === 'sisu') {
      mc = await tryAuth('sisu');
    } else {
      // AUTO : LIVE -> fallback SISU si 403 / authTitle manquant
      try {
        mc = await tryAuth('live');
      } catch (e) {
        log('AUTH LIVE FAILED', String(e));
        if (is403(e) || needLiveAuthTitle(e)) {
          log('AUTO: falling back to SISU');
          mc = await tryAuth('sisu');
        } else {
          throw e;
        }
      }
    }

    const profile = normalizeProfile(mc?.profile);
    const payload = { ok: true, profile };
    await fsp.writeFile(SESSION_FILE, JSON.stringify(payload, null, 2));
    log('AUTH SUCCESS', JSON.stringify(profile));
    return payload;
  } catch (e: any) {
    const msg = e?.message || String(e);
    log('AUTH ERROR', msg);
    return { ok: false, error: msg };
  }
}

export async function status() {
  try {
    await ensureDir();
    const data = await fsp.readFile(SESSION_FILE, 'utf8').catch(() => '');
    if (!data) return { ok: true, profile: null };
    const json = JSON.parse(data);
    return { ok: true, profile: json?.profile ?? null };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

export async function resetAuth() {
  try {
    await fsp.rm(AUTH_DIR, { recursive: true, force: true });
    await ensureDir();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}
