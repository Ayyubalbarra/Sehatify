"use client"

import type React from "react"
import { X, AlertTriangle, Info, CheckCircle, Clock, Bell } from "lucide-react"
import { useNotifications } from "../../contexts/NotificationContext.tsx"

interface NotificationDropdownProps {
  onClose: () => void
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotifications()

  const getIcon = (type: string) => {
    const iconProps = { size: 20, className: "flex-shrink-0" };
    switch (type) {
      case "warning":
        return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100/60 text-amber-600"><AlertTriangle {...iconProps} /></div>
      case "info":
        return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100/60 text-blue-600"><Info {...iconProps} /></div>
      case "success":
        return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100/60 text-green-600"><CheckCircle {...iconProps} /></div>
      case "error":
        return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100/60 text-red-600"><AlertTriangle {...iconProps} /></div>
      default:
        return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600"><Clock {...iconProps} /></div>
    }
  }

  const handleNotificationClick = (id: string) => {
    markAsRead(id)
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg z-50 md:w-96">
      <div className="flex items-center justify-between border-b border-slate-100 p-3">
        <h3 className="font-semibold text-slate-800">Notifikasi</h3>
        <div className="flex items-center gap-2">
          <button onClick={markAllAsRead} className="text-xs font-medium text-blue-600 hover:underline">
            Tandai semua dibaca
          </button>
          <button onClick={onClose} className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <Bell size={32} className="text-slate-400" />
            <p className="mt-2 font-medium text-slate-600">Tidak ada notifikasi baru</p>
            <p className="text-sm text-slate-500">Semua sudah Anda baca.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`relative cursor-pointer p-3 transition-colors hover:bg-slate-50 ${notification.unread ? "bg-blue-50/50" : "bg-white"}`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">{notification.title}</p>
                        <p className="text-sm text-slate-600">{notification.message}</p>
                        <p className="mt-1 text-xs text-slate-400">{notification.time}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {notification.unread && <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" title="Belum dibaca"></div>}
                        <button
                            className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                            }}
                            title="Hapus notifikasi"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-2">
          <button className="w-full rounded-md py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100/50">
            Lihat Semua Notifikasi
          </button>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
