import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Télécharge un fichier via le fetch natif (Node >=18 / Electron récent)
 * et l'écrit sur le disque.
 */
export async function downloadFile(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  }

  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);

  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  await fs.promises.writeFile(dest, buf);

  return dest;
}

/**
 * Installe un mod (fichier .jar) dans le dossier mods du jeu.
 */
export async function installModIntoGame(modFileUrl: string, gameDir?: string) {
  const root = gameDir || path.join(os.homedir(), '.thunder', 'minecraft');
  const modsDir = path.join(root, 'mods');

  await fs.promises.mkdir(modsDir, { recursive: true });

  const filename = path.basename(new URL(modFileUrl).pathname);
  const dest = path.join(modsDir, filename);

  await downloadFile(modFileUrl, dest);
  return dest;
}

/**
 * Récupère la liste des versions Modrinth pour un projet donné.
 * Retourne un tableau d'objets versions (incluant "files").
 */
export async function fetchModrinthProjectFiles(projectId: string) {
  const api = `https://api.modrinth.com/v2/project/${projectId}/version`;
  const res = await fetch(api);

  if (!res.ok) {
    throw new Error(`Modrinth API failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data; // array of versions, each with .files[]
}
