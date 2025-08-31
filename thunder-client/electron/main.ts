import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
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

// ---- Auto Update ----
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

// Utilitaire : promesse avec timeout
function withTimeout<T>(p: Promise<T>, ms = 120_000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('LOGIN_TIMEOUT')), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

// ---- IPC ----
ipcMain.handle('ping', async () => 'pong');

ipcMain.handle('auth:status', async () => {
  const p = await getSavedProfile();
  return { ok: true, profile: p };
});

ipcMain.handle('auth:login', async () => {
  try {
    // “Réveil” du navigateur : si pour une raison X l’ouverture auto traîne,
    // on ouvre au moins la home Microsoft. L’auth réelle est gérée par prismarine-auth.
    shell.openExternal('https://login.live.com/');

    // Lancement du flux MS + profil, avec timeout (2 min)
    const session = await withTimeout(authenticate(), 120_000);
    return { ok: true, profile: session.profile };
  } catch (err: any) {
    if (String(err?.message || err) === 'LOGIN_TIMEOUT') {
      return {
        ok: false,
        error: 'Login timed out. Complete the Microsoft sign-in in your browser, then try again.',
      };
    }
    return { ok: false, error: err?.message || String(err) };
  }
});

// Choisir le dossier de jeu
ipcMain.handle('choose:dir', async () => {
  const res = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
  });
  return res.canceled ? null : res.filePaths[0];
});

ipcMain.handle('mc:launch', async (_e, args) => {
  try {
    const saved = await getSavedProfile();
    if (!saved) {
      return { ok: false, code: 'SIGN_IN_REQUIRED', error: 'Please sign in first.' };
    }
    const { version, gameDir } = args || {};
    const javaPath = await ensureJava();
    const proc = await launchMinecraft({ version, gameDir, javaPath });
    return { ok: true, pid: (proc as any)?.pid };
  } catch (err: any) {
    dialog.showErrorBox('Launch failed', err?.message || String(err));
    return { ok: false, error: err?.message || String(err) };
  }
});
