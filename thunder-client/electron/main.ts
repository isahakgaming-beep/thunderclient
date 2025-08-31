// electron/main.ts
import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';

import { authenticate } from './services/auth';
import { launchMinecraft, ensureJava } from './services/launcher';

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

// --- fenêtre ---------------------------------------------------------------
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    title: 'Thunder Client',
  });

  const url = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(url);
  mainWindow.on('closed', () => (mainWindow = null));
}

// --- bootstrap -------------------------------------------------------------
// IMPORTANT : préparer un dossier de cache en dehors de app.asar et
// le pousser au service d’auth via une variable d’environnement.
app.whenReady().then(() => {
  const userData = app.getPath('userData'); // ex: C:\Users\<toi>\AppData\Roaming\Thunder Client
  const authDir = path.join(userData, 'auth-cache');
  try {
    fs.mkdirSync(authDir, { recursive: true });
  } catch (e) {
    // en dernier recours, on ne bloque pas l’appli
    // (mais l’auth risquerait d’échouer sans cache)
    console.error('Cannot create auth cache dir:', e);
  }

  // transmis à electron/services/auth.ts
  process.env.THUNDER_AUTH_DIR = authDir;

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// --- IPCs ------------------------------------------------------------------
ipcMain.handle('auth:login', async (_e, args) => {
  const flow = args?.flow ?? 'auto'; // 'auto' | 'sisu' | 'live'
  try {
    const session = await authenticate({ flow });
    return session; // { ok: boolean, profile?, error? ... }
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
