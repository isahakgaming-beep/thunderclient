"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Settings,
  Monitor,
  Package,
  User,
  BarChart3,
  Image,
  Globe,
  Trophy,
  Timer,
  Target,
  Zap,
  ChevronLeft,
  ChevronRight,
  Heart,
  Archive,
  Download,
  Users,
  MessageCircle,
  Layers,
  Cpu,
  Activity,
  Gamepad2,
  Star,
  Calendar,
  Network,
  Palette,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { id: "home", label: "Home", icon: Play, category: "main" },
  { id: "profiles", label: "Profiles", icon: User, category: "main", badge: "Pro" },
  { id: "versions", label: "Versions", icon: Archive, category: "main", badge: "Updated" },
  { id: "mods", label: "Mods", icon: Package, category: "main" },
  { id: "hud", label: "HUD", icon: Monitor, category: "main" },
  { id: "overlay", label: "In-Game Overlay", icon: Layers, category: "advanced", badge: "Beta" },
  { id: "friends", label: "Friends", icon: Users, category: "social", badge: "Live" },
  { id: "settings", label: "Settings", icon: Settings, category: "main" },
  { id: "stats", label: "Statistics", icon: BarChart3, category: "tools", badge: "Pro" },
  { id: "screenshots", label: "Screenshots", icon: Image, category: "media" },
  { id: "servers", label: "Server Browser", icon: Globe, category: "tools" }
]

const quickActions = [
  { id: "performance", label: "Performance", icon: Zap, color: "yellow" },
  { id: "practice", label: "Practice Mode", icon: Target, color: "purple" },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy, color: "yellow" },
  { id: "download-manager", label: "Downloads", icon: Download, color: "blue" },
  { id: "timer", label: "Game Timer", icon: Timer, color: "green" },
  { id: "fps-boost", label: "FPS Boost", icon: Activity, color: "red" }
]

interface SidebarProps {
  activeItem: string
  onActiveItemChange: (item: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({
  activeItem,
  onActiveItemChange,
  isCollapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Updated": return "bg-green-500/20 text-green-300 border-green-500/30"
      case "Pro": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "Live": return "bg-blue-500/20 text-blue-300 border-blue-500/30 animate-pulse"
      case "Beta": return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "New": return "bg-red-500/20 text-red-300 border-red-500/30"
      default: return "bg-purple-500/20 text-purple-300 border-purple-500/30"
    }
  }

  const getQuickActionColor = (color: string) => {
    switch (color) {
      case "yellow": return "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
      case "purple": return "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
      case "blue": return "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
      case "green": return "bg-green-500/20 text-green-400 hover:bg-green-500/30"
      case "red": return "bg-red-500/20 text-red-400 hover:bg-red-500/30"
      default: return "bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/30"
    }
  }

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case "performance":
        alert("Performance Mode: Optimizing game settings for maximum FPS")
        break
      case "practice":
        alert("Practice Mode: Loading practice server...")
        break
      case "leaderboard":
        alert("Opening leaderboard...")
        break
      case "download-manager":
        alert("Download Manager: Checking for updates...")
        break
      case "timer":
        alert("Game Timer: Starting session timer...")
        break
      case "fps-boost":
        alert("FPS Boost: Applying performance optimizations...")
        break
      default:
        alert(`${actionId} activated!`)
    }
  }

  return (
    <div className={cn(
      "bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header with collapse toggle */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="text-sm text-zinc-400 uppercase tracking-wide font-medium">
              Navigation
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0 text-zinc-400 hover:text-yellow-400"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <nav className="space-y-1">
          {navigationItems.filter(item => item.category === "main").map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onActiveItemChange(item.id)}
                className={cn(
                  "w-full h-10 justify-start",
                  isCollapsed ? "px-2" : "gap-3",
                  activeItem === item.id
                    ? "bg-gradient-to-r from-purple-500/20 to-yellow-500/20 text-yellow-300 border-r-2 border-yellow-500"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge className={cn("text-xs", getBadgeColor(item.badge))}>
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            )
          })}
        </nav>

        {/* Advanced Features */}
        {!isCollapsed && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-400 uppercase tracking-wide font-medium flex items-center gap-2">
              <Layers className="h-3 w-3 text-purple-400" />
              Advanced Features
            </div>
            <nav className="space-y-1">
              {navigationItems.filter(item => item.category === "advanced").map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => onActiveItemChange(item.id)}
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      activeItem === item.id
                        ? "bg-gradient-to-r from-purple-500/20 to-yellow-500/20 text-yellow-300 border-r-2 border-yellow-500"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge className={cn("text-xs", getBadgeColor(item.badge))}>
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </nav>
          </div>
        )}

        {/* Social Section */}
        {!isCollapsed && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-400 uppercase tracking-wide font-medium flex items-center gap-2">
              <MessageCircle className="h-3 w-3 text-blue-400" />
              Social & Network
            </div>
            <nav className="space-y-1">
              {navigationItems.filter(item => item.category === "social").map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => onActiveItemChange(item.id)}
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      activeItem === item.id
                        ? "bg-gradient-to-r from-purple-500/20 to-yellow-500/20 text-yellow-300 border-r-2 border-yellow-500"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge className={cn("text-xs", getBadgeColor(item.badge))}>
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </nav>
          </div>
        )}

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-400 uppercase tracking-wide font-medium flex items-center gap-2">
              <Zap className="h-3 w-3 text-yellow-400" />
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-1">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickAction(action.id)}
                    className={cn(
                      "h-16 flex flex-col gap-1 text-xs",
                      getQuickActionColor(action.color)
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-center leading-tight">{action.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Tools Section */}
        {!isCollapsed && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-400 uppercase tracking-wide font-medium flex items-center gap-2">
              <Gamepad2 className="h-3 w-3 text-green-400" />
              Tools & Analytics
            </div>
            <nav className="space-y-1">
              {navigationItems.filter(item => item.category === "tools").map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => onActiveItemChange(item.id)}
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      activeItem === item.id
                        ? "bg-gradient-to-r from-purple-500/20 to-yellow-500/20 text-yellow-300 border-r-2 border-yellow-500"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge className={cn("text-xs", getBadgeColor(item.badge))}>
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </nav>
          </div>
        )}

        {/* Media Section */}
        {!isCollapsed && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-400 uppercase tracking-wide font-medium flex items-center gap-2">
              <Palette className="h-3 w-3 text-pink-400" />
              Media & Content
            </div>
            <nav className="space-y-1">
              {navigationItems.filter(item => item.category === "media").map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => onActiveItemChange(item.id)}
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      activeItem === item.id
                        ? "bg-gradient-to-r from-purple-500/20 to-yellow-500/20 text-yellow-300 border-r-2 border-yellow-500"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>
          </div>
        )}

        {/* Collapsed icons */}
        {isCollapsed && (
          <div className="space-y-2">
            {navigationItems.filter(item => item.category !== "main").map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onActiveItemChange(item.id)}
                  className={cn(
                    "w-full h-8 p-0",
                    activeItem === item.id
                      ? "bg-gradient-to-r from-purple-500/20 to-yellow-500/20 text-yellow-300"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                  title={item.label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">Thunder Mode Active</span>
            </div>
            <div className="text-xs text-zinc-500">
              Minecraft 1.20.4 • Fabric 0.15.3
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>FPS: 247</span>
              <span>Ping: 23ms</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Activity className="h-4 w-4 text-green-400" />
          </div>
        )}
      </div>
    </div>
  )
}
