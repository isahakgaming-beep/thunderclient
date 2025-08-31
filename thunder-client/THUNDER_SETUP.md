# Thunder Client — Functional MVP

This turns the SAME.ai Next.js UI into a **real desktop launcher** using **Electron + prismarine-auth + minecraft-launcher-core**.

## What works
- Microsoft login (device-code) via prismarine-auth.
- Download + launch vanilla Minecraft Java by version number (e.g. `1.21`, `1.20.4`).
- Basic memory settings and game directory management (defaults to `~/.thunder/minecraft`).

## Not yet implemented
- Anti-cheat, FPS mods, in-game overlays, cosmetics, friends — these are **non-trivial** and outside a launcher’s scope. They require a custom modded client and kernel-level drivers in some cases. See the roadmap below.

## Dev setup

```bash
# Install Node 18+ and a working Java (Temurin 17+ recommended)
# Install deps
bun install # or: npm install / pnpm install / yarn

# Run UI + Electron together
bun run build:electron && bun run electron:dev
# or with npm:
npm run build:electron && npm run electron:dev
```

In production:

```bash
bun run build
bun run build:electron
bun run electron:build
```

## Notes
- The launcher uses your system Java (`java` on PATH). Edit `electron/services/launcher.ts` to download/ship a JRE if desired.
- Authentication cache is stored in `~/.thunder/auth`.

## Roadmap towards “Badlion-like”
1. **Mod loader integration**: add Fabric/Quilt install, Modrinth/CurseForge API for modpacks.
2. **Custom client distribution**: ship a curated modpack with performance mods (Sodium/Iris/Lithium) and HUD/Keystrokes. This is where “client features” live — not the launcher.
3. **Cosmetics**: your own cape/hat system via a mod + backend that serves player cosmetics by UUID.
4. **Overlays & friends**: an in-game mod that connects to your service (WebSocket) for party/chat/overlay.
5. **Anti-cheat**: deep research and legal review; true anti-cheat requires a kernel/driver + server-side heuristics. Out of scope for a quick iteration.

---

This MVP is a clean starting point: **login → select version → launch**.


## Windows build instructions

To build a Windows .exe/installer locally or on a Windows machine/CI:
1. On Windows: install Node 18+, Git, and Java 17+.
2. Clone repo, run `npm install`.
3. Run `npm run build:electron` then `npm run electron:build` (or `npm run build:win`).
4. On Linux, building a Windows installer requires `wine` and `mono` and `osslsigncode`. Using a Windows CI runner (GitHub Actions) is recommended.

If you want, provide me a GitHub repo and I can give you a sample GitHub Actions workflow to automatically build Windows executables on push and attach the artifact.
