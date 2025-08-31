import { app, BrowserWindow, ipcMain, dialog, shell, session } from 'electron';
import path from 'path';

// Services locaux
import { authenticate, status as authStatus, resetAuth } from './services/auth';
import { launchMinecraft, ensureJava } from './services/launcher';

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

/* ---------- Single-instance ---------- */
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

/* ---------- Hardening / sécurité de base ---------- */
app.on('web-contents-created', (_event, contents) => {
  // Bloque l'ouverture de nouvelles fenêtres (target="_blank", window.open)
  contents.setWindowOpenHandler(({ url }) => {
    // ouvres les liens web externes dans le navigateur
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url).catch(() => {});
    }
    return { action: 'deny' };
  });

  // Empêche une navigation hors de l'app (clickjack, redirections)
  contents.on('will-navigate', (e, url) => {
    if (isAllowedUrl(url)) return;
    e.preventDefault();
    if (/^https?:/i.test(url)) shell.openExternal(url).catch(() => {});
  });
});

function isAllowedUrl(url: string) {
  if (url.startsWith('file://')) return true;
  if (isDev && url.startsWith('http://localhost:3000')) return true;
  return false;
}

/* ---------- Fenêtre ---------- */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false, // on montre quand “ready-to-show”
    title: 'Thunder Client',
    backgroundColor: '#0b0b0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const url = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(url).catch(() => {});

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    if (isDev) mainWindow?.webContents.openDevTools({ mode: 'detach' });
  });

  // Si un chargement échoue (p.ex. dev server pas prêt), on retente après un court délai
  mainWindow.webContents.on('did-fail-load', () => {
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.reloadIgnoringCache();
      }
    }, 800);
  });

  mainWindow.on('closed', () => (mainWindow = null));
}

app.whenReady().then(async () => {
  // Renforce par défaut : refuse toutes les permissions (caméra, micro…)
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, callback) => {
    callback(false);
  });

  // Windows : meilleur comportement icône/notifications
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.thunder.client');
  }

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/* ---------- IPCs ---------- */

// Auth
ipcMain.handle('auth:login', async (_e, args) => {
  const flow = (args?.flow as 'auto' | 'sisu' | 'live') ?? 'auto';
  try {
    const res = await authenticate({ flow });
    return res; // { ok, profile?, error? }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

ipcMain.handle('auth:status', async () => {
  try {
    return await authStatus();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

ipcMain.handle('auth:reset', async () => {
  try {
    return await resetAuth();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
});

// Choix d’un dossier (pour .minecraft custom par ex.)
ipcMain.handle('choose:dir', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Choose Minecraft game folder',
      properties: ['openDirectory', 'createDirectory'],
    });
    if (canceled || !filePaths?.length) return null;
    return filePaths[0];
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
});

// Lancement MC
ipcMain.handle('mc:launch', async (_e, args) => {
  try {
    const { version, gameDir } = args || {};
    const javaPath = await ensureJava();
    const proc = await launchMinecraft({ version, gameDir, javaPath });
    return { ok: true, pid: (proc as any)?.pid ?? null };
  } catch (err: any) {
    dialog.showErrorBox('Launch failed', err?.message || String(err));
    return { ok: false, error: err?.message || String(err) };
  }
});

// Ouvrir un chemin (logs, cache) dans l’explorateur
ipcMain.handle('logs:open', async (_e, p: string) => {
  try {
    await shell.openPath(p);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
});

/* ---------- Gestion erreurs process ---------- */
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
