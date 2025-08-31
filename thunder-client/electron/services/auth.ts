import { Authflow } from 'prismarine-auth';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const cacheDir = path.join(os.homedir(), '.thunder', 'auth');
const profileFile = path.join(cacheDir, 'profile.json');

/**
 * Lance l'auth Microsoft (ouvre le navigateur la 1re fois),
 * récupère le token + le profil et enregistre un profil léger.
 */
export async function authenticate() {
  await fs.promises.mkdir(cacheDir, { recursive: true });

  const flow = new Authflow('thunder-client', cacheDir);
  const result = await flow.getMinecraftJavaToken({ fetchProfile: true });

  // Sauvegarde un profil léger pour savoir si l'utilisateur est connecté.
  const p = result.profile;
  if (p) {
    await fs.promises.writeFile(
      profileFile,
      JSON.stringify({ id: p.id, name: p.name }, null, 2),
      'utf8'
    );
  }
  return result; // { token, profile, entitlements, certificates }
}

/** Retourne le profil sauvegardé (ou null si pas connecté). */
export async function getSavedProfile(): Promise<{ id: string; name: string } | null> {
  try {
    const txt = await fs.promises.readFile(profileFile, 'utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}
