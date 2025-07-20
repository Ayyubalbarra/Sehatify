// apps/admin/frontend/src/components/AIAssistant/AIAssistant.tsx

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, X, BarChart2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { aiAPI } from "../../services/api";
// --- DIUBAH: Menambahkan tipe 'TableData' ---
import type { ChatMessage, LowStockInfoCard, AIResponseData, ChartData, TableData } from "../../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Komponen Kartu Stok Rendah ---
const LowStockCard: React.FC<{ cardData: LowStockInfoCard }> = ({ cardData }) => (
  <div className="mt-2 w-full space-y-2">
    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
      {cardData.title}
    </p>
    {cardData.items.map(item => (
      <div key={item._id} className="flex justify-between items-center bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
        <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">{item.name}</p>
        <div className="text-right">
          <p className="font-bold text-amber-700 dark:text-amber-200 text-sm">{item.stock} <span className="text-xs font-normal">{item.unit}</span></p>
          <p className="text-xs text-amber-600 dark:text-amber-400">(Min: {item.minStock})</p>
        </div>
      </div>
    ))}
  </div>
);

// --- Komponen Kartu Chart ---
const ChartCard: React.FC<{ cardData: ChartData }> = ({ cardData }) => (
  <div className="mt-2 w-full space-y-2">
      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{cardData.title}</p>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
            <BarChart data={cardData.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                <XAxis dataKey="name" fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip wrapperClassName="!bg-white/80 dark:!bg-black/80 !border-slate-300 dark:!border-slate-700 !rounded-lg" />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name={cardData.dataLabel} />
            </BarChart>
        </ResponsiveContainer>
      </div>
  </div>
);

// --- BARU: Komponen untuk Kartu Tabel ---
const TableCard: React.FC<{ cardData: TableData }> = ({ cardData }) => (
    <div className="mt-2 w-full space-y-2 text-sm">
      <p className="font-semibold text-slate-800 dark:text-slate-200">{cardData.title}</p>
      <div className="overflow-x-auto rounded-lg border border-slate-300/50 dark:border-slate-700/50">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              {cardData.headers.map((header) => (
                <th key={header} scope="col" className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/80 dark:bg-slate-800/80 divide-y divide-slate-200 dark:divide-slate-700">
            {cardData.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

const AIAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init1",
      role: "assistant",
      content: { type: 'text', content: "Halo! Saya AI Assistant Sehatify. Tanyakan apapun tentang data rumah sakit." },
      timestamp: new Date(),
    },
  ]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [inputMessage, setInputMessage] = useState<string>("");

  const chatMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await aiAPI.sendChatMessage(messageText);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Invalid response from AI");
      }
      return response.data;
    },
    onSuccess: (aiContent) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: aiContent,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error: any) => {
      console.error("Error sending message to AI:", error);
      toast.error(error.message || "Gagal terhubung dengan AI.");
    },
  });

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: { type: 'text', content: inputMessage },
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(inputMessage);
    setInputMessage("");
  };

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">AI Assistant</h2>
        <button onClick={onClose} className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-black/10 dark:hover:bg-white/10">
          <X size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-end gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === 'assistant' && <div className="flex-shrink-0 grid place-content-center h-8 w-8 rounded-full bg-blue-600 text-white"><BarChart2 size={16}/></div>}
            <div className={`max-w-[80%] rounded-xl p-3 ${
              message.role === "user"
                ? "bg-blue-600 text-white rounded-br-none"
                : "bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-md"
            }`}>
              {/* --- DIUBAH: Menambahkan logika render untuk tabel --- */}
              {message.content.type === 'text' && message.content.content}
              {message.content.type === 'low_stock_card' && <LowStockCard cardData={message.content.content as LowStockInfoCard} />}
              {message.content.type === 'chart' && <ChartCard cardData={message.content.content as ChartData} />}
              {message.content.type === 'table' && <TableCard cardData={message.content.content as TableData} />}
              
              <p className={`text-[10px] mt-1.5 text-right ${message.role === "user" ? "text-blue-200/80" : "text-slate-400 dark:text-slate-500"}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex items-end gap-2 justify-start">
             <div className="flex-shrink-0 grid place-content-center h-8 w-8 rounded-full bg-blue-600 text-white"><BarChart2 size={16}/></div>
            <div className="max-w-[70%] rounded-xl rounded-bl-none bg-white/80 dark:bg-slate-800/80 p-3 text-slate-800 dark:text-slate-200 shadow-md">
              <Loader2 className="animate-spin" size={16} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/20 flex-shrink-0">
        <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 rounded-xl p-2 border border-slate-300/50 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-blue-500">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tanya soal pasien, stok, jadwal..."
            className="flex-1 bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
            disabled={chatMutation.isPending}
          />
          <button
            onClick={handleSendMessage}
            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            disabled={chatMutation.isPending || inputMessage.trim() === ""}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;