"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Layers,
  Settings,
  Palette,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Gamepad2,
  Monitor,
  Cpu,
  MemoryStick,
  Network,
  Zap,
  Target,
  Crosshair,
  Mouse,
  Keyboard,
  Timer,
  Heart,
  Shield,
  Sword,
  MessageCircle,
  Users,
  Globe,
  X,
  Minimize2,
  Maximize2,
  RotateCw,
  Download,
  Upload,
  Image as ImageIcon,
  FolderOpen,
  Star,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  Sliders
} from "lucide-react"

interface OverlayModule {
  id: string
  name: string
  description: string
  category: "hud" | "performance" | "visual" | "audio" | "input"
  enabled: boolean
  settings: OverlaySetting[]
  position?: { x: number; y: number }
  visible: boolean
}

interface OverlaySetting {
  id: string
  name: string
  type: "toggle" | "slider" | "dropdown" | "color" | "keybind"
  value: string | number | boolean
  min?: number
  max?: number
  options?: string[]
  description?: string
}

interface TexturePack {
  id: string
  name: string
  author: string
  version: string
  resolution: string
  category: "pvp" | "uhc" | "aesthetic" | "performance"
  preview: string
  size: string
  enabled: boolean
  downloaded: boolean
  rating: number
  downloads: number
}

const overlayModules: OverlayModule[] = [
  {
    id: "fps-display",
    name: "FPS Counter",
    description: "Real-time frame rate display",
    category: "performance",
    enabled: true,
    visible: true,
    position: { x: 10, y: 10 },
    settings: [
      { id: "show-fps", name: "Show FPS", type: "toggle", value: true },
      { id: "fps-color", name: "Text Color", type: "color", value: "#FFFF00" },
      { id: "font-size", name: "Font Size", type: "slider", value: 16, min: 10, max: 32 }
    ]
  },
  {
    id: "keystrokes",
    name: "Keystrokes Display",
    description: "Show WASD and mouse click inputs",
    category: "input",
    enabled: true,
    visible: true,
    position: { x: 10, y: 100 },
    settings: [
      { id: "show-wasd", name: "Show WASD", type: "toggle", value: true },
      { id: "show-mouse", name: "Show Mouse", type: "toggle", value: true },
      { id: "key-style", name: "Key Style", type: "dropdown", value: "modern", options: ["classic", "modern", "minimal"] },
      { id: "opacity", name: "Opacity", type: "slider", value: 0.8, min: 0.1, max: 1.0 }
    ]
  },
  {
    id: "armor-status",
    name: "Armor Status",
    description: "Display armor durability and protection",
    category: "hud",
    enabled: true,
    visible: true,
    position: { x: 10, y: 200 },
    settings: [
      { id: "show-durability", name: "Show Durability", type: "toggle", value: true },
      { id: "show-protection", name: "Show Protection", type: "toggle", value: false },
      { id: "warning-threshold", name: "Warning Threshold", type: "slider", value: 20, min: 5, max: 50 }
    ]
  },
  {
    id: "uhc-timer",
    name: "UHC Timer",
    description: "Track UHC game phases and timing",
    category: "hud",
    enabled: true,
    visible: true,
    position: { x: 400, y: 10 },
    settings: [
      { id: "show-phases", name: "Show Game Phases", type: "toggle", value: true },
      { id: "auto-detect", name: "Auto-detect UHC", type: "toggle", value: true },
      { id: "alert-sounds", name: "Phase Alert Sounds", type: "toggle", value: true }
    ]
  },
  {
    id: "coordinates",
    name: "Coordinates Display",
    description: "Show current player position",
    category: "hud",
    enabled: false,
    visible: false,
    settings: [
      { id: "show-xyz", name: "Show X Y Z", type: "toggle", value: true },
      { id: "show-biome", name: "Show Biome", type: "toggle", value: false },
      { id: "show-direction", name: "Show Direction", type: "toggle", value: true }
    ]
  }
]

const texturePacks: TexturePack[] = [
  {
    id: "thunder-pvp",
    name: "Thunder PvP Pack",
    author: "ThunderTeam",
    version: "1.2.0",
    resolution: "16x16",
    category: "pvp",
    preview: "/api/placeholder/128/128",
    size: "2.1 MB",
    enabled: true,
    downloaded: true,
    rating: 4.9,
    downloads: 34520
  },
  {
    id: "uhc-pro",
    name: "UHC Pro Enhanced",
    author: "UHC Community",
    version: "2.5.1",
    resolution: "32x32",
    category: "uhc",
    preview: "/api/placeholder/128/128",
    size: "8.7 MB",
    enabled: false,
    downloaded: true,
    rating: 4.7,
    downloads: 18934
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    author: "CleanDesigns",
    version: "1.0.3",
    resolution: "16x16",
    category: "performance",
    preview: "/api/placeholder/128/128",
    size: "1.8 MB",
    enabled: false,
    downloaded: false,
    rating: 4.5,
    downloads: 12456
  }
]

