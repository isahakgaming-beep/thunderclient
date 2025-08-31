// electron/services/auth.ts
import path from 'path';
import fs from 'fs/promises';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { app } from 'electron';
import { Authflow } from 'prismarine-auth';

type Flow = 'auto' | 'sisu' | 'live';

const ROOT = app.getPath('userData');
const AUTH_DIR = path.join(ROOT, 'auth-cache');
const SESSION_FILE = path.join(AUTH_DIR, 'session.json');

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function writeJSON(file: string, data: any) {
  ensureDir(path.dirname(file));
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

async function readJSON<T = any>(file: string): Promise<T | null> {
  try {
    const txt = await fs.readFile(file, 'utf8');
    return JSON.parse(txt) as T;
  } catch {
    return null;
  }
}

export async function resetAuth() {
  try {
    rmSync(AUTH_DIR, { recursive: true, force: true });
  } catch {}
  return { ok: true };
}

export async function status() {
  const sess = await readJSON<{ id: string; name: string }>(SESSION_FILE);
  return { ok: true, profile: sess ?? null };
}

export async function authenticate(opts?: { flow?: Flow }) {
  const flow: Flow = opts?.flow ?? 'auto';

  ensureDir(AUTH_DIR);

  // IMPORTANT : authTitle requis pour le flow "live" (device code).
  // On le met tout le temps, ça ne gêne pas les autres flows.
  const options: any = {
    flow: flow === 'auto' ? 'live' : flow, // on commence par live; à toi de gérer d’autres fallback côté main si besoin
    authTitle: 'Thunder Client',          // <- règle l’erreur “Please specify an authTitle …”
    deviceType: 'Win32',                  // optionnel, mais propre sous Windows
  };

  try {
    const auth = new Authflow(undefined, AUTH_DIR, options);

    // Token + profil Minecraft Java
    const res = await auth.getMinecraftJavaToken(); // { token, entitlements, profile, certificates }

    const profile = res?.profile || {};
    const normalized = {
      id: (profile.id || profile.uuid || profile.mcId || '').toString(),
      name: (profile.name || profile.username || 'Player').toString(),
    };

    await writeJSON(SESSION_FILE, normalized);

    return {
      ok: true,
      profile: normalized,
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}
