// electron/main.ts
import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';

import { authenticate, status as authStatus, resetAuth } from './services/auth';
import { launchMinecraft, ensureJava } from './services/launcher';

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

/* -------------------------------------------------------------------------- */
/*  Fenêtre unique / ID app (Windows notifications / assets)                  */
/* -------------------------------------------------------------------------- */
app.setAppUserModelId('com.thunder.client');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

/* -------------------------------------------------------------------------- */
/*  Création fenêtre                                                          */
/* -------------------------------------------------------------------------- */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // on attend ready-to-show pour éviter le flash blanc
    backgroundColor: '#0b0b0f',
    title: 'Thunder Client',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: isDev,
    },
  });

  // ouverture externe des liens (sécurité)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      new URL(url); // valide l’URL
      shell.openExternal(url);
    } catch {
      // ignore urls invalides
    }
    return { action: 'deny' };
  });

  const url = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(url);

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/* -------------------------------------------------------------------------- */
/*  Bootstrap : prépare le cache d’auth dans userData (jamais dans app.asar)  */
/* -------------------------------------------------------------------------- */
app.whenReady().then(() => {
  const userData = app.getPath('userData'); // ex: C:\Users\<toi>\AppData\Roaming\Thunder Client
  const authDir = path.join(userData, 'auth-cache');
  try {
    fs.mkdirSync(authDir, { recursive: true });
  } catch (e) {
    console.error('Cannot create auth cache dir:', e);
  }

  // transmis à electron/services/auth.ts pour forcer l’emplacement du cache
  process.env.THUNDER_AUTH_DIR = authDir;

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/* -------------------------------------------------------------------------- */
/*  IPCs                                                                       */
/* -------------------------------------------------------------------------- */

/** Connexion Microsoft/Minecraft */
ipcMain.handle('auth:login', async (_e, args) => {
  // flow: 'auto' | 'sisu' | 'live'
  const flow = args?.flow ?? 'auto';
  try {
    const session = await authenticate({ flow });
    return session; // { ok: boolean, profile?, error? }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

/** Statut de session (profil mis en cache côté disque) */
ipcMain.handle('auth:status', async () => {
  try {
    return await authStatus(); // { ok: true, profile } ou { ok: false, error }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

/** Réinitialise complètement le cache d’auth (utile si ça boucle) */
ipcMain.handle('auth:reset', async () => {
  try {
    return await resetAuth(); // { ok: true } | { ok:false, error }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

/** Sélecteur de dossier (ex.: choisir/mettre à jour le .minecraft) */
ipcMain.handle('choose:dir', async () => {
  try {
    const res = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory', 'createDirectory'],
    });
    if (res.canceled || res.filePaths.length === 0) return null;
    return res.filePaths[0];
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

/** Lancement du jeu */
ipcMain.handle('mc:launch', async (_e, args) => {
  try {
    const { version, gameDir } = args || {};
    const javaPath = await ensureJava();
    const proc = await launchMinecraft({ version, gameDir, javaPath });
    return { ok: true, pid: (proc as any)?.pid };
  } catch (err: any) {
    dialog.showErrorBox('Launch failed', err?.message || String(err));
    return { ok: false, error: err?.message || String(err) };
  }
});

/** Ouvrir un chemin (logs, cache, etc.) dans l’explorateur */
ipcMain.handle('logs:open', async (_e, p: string) => {
  try {
    await shell.openPath(p);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
});

/** Ouvrir une URL explicitement demandée depuis le renderer */
ipcMain.handle('open:external', async (_e, url: string) => {
  try {
    new URL(url); // simple validation
    await shell.openExternal(url);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
});
