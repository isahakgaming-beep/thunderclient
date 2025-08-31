import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client } from 'minecraft-launcher-core';
import { Authflow } from 'prismarine-auth';
import { spawn } from 'child_process';

export async function ensureJava(): Promise<string> {
  // Very naive: assume system Java is available in PATH; could extend to download Temurin
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

  // Reuse auth cache
  const cacheDir = path.join(os.homedir(), '.thunder', 'auth');
  const flow = new Authflow('thunder-client', cacheDir, { relyingParty: 'minecraft' });
  const { mcToken, profile } = await flow.getMinecraftJavaToken({ fetchProfiles: true });

  const launcher = new Client();
  const opts: any = {
    authorization: {
      access_token: mcToken,
      profiles: [profile],
      selected_profile: profile,
    },
    root: root,
    version: {
      number: version,
      type: 'release'
    },
    memory: {
      max: '3G',
      min: '1G',
    },
    javaPath: javaPath || 'java',
    // Custom JVM args can be added here
  };

  return new Promise((resolve, reject) => {
    let child: any;
    launcher.launch(opts)
      .then(proc => {
        child = proc;
        resolve(proc);
      })
      .catch(reject);

    launcher.on('debug', (e: any) => console.log('[MC]', e));
    launcher.on('data', (e: any) => console.log('[MC]', e));
    launcher.on('close', () => console.log('[MC] closed'));
    launcher.on('progress', (p: any) => console.log('[MC progress]', p));
  });
}
