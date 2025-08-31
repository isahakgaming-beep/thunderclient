"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Download,
  Play,
  Trash2,
  Settings,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Package,
  FolderOpen,
  RefreshCw,
  AlertTriangle,
  Star,
  Calendar,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  Archive,
  Coffee,
  FileCheck,
  Network,
  Wrench,
  Monitor,
  Database,
  Link,
  Download as DownloadIcon
} from "lucide-react"

interface MinecraftVersion {
  id: string
  version: string
  type: "release" | "snapshot" | "beta" | "alpha"
  releaseDate: string
  isInstalled: boolean
  isInstalling: boolean
  isPopular: boolean
  uhcCompatible: boolean
  fabricSupported: boolean
  size: string
  javaVersion: number
  description: string
  changelog?: string[]
  downloads: number
  installPath?: string
  profileName?: string
  fabricVersion?: string
  manifestUrl?: string
  clientJarUrl?: string
  sha1?: string
  totalFiles?: number
  downloadedFiles?: number
}

interface JavaVersion {
  version: number
  name: string
  installed: boolean
  downloadUrl: string
  size: string
  path?: string
  autoDetected?: boolean
}

interface FabricLoader {
  version: string
  minecraftVersion: string
  stable: boolean
  build: number
  maven: string
}

interface DownloadProgress {
  stage: string
  progress: number
  currentFile?: string
  totalFiles?: number
  downloadedFiles?: number
  speed?: string
  eta?: string
}

const fabricLoaders: FabricLoader[] = [
  { version: "0.15.7", minecraftVersion: "1.21", stable: true, build: 767, maven: "net.fabricmc:fabric-loader:0.15.7" },
  { version: "0.15.3", minecraftVersion: "1.20.4", stable: true, build: 743, maven: "net.fabricmc:fabric-loader:0.15.3" },
  { version: "0.14.24", minecraftVersion: "1.19.4", stable: true, build: 692, maven: "net.fabricmc:fabric-loader:0.14.24" },
  { version: "0.15.6", minecraftVersion: "1.21", stable: false, build: 765, maven: "net.fabricmc:fabric-loader:0.15.6" }
]

