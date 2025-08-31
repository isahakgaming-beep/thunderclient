"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  UserPlus,
  MessageCircle,
  Play,
  Crown,
  Trophy,
  Timer,
  Heart,
  Gamepad2,
  Send,
  Search,
  MoreVertical,
  UserX,
  Star,
  Settings,
  Globe,
  Zap,
  Clock,
  Target,
  Shield,
  Gift,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Phone,
  Video,
  Share2
} from "lucide-react"

interface Friend {
  id: string
  username: string
  displayName: string
  avatar?: string
  status: "online" | "offline" | "away" | "playing" | "in-uhc"
  lastSeen: string
  currentActivity?: {
    type: "playing" | "in-menu" | "in-uhc" | "spectating"
    server?: string
    gameMode?: string
    duration?: number
  }
  uhcStats: {
    wins: number
    gamesPlayed: number
    winRate: number
    rank: string
    rating: number
  }
  isMutualFriend: boolean
  isPremium: boolean
  isBlocked: boolean
  customStatus?: string
}

interface Party {
  id: string
  name: string
  leader: string
  members: string[]
  maxMembers: number
  activity: "idle" | "searching" | "in-game"
  gameMode: "uhc" | "practice" | "tournament"
  server?: string
}

interface Message {
  id: string
  fromId: string
  fromUsername: string
  content: string
  timestamp: Date
  type: "text" | "game-invite" | "party-invite" | "system"
}

const mockFriends: Friend[] = [
  {
    id: "1",
    username: "UHCKing2024",
    displayName: "UHC King",
    status: "in-uhc",
    lastSeen: "now",
    currentActivity: {
      type: "in-uhc",
      server: "Hypixel UHC #47",
      gameMode: "Teams of 2",
      duration: 1247
    },
    uhcStats: {
      wins: 127,
      gamesPlayed: 340,
      winRate: 37.4,
      rank: "Diamond",
      rating: 1847
    },
    isMutualFriend: true,
    isPremium: true,
    isBlocked: false,
    customStatus: "Going for win #128! 🏆"
  },
  {
    id: "2",
    username: "PvPMaster",
    displayName: "PvP Master",
    status: "online",
    lastSeen: "now",
    currentActivity: {
      type: "in-menu",
      server: "Thunder Client Lobby"
    },
    uhcStats: {
      wins: 89,
      gamesPlayed: 256,
      winRate: 34.8,
      rank: "Gold",
      rating: 1456
    },
    isMutualFriend: true,
    isPremium: false,
    isBlocked: false
  },
  {
    id: "3",
    username: "ThunderPro",
    displayName: "Thunder Pro",
    status: "playing",
    lastSeen: "now",
    currentActivity: {
      type: "playing",
      server: "Practice Server",
      gameMode: "PvP Arena",
      duration: 432
    },
    uhcStats: {
      wins: 203,
      gamesPlayed: 567,
      winRate: 35.8,
      rank: "Master",
      rating: 2134
    },
    isMutualFriend: true,
    isPremium: true,
    isBlocked: false,
    customStatus: "Practicing for tournament"
  },
  {
    id: "4",
    username: "CasualGamer",
    displayName: "Casual Gamer",
    status: "away",
    lastSeen: "15 minutes ago",
    uhcStats: {
      wins: 34,
      gamesPlayed: 124,
      winRate: 27.4,
      rank: "Silver",
      rating: 987
    },
    isMutualFriend: false,
    isPremium: false,
    isBlocked: false
  },
  {
    id: "5",
    username: "UHCLegend",
    displayName: "UHC Legend",
    status: "offline",
    lastSeen: "2 hours ago",
    uhcStats: {
      wins: 445,
      gamesPlayed: 892,
      winRate: 49.9,
      rank: "Grandmaster",
      rating: 2876
    },
    isMutualFriend: true,
    isPremium: true,
    isBlocked: false,
    customStatus: "Top 10 global ranking! ⚡"
  }
]

const mockParty: Party = {
  id: "party-1",
  name: "Thunder Squad",
  leader: "UHCKing2024",
  members: ["UHCKing2024", "PvPMaster", "ThunderPro"],
  maxMembers: 4,
  activity: "searching",
  gameMode: "uhc",
  server: "Hypixel"
}

