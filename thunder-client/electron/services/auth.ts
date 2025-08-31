import { app, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { Authflow, Titles } from 'prismarine-auth';

export type McSession = {
  token: string;
  entitlements?: any;
  profile?: { id: string; name: string };
};

// On force un dossier stable (même en dev)
const baseDir = path.join(app.getPath('appData'), 'Thunder Client');
export const cacheDir = path.join(baseDir, 'auth-cache');
const profileFile = path.join(baseDir, 'profile.json');

// TEMP : on force l’auth interactive à chaque fois pour débloquer le 403
const ALWAYS_INTERACTIVE = true;

function deviceCodeDialog(code: string, url?: string) {
  if (url) shell.openExternal(url);
  dialog.showMessageBox({
    type: 'info',
    title: 'Connexion Microsoft',
    message:
      '1) Une page Microsoft vient de s’ouvrir dans ton navigateur.\n' +
      `2) Entre ce code : ${code}\n` +
      '3) Termine la connexion, puis reviens dans Thunder Client.',
    buttons: ['OK'],
  }).catch(() => {});
}

function is403(err: any) {
  const status = err?.response?.statusCode || err?.statusCode || err?.code;
  const msg = err?.message || '';
  return status === 403 || /403/.test(String(status)) || /forbidden/i.test(msg);
}

async function purgeAuthCache() {
  await fs.promises.rm(cacheDir, { recursive: true, force: true }).catch(() => {});
  await fs.promises.mkdir(cacheDir, { recursive: true }).catch(() => {});
}

async function runFlow(): Promise<McSession> {
  await fs.promises.mkdir(baseDir, { recursive: true }).catch(() => {});
  await fs.promises.mkdir(cacheDir, { recursive: true }).catch(() => {});

  const flow = new Authflow(
    'thunder-user',
    cacheDir,
    {
      flow: 'live',
      authTitle: Titles.MinecraftJava, // obligatoire avec le flow "live"
    },
    (res) => deviceCodeDialog(res.user_code, res.verification_uri)
  );

  const mc = await flow.getMinecraftJavaToken({
    fetchEntitlements: true,
    fetchProfile: true,
  });

  if (mc.profile) {
    await fs.promises.writeFile(
      profileFile,
      JSON.stringify({ id: mc.profile.id, name: mc.profile.name }, null, 2),
      'utf8'
    ).catch(() => {});
  }

  return {
    token: mc.token,
    entitlements: mc.entitlements,
    profile: mc.profile,
  };
}

export async function authenticate(): Promise<McSession> {
  try {
    if (ALWAYS_INTERACTIVE) {
      // on purge toujours pour forcer l’ouverture de la page Microsoft
      await purgeAuthCache();
    }
    return await runFlow();
  } catch (err: any) {
    if (is403(err)) {
      await purgeAuthCache();
      await dialog.showMessageBox({
        type: 'info',
        title: 'Session refusée (403)',
        message:
          "Les serveurs Xbox/Minecraft ont refusé l'accès.\n\n" +
          "Causes courantes :\n" +
          "• Pas de gamertag Xbox → https://www.xbox.com/\n" +
          "• Compte enfant : autorisations Xbox (multijoueur/cross-network) → https://account.xbox.com/Settings\n" +
          "• Pas de licence Minecraft Java sur ce compte → https://www.minecraft.net/msaprofile\n\n" +
          "On va relancer la connexion…",
        buttons: ['OK'],
      }).catch(() => {});
      return await runFlow();
    }
    dialog.showErrorBox('Connexion Microsoft', err?.message || String(err));
    throw err;
  }
}

export async function getSavedProfile(): Promise<{ id: string; name: string } | null> {
  try {
    const txt = await fs.promises.readFile(profileFile, 'utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

export async function logout() {
  await purgeAuthCache();
  await fs.promises.rm(profileFile, { force: true }).catch(() => {});
}