const minecraftVersions: MinecraftVersion[] = [
  {
    id: "1.21",
    version: "1.21",
    type: "release",
    releaseDate: "2024-06-13",
    isInstalled: false,
    isInstalling: false,
    isPopular: true,
    uhcCompatible: true,
    fabricSupported: true,
    size: "45.2 MB",
    javaVersion: 21,
    description: "Latest release with new features and UHC optimizations",
    downloads: 2340000,
    fabricVersion: "0.15.7",
    manifestUrl: "https://piston-meta.mojang.com/v1/packages/1.21/manifest.json",
    clientJarUrl: "https://launcher.mojang.com/v1/objects/1.21/client.jar",
    sha1: "4707d00eb834b446575d89a61a11b5d548d8c001",
    totalFiles: 12,
    changelog: [
      "Improved performance for UHC gameplay",
      "New biomes and structures",
      "Enhanced multiplayer stability",
      "Optimized rendering for competitive play"
    ]
  },
  {
    id: "1.20.4",
    version: "1.20.4",
    type: "release",
    releaseDate: "2023-12-07",
    isInstalled: true,
    isInstalling: false,
    isPopular: true,
    uhcCompatible: true,
    fabricSupported: true,
    size: "43.8 MB",
    javaVersion: 17,
    description: "Stable release optimized for competitive UHC play",
    downloads: 5670000,
    profileName: "Thunder UHC 1.20.4",
    fabricVersion: "0.15.3",
    installPath: "C:\\Users\\User\\AppData\\Roaming\\.minecraft\\versions\\1.20.4-thunder",
    manifestUrl: "https://piston-meta.mojang.com/v1/packages/1.20.4/manifest.json",
    clientJarUrl: "https://launcher.mojang.com/v1/objects/1.20.4/client.jar",
    sha1: "fd19469fed4a4b4c15b2d5133985f0e3e7816a8a",
    totalFiles: 11
  },
  {
    id: "1.8.9",
    version: "1.8.9",
    type: "release",
    releaseDate: "2015-12-09",
    isInstalled: false,
    isInstalling: false,
    isPopular: true,
    uhcCompatible: true,
    fabricSupported: false,
    size: "12.4 MB",
    javaVersion: 8,
    description: "Classic PVP version preferred by many UHC players",
    downloads: 12450000,
    manifestUrl: "https://piston-meta.mojang.com/v1/packages/1.8.9/manifest.json",
    clientJarUrl: "https://launcher.mojang.com/v1/objects/1.8.9/client.jar",
    sha1: "b4d749a0d58b5a2ccd3ae097d6c4e1a87bc64681",
    totalFiles: 8,
    changelog: [
      "Classic combat mechanics",
      "Stable multiplayer performance",
      "Widely supported by servers",
      "Optimal for PVP combat"
    ]
  },
  {
    id: "1.12.2",
    version: "1.12.2",
    type: "release",
    releaseDate: "2017-09-18",
    isInstalled: false,
    isInstalling: false,
    isPopular: false,
    uhcCompatible: true,
    fabricSupported: false,
    size: "32.1 MB",
    javaVersion: 8,
    description: "Popular modding version with extensive mod support",
    downloads: 8900000,
    manifestUrl: "https://piston-meta.mojang.com/v1/packages/1.12.2/manifest.json",
    clientJarUrl: "https://launcher.mojang.com/v1/objects/1.12.2/client.jar",
    sha1: "0f275bc1547d01fa5f56ba34bdc87d981ee12daf",
    totalFiles: 9
  },
  {
    id: "1.19.4",
    version: "1.19.4",
    type: "release",
    releaseDate: "2023-03-14",
    isInstalled: false,
    isInstalling: false,
    isPopular: false,
    uhcCompatible: true,
    fabricSupported: true,
    size: "41.2 MB",
    javaVersion: 17,
    description: "Stable version with good performance for UHC",
    downloads: 3210000,
    fabricVersion: "0.14.24",
    manifestUrl: "https://piston-meta.mojang.com/v1/packages/1.19.4/manifest.json",
    clientJarUrl: "https://launcher.mojang.com/v1/objects/1.19.4/client.jar",
    sha1: "79493072f65e17243fd36a699c9a96b4381feb6c",
    totalFiles: 11
  },
  {
    id: "24w04a",
    version: "24w04a",
    type: "snapshot",
    releaseDate: "2024-01-24",
    isInstalled: false,
    isInstalling: false,
    isPopular: false,
    uhcCompatible: false,
    fabricSupported: true,
    size: "46.8 MB",
    javaVersion: 21,
    description: "Latest snapshot with experimental features",
    downloads: 125000,
    fabricVersion: "0.15.6",
    manifestUrl: "https://piston-meta.mojang.com/v1/packages/24w04a/manifest.json",
    clientJarUrl: "https://launcher.mojang.com/v1/objects/24w04a/client.jar",
    sha1: "a1b2c3d4e5f6789012345678901234567890abcd",
    totalFiles: 13
  }
]

const javaVersions: JavaVersion[] = [
  {
    version: 21,
    name: "Java 21 LTS",
    installed: true,
    downloadUrl: "https://adoptium.net/temurin/releases/?version=21",
    size: "190 MB",
    path: "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.2.13-hotspot\\bin\\java.exe",
    autoDetected: true
  },
  {
    version: 17,
    name: "Java 17 LTS",
    installed: true,
    downloadUrl: "https://adoptium.net/temurin/releases/?version=17",
    size: "175 MB",
    path: "C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.10.7-hotspot\\bin\\java.exe",
    autoDetected: true
  },
  {
    version: 8,
    name: "Java 8 LTS",
    installed: false,
    downloadUrl: "https://adoptium.net/temurin/releases/?version=8",
    size: "95 MB",
    autoDetected: false
  }
]

