import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { authenticate } from './services/auth';
import { launchMinecraft, ensureJava } from './services/launcher';

const isDev = !app.isPackaged; // remplace electron-is-dev

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

  const url = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(url);
  // if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  mainWindow.on('closed', () => (mainWindow = null));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC handlers
ipcMain.handle('auth:login', async (_e) => {
  try {
    const session = await authenticate();
    return { ok: true, session };
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
    dialog.showErrorBox('Launch failed', err?.message || String(err) );
    return { ok: false, error: err?.message || String(err) };
  }
});

// Mod installation: expects { projectId, versionId?, gameDir? }
ipcMain.handle('mods:install', async (_e, args) => {
  try {
    const { projectId, versionId, gameDir } = args || {};
    // require pour compat CommonJS du build
    const modService = require('./services/mods');
    const versions = await modService.fetchModrinthProjectFiles(projectId);

    let chosen = versions[0];
    if (versionId) {
      const found = versions.find((v: any) => v.id === versionId);
      if (found) chosen = found;
    }

    const file =
      (chosen.files || []).find(
        (f: any) => f.filename && f.filename.endsWith('.jar')
      ) || (chosen.files && chosen.files[0]);

    if (!file) throw new Error('No jar file found for mod');

    const url = file.url || file.filename;
    const dest = await modService.installModIntoGame(url, gameDir);
    return { ok: true, path: dest };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});
