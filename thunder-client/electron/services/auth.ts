// Service d'authentification Microsoft / Xbox / Minecraft (flow "live" + device code)
// Fonctionne sans enregistrer d'app Azure. Nécessite prismarine-auth >= 2.6.

import { app, dialog, shell } from 'electron';
import path from 'path';
import { Authflow, Titles } from 'prismarine-auth';

export type McSession = {
  token: string;
  entitlements?: any;
  profile?: { id: string; name: string };
};

export async function authenticate(): Promise<McSession> {
  // Répertoire où prismarine-auth mettra le cache des tokens
  const cacheDir = path.join(app.getPath('userData'), 'auth-cache');

  // IMPORTANT : flow "live" + authTitle = Minecraft Java
  const flow = new Authflow(
    'thunder-user',            // identifiant de cache (peu importe, mais stable)
    cacheDir,
    {
      flow: 'live',
      authTitle: Titles.MinecraftJava,  // << clé qui résout ton erreur
      // deviceType / deviceVersion sont facultatifs
    },
    // Callback device-code : on affiche le code et on ouvre le navigateur
    (res) => {
      // Ouvre la page officielle Microsoft où entrer le code
      shell.openExternal(res.verification_uri);
      dialog.showMessageBox({
        type: 'info',
        title: 'Connexion Microsoft',
        message:
          'Pour connecter ton compte Microsoft :\n\n1) Une page vient de s’ouvrir dans ton navigateur.\n2) Entre ce code : ' +
          res.user_code +
          '\n3) Termine la connexion, puis reviens dans Thunder Client.',
        buttons: ['OK'],
      });
    }
  );

  // Récupère le token Minecraft Java + profil
  const mc = await flow.getMinecraftJavaToken({
    fetchEntitlements: true,
    fetchProfile: true,
  });

  return {
    token: mc.token,
    entitlements: mc.entitlements,
    profile: mc.profile,
  };
}
