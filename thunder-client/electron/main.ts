import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import { authenticate, getSavedProfile } from './services/auth';
import { launchMinecraft, ensureJava } from './services/launcher';

const isDev = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    title: 'Thunder Client',
  });

  if (isDev) mainWindow.loadURL('http://localhost:3000');
  else mainWindow.loadFile(path.join(__dirname, '../out/index.html'));

  // mainWindow.webContents.openDevTools({ mode: 'detach' });
  mainWindow.on('closed', () => (mainWindow = null));
}

function setupAutoUpdater() {
  autoUpdater.logger = console as any;
  autoUpdater.on('update-downloaded', () => autoUpdater.quitAndInstall());
  autoUpdater.checkForUpdatesAndNotify().catch(console.error);
}

app.whenReady().then(() => {
  createWindow();
  if (!isDev) setupAutoUpdater();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// util: promesse avec timeout
function withTimeout<T>(p: Promise<T>, ms = 180_000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('LOGIN_TIMEOUT')), ms);
    p.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

// IPC
ipcMain.handle('auth:status', async () => {
  const p = await getSavedProfile();
  return { ok: true, profile: p };
});

ipcMain.handle('auth:login', async () => {
  try {
    // IMPORTANT : on laisse prismarine-auth ouvrir l’URL MSAL lui-même.
    const session = await withTimeout(authenticate(), 180_000);
    return { ok: true, profile: session.profile };
  } catch (err: any) {
    if ((err?.message || String(err)) === 'LOGIN_TIMEOUT') {
      return { ok: false, error: 'Login timed out. Close the browser and try again.' };
    }
    return { ok: false, error: err?.message || String(err) };
  }
});

ipcMain.handle('choose:dir', async () => {
  const r = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
  });
  return r.canceled ? null : r.filePaths[0];
});

ipcMain.handle('mc:launch', async (_e, args) => {
  try {
    const saved = await getSavedProfile();
    if (!saved) return { ok: false, code: 'SIGN_IN_REQUIRED', error: 'Please sign in first.' };

    const { version, gameDir } = args || {};
    const javaPath = await ensureJava();
    const proc = await launchMinecraft({ version, gameDir, javaPath });
    return { ok: true, pid: (proc as any)?.pid };
  } catch (err: any) {
    dialog.showErrorBox('Launch failed', err?.message || String(err));
    return { ok: false, error: err?.message || String(err) };
  }
});
