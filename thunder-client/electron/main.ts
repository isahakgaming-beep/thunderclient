// electron/main.ts
import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';

import { launchMinecraft, ensureJava } from './services/launcher';
// ⚠️ NE PAS importer auth ici : on le fera dynamiquement dans l’IPC
// import { authenticate, status as authStatus, resetAuth } from './services/auth';

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
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

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      new URL(url);
      shell.openExternal(url);
    } catch {}
    return { action: 'deny' };
  });

  const url = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(url);
  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.on('closed', () => (mainWindow = null));
}

/* --------------------------- bootstrap & cache ---------------------------- */
app.whenReady().then(() => {
  const userData = app.getPath('userData');                 // ex: ...\Roaming\Thunder Client
  const authDir  = path.join(userData, 'auth-cache');

  try { fs.mkdirSync(authDir, { recursive: true }); } catch (e) {
    console.error('Cannot create auth cache dir:', e);
  }

  // 1) Transmettre au service d’auth (utilisé par prismarine-auth)
  process.env.THUNDER_AUTH_DIR = authDir;

  // 2) Forcer le répertoire de travail LÀ où on peut écrire.
  //    Certaines libs MSAL/MDX prennent "process.cwd()" pour y créer *_mca-cache.json.
  try {
    process.chdir(authDir);
  } catch (e) {
    console.warn('process.chdir(authDir) failed:', e);
  }

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/* --------------------------------- IPCs ---------------------------------- */

// Auth: on importe dynamiquement pour être sûr que le CWD/env sont déjà en place.
ipcMain.handle('auth:login', async (_e, args) => {
  const flow = args?.flow ?? 'auto';
  try {
    // import paresseux
    const { authenticate } = require('./services/auth');
    const session = await authenticate({ flow });
    return session; // { ok, profile? , error? }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

ipcMain.handle('auth:status', async () => {
  try {
    const { status } = require('./services/auth');
    return await status();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

ipcMain.handle('auth:reset', async () => {
  try {
    const { resetAuth } = require('./services/auth');
    return await resetAuth();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

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

ipcMain.handle('logs:open', async (_e, p: string) => {
  try {
    await shell.openPath(p);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
});

ipcMain.handle('open:external', async (_e, url: string) => {
  try {
    new URL(url);
    await shell.openExternal(url);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
});
