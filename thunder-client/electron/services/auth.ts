import { Authflow } from 'prismarine-auth';
import os from 'os';
import path from 'path';
import fs from 'fs';

export async function authenticate() {
  const cacheDir = path.join(os.homedir(), '.thunder', 'auth');
  fs.mkdirSync(cacheDir, { recursive: true });

  // Pas d'options exotiques : reste compatible avec les types
  const flow = new Authflow('thunder-client', cacheDir);

  // Option correcte : fetchProfile (singulier)
  const result = await flow.getMinecraftJavaToken({ fetchProfile: true });
  return result; // { token, entitlements, profile, certificates }
}
