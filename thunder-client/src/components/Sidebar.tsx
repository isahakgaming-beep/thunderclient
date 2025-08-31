'use client';

import { Badge } from '@/components/ui/badge';
import {
  Home, UserSquare2, PackageCheck, Boxes, MonitorCog, Settings,
  ImagePlus, Users, Zap, Target, Trophy, Download, Timer, BarChart3, Globe
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

const sections = [
  {
    title: 'Navigation',
    items: [
      { icon: Home, label: 'Home' },
      { icon: UserSquare2, label: 'Profiles', badge: 'Pro' },
      { icon: PackageCheck, label: 'Versions', badge: 'Updated' },
      { icon: Boxes, label: 'Mods' },
      { icon: MonitorCog, label: 'HUD' },
      { icon: Settings, label: 'Settings' },
    ],
  },
  {
    title: 'Advanced Features',
    items: [{ icon: ImagePlus, label: 'In-Game Overlay', badge: 'Beta' }],
  },
  {
    title: 'Social & Network',
    items: [{ icon: Users, label: 'Friends', hint: 'Live' }],
  },
  {
    title: 'Quick Actions',
    items: [
      { icon: Zap, label: 'Performance' },
      { icon: Target, label: 'Practice Mode' },
      { icon: Trophy, label: 'Leaderboard' },
      { icon: Download, label: 'Downloads' },
      { icon: Timer, label: 'Game Timer' },
    ],
  },
  {
    title: 'Tools & Analytics',
    items: [{ icon: BarChart3, label: 'Statistics', badge: 'Pro' }, { icon: Globe, label: 'Server Browser' }],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 h-full p-3 pr-2 bg-sidebar/80 border-r border-white/10 backdrop-blur">
      {sections.map((sec) => (
        <div key={sec.title} className="mb-5">
          <div className="px-2 pb-2 text-xs uppercase tracking-wider text-white/40">{sec.title}</div>
          <nav className="space-y-1">
            {sec.items.map((it) => {
              const Icon = it.icon;
              return (
                <Link
                  key={it.label}
                  href="#"
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                    'hover:bg-white/5 transition border border-transparent hover:border-white/10'
                  )}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span className="flex-1">{it.label}</span>
                  {it.badge && (
                    <Badge className="bg-purple-600/30 text-purple-200 border-purple-400/20">{it.badge}</Badge>
                  )}
                  {it.hint && <span className="text-xs text-emerald-400">{it.hint}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}
