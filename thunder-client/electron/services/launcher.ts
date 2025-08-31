import path from 'path';
import { app } from 'electron';
import { Client, Auth } from 'minecraft-launcher-core';
import { cacheDir } from './auth';

/**
 * Chemin Java : version simple. Si tu veux, on pourra ajouter
 * un téléchargement auto (Temurin) plus tard.
 */
export async function ensureJava(): Promise<string> {
  // On tente "java" depuis le PATH.
  // (Améliorable : télécharger un JRE dans path.join(cacheDir, 'runtime', 'java'))
  return 'java';
}

type LaunchArgs = {
  version?: string;
  gameDir?: string;
  javaPath?: string;
  username?: string; // si pas de login, on peut fallback en offline
};

/**
 * Lance Minecraft avec minecraft-launcher-core.
 * Retourne le process spawné (pour récupérer le pid dans main.ts).
 */
export async function launchMinecraft(args: LaunchArgs = {}) {
  const launcher = new Client();

  const root =
    args.gameDir ||
    path.join(app.getPath('appData'), '.minecraft'); // dossier .minecraft par défaut

  const javaPath = args.javaPath || (await ensureJava());
  const version = args.version || '1.21';

  // Si tu es connecté via Microsoft côté main/auth, tu peux injecter l’auth ici.
  // En attendant, on met un offline au besoin (à remplacer plus tard par l’auth MS).
  const authorization = Auth.offline(args.username || 'Player');

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
    launcher.on('progress', (_: any) => {});

    // Événement émis quand le process Java est spawné
    launcher.on('spawn', (proc: any) => resolve(proc));
  });
}
