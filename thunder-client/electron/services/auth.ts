// electron/services/auth.ts
import { app, shell, dialog } from "electron";
import fs from "fs/promises";
import path from "path";
// ⬇️ Prismarine-Auth
import { Authflow, Titles } from "prismarine-auth";

// -------- Types minimalistes que l’UI consomme --------
export type SimpleProfile = {
  id: string;          // UUID sans tirets
  name: string;        // pseudo
  uuid?: string;       // UUID avec ou sans tirets
  username?: string;   // alias de name
  mclId?: string;      // alias interne si besoin
};

type FlowMode = "auto" | "sisu" | "live";

// -------- Chemins (toujours hors .asar) --------
const USER_DATA = app.getPath("userData");                // …\AppData\Roaming\Thunder Client
const AUTH_DIR = path.join(USER_DATA, "auth-cache");      // …\auth-cache
const SESSION_FILE = path.join(AUTH_DIR, "session.json");

// Petit helper
async function ensureDir() {
  await fs.mkdir(AUTH_DIR, { recursive: true });
}

// Uniformise le profil
function normalizeProfile(raw: any): SimpleProfile | null {
  if (!raw) return null;
  const rawId = String(raw.id ?? raw.uuid ?? raw.profileId ?? "").trim();
  const id = rawId.replace(/-/g, "");
  const name = String(raw.name ?? raw.username ?? raw.profileName ?? "Player");
  return {
    id,
    name,
    uuid: rawId || id,
    username: name,
    mclId: String(raw.mclId ?? rawId ?? id),
  };
}

// Log debug (consultable via DevTools / console ou en ajoutant un writeFile si besoin)
function logDebug(...args: any[]) {
  // eslint-disable-next-line no-console
  console.log("[auth]", ...args);
}

/**
 * Auth Microsoft/Minecraft.
 * - On force **le cache en second argument** d'Authflow (ancienne signature 100% supportée)
 *   => évite l’écriture dans resources\app.asar\… (lecture seule) et donc l’ENOENT.
 * - flow:
 *    - 'auto' (par défaut) -> laisse Authflow choisir
 *    - 'live' -> exige un authTitle (on en passe un sûr)
 *    - 'sisu' -> Windows SISU (Authflow le gère en interne)
 */
export async function authenticate(opts?: { flow?: FlowMode }) {
  await ensureDir();
  const flow = opts?.flow ?? "auto";

  try {
    // Quelques options « sûres » ; pour 'live' on force un titre MS acceptable
    const useAuthTitle =
      flow === "live"
        ? { value: Titles.MinecraftNintendoSwitch, deviceType: "Win32" }
        : undefined;

    // ⬇️⚠️ POINT CLÉ : on passe AUTH_DIR **en 2e argument**
    //    Signature legacy: new Authflow(msaClientIdOrMode, cacheDir, options?)
    //    Ici on met "select_account" (comportement standard MSAL).
    const af: any = new (Authflow as unknown as any)(
      "select_account",
      AUTH_DIR,
      { authTitle: useAuthTitle } as any
    );

    logDebug("Authflow ready with cache:", AUTH_DIR, "flow:", flow);

    // Récupération du token Java + profil
    const java = await af.getMinecraftJavaToken({ fetchProfile: true } as any);
    const profile = normalizeProfile(java?.profile);
    const payload = { ok: true, profile };

    await fs.writeFile(SESSION_FILE, JSON.stringify(payload, null, 2));
    logDebug("Auth OK for:", profile?.name, profile?.id);
    return payload;
  } catch (e: any) {
    logDebug("Auth ERROR:", e?.message || String(e));
    return { ok: false, error: e?.message || String(e) };
  }
}

/** Retourne le dernier profil (hors réseau) */
export async function status() {
  try {
    await ensureDir();
    const data = await fs.readFile(SESSION_FILE, "utf8").catch(() => "");
    if (!data) return { ok: true, profile: null };
    const json = JSON.parse(data);
    return { ok: true, profile: json?.profile ?? null };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/** Purge tout le cache d’auth (utile si ça boucle) */
export async function resetAuth() {
  try {
    await fs.rm(AUTH_DIR, { recursive: true, force: true });
    await ensureDir();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

// Bonus utilitaires (facultatifs) pour ouvrir le dossier de cache depuis l’UI
export async function openAuthFolder() {
  try {
    await ensureDir();
    await shell.openPath(AUTH_DIR);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

export async function showDeviceLoginHint() {
  // Si tu veux afficher une aide utilisateur quand MS demande un « code » :
  await dialog.showMessageBox({
    type: "info",
    title: "Microsoft Login",
    message:
      "Si une fenêtre « code de connexion » s’ouvre, colle le code affiché puis valide.",
  });
}
