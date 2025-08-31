"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Monitor,
  Eye,
  EyeOff,
  Settings,
  Move,
  Palette,
  RotateCw,
  Target,
  Heart,
  Shield,
  Clock,
  MapPin,
  Keyboard,
  Crosshair
} from "lucide-react"

interface HUDElement {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  enabled: boolean
  position: { x: number; y: number }
  customizable: boolean
}

const hudElements: HUDElement[] = [
  {
    id: "fps",
    name: "FPS Counter",
    description: "Display current frames per second",
    icon: Monitor,
    enabled: true,
    position: { x: 10, y: 10 },
    customizable: true
  },
  {
    id: "keystrokes",
    name: "Keystrokes",
    description: "Show WASD and mouse click inputs",
    icon: Keyboard,
    enabled: true,
    position: { x: 10, y: 100 },
    customizable: true
  },
  {
    id: "armor",
    name: "Armor Status",
    description: "Display armor durability and protection",
    icon: Shield,
    enabled: true,
    position: { x: 10, y: 200 },
    customizable: true
  },
  {
    id: "coordinates",
    name: "Coordinates",
    description: "Show current player position",
    icon: MapPin,
    enabled: false,
    position: { x: 10, y: 300 },
    customizable: true
  },
  {
    id: "crosshair",
    name: "Custom Crosshair",
    description: "Enhanced crosshair with customization",
    icon: Crosshair,
    enabled: true,
    position: { x: 400, y: 300 },
    customizable: true
  },
  {
    id: "potion",
    name: "Potion Effects",
    description: "Display active potion effects",
    icon: Heart,
    enabled: true,
    position: { x: 10, y: 400 },
    customizable: true
  },
  {
    id: "clock",
    name: "Game Clock",
    description: "Show in-game time",
    icon: Clock,
    enabled: false,
    position: { x: 10, y: 500 },
    customizable: true
  },
  {
    id: "target",
    name: "Target HUD",
    description: "Show information about targeted entity",
    icon: Target,
    enabled: true,
    position: { x: 200, y: 100 },
    customizable: true
  }
]

export function HUDConfig() {
  const [elements, setElements] = useState(hudElements)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)

  const toggleElement = (id: string) => {
    setElements(prev => prev.map(el =>
      el.id === id ? { ...el, enabled: !el.enabled } : el
    ))
  }

  const enabledCount = elements.filter(el => el.enabled).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">HUD Configuration</h2>
          <p className="text-zinc-400">Customize your heads-up display elements</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
            {enabledCount} Active
          </Badge>
          <Button variant="outline" className="border-zinc-700 text-zinc-300">
            <Settings className="h-4 w-4 mr-2" />
            Global Settings
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            HUD Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-zinc-950 rounded-lg aspect-video border border-zinc-700 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 to-green-400/20" />

            {/* Render enabled HUD elements */}
            {elements.filter(el => el.enabled).map(element => {
              const Icon = element.icon
              return (
                <div
                  key={element.id}
                  className={`absolute p-2 bg-black/50 rounded border border-zinc-600 cursor-pointer transition-all hover:bg-black/70 ${
                    selectedElement === element.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  style={{
                    left: `${(element.position.x / 800) * 100}%`,
                    top: `${(element.position.y / 450) * 100}%`
                  }}
                  onClick={() => setSelectedElement(selectedElement === element.id ? null : element.id)}
                >
                  <div className="flex items-center gap-1 text-xs text-white">
                    <Icon className="h-3 w-3" />
                    <span>{element.name}</span>
                  </div>
                </div>
              )
            })}

            {/* Center crosshair */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border border-white/80 bg-transparent"></div>
            </div>
          </div>

          <div className="mt-4 text-sm text-zinc-400 text-center">
            Click on HUD elements to select and configure them
          </div>
        </CardContent>
      </Card>

      {/* HUD Elements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {elements.map(element => {
          const Icon = element.icon
          return (
            <Card key={element.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${element.enabled ? 'bg-purple-500/20' : 'bg-zinc-700/50'}`}>
                      <Icon className={`h-5 w-5 ${element.enabled ? 'text-purple-400' : 'text-zinc-500'}`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${element.enabled ? 'text-zinc-100' : 'text-zinc-400'}`}>
                        {element.name}
                      </h4>
                      <p className="text-sm text-zinc-500 mt-1">{element.description}</p>
                      {element.enabled && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                            X: {element.position.x} Y: {element.position.y}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {element.enabled && element.customizable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                        onClick={() => setSelectedElement(element.id)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleElement(element.id)}
                    >
                      {element.enabled ? (
                        <Eye className="h-4 w-4 text-green-400" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-zinc-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-zinc-100">Quick Actions</h4>
              <p className="text-sm text-zinc-500">Preset configurations for different game modes</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
                <Target className="h-4 w-4 mr-2" />
                PVP Setup
              </Button>
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
                <RotateCw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
                <Palette className="h-4 w-4 mr-2" />
                Color Theme
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
