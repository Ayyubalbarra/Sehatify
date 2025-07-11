"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { X, Send, Loader2, Brain } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// PERBAIKAN: Terima props onClose
interface AIAssistantProps {
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose }) => {
  // Hapus state `isOpen` dari sini
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Halo! Saya AI Assistant Sehatify. Bagaimana saya bisa membantu Anda mengelola rumah sakit hari ini?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      let response = "Terima kasih atas pertanyaan Anda. "
      if (message.toLowerCase().includes("pasien")) {
        response += "Untuk mengelola data pasien, Anda bisa menggunakan menu 'Data Pasien' di sidebar."
      } else if (message.toLowerCase().includes("stok") || message.toLowerCase().includes("obat")) {
        response += "Untuk monitoring stok obat, silakan gunakan menu 'Stok Medis'."
      } else if (message.toLowerCase().includes("jadwal") || message.toLowerCase().includes("dokter")) {
        response += "Untuk mengatur jadwal dokter, gunakan menu 'Jadwal dan SDM'."
      } else {
        response += "Saya dapat membantu Anda dengan berbagai hal terkait manajemen rumah sakit. Apa yang ingin Anda ketahui?"
      }
      return { success: true, data: { message: response, timestamp: new Date().toISOString() } }
    },
    onSuccess: (data) => {
      const assistantMessage: Message = { id: Date.now().toString(), role: "assistant", content: data.data.message, timestamp: new Date() }
      setMessages((prev) => [...prev, assistantMessage])
    },
    onError: (error) => { toast.error("Gagal mengirim pesan ke AI Assistant"); console.error("Chat error:", error) },
  })

  const handleSendMessage = () => {
    if (!inputMessage.trim() || chatMutation.isPending) return
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: inputMessage, timestamp: new Date() }
    setMessages((prev) => [...prev, userMessage])
    chatMutation.mutate(inputMessage)
    setInputMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })

  const quickSuggestions = [
    "Bagaimana cara menambah pasien baru?",
    "Cek stok obat yang rendah",
    "Lihat jadwal dokter hari ini",
    "Buat laporan bulanan",
  ]

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    inputRef.current?.focus()
  }

  return (
    // PERBAIKAN: Hapus pembungkus {isOpen && ...}
    <div className="flex flex-col w-full h-[80vh] max-h-[700px] rounded-2xl bg-white shadow-2xl overflow-hidden">
      {/* Header Chat */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base">AI Assistant</h3>
            <p className="text-xs opacity-80">Sehatify Hospital Management</p>
          </div>
        </div>
        {/* PERBAIKAN: Gunakan fungsi onClose dari props */}
        <button className="p-2 rounded-full transition-colors hover:bg-white/20" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Area Pesan */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((message) => (
          <div key={message.id} className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
            <div className={`px-4 py-2 rounded-2xl ${message.role === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-white text-slate-800 rounded-bl-lg shadow-sm'}`}>
              {message.content}
            </div>
            <div className="mt-1 text-xs text-slate-400">{formatTime(message.timestamp)}</div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex items-start max-w-[80%] self-start">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl rounded-bl-lg bg-white text-slate-800 shadow-sm">
              <Loader2 size={16} className="animate-spin text-slate-500" />
              <span className="text-sm italic">AI sedang mengetik...</span>
            </div>
          </div>
        )}

        {messages.length === 1 && !chatMutation.isPending && (
          <div className="p-4 bg-slate-100/70 rounded-lg">
            <h4 className="mb-2 text-xs font-semibold uppercase text-slate-500">Saran Pertanyaan:</h4>
            <div className="space-y-2">
              {quickSuggestions.map((suggestion, index) => (
                <button key={index} onClick={() => handleSuggestionClick(suggestion)} className="block w-full text-left text-sm p-2 rounded-md bg-white hover:bg-blue-50 border border-slate-200 transition-all hover:border-blue-200 hover:text-blue-700">
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tulis pesan Anda..."
            disabled={chatMutation.isPending}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || chatMutation.isPending}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant
