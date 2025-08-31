'use client';

import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  Home,
  UserSquare2,
  PackageCheck,
  Boxes,
  MonitorCog,
  Settings,
  ImagePlus,
  Users,
  Zap,
  Target,
  Trophy,
  Download,
  Timer,
  BarChart3,
  Globe,
} from 'lucide-react';

type NavItem = {
  icon: any;
  label: string;
  href: string;
  badge?: string;
  hint?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: 'Navigation',
    items: [
      { icon: Home,         label: 'Home',     href: '/' },
      { icon: UserSquare2,  label: 'Profiles', href: '/profiles',  badge: 'Pro' },
      { icon: PackageCheck, label: 'Versions', href: '/versions',  badge: 'Updated' },
      { icon: Boxes,        label: 'Mods',     href: '/mods' },
      { icon: MonitorCog,   label: 'HUD',      href: '/hud' },
      { icon: Settings,     label: 'Settings', href: '/settings' },
    ],
  },
  {
    title: 'Advanced Features',
    items: [{ icon: ImagePlus, label: 'In-Game Overlay', href: '/overlay', badge: 'Beta' }],
  },
  {
    title: 'Social & Network',
    items: [{ icon: Users, label: 'Friends', href: '/friends', hint: 'Live' }],
  },
  {
    title: 'Quick Actions',
    items: [
      { icon: Zap,    label: 'Performance',  href: '/performance' },
      { icon: Target, label: 'Practice Mode', href: '/practice' },
      { icon: Trophy, label: 'Leaderboard',   href: '/leaderboard' },
      { icon: Download, label: 'Downloads',   href: '/downloads' },
      { icon: Timer, label: 'Game Timer',     href: '/game-timer' },
    ],
  },
  {
    title: 'Tools & Analytics',
    items: [
      { icon: BarChart3, label: 'Statistics', href: '/statistics', badge: 'Pro' },
      { icon: Globe,     label: 'Server Browser', href: '/server-browser' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname() || '/';

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="w-64 shrink-0 h-full p-3 pr-2 bg-sidebar/80 border-r border-white/10 backdrop-blur">
      {sections.map((sec) => (
        <div key={sec.title} className="mb-5">
          <div className="px-2 pb-2 text-xs uppercase tracking-wider text-white/40">
            {sec.title}
          </div>
          <nav className="space-y-1">
            {sec.items.map((it) => {
              const Icon = it.icon;
              const active = isActive(it.href);
              return (
                <Link
                  key={it.label}
                  href={it.href}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition border',
                    active
                      ? 'bg-white/10 text-white border-white/20'
                      : 'text-white/70 hover:bg-white/5 border-transparent hover:border-white/10'
                  )}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span className="flex-1">{it.label}</span>
                  {it.badge && (
                    <Badge className="bg-purple-600/30 text-purple-200 border-purple-400/20">
                      {it.badge}
                    </Badge>
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
