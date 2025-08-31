"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { HUDConfig } from "@/components/HUDConfig"
import { MicrosoftAuth } from "@/components/MicrosoftAuth"
import { ModpackManager } from "@/components/ModpackManager"
import { VersionManager } from "@/components/VersionManager"
import { FriendNetwork } from "@/components/FriendNetwork"
import { InGameOverlay } from "@/components/InGameOverlay"
import {
  Play,
  Settings2,
  Download,
  Clock,
  Users,
  Zap,
  Shield,
  Monitor,
  Gamepad2,
  Trophy,
  Target,
  Timer,
  Heart,
  Package,
  Archive,
  Layers,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Activity,
  Star,
  ChevronRight,
  ExternalLink,
  Pause,
  RotateCw,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react"

interface MainContentProps {
  activeSection: string
}

interface LaunchConfig {
  version: string
  modLoader: string
  modsCount: number
  javaMemory: string
  javaVersion: string
  profile: string
}

interface SystemStats {
  fps: number
  memory: { used: number; total: number }
  cpu: number
  gpu: number
  ping: number
}

export function MainContent({ activeSection }: MainContentProps) {
  const [isLaunching, setIsLaunching] = useState(false)
  const [progress, setProgress] = useState(0)
  const [launchStage, setLaunchStage] = useState("")
  const [selectedProfile, setSelectedProfile] = useState("Optimized")
  const [quickLaunchEnabled, setQuickLaunchEnabled] = useState(true)

  const [launchConfig, setLaunchConfig] = useState<LaunchConfig>({
    version: "1.20.4",
    modLoader: "Fabric 0.15.3",
    modsCount: 15,
    javaMemory: "6GB",
    javaVersion: "Java 17",
    profile: "Thunder Optimized"
  })

  const [systemStats, setSystemStats] = useState<SystemStats>({
    fps: 0,
    memory: { used: 2.1, total: 16 },
    cpu: 0,
    gpu: 0,
    ping: 0
  })

  // Simulate real-time system stats
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        fps: Math.floor(Math.random() * 50) + 200, // 200-250 FPS
        memory: {
          used: Math.random() * 2 + 1.5, // 1.5-3.5 GB
          total: prev.memory.total
        },
        cpu: Math.floor(Math.random() * 20) + 5, // 5-25%
        gpu: Math.floor(Math.random() * 30) + 40, // 40-70%
        ping: Math.floor(Math.random() * 20) + 15 // 15-35ms
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleLaunch = async () => {
    setIsLaunching(true)
    setProgress(0)
    setLaunchStage("Initializing launcher...")

    const stages = [
      "Verifying game files...",
      "Loading mods and configurations...",
      "Starting Java Virtual Machine...",
      "Connecting to authentication servers...",
      "Loading game assets...",
      "Initializing Minecraft..."
    ]

    for (let i = 0; i < stages.length; i++) {
      setLaunchStage(stages[i])
      await new Promise(resolve => setTimeout(resolve, 1200))
      setProgress(((i + 1) / stages.length) * 100)
    }

    setLaunchStage("Game launched successfully!")
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLaunching(false)
    setProgress(0)
    setLaunchStage("")
  }

  const handleQuickSettings = () => {
    // Open quick settings modal
    alert("Quick Settings: Adjust performance, graphics, and mod settings on the fly")
  }

  const handleProfileChange = (profile: string) => {
    setSelectedProfile(profile)
    // Update launch config based on profile
    const configs = {
      "Optimized": {
        version: "1.20.4",
        modLoader: "Fabric 0.15.3",
        modsCount: 15,
        javaMemory: "6GB",
        javaVersion: "Java 17",
        profile: "Thunder Optimized"
      },
      "Performance": {
        version: "1.20.4",
        modLoader: "Fabric 0.15.3",
        modsCount: 8,
        javaMemory: "4GB",
        javaVersion: "Java 17",
        profile: "High Performance"
      },
      "Vanilla": {
        version: "1.20.4",
        modLoader: "Vanilla",
        modsCount: 0,
        javaMemory: "2GB",
        javaVersion: "Java 17",
        profile: "Vanilla Experience"
      }
    }
    setLaunchConfig(configs[profile as keyof typeof configs])
  }

  const renderHomeContent = () => {
    const features = [
      { icon: Zap, title: "Performance Boost", desc: "Up to 3x better FPS with advanced optimizations", color: "yellow" },
      { icon: Shield, title: "Anti-Cheat Safe", desc: "Fully compliant with all major servers", color: "green" },
      { icon: Monitor, title: "Custom HUD", desc: "Personalized overlays and information displays", color: "purple" },
      { icon: Target, title: "PVP Enhanced", desc: "Competitive features for better gameplay", color: "red" }
    ]

    const getFeatureColor = (color: string) => {
      switch (color) {
        case "yellow": return "from-yellow-500/20 to-yellow-600/20 text-yellow-400"
        case "green": return "from-green-500/20 to-green-600/20 text-green-400"
        case "purple": return "from-purple-500/20 to-purple-600/20 text-purple-400"
        case "red": return "from-red-500/20 to-red-600/20 text-red-400"
        default: return "from-purple-500/20 to-yellow-500/20 text-yellow-400"
      }
    }

    return (
      <div className="space-y-6">
        {/* Launch Section */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600/20 via-yellow-400/10 to-purple-600/20 border border-yellow-500/30 p-8">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    Optimized
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-yellow-300 to-purple-300 bg-clip-text text-transparent">
                  Ready to Thunder?
                </h1>
                <p className="text-zinc-400 text-lg">
                  Launch Minecraft with enhanced performance and competitive features
                </p>
              </div>

              {/* Profile Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-sm text-zinc-400">Profile:</span>
                <select
                  value={selectedProfile}
                  onChange={(e) => handleProfileChange(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="Optimized">Thunder Optimized</option>
                  <option value="Performance">High Performance</option>
                  <option value="Vanilla">Vanilla Experience</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={handleLaunch}
                disabled={isLaunching}
                size="lg"
                className="bg-gradient-to-r from-purple-600 via-yellow-500 to-purple-600 hover:from-purple-700 hover:via-yellow-600 hover:to-purple-700 text-white font-semibold px-8 py-3 h-auto"
              >
                {isLaunching ? (
                  <>
                    <RotateCw className="mr-2 h-5 w-5 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Launch Minecraft
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-yellow-500/30 text-yellow-300 hover:text-white hover:bg-yellow-500/10"
                onClick={handleQuickSettings}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Quick Settings
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-500/10"
                onClick={() => setQuickLaunchEnabled(!quickLaunchEnabled)}
              >
                {quickLaunchEnabled ? <CheckCircle className="mr-2 h-4 w-4" /> : <AlertCircle className="mr-2 h-4 w-4" />}
                Quick Launch
              </Button>
            </div>

            {isLaunching && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 flex items-center gap-2">
                    <Activity className="h-4 w-4 animate-pulse" />
                    {launchStage}
                  </span>
                  <span className="text-zinc-200">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            )}
          </div>

          {/* Background decoration */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Online</div>
                  <div className="text-xl font-semibold">347</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Activity className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-sm text-zinc-400">FPS</div>
                  <div className="text-xl font-semibold">{systemStats.fps}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Session</div>
                  <div className="text-xl font-semibold">2h 34m</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MemoryStick className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Memory</div>
                  <div className="text-xl font-semibold">{systemStats.memory.used.toFixed(1)}GB</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Wifi className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Ping</div>
                  <div className="text-xl font-semibold">{systemStats.ping}ms</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Authentication Section */}
        <MicrosoftAuth />

        {/* Features Grid */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Thunder Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer"
                    onClick={() => alert(`Learn more about ${feature.title}`)}
                  >
                    <div className={`p-2 bg-gradient-to-br ${getFeatureColor(feature.color)} rounded-lg`}>
                      <Icon className={`h-5 w-5 ${feature.color === 'yellow' ? 'text-yellow-400' :
                                                  feature.color === 'green' ? 'text-green-400' :
                                                  feature.color === 'red' ? 'text-red-400' : 'text-purple-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-zinc-100 mb-1">{feature.title}</h4>
                      <p className="text-sm text-zinc-400">{feature.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-500" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Current Profile Info */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              Current Profile
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                {selectedProfile}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Minecraft Version:</span>
                  <span className="text-zinc-100">{launchConfig.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Mod Loader:</span>
                  <span className="text-zinc-100">{launchConfig.modLoader}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Active Mods:</span>
                  <span className="text-yellow-400 font-medium">{launchConfig.modsCount} mods</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Java Memory:</span>
                  <span className="text-zinc-100">{launchConfig.javaMemory} allocated</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Performance:</span>
                  <span className="text-yellow-400">Optimized</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Anti-Cheat:</span>
                  <span className="text-green-400">Compatible</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Java Version:</span>
                  <span className="text-purple-400">{launchConfig.javaVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Quick Launch:</span>
                  <span className={quickLaunchEnabled ? "text-green-400" : "text-zinc-400"}>
                    {quickLaunchEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800 flex gap-2">
              <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-300">
                <Settings2 className="h-4 w-4 mr-2" />
                Configure Profile
              </Button>
              <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-300">
                <Archive className="h-4 w-4 mr-2" />
                Backup Profile
              </Button>
              <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-300">
                <ExternalLink className="h-4 w-4 mr-2" />
                Export Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return renderHomeContent()
      case "hud":
        return <HUDConfig />
      case "mods":
        return <ModpackManager />
      case "versions":
        return <VersionManager />
      case "friends":
        return <FriendNetwork />
      case "overlay":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Layers className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">In-Game Overlay System</h2>
              <p className="text-zinc-400 mb-6">
                Advanced overlay system for real-time mod settings and texture pack management during gameplay
              </p>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-6">
                Beta Feature - Now Available
              </Badge>
            </div>
            <InGameOverlay />
          </div>
        )
      case "profiles":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Profile Management</h2>
                <p className="text-zinc-400">Create and manage multiple game profiles</p>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-yellow-500">
                <Trophy className="h-4 w-4 mr-2" />
                Create Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Thunder Optimized", "High Performance", "Vanilla Experience"].map((profile, index) => (
                <Card key={profile} className="bg-zinc-900 border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">{profile}</h3>
                      {profile === selectedProfile && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 mb-3">
                      {profile === "Thunder Optimized" ? "Balanced performance and features" :
                       profile === "High Performance" ? "Maximum FPS optimization" :
                       "Pure Minecraft experience"}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        {profile === selectedProfile ? "Current" : "Switch"}
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Thunder Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-zinc-100">General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Quick Launch</span>
                    <Button variant="ghost" size="sm" onClick={() => setQuickLaunchEnabled(!quickLaunchEnabled)}>
                      {quickLaunchEnabled ? <CheckCircle className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4 text-zinc-500" />}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Auto-Updates</span>
                    <Button variant="ghost" size="sm">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Close to System Tray</span>
                    <Button variant="ghost" size="sm">
                      <AlertCircle className="h-4 w-4 text-zinc-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-zinc-100">Performance Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-zinc-300 text-sm">Java Memory Allocation</label>
                    <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white">
                      <option>2GB</option>
                      <option>4GB</option>
                      <option selected>6GB</option>
                      <option>8GB</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-zinc-300 text-sm">JVM Arguments</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm"
                      placeholder="-XX:+UseG1GC -XX:+ParallelRefProcEnabled"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "stats":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Statistics & Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">247h</div>
                  <div className="text-zinc-400">Total Playtime</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">189</div>
                  <div className="text-zinc-400">Games Played</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">{systemStats.fps}</div>
                  <div className="text-zinc-400">Average FPS</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "screenshots":
        return (
          <div className="text-center py-20">
            <Monitor className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Screenshot Gallery</h2>
            <p className="text-zinc-400 mb-6">Capture and manage your best Minecraft moments</p>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Download className="h-4 w-4 mr-2" />
              Open Screenshots Folder
            </Button>
          </div>
        )
      case "servers":
        return (
          <div className="text-center py-20">
            <Heart className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Server Browser</h2>
            <p className="text-zinc-400 mb-6">Quick connect to your favorite Minecraft servers</p>
            <Button className="bg-gradient-to-r from-red-600 to-pink-600">
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse Servers
            </Button>
          </div>
        )
      default:
        return renderHomeContent()
    }
  }

  return (
    <div className="flex-1 p-6">
      {renderContent()}
    </div>
  )
}
