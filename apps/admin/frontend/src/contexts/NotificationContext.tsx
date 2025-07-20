// apps/admin/frontend/src/contexts/NotificationContext.tsx

"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast"; 

import { notificationAPI } from "../services/api";
import { Notification } from "../types"; 

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "_id" | "isRead" | "createdAt" | "title" | "time" | "updatedAt"> & { _id?: string, isRead?: boolean, createdAt?: string, updatedAt?: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  isLoadingNotifications: boolean;
  errorLoadingNotifications: boolean;
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
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Baru saja";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit yang lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam yang lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getNotificationDetails = (notification: Notification): Notification => {
    let title = "Notifikasi Umum";
    let uiType: Notification['type'];

    switch (notification.type) {
      case 'new_appointment':
        title = "Janji Temu Baru";
        uiType = "info"; 
        break;
      case 'stock_low':
        title = "Stok Rendah";
        uiType = "warning";
        break;
      case 'schedule_update':
        title = "Update Jadwal";
        uiType = "info";
        break;
      case 'system_alert':
        title = "Peringatan Sistem";
        uiType = "error";
        break;
      case 'login_attempt':
        title = "Aktivitas Login";
        uiType = "info"; 
        break;
      case 'info':
      case 'warning':
      case 'success':
      case 'error':
        title = notification.title || "Notifikasi"; 
        uiType = notification.type;
        break;
      default:
        uiType = "info"; 
        break;
    }
    return { 
      ...notification, 
      title, 
      type: uiType,
      time: formatTimeAgo(notification.createdAt) 
    };
  };

  const { data, isLoading: isLoadingNotifications, isError: errorLoadingNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationAPI.getNotifications();
      if (!response.data) {
        return [];
      }
      return response.data.map(getNotificationDetails);
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (data) {
      setNotifications(data);
    }
  }, [data]);

  useEffect(() => {
    // --- ▼▼▼ INI BAGIAN YANG DIPERBAIKI ▼▼▼ ---
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'; 
    
    if (!socketRef.current) {
        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });
        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            console.log('Connected to Socket.IO server (Admin Frontend Notifications)');
            newSocket.emit('join_notification_room', 'admin_notifications'); 
            newSocket.emit('join_notification_room', 'staff_notifications'); 
            newSocket.emit('join_notification_room', 'admin_dashboard_room'); 
        });

        newSocket.on('new_notification', (newNotificationData: Notification) => { 
            console.log('New notification received via Socket.IO:', newNotificationData);
            const processedNotification = getNotificationDetails(newNotificationData); 
            setNotifications(prev => [processedNotification, ...prev]);
            
            if (processedNotification.type === 'success') {
              toast.success(processedNotification.message);
            } else if (processedNotification.type === 'warning' || processedNotification.type === 'error' || processedNotification.type === 'system_alert') { 
              toast.error(processedNotification.message); 
            } else {
              toast.success(processedNotification.message, { icon: '🔔' }); 
            }

            queryClient.invalidateQueries({ queryKey: ['notifications'] }); 
        });

        newSocket.on('queue_updated', (queueData: any) => {
            console.log('Queue update received via Socket.IO:', queueData);
            queryClient.invalidateQueries({ queryKey: ['adminDashboardOverview'] });
            queryClient.invalidateQueries({ queryKey: ['todayQueues'] });
            toast.success(`Antrian ${queueData.queueNumber} (${queueData.patientName}) diperbarui!`);
        });
        
        newSocket.on('queue_updated_status', (queueData: any) => {
            console.log('Queue status update received:', queueData);
            queryClient.invalidateQueries({ queryKey: ['adminDashboardOverview'] });
            queryClient.invalidateQueries({ queryKey: ['todayQueues'] }); 
            toast.success(`Status antrian ${queueData.queueNumber} (${queueData.patientName}) berubah menjadi ${queueData.status}!`);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server (Admin Frontend Notifications)');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket.IO connection error (Admin Frontend Notifications):', error);
        });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('new_notification');
        socketRef.current.off('queue_updated');
        socketRef.current.off('queue_updated_status');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
      }
    };
  }, [queryClient]); 

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = useCallback((notification: Omit<Notification, "_id" | "isRead" | "createdAt" | "title" | "time" | "updatedAt"> & { _id?: string, isRead?: boolean, createdAt?: string, updatedAt?: string }) => {
    const finalNotification: Notification = getNotificationDetails({ 
      _id: notification._id || Date.now().toString(),
      isRead: notification.isRead !== undefined ? notification.isRead : false, 
      createdAt: notification.createdAt || new Date().toISOString(),
      ...notification,
    } as Notification); 
    setNotifications((prev) => [finalNotification, ...prev]);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) => (notification._id === id ? { ...notification, isRead: true } : notification)),
      );
    } catch (error) {
      toast.error("Gagal menandai notifikasi sebagai sudah dibaca.");
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("Semua notifikasi ditandai sebagai sudah dibaca.");
    } catch (error) {
      toast.error("Gagal menandai semua notifikasi sebagai sudah dibaca.");
      console.error("Error marking all notifications as read:", error);
    }
  }, [queryClient]);

  const removeNotification = useCallback(async (id: string) => {
    try {
      await notificationAPI.removeNotification(id);
      setNotifications((prev) => prev.filter((notification) => notification._id !== id));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("Notifikasi dihapus.");
    } catch (error) {
      toast.error("Gagal menghapus notifikasi.");
      console.error("Error removing notification:", error);
    }
  }, [queryClient]);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    isLoadingNotifications,
    errorLoadingNotifications,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
