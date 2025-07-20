// apps/admin/frontend/src/components/Layout/Layout.tsx

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Bot } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AIAssistant from "../AIAssistant/AIAssistant";
import { AnimatePresence, motion } from "framer-motion"; // Import framer-motion

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

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

      {/* Tombol trigger AI Assistant */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-8 right-8 z-40 h-16 w-16 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all duration-200 hover:scale-110"
            aria-label="Open AI Assistant"
          >
            <Bot size={32} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Container Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 120 }}
            // --- PERUBAHAN TAMPILAN DI SINI ---
            className="fixed bottom-8 right-8 z-50 w-[440px] h-[70vh] max-w-[90vw] max-h-[700px] bg-gray-200/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20"
          >
            <AIAssistant onClose={() => setIsChatOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;