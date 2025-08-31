'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Rocket, Settings2, Zap, Gauge, Activity, Clock, MemoryStick, Wifi, ShieldCheck, FolderOpen, X,
} from 'lucide-react';

type Stat = { label: string; value: string; Icon: any; hint?: string };
type SavedProfile = { id: string; name: string } | null;

const LS_KEY_DIR = 'thunder.gameDir';

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

  useEffect(() => {
    // charge l'état initial
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY_DIR) : null;
    if (saved) setGameDir(saved);
    (async () => {
      try {
        const res = await api?.invoke?.('auth:status');
        if (res?.ok) setProfile(res.profile || null);
      } catch {}
    })();
  }, []);

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
      const res = await api.invoke('auth:login');
      if (!res?.ok) return alert(res?.error || 'Login failed');
      setProfile(res.profile ? { id: res.profile.id, name: res.profile.name } : null);
      alert(`Signed in as ${res.profile?.name || 'Player'}`);
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
        el
