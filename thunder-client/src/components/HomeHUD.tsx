'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Rocket, Settings2, Zap, Gauge, Activity, Clock, MemoryStick, Wifi, ShieldCheck,
} from 'lucide-react';

type Stat = { label: string; value: string; Icon: any; hint?: string };

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
  const [launching, setLaunching] = useState(false);

  const stats: Stat[] = [
    { label: 'Online', value: '347', Icon: Activity },
    { label: 'FPS', value: '203', Icon: Gauge },
    { label: 'Session', value: '2h 34m', Icon: Clock },
    { label: 'Memory', value: '2.5GB', Icon: MemoryStick },
    { label: 'Ping', value: '21ms', Icon: Wifi },
    { label: 'Anti-crash', value: 'On', Icon: ShieldCheck, hint: 'Safe' },
  ];

  async function onLaunch() {
    try {
      setLaunching(true);
      const res: any = await (window as any).api?.invoke('mc:launch', { version: '1.21' });
      if (!res?.ok) throw new Error(res?.error || 'Launch failed');
    } catch (e) {
      alert((e as Error).message);
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
          <Button variant="secondary" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Quick Settings
          </Button>
          <Button variant="outline" className="gap-2 border-white/20">
            <Zap className="w-4 h-4" />
            Quick Launch
          </Button>
        </CardContent>
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
          <Button
            onClick={() => (window as any).api?.invoke('auth:login')}
            className="bg-white/10 hover:bg-white/15"
          >
            Sign in
          </Button>
          <span className="text-sm text-white/60">Required for Minecraft Java.</span>
        </CardContent>
      </Card>
    </div>
  );
}
