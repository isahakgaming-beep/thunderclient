import { app, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { Authflow, Titles } from 'prismarine-auth';

export type McSession = {
  token: string;
  entitlements?: any;
  profile?: { id: string; name: string };
};

// Répertoire de cache (tokens, profile)
export const cacheDir = path.join(app.getPath('userData'), 'auth-cache');
const profileFile = path.join(cacheDir, 'profile.json');

/**
 * Connexion Microsoft (flow "live") avec authTitle = Minecraft Java.
 * -> Pas besoin de créer une app Azure.
 * -> Device-code : on ouvre la page et on affiche le code à saisir.
 */
export async function authenticate(): Promise<McSession> {
  await fs.promises.mkdir(cacheDir, { recursive: true });

  const flow = new Authflow(
    'thunder-user',
    cacheDir,
    {
      flow: 'live',
      authTitle: Titles.MinecraftJava,
    },
    (res) => {
      // Ouvre le navigateur et affiche le code à l’utilisateur
      if (res.verification_uri) shell.openExternal(res.verification_uri);
      dialog
        .showMessageBox({
          type: 'info',
          title: 'Connexion Microsoft',
          message:
            'Pour connecter ton compte Microsoft :\n\n' +
            '1) Une page vient de s’ouvrir dans ton navigateur.\n' +
            `2) Entre ce code : ${res.user_code}\n` +
            '3) Termine la connexion, puis reviens dans Thunder Client.',
          buttons: ['OK'],
        })
        .catch(() => {});
    }
  );

  const mc = await flow.getMinecraftJavaToken({
    fetchEntitlements: true,
    fetchProfile: true,
  });

  if (mc.profile) {
    await fs.promises.writeFile(
      profileFile,
      JSON.stringify({ id: mc.profile.id, name: mc.profile.name }, null, 2),
      'utf8'
    );
  }

  return {
    token: mc.token,
    entitlements: mc.entitlements,
    profile: mc.profile,
  };
}

/** Lecture du profil sauvegardé (utilisé par main.ts avant le launch). */
export async function getSavedProfile(): Promise<{ id: string; name: string } | null> {
  try {
    const txt = await fs.promises.readFile(profileFile, 'utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}
