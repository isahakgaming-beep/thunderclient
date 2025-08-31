import fs from 'fs';
import path from 'path';
import os from 'os';
import fetch from 'node-fetch';

// Simple Modrinth client helpers (no heavy deps)
export async function downloadFile(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Download failed: ' + res.status);
  const stream = fs.createWriteStream(dest);
  await new Promise((resolve, reject) => {
    res.body.pipe(stream);
    res.body.on('error', reject);
    stream.on('finish', resolve);
  });
}

export async function installModIntoGame(modFileUrl: string, gameDir?: string) {
  const root = gameDir || path.join(os.homedir(), '.thunder', 'minecraft');
  const modsDir = path.join(root, 'mods');
  fs.mkdirSync(modsDir, { recursive: true });
  const filename = path.basename(new URL(modFileUrl).pathname);
  const dest = path.join(modsDir, filename);
  await downloadFile(modFileUrl, dest);
  return dest;
}

export async function fetchModrinthProjectFiles(projectId: string) {
  const api = `https://api.modrinth.com/v2/project/${projectId}/version`;
  const res = await fetch(api);
  if (!res.ok) throw new Error('Modrinth API failed: ' + res.status);
  const data = await res.json();
  // return array of version objects
  return data;
}
