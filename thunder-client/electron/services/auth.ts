import { app, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { Authflow, Titles } from 'prismarine-auth';

export type McSession = {
  token: string;
  entitlements?: any;
  profile?: { id: string; name: string };
};

// Dossiers stables (dev/prod)
const baseDir = path.join(app.getPath('appData'), 'Thunder Client');
const cacheDir = path.join(baseDir, 'auth-cache');
const profileFile = path.join(baseDir, 'profile.json');
const debugFile = path.join(baseDir, 'auth-debug.log');

// fetch natif (Node 18+/Electron)
const gfetch: typeof globalThis.fetch = (globalThis as any).fetch;

// Force un login interactif à chaque tentative
const ALWAYS_INTERACTIVE = true;

async function log(line: string, obj?: any) {
  const txt =
    `[${new Date().toISOString()}] ${line}` +
    (obj ? ` ${JSON.stringify(obj)}` : '') +
    '\n';
  await fs.promises.mkdir(baseDir, { recursive: true }).catch(() => {});
  await fs.promises.appendFile(debugFile, txt).catch(() => {});
}

function deviceCodeDialog(code: string, url?: string) {
  if (url) shell.openExternal(url);
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Connexion Microsoft',
      message:
        '1) Une page Microsoft vient de s’ouvrir dans ton navigateur.\n' +
        `2) Entre ce code : ${code}\n` +
        '3) Termine la connexion, puis reviens dans Thunder Client.',
      buttons: ['OK'],
    })
    .catch(() => {});
}

async function purgeAuthCache() {
  await fs.promises.rm(cacheDir, { recursive: true, force: true }).catch(() => {});
  await fs.promises.mkdir(cacheDir, { recursive: true }).catch(() => {});
}

function explain403(where: string) {
  return (
    `403 Forbidden pendant: ${where}\n\n` +
    `Causes fréquentes:\n` +
    `• Pas de gamertag Xbox → https://www.xbox.com/\n` +
    `• Compte enfant: autorisations multijoueur/cross-network → https://account.xbox.com/Settings\n` +
    `• Pas de licence Minecraft: Java sur ce compte → https://www.minecraft.net/msaprofile\n\n` +
    `Log: ${debugFile}`
  );
}

async function finalizeFromToken(token: string): Promise<McSession> {
  const bearer = `Bearer ${token}`;

  // Entitlements (licence)
  await log('Step B: fetch entitlements START');
  const entRes = await gfetch('https://api.minecraftservices.com/entitlements/mcstore', {
    headers: {
      Authorization: bearer,
      Accept: 'application/json'
    }
  });
  const entTxt = await entRes.text();
  await log(`Step B: entitlements status=${entRes.status} body=${entTxt.slice(0, 600)}`);

  if (entRes.status === 403) {
    await dialog.showErrorBox(
      'Accès refusé (403) – Entitlements',
      explain403('entitlements (licence)')
    );
    throw new Error('403 on entitlements');
  }
  if (!entRes.ok) {
    await dialog.showErrorBox('Erreur entitlements', `status=${entRes.status}\n${entTxt}`);
    throw new Error(`Entitlements failed: ${entRes.status}`);
  }
  const entJson = entTxt ? JSON.parse(entTxt) : undefined;

  // Profil (pseudo/UUID)
  await log('Step C: fetch profile START');
  const profRes = await gfetch('https://api.minecraftservices.com/minecraft/profile', {
    headers: {
      Authorization: bearer,
      Accept: 'application/json'
    }
  });
  const profTxt = await profRes.text();
  await log(`Step C: profile status=${profRes.status} body=${profTxt.slice(0, 600)}`);

  if (profRes.status === 403) {
    await dialog.showErrorBox(
      'Accès refusé (403) – Profile',
      explain403('minecraft/profile (pseudo)')
    );
    throw new Error('403 on profile');
  }
  if (!profRes.ok) {
    await dialog.showErrorBox('Erreur profile', `status=${profRes.status}\n${profTxt}`);
    throw new Error(`Profile failed: ${profRes.status}`);
  }
  const profJson = profTxt ? JSON.parse(profTxt) : undefined;

  if (profJson?.name && profJson?.id) {
    await fs.promises
      .writeFile(profileFile, JSON.stringify({ id: profJson.id, name: profJson.name }, null, 2), 'utf8')
      .catch(() => {});
  }

  return { token, entitlements: entJson, profile: profJson };
}

async function tryLiveFlow(): Promise<McSession> {
  await log('LIVE FLOW: start');
  if (ALWAYS_INTERACTIVE) {
    await log('LIVE FLOW: purge cache');
    await purgeAuthCache();
  }

  const flow = new Authflow(
    'thunder-user',
    cacheDir,
    {
      flow: 'live',
      authTitle: Titles.MinecraftJava, // requis pour “live”
    },
    (res) => deviceCodeDialog(res.user_code, res.verification_uri)
  );

  await log('Step A (LIVE): getMinecraftJavaToken START');
  const mcBas
