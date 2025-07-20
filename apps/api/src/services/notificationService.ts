// apps/api/src/services/notificationService.ts

import Notification, { INotification } from '../models/Notification';
import { Types } from 'mongoose';
import { Server as SocketIOServer } from 'socket.io'; // Import Socket.IO Server type

class NotificationService {
    // Fungsi untuk membuat dan menyimpan notifikasi baru
    public async createNotification(data: {
        message: string;
        type: INotification['type'];
        targetUserIds?: string[]; // Array of string IDs
        targetRoles?: string[];   // Array of strings (e.g., 'admin', 'staff')
        relatedEntityId?: Types.ObjectId;
        link?: string;
    }): Promise<INotification> {
        const notification = new Notification({
            ...data,
            targetUserIds: data.targetUserIds?.map(id => new Types.ObjectId(id)), // Konversi string ke ObjectId
        });
        await notification.save();
        return notification;
    }

    // Fungsi untuk memancarkan notifikasi melalui Socket.IO
    public emitNotification(io: SocketIOServer, notification: INotification) {
        if (notification.targetRoles && notification.targetRoles.length > 0) {
            // Emit ke room berdasarkan peran yang ditarget
            // Misalnya, admin akan bergabung ke room 'admin_notifications'
            notification.targetRoles.forEach(role => {
                io.to(`${role}_notifications`).emit('new_notification', notification);
            });
        }
        if (notification.targetUserIds && notification.targetUserIds.length > 0) {
            // Emit ke user spesifik jika ada
            notification.targetUserIds.forEach(userId => {
                io.to(userId.toString()).emit('new_notification', notification); // Asumsi user socket ID sama dengan user._id
            });
        }
    }

    // Fungsi untuk mendapatkan notifikasi yang belum dibaca untuk peran tertentu (misal admin)
    public async getUnreadNotificationsForRoles(roles: string[]): Promise<INotification[]> {
        return Notification.find({
            targetRoles: { $in: roles },
            isRead: false
        })
        .sort({ createdAt: -1 })
        .limit(20) // Batasi jumlah notifikasi yang diambil
        .lean(); // Mengembalikan objek JavaScript polos
    }

    // Fungsi untuk menandai notifikasi sebagai sudah dibaca
    public async markNotificationAsRead(notificationId: string): Promise<INotification | null> {
        return Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    }

    // Fungsi untuk menandai semua notifikasi untuk peran tertentu sebagai sudah dibaca
    public async markAllNotificationsAsReadForRoles(roles: string[]): Promise<void> {
        await Notification.updateMany(
            { targetRoles: { $in: roles }, isRead: false },
            { $set: { isRead: true } }
        );
    }

    // Fungsi untuk menghapus notifikasi
    public async deleteNotification(notificationId: string): Promise<void> {
        await Notification.findByIdAndDelete(notificationId);
    }
}

export default new NotificationService();