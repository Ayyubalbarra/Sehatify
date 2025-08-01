// apps/api/src/controllers/queueController.ts

import { Request, Response, NextFunction } from 'express';
import Queue from "../models/Queue";
import Schedule from "../models/Schedule";
import PatientUser from '../models/patientUser.model'; 
import User from '../models/User'; 
import Polyclinic from '../models/Polyclinic'; 
import { AuthRequest } from '../middleware/auth';
import notificationService from '../services/notificationService'; 
import { Server as SocketIOServer } from 'socket.io'; 

class QueueController {

    constructor() {
        this.getAllQueues = this.getAllQueues.bind(this);
        this.getQueueById = this.getQueueById.bind(this);
        this.createQueue = this.createQueue.bind(this);
        this.updateQueueStatus = this.updateQueueStatus.bind(this);
        this.cancelQueue = this.cancelQueue.bind(this);
        this.getQueueStats = this.getQueueStats.bind(this);
        this.getTodayQueueSummary = this.getTodayQueueSummary.bind(this);
    }

    public async createQueue(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { scheduleId, notes } = req.body;
            const patientId = req.user?._id;

            if (!patientId) {
                return res.status(401).json({ success: false, message: "Akses ditolak. Silakan login kembali." });
            }

            if (!scheduleId) {
                return res.status(400).json({ success: false, message: "Jadwal praktek harus dipilih." });
            }
            
            const schedule = await Schedule.findById(scheduleId);
            if (!schedule) {
                return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan." });
            }

            if (schedule.availableSlots <= 0) {
                return res.status(400).json({ success: false, message: "Mohon maaf, kuota untuk jadwal ini sudah penuh." });
            }
            
            const existingQueue = await Queue.findOne({ patientId, scheduleId });
            if (existingQueue) {
                return res.status(400).json({ success: false, message: "Anda sudah terdaftar pada jadwal dokter ini." });
            }

            const newQueue = new Queue({
                patientId,
                scheduleId,
                notes,
                doctorId: schedule.doctorId,
                polyclinicId: schedule.polyclinicId,
                queueDate: schedule.date,
                appointmentTime: schedule.startTime,
                createdBy: patientId,
            });
            
            await newQueue.save();

            await Schedule.findByIdAndUpdate(scheduleId, { $inc: { bookedSlots: 1, availableSlots: -1 } });
            
            const populatedQueue = await Queue.findById(newQueue._id)
                .populate({ path: 'patientId', select: 'fullName' }) 
                .populate({ path: 'doctorId', select: 'name specialization' }) 
                .populate({ path: 'polyclinicId', select: 'name' }) 
                .lean();

            if (populatedQueue) {
                const patientName = populatedQueue.patientId && 'fullName' in populatedQueue.patientId ? populatedQueue.patientId.fullName : 'Pasien Tidak Dikenal';
                const doctorName = populatedQueue.doctorId && 'name' in populatedQueue.doctorId ? populatedQueue.doctorId.name : 'Dokter Tidak Dikenal';
                const polyclinicName = populatedQueue.polyclinicId && 'name' in populatedQueue.polyclinicId ? populatedQueue.polyclinicId.name : 'Poli Tidak Dikenal';
                const formattedDate = new Date(populatedQueue.queueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

                const notificationMessage = `Pasien baru (${patientName}) dengan nomor antrian ${populatedQueue.queueNumber} telah memesan janji temu dengan ${doctorName} di poli ${polyclinicName} pada ${formattedDate} pukul ${populatedQueue.appointmentTime}.`;
                
                const notification = await notificationService.createNotification({
                    message: notificationMessage,
                    type: 'new_appointment',
                    targetRoles: ['admin', 'staff'], 
                    relatedEntityId: populatedQueue._id,
                    link: `/dashboard/queue/${populatedQueue._id}` 
                });

                const io: SocketIOServer = req.app.get("io");
                if (io) {
                    notificationService.emitNotification(io, notification);
                    console.log(`✅ Notifikasi janji temu baru dipancarkan via Socket.IO: ${notification.message}`);
                    // Opsi: emit juga ke room dashboard agar antrian di dashboard update otomatis
                    io.to('admin_dashboard_room').emit('queue_updated', populatedQueue); 
                } else {
                    console.warn("❌ Socket.IO instance tidak ditemukan di Express app. Notifikasi real-time mungkin tidak berfungsi.");
                }
            }
            
            res.status(201).json({ success: true, message: "Antrian berhasil dibuat.", data: populatedQueue });
        } catch (error) {
            console.error("Create Queue Error:", error);
            next(error);
        }
    }
    
