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

// ---- IPC ----
ipcMain.handle('ping', async () => 'pong');

ipcMain.handle('auth:status', async () => {
  const p = await getSavedProfile();
  return { ok: true, profile: p };
});

ipcMain.handle('auth:login', async () => {
  try {
    const session = await authenticate();
    return { ok: true, profile: session.profile };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

// nouveau : choix du dossier de jeu
ipcMain.handle('choose:dir', async () => {
  const res = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory']
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