export function VersionManager() {
  const [versions, setVersions] = useState(minecraftVersions)
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [downloadProgress, setDownloadProgress] = useState<Record<string, DownloadProgress>>({})
  const [selectedVersion, setSelectedVersion] = useState<string>("1.20.4")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const simulateRealisticDownload = async (versionId: string, version: MinecraftVersion) => {
    const progress: DownloadProgress = {
      stage: "Initializing...",
      progress: 0,
      totalFiles: version.totalFiles || 10,
      downloadedFiles: 0,
      speed: "0 MB/s",
      eta: "Calculating..."
    }

    setDownloadProgress(prev => ({ ...prev, [versionId]: progress }))

    // Realistic download stages with variable timing
    const stages = [
      { name: "Fetching version manifest", files: 1, duration: 500 },
      { name: "Downloading client JAR", files: 1, duration: 2000 },
      { name: "Downloading libraries", files: version.totalFiles! - 4, duration: 1500 },
      { name: "Installing Fabric loader", files: 1, duration: 800 },
      { name: "Creating profile", files: 1, duration: 300 },
      { name: "Verifying installation", files: 1, duration: 400 }
    ]

    let downloadedFiles = 0

    for (const [index, stage] of stages.entries()) {
      for (let i = 0; i < stage.files; i++) {
        setDownloadProgress(prev => ({
          ...prev,
          [versionId]: {
            ...prev[versionId],
            stage: stage.name,
            currentFile: `${stage.name.toLowerCase().replace(/\s+/g, '_')}_${i + 1}`,
            downloadedFiles: downloadedFiles + i + 1,
            progress: ((downloadedFiles + i + 1) / progress.totalFiles!) * 100,
            speed: `${(Math.random() * 5 + 2).toFixed(1)} MB/s`,
            eta: `${Math.ceil((progress.totalFiles! - downloadedFiles - i - 1) * 0.3)}s`
          }
        }))

        await new Promise(resolve => setTimeout(resolve, stage.duration / stage.files))
      }
      downloadedFiles += stage.files
    }

    // Final verification
    setDownloadProgress(prev => ({
      ...prev,
      [versionId]: {
        ...prev[versionId],
        stage: "Installation complete!",
        progress: 100,
        downloadedFiles: progress.totalFiles,
        speed: "0 MB/s",
        eta: "Done"
      }
    }))

    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const handleInstallVersion = async (versionId: string) => {
    const version = versions.find(v => v.id === versionId)
    if (!version) return

    setVersions(prev => prev.map(v =>
      v.id === versionId ? { ...v, isInstalling: true } : v
    ))

    await simulateRealisticDownload(versionId, version)

    setVersions(prev => prev.map(v =>
      v.id === versionId ? {
        ...v,
        isInstalling: false,
        isInstalled: true,
        profileName: `Thunder UHC ${v.version}`,
        installPath: `C:\\Users\\User\\AppData\\Roaming\\.minecraft\\versions\\${v.version}-thunder`
      } : v
    ))

    setDownloadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[versionId]
      return newProgress
    })
  }

  const handleUninstallVersion = (versionId: string) => {
    setVersions(prev => prev.map(v =>
      v.id === versionId ? {
        ...v,
        isInstalled: false,
        installPath: undefined,
        profileName: undefined
      } : v
    ))
  }

  const handleRefreshVersions = async () => {
    setIsRefreshing(true)

    // Simulate fetching latest versions from Mojang API
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsRefreshing(false)

    // In a real implementation, this would fetch from:
    // https://piston-meta.mojang.com/mc/game/version_manifest_v2.json
  }

  const handleLaunchVersion = (version: MinecraftVersion) => {
    const javaPath = javaVersions.find(j => j.version === version.javaVersion)?.path || "java"
    const fabricInfo = version.fabricSupported ? ` with Fabric ${version.fabricVersion}` : ""

    alert(`🚀 Launching Minecraft ${version.version}!\n\n` +
          `📁 Profile: ${version.profileName}\n` +
          `☕ Java: ${javaPath}\n` +
          `🧵 Fabric: ${version.fabricSupported ? version.fabricVersion : "Not supported"}\n` +
          `⚡ UHC Optimizations: ${version.uhcCompatible ? "Enabled" : "Disabled"}\n\n` +
          `In a real launcher, this would:\n` +
          `• Execute: "${javaPath}" -jar minecraft.jar\n` +
          `• Apply memory allocation: -Xmx6G -Xms2G\n` +
          `• Load UHC-optimized JVM arguments\n` +
          `• Initialize ${version.fabricSupported ? "Fabric" : "Vanilla"} environment${fabricInfo}`)
  }

  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case "release": return "bg-green-500/20 text-green-300 border-green-500/30"
      case "snapshot": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "beta": return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "alpha": return "bg-red-500/20 text-red-300 border-red-500/30"
      default: return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
    }
  }

  const getJavaIcon = (javaVersion: number) => {
    return javaVersion >= 17 ? <Cpu className="h-4 w-4 text-blue-400" /> : <Coffee className="h-4 w-4 text-orange-400" />
  }

  const filteredVersions = versions.filter(version => {
    switch (selectedFilter) {
      case "installed": return version.isInstalled
      case "popular": return version.isPopular
      case "uhc": return version.uhcCompatible
      case "fabric": return version.fabricSupported
      case "release": return version.type === "release"
      default: return true
    }
  })

  const installedCount = versions.filter(v => v.isInstalled).length
  const totalSize = versions.filter(v => v.isInstalled).reduce((acc, v) => acc + parseFloat(v.size), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Archive className="h-6 w-6 text-yellow-400" />
            Minecraft Version Manager
          </h2>
          <p className="text-zinc-400">Download and manage Minecraft versions for UHC gameplay</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            {installedCount} Installed
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            {totalSize.toFixed(1)} MB Used
          </Badge>
          <Button
            variant="outline"
            className="border-yellow-500/30 text-yellow-300"
            onClick={handleRefreshVersions}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Checking...' : 'Check Updates'}
          </Button>
        </div>
      </div>

      {/* Java Versions Panel */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Coffee className="h-5 w-5 text-orange-400" />
            Java Runtime Environment
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 ml-2">
              Auto-Detected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {javaVersions.map((java) => (
              <div key={java.version} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  {getJavaIcon(java.version)}
                  <div>
                    <div className="font-medium text-zinc-100 flex items-center gap-2">
                      {java.name}
                      {java.autoDetected && (
                        <FileCheck className="h-3 w-3 text-green-400" />
                      )}
                    </div>
                    <div className="text-sm text-zinc-400">{java.size}</div>
                    {java.path && (
                      <div className="text-xs text-zinc-500 break-all">{java.path}</div>
                    )}
                  </div>
                </div>
                {java.installed ? (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    Installed
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-300">
                    Install
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "all", label: "All Versions", icon: Archive },
          { id: "installed", label: "Installed", icon: CheckCircle },
          { id: "popular", label: "Popular", icon: Star },
          { id: "uhc", label: "UHC Compatible", icon: Zap },
          { id: "fabric", label: "Fabric Support", icon: Package },
          { id: "release", label: "Releases Only", icon: Shield }
        ].map((filter) => {
          const Icon = filter.icon
          return (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className={selectedFilter === filter.id
                ? "bg-gradient-to-r from-purple-600 to-yellow-500"
                : "border-zinc-700 text-zinc-300"}
            >
              <Icon className="h-4 w-4 mr-1" />
              {filter.label}
            </Button>
          )
        })}
      </div>

      {/* Version Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVersions.map((version) => (
          <Card key={version.id} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 bg-gradient-to-br from-green-500 to-blue-500">
                    <AvatarFallback className="text-white font-bold">
                      {version.version.split('.').slice(0, 2).join('.')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">Minecraft {version.version}</h3>
                      {version.isPopular && (
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      )}
                      {version.fabricSupported && (
                        <Package className="h-4 w-4 text-purple-400" />
                      )}
                    </div>
                    <p className="text-sm text-zinc-400">{version.description}</p>
                    {version.profileName && (
                      <p className="text-xs text-yellow-400">Profile: {version.profileName}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getVersionTypeColor(version.type)}>
                    {version.type.charAt(0).toUpperCase() + version.type.slice(1)}
                  </Badge>
                  {version.uhcCompatible && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      UHC Ready
                    </Badge>
                  )}
                  {version.fabricSupported && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      Fabric {version.fabricVersion}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Released:</span>
                    <span className="text-zinc-200">{new Date(version.releaseDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Size:</span>
                    <span className="text-zinc-200">{version.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Java:</span>
                    <span className="text-zinc-200">Java {version.javaVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Files:</span>
                    <span className="text-zinc-200">{version.totalFiles} components</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Downloads:</span>
                    <span className="text-zinc-200">{version.downloads.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Fabric:</span>
                    <span className={version.fabricSupported ? "text-green-300" : "text-red-300"}>
                      {version.fabricSupported ? version.fabricVersion : "Not Available"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">UHC:</span>
                    <span className={version.uhcCompatible ? "text-yellow-300" : "text-zinc-400"}>
                      {version.uhcCompatible ? "Compatible" : "Limited"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">SHA1:</span>
                    <span className="text-zinc-200 font-mono text-xs">{version.sha1?.substring(0, 8)}...</span>
                  </div>
                </div>
              </div>

              {version.isInstalling && downloadProgress[version.id] && (
                <div className="space-y-2 p-3 rounded-lg bg-zinc-800/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <DownloadIcon className="h-4 w-4 animate-bounce" />
                      {downloadProgress[version.id].stage}
                    </span>
                    <span className="text-zinc-200">{Math.round(downloadProgress[version.id].progress)}%</span>
                  </div>
                  <Progress value={downloadProgress[version.id].progress} className="h-2" />
                  <div className="grid grid-cols-3 text-xs text-zinc-500">
                    <span>Files: {downloadProgress[version.id].downloadedFiles}/{downloadProgress[version.id].totalFiles}</span>
                    <span>Speed: {downloadProgress[version.id].speed}</span>
                    <span>ETA: {downloadProgress[version.id].eta}</span>
                  </div>
                  {downloadProgress[version.id].currentFile && (
                    <div className="text-xs text-zinc-400 font-mono">
                      Current: {downloadProgress[version.id].currentFile}
                    </div>
                  )}
                </div>
              )}

              {version.installPath && (
                <div className="text-xs text-zinc-500 break-all p-2 rounded bg-zinc-800/30">
                  <FolderOpen className="h-3 w-3 inline mr-1" />
                  {version.installPath}
                </div>
              )}

              {version.manifestUrl && (
                <div className="text-xs text-zinc-500 break-all">
                  <Link className="h-3 w-3 inline mr-1" />
                  Manifest: {version.manifestUrl.split('/').pop()}
                </div>
              )}

              <div className="flex gap-2">
                {version.isInstalled ? (
                  <>
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      onClick={() => handleLaunchVersion(version)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Launch {version.version}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 text-zinc-400"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUninstallVersion(version.id)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600"
                    onClick={() => handleInstallVersion(version.id)}
                    disabled={version.isInstalling}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {version.isInstalling ? "Installing..." : `Install ${version.version}`}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVersions.length === 0 && (
        <div className="text-center py-20">
          <Archive className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">No Versions Found</h3>
          <p className="text-zinc-400">Try adjusting your filter settings</p>
        </div>
      )}
    </div>
  )
}