export function FriendNetwork() {
  const [friends, setFriends] = useState(mockFriends)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [activeTab, setActiveTab] = useState<"friends" | "party" | "network">("friends")
  const [searchQuery, setSearchQuery] = useState("")
  const [party, setParty] = useState<Party | null>(mockParty)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "in-uhc": return "bg-yellow-500 animate-pulse"
      case "playing": return "bg-blue-500"
      case "away": return "bg-orange-500"
      case "offline": return "bg-zinc-500"
      default: return "bg-zinc-500"
    }
  }

  const getStatusText = (friend: Friend) => {
    if (friend.status === "offline") return `Last seen ${friend.lastSeen}`
    if (friend.customStatus) return friend.customStatus
    if (friend.currentActivity) {
      switch (friend.currentActivity.type) {
        case "in-uhc":
          return `Playing UHC on ${friend.currentActivity.server}`
        case "playing":
          return `Playing ${friend.currentActivity.gameMode}`
        case "in-menu":
          return "In main menu"
        case "spectating":
          return "Spectating a game"
        default:
          return "Online"
      }
    }
    return "Online"
  }

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case "grandmaster": return "text-purple-400"
      case "master": return "text-red-400"
      case "diamond": return "text-cyan-400"
      case "gold": return "text-yellow-400"
      case "silver": return "text-zinc-300"
      case "bronze": return "text-orange-400"
      default: return "text-zinc-400"
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedFriend) return

    const message: Message = {
      id: Date.now().toString(),
      fromId: "current-user",
      fromUsername: "You",
      content: newMessage,
      timestamp: new Date(),
      type: "text"
    }

    setMessages(prev => [...prev, message])
    setNewMessage("")
  }

  const handleInviteToParty = (friendId: string) => {
    // Simulate party invite
    alert(`Invited ${friends.find(f => f.id === friendId)?.displayName} to party!`)
  }

  const handleJoinGame = (friend: Friend) => {
    if (friend.currentActivity?.server) {
      alert(`Joining ${friend.displayName} on ${friend.currentActivity.server}!`)
    }
  }

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onlineFriends = friends.filter(f => f.status !== "offline").length
  const uhcFriends = friends.filter(f => f.status === "in-uhc").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-yellow-400" />
            Thunder Network
          </h2>
          <p className="text-zinc-400">Connect with fellow UHC players and form parties</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            {onlineFriends} Online
          </Badge>
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            {uhcFriends} in UHC
          </Badge>
          <Button variant="outline" className="border-yellow-500/30 text-yellow-300">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-zinc-900 p-1 rounded-lg">
        {[
          { id: "friends", label: "Friends", icon: Users, count: friends.length },
          { id: "party", label: "Party", icon: Crown, count: party?.members.length || 0 },
          { id: "network", label: "Network", icon: Globe, count: 1247 }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id as "friends" | "party" | "network")}
              className={`flex-1 ${activeTab === tab.id
                ? "bg-gradient-to-r from-purple-600 to-yellow-500 text-white"
                : "text-zinc-400 hover:text-white"}`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
              {tab.count > 0 && (
                <Badge className="ml-2 bg-zinc-700 text-zinc-200 text-xs">
                  {tab.count}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Friends List */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "friends" && (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-500"
                />
              </div>

              {/* Friends List */}
              <div className="space-y-2">
                {filteredFriends.map((friend) => (
                  <Card
                    key={friend.id}
                    className={`bg-zinc-900 border-zinc-800 cursor-pointer transition-all hover:bg-zinc-800/50 ${
                      selectedFriend?.id === friend.id ? 'ring-2 ring-yellow-500' : ''
                    }`}
                    onClick={() => setSelectedFriend(friend)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-yellow-500 text-white">
                                {friend.displayName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900 ${getStatusColor(friend.status)}`} />
                            {friend.isPremium && (
                              <Crown className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-white">{friend.displayName}</h4>
                              <span className={`text-xs font-bold ${getRankColor(friend.uhcStats.rank)}`}>
                                {friend.uhcStats.rank}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-400">{getStatusText(friend)}</p>
                            {friend.currentActivity?.duration && (
                              <div className="flex items-center gap-1 text-xs text-zinc-500">
                                <Clock className="h-3 w-3" />
                                {Math.floor(friend.currentActivity.duration / 60)}:{(friend.currentActivity.duration % 60).toString().padStart(2, '0')}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-sm font-medium text-yellow-400">
                              {friend.uhcStats.wins} wins
                            </div>
                            <div className="text-xs text-zinc-500">
                              {friend.uhcStats.winRate}% WR
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            {friend.status === "in-uhc" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-yellow-500/30 text-yellow-300 h-6 px-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleJoinGame(friend)
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Watch
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-zinc-700 text-zinc-400 h-6 px-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleInviteToParty(friend.id)
                              }}
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Invite
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {activeTab === "party" && party && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  {party.name}
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {party.members.length}/{party.maxMembers}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-400">
                    Leader: <span className="text-yellow-300">{party.leader}</span>
                  </div>
                  <Badge className={`${
                    party.activity === "searching" ? "bg-yellow-500/20 text-yellow-300" :
                    party.activity === "in-game" ? "bg-green-500/20 text-green-300" :
                    "bg-zinc-500/20 text-zinc-300"
                  }`}>
                    {party.activity === "searching" ? "Searching for UHC" :
                     party.activity === "in-game" ? "In Game" : "Idle"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {party.members.map((memberId, index) => {
                    const member = friends.find(f => f.username === memberId) || {
                      id: memberId,
                      username: memberId,
                      displayName: memberId,
                      status: "online" as const,
                      uhcStats: { wins: 0, rank: "Unranked", winRate: 0, gamesPlayed: 0, rating: 0 },
                      isPremium: false,
                      isMutualFriend: false,
                      isBlocked: false,
                      lastSeen: "now"
                    }

                    return (
                      <div key={memberId} className="flex items-center justify-between p-2 rounded bg-zinc-800/50">
                        <div className="flex items-center gap-2">
                          {party.leader === memberId && (
                            <Crown className="h-4 w-4 text-yellow-400" />
                          )}
                          <span className="text-white">{member.displayName}</span>
                          <Badge className={`text-xs ${getRankColor(member.uhcStats.rank)}`}>
                            {member.uhcStats.rank}
                          </Badge>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-yellow-500">
                    <Target className="h-4 w-4 mr-2" />
                    Find UHC Game
                  </Button>
                  <Button variant="outline" className="border-zinc-700">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "network" && (
            <div className="text-center py-20">
              <Globe className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Thunder Network</h3>
              <p className="text-zinc-400 mb-6">
                Connect with 1,247 Thunder Client users worldwide
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <Button variant="outline" className="border-yellow-500/30 text-yellow-300">
                  <Search className="h-4 w-4 mr-2" />
                  Find Players
                </Button>
                <Button variant="outline" className="border-purple-500/30 text-purple-300">
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <div className="space-y-4">
          {selectedFriend ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-yellow-500 text-white text-sm">
                      {selectedFriend.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-white">{selectedFriend.displayName}</h4>
                    <p className="text-xs text-zinc-400">{getStatusText(selectedFriend)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chat Messages */}
                <div className="h-40 overflow-y-auto space-y-2 p-2 bg-zinc-950 rounded">
                  {messages.length === 0 ? (
                    <div className="text-center text-zinc-500 text-sm py-8">
                      Start a conversation with {selectedFriend.displayName}
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="space-y-1">
                        <div className="text-xs text-zinc-400">{message.fromUsername}</div>
                        <div className="text-sm text-zinc-200 bg-zinc-800 p-2 rounded">
                          {message.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-500 text-sm"
                  />
                  <Button size="sm" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-300">
                    <Gift className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-300">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h4 className="text-white mb-2">No chat selected</h4>
                <p className="text-zinc-400 text-sm">Select a friend to start chatting</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-sm">Network Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Online Friends:</span>
                <span className="text-green-400">{onlineFriends}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">In UHC Games:</span>
                <span className="text-yellow-400">{uhcFriends}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Network Users:</span>
                <span className="text-purple-400">1,247</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Active Parties:</span>
                <span className="text-blue-400">34</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
