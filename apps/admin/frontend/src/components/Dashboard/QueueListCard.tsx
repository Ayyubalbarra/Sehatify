"use client"

import React, { useEffect, useState } from "react"
import { Clock, User, MapPin, AlertCircle } from "lucide-react"
import { io, Socket } from "socket.io-client" // <-- Import io

interface QueueItem {
  id: string
  patientName: string
  polyclinic: string
  appointmentTime: string
  status: "waiting" | "in-progress" | "completed" | "cancelled" | "no show"
  waitTime: number
  queueNumber?: number
}

// Definisikan alamat backend Anda, sesuaikan jika perlu
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

const QueueListCard: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // =================================================================
  // LOGIKA REAL-TIME DENGAN SOCKET.IO
  // =================================================================
  useEffect(() => {
    // 1. Lakukan fetch data awal saat komponen dimuat
    const fetchInitialData = async () => {
      try {
        setIsLoading(true)
        const today = new Date().toISOString().split("T")[0]
        const res = await fetch(`${BACKEND_URL}/api/queues?date=${today}&limit=100`, {
          headers: {
            // Asumsi token ada di localStorage
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        const data = await res.json()
        if (data.success) {
          setQueue(data.data)
        } else {
          setError(data.message || "Gagal memuat data antrian awal")
        }
      } catch (err) {
        console.error(err)
        setError("Terjadi kesalahan saat memuat data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()

    // 2. Buat koneksi Socket.IO
    const socket: Socket = io(BACKEND_URL, {
        transports: ['websocket'], // Lebih prefer WebSocket
    })

    // 3. Dengarkan event 'queueUpdate' dari server
    socket.on("queueUpdate", (updatedData: { success: boolean, data: QueueItem[] }) => {
      if (updatedData.success) {
        console.log("Received queue update:", updatedData.data)
        setQueue(updatedData.data) // Update state dengan data baru
        setError(null); // Hapus error jika update berhasil
      }
    });
    
    // Memberi tahu jika koneksi berhasil
    socket.on('connect', () => {
        console.log('Connected to WebSocket server!');
    });

    // Memberi tahu jika ada error koneksi
    socket.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err.message);
        setError('Gagal terhubung ke server real-time.');
    });


    // 4. Cleanup: Putuskan koneksi saat komponen di-unmount
    return () => {
      console.log("Disconnecting socket...")
      socket.disconnect()
    }
  }, []) // Dependency array kosong agar hanya berjalan sekali saat mount

  // ... (semua fungsi helper seperti getStatusDetails dan formatWaitTime tetap sama)
  const getStatusDetails = (/* ... */) => { /* ... */ }
  const formatWaitTime = (/* ... */) => { /* ... */ }

  // ... (semua logika render untuk isLoading dan error tetap sama)
  if (isLoading) { /* ... */ }
  if (error && queue.length === 0) { /* ... */ }


  // Render utama komponen (tidak ada perubahan di sini)
  return (
    <div className="flex h-full max-h-[500px] flex-col rounded-xl border border-slate-200 bg-white p-5">
      {/* Header */}
      <div className="mb-4 flex flex-col items-start justify-between gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-center">
        <h3 className="text-base font-semibold text-slate-800">Antrian Hari Ini</h3>
        <div className="rounded-full bg-blue-100/60 px-2.5 py-1 text-xs font-semibold text-blue-700">
          {queue.length} Pasien
        </div>
      </div>
      
      {/* Pesan error jika ada tapi data masih tampil */}
      {error && (
        <div className="my-2 p-2 bg-red-100 text-red-700 text-xs rounded-md text-center">
          {error} (Menampilkan data terakhir yang berhasil dimuat)
        </div>
      )}


      {/* Daftar */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {/* ... (logika render untuk queue.length === 0 dan queue.map tetap sama) ... */}
      </div>

      {/* Footer */}
      {/* ... (logika render footer tetap sama) ... */}
    </div>
  )
}

export default QueueListCard
