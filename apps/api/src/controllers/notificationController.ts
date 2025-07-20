// apps/api/src/controllers/notificationController.ts

import { Request, Response, NextFunction } from 'express';
import notificationService from '../services/notificationService';
import { AuthRequest } from '../middleware/auth'; // Perlu AuthRequest untuk mendapatkan req.user dan req.userType

class NotificationController {
    constructor() {
        this.getNotifications = this.getNotifications.bind(this);
        this.markAsRead = this.markAsRead.bind(this);
        this.markAllAsRead = this.markAllAsRead.bind(this); // Bind method baru
        this.deleteNotification = this.deleteNotification.bind(this);
    }

    // Mendapatkan notifikasi untuk user yang sedang login (berdasarkan role atau id)
    public async getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.userType) {
                res.status(401).json({ success: false, message: 'Autentikasi diperlukan.' });
                return;
            }

            // Dapatkan peran pengguna yang login
            const rolesToFetch = [];
            if (req.userType === 'admin' || req.userType === 'Super Admin') {
                rolesToFetch.push('admin');
            }
            if (req.userType === 'staff') {
                rolesToFetch.push('staff');
            }
            // Anda bisa tambahkan peran 'doctor' jika dokter juga melihat notifikasi ini

            // Jika user adalah pasien, bisa ambil notifikasi spesifik untuk patientId mereka
            // if (req.userType === 'patient') {
            //     // Implementasi getUnreadNotificationsForUser(req.user._id.toString()) jika ada
            // }

            const notifications = await notificationService.getUnreadNotificationsForRoles(rolesToFetch);
            
            res.json({ success: true, data: notifications });
        } catch (error) {
            console.error("Error getting notifications:", error);
            next(error);
        }
    }

    // Menandai notifikasi sebagai sudah dibaca
    public async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const notification = await notificationService.markNotificationAsRead(id);
            if (!notification) {
                return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan.' });
            }
            res.json({ success: true, message: 'Notifikasi berhasil ditandai sebagai sudah dibaca.', data: notification });
        } catch (error) {
            console.error("Error marking notification as read:", error);
            next(error);
        }
    }

    // Menandai semua notifikasi sebagai sudah dibaca untuk peran pengguna
    public async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.userType) {
                res.status(401).json({ success: false, message: 'Autentikasi diperlukan.' });
                return;
            }
            const rolesToMark = [];
            if (req.userType === 'admin' || req.userType === 'Super Admin') {
                rolesToMark.push('admin');
            }
            if (req.userType === 'staff') {
                rolesToMark.push('staff');
            }
            await notificationService.markAllNotificationsAsReadForRoles(rolesToMark);
            res.json({ success: true, message: 'Semua notifikasi ditandai sebagai sudah dibaca.' });
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            next(error);
        }
    }

    // Menghapus notifikasi
    public async deleteNotification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await notificationService.deleteNotification(id);
            res.json({ success: true, message: 'Notifikasi berhasil dihapus.' });
        } catch (error) {
            console.error("Error deleting notification:", error);
            next(error);
        }
    }
}

export default new NotificationController();