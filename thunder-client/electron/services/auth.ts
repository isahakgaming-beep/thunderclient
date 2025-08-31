// electron/services/auth.ts
import { app } from 'electron';
import fsp from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { Authflow, Titles } from 'prismarine-auth';

type FlowMode = 'auto' | 'sisu' | 'live';

export type SimpleProfile = {
  id: string;        // UUID sans tirets
  name: string;      // pseudo
  uuid?: string;     // UUID source (avec ou sans tirets)
  username?: string; // alias
  mclId?: string;    // alias interne si besoin
};

// ---------------------------------------------------------------------------
// Dossiers & logs
// ---------------------------------------------------------------------------

// 1) si main.ts a défini THUNDER_AUTH_DIR, on l’utilise;
// 2) sinon on tombe sur <userData>/auth-cache
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

/** Normalise le profil renvoyé par prismarine-auth/Mojang */
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
  // messages vus : "Please specify an 'authTitle' in Authflow constructor when using live flow"
  return msg.includes('authtitle') && msg.includes('live');
}

// Construit les options pour Authflow suivant le mode demandé
function buildOptions(mode: FlowMode): any {
  const base: any = { cacheDirectory: AUTH_DIR };

  if (mode === 'live') {
    // LIVE flow -> il faut un authTitle. Celui-ci marche bien pour desktop.
    base.authTitle = Titles.MinecraftNintendoSwitch;
    // certaines versions de prismarine-auth respectent aussi deviceType:
    base.deviceType = 'Win32';
  } else if (mode === 'sisu') {
    // SISU (Windows) -> forcer l’activation (nom variable selon versions => cast any)
    base.enableSisu = true as any;
  }

  return base;
}

// Tente une authentification dans un mode donné
async function tryAuth(mode: FlowMode) {
  log(`FLOW ${mode}: start`);
  const af = new Authflow('thunder-client', buildOptions(mode));
  // fetchProfile: true => renvoie le profil directement
  const mc = await af.getMinecraftJavaToken({ fetchProfile: true } as any);
  log(`FLOW ${mode}: getMinecraftJavaToken OK`);
  return mc;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/**
 * Lance l’auth Microsoft/Minecraft et retourne { ok, profile?, error? }.
 * opts.flow:
 *  - 'auto' : tente LIVE, si 403 ou authTitle manquant => fallback SISU
 *  - 'live' : force live
 *  - 'sisu' : force sisu
 */
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
      // AUTO : tente LIVE d’abord
      try {
        mc = await tryAuth('live');
      } catch (e) {
        log('AUTH LIVE FAILED', JSON.stringify(e?.toString?.() ?? e));
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

/** Retourne le dernier profil connu (sans réseau) */
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

/** Purge tout le cache d’auth (utile si ça boucle) */
export async function resetAuth() {
  try {
    await fsp.rm(AUTH_DIR, { recursive: true, force: true });
    await ensureDir();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}
