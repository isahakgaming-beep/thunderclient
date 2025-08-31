import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import { authenticate } from './services/auth';
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
      sandbox: true,
    },
    title: 'Thunder Client',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  mainWindow.on('closed', () => (mainWindow = null));
}

// ---- Auto Update ----
function setupAutoUpdater() {
  // (optionnel) log dans la console
  autoUpdater.logger = console as any;

  autoUpdater.on('update-available', () => {
    mainWindow?.webContents.send('update:status', 'available');
  });
  autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('update:status', 'none');
  });
  autoUpdater.on('download-progress', (p) => {
    mainWindow?.webContents.send('update:progress', p.percent);
  });
  autoUpdater.on('error', (e) => {
    mainWindow?.webContents.send('update:error', String(e));
  });
  autoUpdater.on('update-downloaded', () => {
    // Installe immédiatement
    autoUpdater.quitAndInstall();
  });

  // Lance la recherche de mise à jour et notifie
  autoUpdater.checkForUpdatesAndNotify().catch((e) => console.error(e));
}

app.whenReady().then(() => {
  createWindow();
  if (!isDev) setupAutoUpdater();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ---- IPC handlers ----
ipcMain.handle('auth:login', async () => {
  try {
    const session = await authenticate();
    return { ok: true, session };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

ipcMain.handle('mc:launch', asy
