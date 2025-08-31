import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client } from 'minecraft-launcher-core';
import { Authflow } from 'prismarine-auth';

export async function ensureJava(): Promise<string> {
  // simplifié : utilise le Java système
  return 'java';
}

interface LaunchArgs {
  version: string;
  gameDir?: string;
  javaPath?: string;
}

export async function launchMinecraft({ version, gameDir, javaPath }: LaunchArgs) {
  const root = gameDir || path.join(os.homedir(), '.thunder', 'minecraft');
  fs.mkdirSync(root, { recursive: true });

  const cacheDir = path.join(os.homedir(), '.thunder', 'auth');
  const flow = new Authflow('thunder-client', cacheDir);

  // fetchProfile (singulier) et champs conformes
  const { token, profile } = await flow.getMinecraftJavaToken({ fetchProfile: true });

  const launcher = new Client();

  const opts: any = {
    root,
    javaPath: javaPath || 'java',
    version: { number: version || '1.21', type: 'release' },
    memory: { max: '3G', min: '1G' },

    // Auth attendu par minecraft-launcher-core
    authorization: {
      access_token: token,
      profiles: [profile],
      selected_profile: profile
    }
  };

  // renvoie le process enfant (minecraft)
  return new Promise((resolve, reject) => {
    launcher.launch(opts)
      .then(proc => resolve(proc))
      .catch(reject);

    launcher.on('debug', (m: any) => console.log('[MC]', m));
    launcher.on('data',  (m: any) => console.log('[MC]', m));
    launcher.on('close', () => console.log('[MC] closed'));
    launcher.on('progress', (p: any) => console.log('[MC progress]', p));
  });
}
