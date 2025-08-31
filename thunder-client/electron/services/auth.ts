import { Authflow } from 'prismarine-auth';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const cacheDir = path.join(os.homedir(), '.thunder', 'auth');
const profileFile = path.join(cacheDir, 'profile.json');

export type DeviceCodeCb = (info: { userCode: string; verificationUri: string }) => void;

/**
 * Auth Microsoft via "Device Code Flow".
 * - onDeviceCode: callback appelé pour afficher le code à l'utilisateur
 */
export async function authenticate(onDeviceCode?: DeviceCodeCb) {
  await fs.promises.mkdir(cacheDir, { recursive: true });

  // NB: "flow" et "deviceCodeCallback" sont passés en 'any' pour éviter
  // d'être bloqué par les types; prismarine-auth les reconnaît à l'exécution.
  const flow: any = new (Authflow as any)('thunder-client', cacheDir, {
    flow: 'device',
    deviceCodeCallback: (res: any) => {
      // res.userCode      -> code à entrer
      // res.verificationUri -> https://microsoft.com/devicelogin
      onDeviceCode?.({ userCode: res.userCode, verificationUri: res.verificationUri });
    },
  });

  const result = await flow.getMinecraftJavaToken({ fetchProfile: true });

  const p = result.profile;
  if (p) {
    await fs.promises.writeFile(
      profileFile,
      JSON.stringify({ id: p.id, name: p.name }, null, 2),
      'utf8'
    );
  }
  return result;
}

export async function getSavedProfile(): Promise<{ id: string; name: string } | null> {
  try {
    const txt = await fs.promises.readFile(profileFile, 'utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}
