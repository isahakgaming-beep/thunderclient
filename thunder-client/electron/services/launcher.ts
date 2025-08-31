import path from 'path';
import { app } from 'electron';
import { Client, Authenticator } from 'minecraft-launcher-core';

/**
 * Retourne un chemin Java. Version simple : on tente "java" depuis le PATH.
 * (Tu pourras remplacer par un téléchargement Temurin plus tard.)
 */
export async function ensureJava(): Promise<string> {
  return 'java';
}

type LaunchArgs = {
  version?: string;
  gameDir?: string;
  javaPath?: string;
  username?: string; // fallback offline
};

/**
 * Lance Minecraft avec minecraft-launcher-core.
 * Renvoie le process spawné (pour récupérer le pid côté main.ts).
 */
export async function launchMinecraft(args: LaunchArgs = {}) {
  const launcher = new Client();

  const root =
    args.gameDir ||
    path.join(app.getPath('appData'), '.minecraft');

  const javaPath = args.javaPath || (await ensureJava());
  const version = args.version || '1.21';

  // Auth offline temporaire (en attendant l’injection du vrai token MS)
  const authorization = Authenticator.getAuth(args.username || 'Player');

  const options: any = {
    authorization,
    root,
    version: {
      number: version,
      type: 'release',
    },
    memory: {
      max: '2G',
      min: '1G',
    },
    javaPath,
  };

  return new Promise<any>((resolve, reject) => {
    launcher.launch(options).catch(reject);

    launcher.on('debug', (m: any) => console.log('[MC DEBUG]', m));
    launcher.on('data', (m: any) => console.log('[MC]', m));
    launcher.on('error', (e: any) => reject(e));

    // Émis quand le process Java se lance
    launcher.on('spawn', (proc: any) => resolve(proc));
  });
}
