'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogIn } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="h-14 px-3 border-b border-white/10 bg-topbar/80 backdrop-blur flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="px-2 py-1 rounded-lg bg-white/5 font-semibold">Thunder Client</div>
        <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30">Performance</Badge>
        <span className="text-xs text-white/50 ml-2">v2.1.0</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-white/70">
        <span>FPS 219</span>
        <span>Ping 24ms</span>
        <Button
          size="sm"
          className="gap-2 bg-white/10 hover:bg-white/15"
          onClick={() => (window as any).api?.invoke('auth:login')}
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </div>
    </header>
  );
}
