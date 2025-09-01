// electron/services/auth.ts
import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';

// On importe msmc de façon tolérante (typage any pour éviter les soucis de d.ts)
const msmc: any = require('msmc');

type FlowMode = 'auto' | 'live' | 'sisu';

export type SimpleProfile = {
  id: string;          // UUID sans tirets
  name: string;        // pseudo
  uuid?: string;       // UUID avec/sans tirets
  username?: string;   // alias
};

const AUTH_DIR = path.join(app.getPath('userData'), 'auth-cache');
const MCA_CACHE = path.join(AUTH_DIR, 'mca-cache.json');
const SESSION_FILE = path.join(AUTH_DIR, 'session.json');

async function ensureDir() {
  await fs.mkdir(AUTH_DIR, { recursive: true });
}

function normalizeProfile(raw: any): SimpleProfile | null {
  if (!raw) return null;
  // msmc expose souvent { id, name } pour le profil Java
  const rawId = String(raw.id ?? raw.uuid ?? raw.profileId ?? '').trim();
  const id = rawId.replace(/-/g, '');
  const name = String(raw.name ?? raw.username ?? raw.gamertag ?? 'Player');
  return { id, name, uuid: rawId || id, username: name };
}

function pickMsmcFlow(flow: FlowMode): 'device' | 'sisu' {
  if (flow === 'live') return 'device';
  if (flow === 'sisu') return 'sisu';
  // auto
  return process.platform === 'win32' ? 'sisu' : 'device';
}

/**
 * Authentifie l’utilisateur Microsoft/Xbox/Minecraft via MSMC,
 * avec un cache persistant et un choix explicite de flow.
 */
export async function authenticate(opts?: { flow?: FlowMode }) {
  await ensureDir();
  const uiFlow: FlowMode = (opts?.flow ?? 'auto') as FlowMode;
  const flowForMsmc = pickMsmcFlow(uiFlow);

  try {
    // MSMC: on crée un gestionnaire d’auth (sélecteur "select_account")
    const auth = new msmc.Auth('select_account');

    // On demande un token Xbox pour Minecraft **Java**
    // TitleId pour Java chez msmc :
    const TitleId = msmc.TitleId?.MinecraftJava || msmc.TitleIds?.MinecraftJava || 1717005355; // fallback

    // Options attendues par msmc
    const options = {
      flow: flowForMsmc,     // <<< IMPORTANT
      cache: MCA_CACHE,      // <<< IMPORTANT (cache hors app.asar)
    };

    // 1) Xbox token (XSTS)
    const xsts = await auth.getXboxToken(TitleId, options);
    // 2) Minecraft token Java
    const mcToken = await auth.getMinecraftToken(xsts);
    // 3) Profil Java
    const profileRaw = await auth.getProfile(mcToken);
    const profile = normalizeProfile(profileRaw);

    const payload = { ok: true, profile };
    await fs.writeFile(SESSION_FILE, JSON.stringify(payload, null, 2));

    return payload;
  } catch (e: any) {
    // On renvoie le message proprement pour l’UI
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
