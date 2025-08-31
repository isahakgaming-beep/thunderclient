import { Authflow } from 'prismarine-auth';
import os from 'os';
import path from 'path';
import fs from 'fs';

export async function authenticate() {
  const cacheDir = path.join(os.homedir(), '.thunder', 'auth');
  fs.mkdirSync(cacheDir, { recursive: true });
  const flow = new Authflow('thunder-client', cacheDir, {
    relyingParty: 'minecraft',
    authTitle: 'Thunder Client Login',
  });
  const tokens = await flow.getMinecraftJavaToken({ fetchProfiles: true });
  return tokens; // includes mcToken, profile, etc.
}
