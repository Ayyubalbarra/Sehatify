"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface Notification {
  id: string
  type: "info" | "warning" | "success" | "error"
  title: string
  message: string
  time: string
  unread: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "time" | "unread">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "warning",
      title: "Stok Rendah",
      message: "5 item obat memiliki stok di bawah minimum",
      time: "2 menit yang lalu",
      unread: true,
    },
    {
      id: "2",
      type: "info",
      title: "Jadwal Dokter",
      message: "Dr. Sarah akan terlambat 30 menit hari ini",
      time: "15 menit yang lalu",
      unread: true,
    },
    {
      id: "3",
      type: "success",
      title: "Backup Selesai",
      message: "Backup database berhasil dilakukan",
      time: "1 jam yang lalu",
      unread: false,
    },
  ])

  const unreadCount = notifications.filter((n) => n.unread).length

  const addNotification = (notification: Omit<Notification, "id" | "time" | "unread">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      time: "Baru saja",
      unread: true,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, unread: false } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, unread: false })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
