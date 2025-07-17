// apps/admin/frontend/src/components/AIAssistant/AIAssistant.tsx

"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { X, Send, Loader2, Brain } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { aiAPI } from "../../services/api"
import type { ChatMessage, LowStockInfoCard, AIResponseData } from "../../types"

// --- Komponen untuk Menampilkan Konten Terstruktur ---

const LowStockCard: React.FC<{ cardData: LowStockInfoCard }> = ({ cardData }) => (
  <div className="mt-2 w-full space-y-2">
    <p className="font-semibold text-sm text-slate-700">Berikut adalah {cardData.items.length} item dengan stok rendah:</p>
    {cardData.items.map(item => (
      <div key={item._id} className="flex justify-between items-center bg-amber-50 p-2 rounded-lg border border-amber-200">
        <div>
          <p className="font-medium text-amber-800 text-sm">{item.name}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-amber-700 text-sm">{item.currentStock} <span className="text-xs font-normal">{item.unit}</span></p>
          <p className="text-xs text-amber-500">(Min: {item.minimumStock})</p>
        </div>
      </div>
    ))}
  </div>
);

// --- Komponen Utama AI Assistant ---

interface AIAssistantProps {
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init1",
      role: "assistant",
      content: { type: 'text', content: "Halo! Saya AI Assistant Sehatify. Apa yang ingin Anda ketahui hari ini?" },
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const chatMutation = useMutation({
    mutationFn: aiAPI.sendChatMessage,
    onSuccess: (response) => {
      const assistantMessage: ChatMessage = { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: response.data,
        timestamp: new Date() 
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error) => { toast.error("Gagal mendapat respon dari AI."); console.error("Chat error:", error); },
  });

  const handleSendMessage = (messageText: string) => {
    if (!messageText.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = { 
        id: Date.now().toString(), 
        role: "user", 
        content: messageText,
        timestamp: new Date() 
    };
    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(messageText);
    setInputMessage("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const formatTime = (date: Date) => date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const quickSuggestions = [
    "Cek stok obat yang rendah",
    "Lihat jadwal dokter hari ini",
  ];

  return (
    <div className="flex flex-col w-full h-[80vh] max-h-[700px] rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20"><Brain size={20} /></div>
          <div>
            <h3 className="font-bold text-base">AI Assistant</h3>
            <p className="text-xs opacity-80">Sehatify Hospital Management</p>
          </div>
        </div>
        <button className="p-2 rounded-full transition-colors hover:bg-white/20" onClick={onClose}><X size={20} /></button>
      </div>

      {/* Daftar Pesan */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((message) => (
          <div key={message.id} className={`flex flex-col max-w-[85%] ${message.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
            <div className={`px-4 py-3 rounded-2xl ${message.role === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-white text-slate-800 rounded-bl-lg shadow-sm border border-slate-100'}`}>
              {typeof message.content === 'string' ? (
                message.content
              ) : (
                <>
                  {message.content.type === 'text' && message.content.content}
                  {message.content.type === 'low_stock_card' && <LowStockCard cardData={message.content} />}
                </>
              )}
            </div>
            <div className="mt-1.5 text-xs text-slate-400">{formatTime(message.timestamp)}</div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex items-start max-w-[80%] self-start">
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-lg bg-white text-slate-800 shadow-sm border border-slate-100">
              <Loader2 size={16} className="animate-spin text-slate-500" />
              <span className="text-sm italic">AI sedang berpikir...</span>
            </div>
          </div>
        )}

        {messages.length === 1 && !chatMutation.isPending && (
          <div className="p-3 bg-slate-100/80 rounded-lg">
            <h4 className="mb-2 text-xs font-semibold uppercase text-slate-500">Saran:</h4>
            <div className="space-y-2">
              {quickSuggestions.map((suggestion, index) => (
                <button key={index} onClick={() => handleSuggestionClick(suggestion)} className="block w-full text-left text-sm p-2.5 rounded-md bg-white hover:bg-blue-50 border border-slate-200 transition-all hover:border-blue-200 hover:text-blue-700">
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
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tulis pesan Anda..."
            disabled={chatMutation.isPending}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || chatMutation.isPending}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default AIAssistant;