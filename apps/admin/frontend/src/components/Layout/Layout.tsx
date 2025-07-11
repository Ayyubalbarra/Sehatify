"use client"

import type React from "react"
import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Bot } from "lucide-react"
import Sidebar from "./Sidebar.tsx"
import Header from "./Header.tsx"
import AIAssistant from "../AIAssistant/AIAssistant.tsx"

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* AI Assistant Floating Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 z-40 h-16 w-16 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all duration-200 hover:scale-110"
          aria-label="Open AI Assistant"
        >
          <Bot size={32} />
        </button>
      )}

      {/* AI Assistant Modal */}
      {isChatOpen && (
        <div className="fixed bottom-8 right-8 z-50 w-[440px] max-w-[90vw]">
          <AIAssistant onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </div>
  )
}

export default Layout