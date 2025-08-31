import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client } from 'minecraft-launcher-core';
import { Authflow } from 'prismarine-auth';
import { cacheDir } from './auth';

export async function ensureJava(): Promise<string> {
  // Simple pour l’instant : utilise le Java système
  return 'java';
}

interface LaunchArgs {
  version: string;
  gameDir?: string;
  javaPath?: string;
}

export async function launchMinecraft({ version, gameDir, javaPath }: LaunchArgs) {
  const root = gameDir || path.join(os.homedir(), '.thunder', 'minecraft');
  await fs.promises.mkdir(root, { recursive: true });

  // Utilise les credentials déjà enregistrés (sinon Authflow fera un refresh silencieux)
  const flow = new Authflow('thunder-client', cacheDir);
  const { token, profile } = await flow.getMinecraftJavaToken({ fetchProfile: true });

  // Format d'auth compatible minecraft-launcher-core
  const authorization = {
    access_token: token,
    client_token: '',
    uuid: profile?.id,
    name: profile?.name,
    user_properties: {},
    meta: { type: 'msa', demo: false, xuid: '', clientId: '' }
  };

  const launcher = new Client();
  const opts: any = {
    root,
    javaPath: javaPath || 'java',
    version: { number: version || '1.21', type: 'release' },
    memory: { max: '3G', min: '1G' },
    authorization
  };

  return launcher.launch(opts);
}
