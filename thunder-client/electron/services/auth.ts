// electron/services/auth.ts
import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { Authflow, Titles } from 'prismarine-auth';

type FlowMode = 'auto' | 'sisu' | 'live';

export type SimpleProfile = {
  id: string;          // UUID sans tirets
  name: string;        // pseudo
  uuid?: string;       // UUID avec ou sans tirets
  username?: string;   // alias de name
  mclId?: string;      // alias interne si besoin
};

const AUTH_DIR = path.join(app.getPath('userData'), 'auth-cache');
const SESSION_FILE = path.join(AUTH_DIR, 'session.json');

async function ensureDir() {
  await fs.mkdir(AUTH_DIR, { recursive: true });
}

/** Uniformise le profil renvoyé par prismarine-auth / Mojang */
function normalizeProfile(raw: any): SimpleProfile | null {
  if (!raw) return null;
  // certains tokens renvoient raw.id ou raw.uuid ou raw.profileId
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

/**
 * Lance l’auth Microsoft/Minecraft et retourne un profil minimal.
 * flow: 'auto' (défaut), 'sisu' (fallback Windows), 'live' (exige authTitle)
 */
export async function authenticate(opts?: { flow?: FlowMode }) {
  try {
    await ensureDir();
    const flow = opts?.flow ?? 'auto';

    // Pour 'live' certains environnements exigent un authTitle
    const authTitle =
      flow === 'live'
        ? { value: Titles.MinecraftNintendoSwitch, deviceType: 'Win32' }
        : undefined;

    // prismarine-auth choisit la bonne stratégie en fonction des options
    const af = new Authflow('thunder-client', {
      cacheDirectory: AUTH_DIR,
      authTitle, // undefined sauf en live
      // NB: pour forcer SISU, certaines versions utilisent { enableSisu: true }
      // On laisse en "any" pour éviter les TS breaking changes :
    } as any);

    // Récupère le token Java + profil
    const mc = await af.getMinecraftJavaToken({ fetchProfile: true } as any);

    const profile = normalizeProfile(mc?.profile);
    const payload = { ok: true, profile };

    await fs.writeFile(SESSION_FILE, JSON.stringify(payload, null, 2));
    return payload; // { ok: true, profile }
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/** Retourne le dernier profil connu (sans réseau) */
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

/** Purge tout le cache d’auth (utile si ça boucle) */
export async function resetAuth() {
  try {
    await fs.rm(AUTH_DIR, { recursive: true, force: true });
    await ensureDir();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}
