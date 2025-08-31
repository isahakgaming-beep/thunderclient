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
  const mcBasic = await flow.getMinecraftJavaToken({
    fetchEntitlements: false,
    fetchProfile: false,
  });
  await log('Step A (LIVE): token OK');

  return finalizeFromToken(mcBasic.token);
}

async function trySisuFlow(): Promise<McSession> {
  await log('SISU FLOW: start');
  // on repart propre
  await purgeAuthCache();

  // Pas d’authTitle nécessaire en SISU
  const flow = new Authflow('thunder-user', cacheDir, { flow: 'sisu' });

  await log('Step A (SISU): getMinecraftJavaToken START');
  const mcBasic = await flow.getMinecraftJavaToken({
    fetchEntitlements: false,
    fetchProfile: false,
  });
  await log('Step A (SISU): token OK');

  return finalizeFromToken(mcBasic.token);
}

export async function authenticate(): Promise<McSession> {
  await log('===== NEW AUTH ATTEMPT (with SISU fallback) =====');

  // 1) LIVE (device code)
  try {
    const session = await tryLiveFlow();
    await log('AUTH SUCCESS via LIVE');
    return session;
  } catch (errLive: any) {
    await log('AUTH LIVE FAILED', { message: errLive?.message });

    // 2) SISU (navigateur)
    dialog.showMessageBox({
      type: 'info',
      title: 'Connexion Microsoft',
      message:
        'La première méthode de connexion a échoué. On va essayer une autre méthode.\n' +
        'Une fenêtre de connexion système peut s’ouvrir (SISU).',
    }).catch(() => {});

    try {
      const session = await trySisuFlow();
      await log('AUTH SUCCESS via SISU');
      return session;
    } catch (errSisu: any) {
      await log('AUTH SISU FAILED', { message: errSisu?.message });

      const msg = (errSisu?.message || '').toString();
      if (/403/.test(msg)) {
        dialog.showErrorBox(
          'Accès refusé (403) – Microsoft/Xbox',
          'Les serveurs Xbox/Minecraft ont refusé l’accès.\n\n' +
          'Vérifie :\n' +
          '• Gamertag Xbox créé : https://www.xbox.com/\n' +
          '• Autorisations multijoueur/cross-network : https://account.xbox.com/Settings\n' +
          '• Ouvre le lanceur officiel Minecraft une fois (profil provisionné)\n' +
          '• Heure Windows synchronisée\n\n' +
          `Log détaillé : ${debugFile}`
        );
      } else {
        dialog.showErrorBox('Connexion Microsoft', msg);
      }
      throw errSisu;
    }
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
  await log('LOGOUT: cache & profile cleared');
}