export function InGameOverlay() {
  const [modules, setModules] = useState(overlayModules)
  const [packs, setPacks] = useState(texturePacks)
  const [activeTab, setActiveTab] = useState<"overlay" | "textures" | "performance">("overlay")
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

  const toggleModule = (moduleId: string) => {
    setModules(prev => prev.map(mod =>
      mod.id === moduleId ? { ...mod, enabled: !mod.enabled, visible: !mod.enabled ? true : mod.visible } : mod
    ))
  }

  const updateModuleSetting = (moduleId: string, settingId: string, value: string | number | boolean) => {
    setModules(prev => prev.map(mod =>
      mod.id === moduleId ? {
        ...mod,
        settings: mod.settings.map(setting =>
          setting.id === settingId ? { ...setting, value } : setting
        )
      } : mod
    ))
  }

  const toggleTexturePack = (packId: string) => {
    setPacks(prev => prev.map(pack =>
      pack.id === packId ? { ...pack, enabled: true } : { ...pack, enabled: false }
    ))
  }

  const downloadTexturePack = (packId: string) => {
    setPacks(prev => prev.map(pack =>
      pack.id === packId ? { ...pack, downloaded: true } : pack
    ))
    // Simulate download
    alert(`Downloading ${packs.find(p => p.id === packId)?.name}...`)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "hud": return <Monitor className="h-4 w-4" />
      case "performance": return <Zap className="h-4 w-4" />
      case "visual": return <Eye className="h-4 w-4" />
      case "audio": return <Volume2 className="h-4 w-4" />
      case "input": return <Keyboard className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "hud": return "text-purple-400"
      case "performance": return "text-yellow-400"
      case "visual": return "text-blue-400"
      case "audio": return "text-green-400"
      case "input": return "text-red-400"
      default: return "text-zinc-400"
    }
  }

  const getPackCategoryColor = (category: string) => {
    switch (category) {
      case "pvp": return "bg-red-500/20 text-red-300 border-red-500/30"
      case "uhc": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "aesthetic": return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "performance": return "bg-green-500/20 text-green-300 border-green-500/30"
      default: return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
    }
  }

  const renderSettingControl = (moduleId: string, setting: OverlaySetting) => {
    switch (setting.type) {
      case "toggle":
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateModuleSetting(moduleId, setting.id, !setting.value)}
            className="p-2"
          >
            {setting.value ? (
              <ToggleRight className="h-5 w-5 text-green-400" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-zinc-500" />
            )}
          </Button>
        )
      case "slider":
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <input
              type="range"
              min={setting.min || 0}
              max={setting.max || 100}
              step={setting.max && setting.max <= 1 ? 0.1 : 1}
              value={typeof setting.value === 'number' ? setting.value : 0}
              onChange={(e) => updateModuleSetting(moduleId, setting.id, Number(e.target.value))}
              className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-zinc-400 min-w-[30px]">
              {setting.max && setting.max <= 1 && typeof setting.value === 'number' ? setting.value.toFixed(1) : setting.value}
            </span>
          </div>
        )
      case "dropdown":
        return (
          <select
            value={typeof setting.value === 'string' ? setting.value : ''}
            onChange={(e) => updateModuleSetting(moduleId, setting.id, e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      case "color":
        return (
          <input
            type="color"
            value={typeof setting.value === 'string' ? setting.value : '#000000'}
            onChange={(e) => updateModuleSetting(moduleId, setting.id, e.target.value)}
            className="w-8 h-8 border border-zinc-600 rounded cursor-pointer"
          />
        )
      default:
        return <span className="text-xs text-zinc-500">Unsupported</span>
    }
  }

  const enabledModules = modules.filter(mod => mod.enabled).length
  const visibleModules = modules.filter(mod => mod.visible).length
  const activeTexturePack = packs.find(pack => pack.enabled)

  if (!overlayVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setOverlayVisible(true)}
          className="bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white shadow-lg"
        >
          <Layers className="h-4 w-4 mr-2" />
          Thunder Overlay
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay Modules Preview */}
      {modules.filter(mod => mod.enabled && mod.visible && mod.position).map(module => (
        <div
          key={module.id}
          className="absolute pointer-events-auto"
          style={{
            left: `${module.position!.x}px`,
            top: `${module.position!.y}px`
          }}
        >
          <div className="bg-black/70 text-white px-2 py-1 rounded border border-yellow-500/30 text-sm">
            {module.name}: {module.id === "fps-display" ? "247 FPS" :
                            module.id === "uhc-timer" ? "15:32" :
                            module.id === "armor-status" ? "❤ 20/20" : "Active"}
          </div>
        </div>
      ))}

      {/* Main Overlay Panel */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <Card className={`bg-zinc-900/95 border-zinc-800 backdrop-blur-md ${isMinimized ? 'w-64' : 'w-96'} transition-all duration-300`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-white text-lg">Thunder Overlay</CardTitle>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                  {enabledModules} Active
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOverlayVisible(false)}
                  className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex space-x-1 bg-zinc-800 p-1 rounded-lg mt-3">
                {[
                  { id: "overlay", label: "HUD Modules", icon: Monitor },
                  { id: "textures", label: "Texture Packs", icon: Palette },
                  { id: "performance", label: "Performance", icon: Cpu }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab(tab.id as "overlay" | "textures" | "performance")}
                      className={`flex-1 ${activeTab === tab.id
                        ? "bg-gradient-to-r from-purple-600 to-yellow-500 text-white"
                        : "text-zinc-400 hover:text-white"}`}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {tab.label}
                    </Button>
                  )
                })}
              </div>
            )}
          </CardHeader>

          {!isMinimized && (
            <CardContent className="space-y-4">
              {/* HUD Modules Tab */}
              {activeTab === "overlay" && (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {modules.map((module) => (
                    <div key={module.id} className="border border-zinc-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={getCategoryColor(module.category)}>
                            {getCategoryIcon(module.category)}
                          </div>
                          <div>
                            <h4 className="text-white text-sm font-medium">{module.name}</h4>
                            <p className="text-zinc-400 text-xs">{module.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {module.enabled && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setModules(prev => prev.map(mod =>
                                mod.id === module.id ? { ...mod, visible: !mod.visible } : mod
                              ))}
                              className="h-6 w-6 p-0"
                            >
                              {module.visible ? <Eye className="h-3 w-3 text-green-400" /> : <EyeOff className="h-3 w-3 text-zinc-500" />}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleModule(module.id)}
                            className="h-6 w-6 p-0"
                          >
                            {module.enabled ? (
                              <ToggleRight className="h-4 w-4 text-green-400" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-zinc-500" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {module.enabled && (
                        <div className="space-y-2 pt-2 border-t border-zinc-800">
                          {module.settings.map((setting) => (
                            <div key={setting.id} className="flex items-center justify-between">
                              <span className="text-sm text-zinc-300">{setting.name}</span>
                              {renderSettingControl(module.id, setting)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Texture Packs Tab */}
              {activeTab === "textures" && (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  <div className="text-sm text-zinc-400 mb-3">
                    Active: <span className="text-yellow-400">{activeTexturePack?.name || "Default"}</span>
                  </div>

                  {packs.map((pack) => (
                    <div key={pack.id} className="border border-zinc-800 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-zinc-800 rounded border overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-yellow-500/20 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-zinc-400" />
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white text-sm font-medium">{pack.name}</h4>
                            <Badge className={getPackCategoryColor(pack.category)}>
                              {pack.category.toUpperCase()}
                            </Badge>
                            {pack.enabled && (
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-zinc-400 text-xs mb-1">by {pack.author} • {pack.resolution}</p>
                          <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <span>{pack.size}</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              {pack.rating}
                            </div>
                            <span>{pack.downloads.toLocaleString()} downloads</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          {pack.downloaded ? (
                            <Button
                              size="sm"
                              variant={pack.enabled ? "default" : "outline"}
                              onClick={() => toggleTexturePack(pack.id)}
                              className={pack.enabled ? "bg-green-600 hover:bg-green-700" : "border-zinc-700"}
                            >
                              {pack.enabled ? "Active" : "Apply"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadTexturePack(pack.id)}
                              className="border-yellow-500/30 text-yellow-300"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === "performance" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-800/50 p-3 rounded">
                      <div className="text-2xl font-bold text-yellow-400">247</div>
                      <div className="text-xs text-zinc-400">FPS</div>
                    </div>
                    <div className="bg-zinc-800/50 p-3 rounded">
                      <div className="text-2xl font-bold text-purple-400">2.1GB</div>
                      <div className="text-xs text-zinc-400">Memory</div>
                    </div>
                    <div className="bg-zinc-800/50 p-3 rounded">
                      <div className="text-2xl font-bold text-green-400">23ms</div>
                      <div className="text-xs text-zinc-400">Frame Time</div>
                    </div>
                    <div className="bg-zinc-800/50 p-3 rounded">
                      <div className="text-2xl font-bold text-blue-400">45°C</div>
                      <div className="text-xs text-zinc-400">GPU Temp</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white text-sm font-medium">Quick Performance</h4>
                    <Button size="sm" variant="outline" className="w-full border-yellow-500/30 text-yellow-300">
                      <Zap className="h-4 w-4 mr-2" />
                      Optimize for UHC
                    </Button>
                    <Button size="sm" variant="outline" className="w-full border-purple-500/30 text-purple-300">
                      <MemoryStick className="h-4 w-4 mr-2" />
                      Clear Memory Cache
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Quick Actions Bar */}
      {!isMinimized && (
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-yellow-500/30 text-yellow-300 bg-zinc-900/80 backdrop-blur-md"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Chat
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-blue-500/30 text-blue-300 bg-zinc-900/80 backdrop-blur-md"
            >
              <Users className="h-4 w-4 mr-1" />
              Friends
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-purple-500/30 text-purple-300 bg-zinc-900/80 backdrop-blur-md"
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
