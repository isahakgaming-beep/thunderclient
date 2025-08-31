"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LogIn,
  LogOut,
  User,
  Shield,
  Globe,
  RotateCw,
  CheckCircle,
  AlertCircle,
  Zap,
  Star,
  Trophy,
  Clock,
  Activity,
  Gamepad2,
  Settings,
  ExternalLink
} from "lucide-react"

interface MinecraftProfile {
  id: string
  name: string
  avatar: string
  premium: boolean
  lastPlayed: string
  stats: {
    gamesPlayed: number
    totalHours: number
    level: number
    achievements: number
  }
  preferences: {
    autoLogin: boolean
    staySignedIn: boolean
    syncSettings: boolean
  }
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  profile: MinecraftProfile | null
  error: string | null
}

export function MicrosoftAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    profile: null,
    error: null
  })

  // Simulate Microsoft OAuth flow
  const handleMicrosoftLogin = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock successful authentication
      const mockProfile: MinecraftProfile = {
        id: "thunder-player-uuid",
        name: "ThunderPlayer",
        avatar: "/api/placeholder/64/64",
        premium: true,
        lastPlayed: new Date().toISOString(),
        stats: {
          gamesPlayed: 189,
          totalHours: 247,
          level: 24,
          achievements: 67
        },
        preferences: {
          autoLogin: true,
          staySignedIn: true,
          syncSettings: true
        }
      }

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        profile: mockProfile,
        error: null
      })

      // Store in localStorage for persistence with additional data
      const authData = {
        ...mockProfile,
        uhcStats: {
          wins: 89,
          gamesPlayed: mockProfile.stats.gamesPlayed,
          winRate: 36.0
        }
      }
      localStorage.setItem('thunder-auth', JSON.stringify(authData))
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to authenticate with Microsoft"
      }))
    }
  }

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      profile: null,
      error: null
    })
    localStorage.removeItem('thunder-auth')
  }

  const handleAccountSettings = () => {
    alert("Opening Microsoft account settings...")
  }

  const handleSyncSettings = () => {
    alert("Syncing profile settings across devices...")
  }

  // Load saved authentication on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('thunder-auth')
    if (savedAuth) {
      try {
        const profile = JSON.parse(savedAuth)
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          profile: {
            id: profile.id || "thunder-player-uuid",
            name: profile.name,
            avatar: profile.avatar || "/api/placeholder/64/64",
            premium: profile.premium,
            lastPlayed: profile.lastPlayed,
            stats: {
              gamesPlayed: profile.uhcStats?.gamesPlayed || 189,
              totalHours: Math.floor((profile.uhcStats?.gamesPlayed || 189) * 1.3),
              level: Math.floor((profile.uhcStats?.wins || 89) / 4) + 1,
              achievements: Math.floor((profile.uhcStats?.wins || 89) * 0.75)
            },
            preferences: {
              autoLogin: true,
              staySignedIn: true,
              syncSettings: true
            }
          },
          error: null
        })
      } catch (error) {
        localStorage.removeItem('thunder-auth')
      }
    }
  }, [])

  if (!authState.isAuthenticated) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-400" />
            Microsoft Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-yellow-400/20 flex items-center justify-center">
              <User className="h-8 w-8 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">
              Sign in to Thunder Client
            </h3>
            <p className="text-zinc-400 text-sm mb-4">
              Connect your Microsoft account to sync profiles and unlock premium features
            </p>
          </div>

          {authState.error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-300">{authState.error}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleMicrosoftLogin}
              disabled={authState.isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-semibold"
            >
              {authState.isLoading ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  Connecting to Microsoft...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in with Microsoft
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <CheckCircle className="h-3 w-3 text-green-400" />
              <span>Secure OAuth 2.0 authentication</span>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <h4 className="text-sm font-medium text-zinc-300 mb-2">Benefits:</h4>
            <ul className="space-y-1 text-xs text-zinc-400">
              <li>• Sync profiles and settings across devices</li>
              <li>• Access to premium mod collections</li>
              <li>• Cloud save backup and restore</li>
              <li>• Advanced statistics and analytics</li>
              <li>• Priority customer support</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Account Connected
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-zinc-400 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-yellow-400/50">
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-yellow-500 text-white font-bold">
              {authState.profile?.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-zinc-100">{authState.profile?.name}</h3>
              {authState.profile?.premium && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-sm text-zinc-400">
              Last played: {new Date(authState.profile?.lastPlayed || '').toLocaleDateString()}
            </p>
          </div>
        </div>

        {authState.profile?.stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-zinc-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-zinc-400">Level</span>
              </div>
              <div className="text-lg font-bold text-yellow-400">
                {authState.profile.stats.level}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Gamepad2 className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-zinc-400">Games</span>
              </div>
              <div className="text-lg font-bold text-purple-400">
                {authState.profile.stats.gamesPlayed}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-zinc-400">Hours</span>
              </div>
              <div className="text-lg font-bold text-blue-400">
                {authState.profile.stats.totalHours}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-green-400" />
                <span className="text-xs text-zinc-400">Achievements</span>
              </div>
              <div className="text-lg font-bold text-green-400">
                {authState.profile.stats.achievements}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <Globe className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-300">Profile synced across devices</span>
          </div>

          {authState.profile?.premium && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-yellow-300">Premium features enabled</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-yellow-500/30 text-yellow-300"
            onClick={handleAccountSettings}
          >
            <Settings className="h-4 w-4 mr-2" />
            Account
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-purple-500/30 text-purple-300"
            onClick={handleSyncSettings}
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-blue-500/30 text-blue-300"
            onClick={() => window.open('https://account.microsoft.com', '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