    public async getAllQueues(req: Request, res: Response, next: NextFunction) {
        try {
            const queues = await Queue.find()
                .populate("patientId", "fullName")
                .populate("polyclinicId", "name")
                .populate("doctorId", "name")
                .sort({ queueDate: -1, queueNumber: 1 })
                .lean();
            
            res.json({ success: true, data: queues });
        } catch (error) {
            next(error);
        }
    }

    public async getQueueById(req: Request, res: Response, next: NextFunction) {
        try {
            const queue = await Queue.findById(req.params.id)
                .populate("patientId")
                .populate("doctorId", "name specialization")
                .populate("polyclinicId", "name")
                .populate("scheduleId")
                .lean(); 
            
            if (!queue) {
                return res.status(404).json({ success: false, message: "Antrian tidak ditemukan" });
            }

            res.json({ success: true, data: queue });
        } catch (error) {
            next(error);
        }
    }

    public async updateQueueStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { status } = req.body;
            const updatedQueue = await Queue.findByIdAndUpdate(req.params.id, { status }, { new: true });
            
            if (!updatedQueue) {
                return res.status(404).json({ success: false, message: "Antrian tidak ditemukan" });
            }

            // Opsi: Emit notifikasi atau update ke dashboard setelah status diubah
            const io: SocketIOServer = req.app.get("io");
            if (io) {
                io.to('admin_dashboard_room').emit('queue_updated_status', updatedQueue); 
            }

            res.json({ success: true, message: "Status antrian diperbarui.", data: updatedQueue.toObject() });
        } catch (error) {
            next(error);
        }
    }
    
    public async cancelQueue(req: Request, res: Response, next: NextFunction) {
        try {
            const queue = await Queue.findById(req.params.id);
            if (!queue) return res.status(404).json({ success: false, message: "Antrian tidak ditemukan" });
            
            if (queue.status === "Completed" || queue.status === "Cancelled") {
                return res.status(400).json({ success: false, message: `Antrian sudah ${queue.status} dan tidak bisa dibatalkan.` });
            }

            queue.status = "Cancelled";
            await queue.save();
            
            await Schedule.findByIdAndUpdate(queue.scheduleId, { $inc: { bookedSlots: -1, availableSlots: 1 } });
            
            res.json({ success: true, message: "Antrian berhasil dibatalkan." });
        } catch (error) {
            next(error);
        }
    }
    
    public async getQueueStats(req: Request, res: Response, next: NextFunction) {
        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const stats = await Queue.aggregate([
                { $match: { queueDate: { $gte: todayStart } } },
                { 
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        waiting: { $sum: { $cond: [{ $eq: ["$status", "Waiting"] }, 1, 0] } },
                        completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                        inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } }
                    }
                }
            ]);

            const result = stats[0] || { total: 0, waiting: 0, completed: 0, inProgress: 0 };
            
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    public async getTodayQueueSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const queues = await Queue.aggregate([
                { $match: { queueDate: { $gte: todayStart } } },
                { $group: { _id: "$polyclinicId", count: { $sum: 1 } } },
                { $lookup: { from: "polyclinics", localField: "_id", foreignField: "_id", as: "polyclinicInfo" } },
                { $unwind: "$polyclinicInfo" },
                { $project: { _id: 0, polyclinicName: "$polyclinicInfo.name", count: 1 } },
                { $sort: { count: -1 } }
            ]);

            res.json({ success: true, data: queues });
        } catch (error) {
            next(error);
        }
    }
}

export default new QueueController();