"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Minimize2,
  Square,
  X,
  Zap,
  ChevronDown,
  LogOut,
  UserCircle,
  Settings,
  Trophy,
  Moon,
  Sun,
  LogIn,
  Activity,
  Shield,
  Star,
  Bell,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react"

interface UserProfile {
  name: string
  premium: boolean
  stats: {
    gamesPlayed: number
    hoursPlayed: number
    level: number
  }
}

interface TopBarProps {
  onToggleDarkMode?: () => void
  isDarkMode?: boolean
}

interface SystemStatus {
  connected: boolean
  fps: number
  ping: number
  serverStatus: "online" | "maintenance" | "offline"
}

export function TopBar({ onToggleDarkMode, isDarkMode = true }: TopBarProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    connected: true,
    fps: 247,
    ping: 23,
    serverStatus: "online"
  })
  const [notifications, setNotifications] = useState(2)

  useEffect(() => {
    // Check for stored authentication
    const savedAuth = localStorage.getItem('thunder-auth')
    if (savedAuth) {
      try {
        const profile = JSON.parse(savedAuth)
        setUser({
          name: profile.name,
          premium: profile.premium,
          stats: {
            gamesPlayed: profile.uhcStats?.gamesPlayed || 189,
            hoursPlayed: Math.floor((profile.uhcStats?.gamesPlayed || 189) * 1.3),
            level: Math.floor((profile.uhcStats?.wins || 89) / 10) + 1
          }
        })
      } catch (error) {
        // Handle invalid stored data
      }
    }

    // Listen for auth changes
    const handleStorageChange = () => {
      const auth = localStorage.getItem('thunder-auth')
      if (auth) {
        const profile = JSON.parse(auth)
        setUser({
          name: profile.name,
          premium: profile.premium,
          stats: {
            gamesPlayed: profile.uhcStats?.gamesPlayed || 189,
            hoursPlayed: Math.floor((profile.uhcStats?.gamesPlayed || 189) * 1.3),
            level: Math.floor((profile.uhcStats?.wins || 89) / 10) + 1
          }
        })
      } else {
        setUser(null)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Simulate real-time system status
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        fps: Math.floor(Math.random() * 50) + 200, // 200-250 FPS
        ping: Math.floor(Math.random() * 20) + 15, // 15-35ms
        connected: Math.random() > 0.05 // 95% uptime
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('thunder-auth')
    setUser(null)
  }

  const handleMinimize = () => {
    alert("Minimize to system tray")
  }

  const handleMaximize = () => {
    alert("Toggle fullscreen")
  }

  const handleClose = () => {
    if (confirm("Are you sure you want to close Thunder Client?")) {
      alert("Closing application...")
    }
  }

  const getConnectionStatus = () => {
    if (!systemStatus.connected) return { color: "text-red-400", icon: WifiOff, text: "Offline" }
    if (systemStatus.serverStatus === "maintenance") return { color: "text-yellow-400", icon: AlertCircle, text: "Maintenance" }
    return { color: "text-green-400", icon: Wifi, text: "Online" }
  }

  const getStatusIcon = () => {
    const status = getConnectionStatus()
    const IconComponent = status.icon
    return <IconComponent className={`h-4 w-4 ${status.color}`} />
  }

  return (
    <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-purple-500 via-yellow-400 to-purple-600 rounded-md">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-purple-400 via-yellow-400 to-purple-500 bg-clip-text text-transparent">
            Thunder Client
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
            v2.1.0
          </div>
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
            Performance
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* System Status */}
        <div className="hidden md:flex items-center gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-green-400" />
            <span>{systemStatus.fps} FPS</span>
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <span>{systemStatus.ping}ms</span>
          </div>
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-zinc-400 hover:text-yellow-400 relative"
          onClick={() => alert("Notifications: 2 new updates available")}
        >
          <Bell className="h-4 w-4" />
          {notifications > 0 && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
              {notifications}
            </div>
          )}
        </Button>

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleDarkMode}
          className="h-8 w-8 p-0 text-zinc-400 hover:text-yellow-400"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* User Profile or Login */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-zinc-300 hover:text-white px-3 py-1 rounded hover:bg-zinc-800">
              <Avatar className="h-6 w-6 border border-yellow-400/50">
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-yellow-500 text-white text-xs">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{user.name}</span>
                  {user.premium && (
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  )}
                </div>
                <span className="text-xs text-yellow-400">
                  Level {user.stats.level} • {user.stats.hoursPlayed}h played
                </span>
              </div>
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 w-48">
              <DropdownMenuItem className="text-zinc-300 hover:text-white">
                <UserCircle className="h-4 w-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-zinc-300 hover:text-white">
                <Trophy className="h-4 w-4 mr-2 text-yellow-400" />
                Statistics
              </DropdownMenuItem>
              <DropdownMenuItem className="text-zinc-300 hover:text-white">
                <Shield className="h-4 w-4 mr-2 text-green-400" />
                Account Security
              </DropdownMenuItem>
              <DropdownMenuItem className="text-zinc-300 hover:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-zinc-300 hover:text-red-400"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            onClick={() => alert("Redirecting to Microsoft login...")}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        )}

        {/* Window Controls */}
        <div className="flex ml-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-blue-500/20"
            onClick={handleMinimize}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-green-500/20"
            onClick={handleMaximize}
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400 hover:bg-red-500/20"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
