// electron/services/auth.ts
import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { Authflow, Titles } from 'prismarine-auth';

type FlowMode = 'auto' | 'sisu' | 'live';

export type SimpleProfile = {
  id: string;          // UUID sans tirets
  name: string;        // pseudo
  uuid?: string;
  username?: string;
  mclId?: string;
};

const AUTH_DIR =
  process.env.THUNDER_AUTH_DIR ||
  path.join(app.getPath('userData'), 'auth-cache');

const SESSION_FILE = path.join(AUTH_DIR, 'session.json');
const DEBUG_FILE   = path.join(AUTH_DIR, 'auth-debug.log');

async function ensureDir() {
  await fs.mkdir(AUTH_DIR, { recursive: true });
}

async function log(line: string) {
  try {
    await fs.appendFile(
      DEBUG_FILE,
      `[${new Date().toISOString()}] ${line}\n`,
      'utf8'
    );
  } catch {}
}

function normalizeProfile(raw: any): SimpleProfile | null {
  if (!raw) return null;
  const rawId = String(raw.id ?? raw.uuid ?? raw.profileId ?? '').trim();
  const id = rawId.replace(/-/g, '');
  const name = String(raw.name ?? raw.username ?? raw.profileName ?? 'Player');
  return {
    id,
    name,
    uuid: rawId || id,
    username: name,
    mclId: String(raw.mclId ?? rawId ?? id),
  };
}

/** Prépare l’environnement pour éviter l’écriture dans app.asar */
async function prepareEnv() {
  await ensureDir();

  // ▸ TEMP/TMP pour les libs qui utilisent os.tmpdir()
  process.env.TMPDIR = AUTH_DIR;
  process.env.TEMP   = AUTH_DIR;
  process.env.TMP    = AUTH_DIR;

  // ▸ Certaines implémentations regardent aussi cette var
  process.env.MSAL_CACHE_DIR = AUTH_DIR;

  // ▸ Dernier filet : cwd = AUTH_DIR
  try { process.chdir(AUTH_DIR); } catch {}

  await log(`prepareEnv -> AUTH_DIR=${AUTH_DIR} cwd=${process.cwd()}`);
}

function makeAuthflow(opts?: { forceLive?: boolean; forceSisu?: boolean }) {
  // Live → exige souvent un authTitle
  const authTitle = opts?.forceLive
    ? { value: Titles.MinecraftNintendoSwitch, deviceType: 'Win32' as const }
    : undefined;

  return new Authflow('thunder-client', {
    cacheDirectory: AUTH_DIR,
    authTitle,
  } as any);
}

/**
 * Auth Microsoft/Minecraft
 *  - auto  : essaie SISU d’abord, puis LIVE si nécessaire
 *  - sisu  : force le flux SISU
 *  - live  : force le flux LIVE (avec authTitle)
 */
export async function authenticate(opts?: { flow?: FlowMode }) {
  const flow = opts?.flow ?? 'auto';
  await prepareEnv();

  async function runSisu() {
    await log('SISU FLOW: start');
    const af = makeAuthflow({ forceSisu: true });
    const res = await af.getMinecraftJavaToken({ fetchProfile: true } as any);
    const profile = normalizeProfile(res?.profile);
    await fs.writeFile(SESSION_FILE, JSON.stringify({ ok: true, profile }, null, 2));
    await log('SISU FLOW: success');
    return { ok: true, profile };
  }

  async function runLive() {
    await log('LIVE FLOW: start');
    const af = makeAuthflow({ forceLive: true });
    const res = await af.getMinecraftJavaToken({ fetchProfile: true } as any);
    const profile = normalizeProfile(res?.profile);
    await fs.writeFile(SESSION_FILE, JSON.stringify({ ok: true, profile }, null, 2));
    await log('LIVE FLOW: success');
    return { ok: true, profile };
  }

  try {
    if (flow === 'sisu') return await runSisu();
    if (flow === 'live') return await runLive();

    // flow = auto -> SISU d'abord
    try {
      return await runSisu();
    } catch (e: any) {
      const msg = String(e?.message || e);
      await log(`SISU FAILED: ${msg}`);
      // Si l’erreur est “Forbidden 403”, on tente LIVE derrière
      if (/403|Forbidden/i.test(msg)) {
        try {
          return await runLive();
        } catch (e2: any) {
          await log(`LIVE FAILED: ${String(e2?.message || e2)}`);
          return { ok: false, error: e2?.message || String(e2) };
        }
      }
      // Erreur non liée → on essaye LIVE quand même
      try {
        return await runLive();
      } catch (e2: any) {
        await log(`LIVE FAILED: ${String(e2?.message || e2)}`);
        return { ok: false, error: e2?.message || String(e2) };
      }
    }
  } catch (e: any) {
    await log(`AUTH CRASH: ${String(e?.message || e)}`);
    return { ok: false, error: e?.message || String(e) };
  }
}

export async function status() {
  try {
    await ensureDir();
    const data = await fs.readFile(SESSION_FILE, 'utf8').catch(() => '');
    if (!data) return { ok: true, profile: null };
    const json = JSON.parse(data);
    return { ok: true, profile: json?.profile ?? null };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

export async function resetAuth() {
  try {
    await fs.rm(AUTH_DIR, { recursive: true, force: true });
    await ensureDir();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}
