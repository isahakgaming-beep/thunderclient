import { Authflow } from 'prismarine-auth';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const cacheDir = path.join(os.homedir(), '.thunder', 'auth');
const profileFile = path.join(cacheDir, 'profile.json');

/**
 * Connexion Microsoft via le flux "live" (aucune app Azure requise).
 * Compatible avec prismarine-auth 2.5.x.
 */
export async function authenticate() {
  await fs.promises.mkdir(cacheDir, { recursive: true });

  // 👉 On force le flow "live" (pas "msal" ni "device")
  const flow: any = new (Authflow as any)('thunder-client', cacheDir, {
    flow: 'live',
  });

  const result = await flow.getMinecraftJavaToken({ fetchProfile: true });

  const p = result.profile;
  if (p) {
    await fs.promises.writeFile(
      profileFile,
      JSON.stringify({ id: p.id, name: p.name }, null, 2),
      'utf8'
    );
  }
  return result;
}

export async function getSavedProfile(): Promise<{ id: string; name: string } | null> {
  try {
    const txt = await fs.promises.readFile(profileFile, 'utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}
