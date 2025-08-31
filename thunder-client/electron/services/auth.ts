import { Authflow } from 'prismarine-auth';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const cacheDir = path.join(os.homedir(), '.thunder', 'auth');
const profileFile = path.join(cacheDir, 'profile.json');

/** Login Microsoft via MSAL (flux supporté par prismarine-auth 2.5.x) */
export async function authenticate() {
  await fs.promises.mkdir(cacheDir, { recursive: true });

  // NB: on force 'msal' (flux supporté). Pas de 'device' ici.
  const flow: any = new (Authflow as any)('thunder-client', cacheDir, { flow: 'msal' });

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
