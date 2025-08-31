"use client"

import { useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { MainContent } from "@/components/MainContent"
import { TopBar } from "@/components/TopBar"
import { cn } from "@/lib/utils"

export default function Home() {
  const [activeSection, setActiveSection] = useState("home")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className={cn(
      "min-h-screen text-white flex flex-col transition-colors duration-300",
      isDarkMode
        ? "bg-zinc-950"
        : "bg-gray-50 text-gray-900"
    )}>
      <TopBar
        onToggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      <div className="flex flex-1">
        <Sidebar
          activeItem={activeSection}
          onActiveItemChange={setActiveSection}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        <MainContent activeSection={activeSection} />
      </div>
    </div>
  )
}
