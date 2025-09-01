'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Rocket, Settings2, Zap, Gauge, Activity, Clock, MemoryStick, Wifi, ShieldCheck,
  FolderOpen, X,
} from 'lucide-react';

type Stat = { label: string; value: string; Icon: any; hint?: string };
type SavedProfile = { id: string; name: string } | null;

const LS_KEY_DIR = 'thunder.gameDir';
const LS_KEY_FLOW = 'thunder.authFlow';

function StatCard({ label, value, Icon, hint }: Stat) {
  return (
    <Card className="bg-elev/60 border-white/5 hover:border-white/10 transition">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5">
          <Icon className="w-5 h-5 opacity-80" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-white/60">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
        {hint && <div className="text-xs text-white/50">{hint}</div>}
      </CardContent>
    </Card>
  );
}

export default function HomeHUD() {
  const api: any = (typeof window !== 'undefined' && (window as any).api) || null;

  const [launching, setLaunching] = useState(false);
  const [signing, setSigning] = useState(false);
  const [profile, setProfile] = useState<SavedProfile>(null);
  const [gameDir, setGameDir] = useState<string | null>(null);

  // ← NEW: flow
  const [flow, setFlow] = useState<'auto' | 'live' | 'sisu'>('auto');

  useEffect(() => {
    const savedDir = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY_DIR) : null;
    if (savedDir) setGameDir(savedDir);

    const savedFlow = typeof window !== 'undefined' ? (localStorage.getItem(LS_KEY_FLOW) as any) : null;
    if (savedFlow === 'live' || savedFlow === 'sisu' || savedFlow === 'auto') {
      setFlow(savedFlow);
    }

    (async () => {
      try {
        const res = await api?.invoke?.('auth:status');
        if (res?.ok) setProfile(res.profile || null);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(LS_KEY_FLOW, flow);
  }, [flow]);

  const stats: Stat[] = [
    { label: 'Online', value: '347', Icon: Activity },
    { label: 'FPS', value: '203', Icon: Gauge },
    { label: 'Session', value: '2h 34m', Icon: Clock },
    { label: 'Memory', value: '2.5GB', Icon: MemoryStick },
    { label: 'Ping', value: '21ms', Icon: Wifi },
    { label: 'Anti-crash', value: 'On', Icon: ShieldCheck, hint: 'Safe' },
  ];

  async function onSignIn() {
    if (!api) return alert('Bridge IPC indisponible.');
    setSigning(true);
    try {
      // >>>>>>>>>> IMPORTANT: on envoie le flow choisi au main
      const res = await api.invoke('auth:login', { flow });
      if (!res?.ok) return alert(res?.error || 'Login failed');
      setProfile(res.profile ? { id: res.profile.id, name: res.profile.name } : null);
    } catch (e: any) {
      alert(e?.message || 'Login failed');
    } finally {
      setSigning(false);
    }
  }

  async function onChooseDir() {
    if (!api) return alert('Bridge IPC indisponible.');
    try {
      const dir = await api.invoke('choose:dir');
      if (dir) {
        setGameDir(dir);
        localStorage.setItem(LS_KEY_DIR, dir);
      }
    } catch (e: any) {
      alert(e?.message || 'Cannot select folder');
    }
  }

  function onClearDir() {
    setGameDir(null);
    if (typeof window !== 'undefined') localStorage.removeItem(LS_KEY_DIR);
  }

  async function onLaunch() {
    if (!api) return alert('Bridge IPC indisponible.');
    setLaunching(true);
    try {
      const res = await api.invoke('mc:launch', {
        version: '1.21',
        gameDir: gameDir || undefined,
      });
      if (!res?.ok) {
        if (res?.code === 'SIGN_IN_REQUIRED') alert('Please sign in with your Microsoft account first.');
        else alert(res?.error || 'Launch failed');
        return;
      }
    } catch (e: any) {
      alert(e?.message || 'Launch failed');
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* HERO */}
      <Card className="bg-gradient-to-br from-violet-600/15 via-indigo-500/10 to-transparent border-white/10">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30">Optimized</Badge>
            <span className="text-sm text-white/60">Performance</span>
            {profile ? (
              <Badge className="ml-2 bg-white/10 text-white/80 border-white/20">Signed in: {profile.name}</Badge>
            ) : null}

            {/* >>> Select du flow */}
            <div className="ml-auto flex items-center gap-2 text-sm text-white/70">
              <span className="opacity-70">Auth flow</span>
              <select
                value={flow}
                onChange={(e) => setFlow(e.target.value as any)}
                className="bg-white/10 border border-white/10 rounded-md px-2 py-1 outline-none"
              >
                <option value="auto">auto</option>
                <option value="live">live</option>
                <option value="sisu">sisu</option>
              </select>
            </div>
          </div>

          <CardTitle className="text-2xl md:text-3xl font-bold">
            Ready to <span className="text-violet-300">Thunder</span>?
          </CardTitle>
          <p className="text-white/60">Launch Minecraft with enhanced performance and competitive features.</p>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={onLaunch}
            disabled={launching}
            className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
          >
            <Rocket className="w-4 h-4" />
            {launching ? 'Launching…' : 'Launch Minecraft'}
          </Button>

          <Button variant="secondary" className="gap-2" onClick={onChooseDir}>
            <FolderOpen className="w-4 h-4" />
            {gameDir ? 'Change Game Folder' : 'Choose Game Folder'}
          </Button>

          {gameDir && (
            <Button variant="outline" className="gap-2 border-white/20" onClick={onClearDir}>
              <X className="w-4 h-4" />
              Clear Folder
            </Button>
          )}

          <Button variant="outline" className="gap-2 border-white/20" onClick={onLaunch}>
            <Zap className="w-4 h-4" />
            Quick Launch
          </Button>
        </CardContent>

        {gameDir && (
          <div className="px-6 pb-4 text-xs text-white/60">
            Using game folder:&nbsp;<span className="text-white/80">{gameDir}</span>
          </div>
        )}
      </Card>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* MICROSOFT AUTH */}
      <Card className="border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Microsoft Authentication</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Button onClick={onSignIn} disabled={signing} className="bg-white/10 hover:bg-white/15">
            {signing ? 'Signing in…' : profile ? `Signed in: ${profile.name}` : 'Sign in'}
          </Button>
          <span className="text-sm text-white/60">Required for Minecraft Java.</span>
        </CardContent>
      </Card>
    </div>
  );
}
