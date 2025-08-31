import path from 'path';
import { app } from 'electron';
import { Client, Authenticator } from 'minecraft-launcher-core';
import { cacheDir } from './auth';

/**
 * Chemin Java : version simple. (On pourra ajouter un téléchargement Temurin plus tard.)
 */
export async function ensureJava(): Promise<string> {
  // Essaie d'utiliser "java" depuis le PATH
  return 'java';
}

type LaunchArgs = {
  version?: string;
  gameDir?: string;
  javaPath?: string;
  username?: string; // si pas d’auth Microsoft encore branchée, fallback offline
};

/**
 * Lance Minecraft avec minecraft-launcher-core.
 */
export async function launchMinecraft(args: LaunchArgs = {}) {
  const launcher = new Client();

  const root =
    args.gameDir ||
    path.join(app.getPath('appData'), '.minecraft');

  const javaPath = args.javaPath || (await ensureJava());
  const version = args.version || '1.21';

  // OFFLINE temporaire (remplacera par auth MS quand on aura le token ici)
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
