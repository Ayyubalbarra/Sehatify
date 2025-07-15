import { Request, Response, NextFunction } from 'express';
import { Server } from 'socket.io';
import Queue from "../models/Queue";
import Schedule from "../models/Schedule";
import { AuthRequest } from '../middleware/auth';
import { IQueue } from '../interfaces/IQueue'; // Pastikan Anda memiliki interface ini

// Tipe untuk hasil populate yang lebih spesifik
interface PopulatedQueueForList {
    _id: string;
    patientId: { name: string; } | null;
    polyclinicId: { name: string; } | null;
    scheduleId: { startTime: string; } | null;
    status: string;
    createdAt: Date;
    queueNumber: number;
}

// Helper Functions dengan Tipe Data yang Lebih Aman
function calculateWaitTime(createdAt: Date, status: string): number {
  if (status === 'Completed' || status === 'Cancelled') return 0;
  const now = new Date();
  const queueTime = new Date(createdAt);
  const diffInMinutes = Math.floor((now.getTime() - queueTime.getTime()) / (1000 * 60));
  return Math.max(0, diffInMinutes);
}

function transformStatus(status?: string): string {
  if (!status) return 'waiting';
  return status.toLowerCase().replace(/\s+/g, '-');
}

function formatAppointmentTime(schedule?: { startTime: string } | null): string {
  if (!schedule?.startTime) return 'N/A';
  try {
    // Asumsi startTime adalah string jam seperti "08:00"
    return schedule.startTime;
  } catch (error) {
    return 'N/A';
  }
}

// Fungsi untuk mengambil dan memancarkan data antrian terbaru
async function emitQueueUpdate(io: Server) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const queues = await Queue.find({ queueDate: { $gte: todayStart } })
      .populate("patientId", "name")
      .populate("polyclinicId", "name")
      .populate("scheduleId", "startTime")
      .sort({ queueNumber: 1 })
      .limit(100)
      .lean<PopulatedQueueForList[]>();

    const transformedQueues = queues.map(queue => ({
      id: queue._id.toString(),
      patientName: queue.patientId?.name || 'Pasien Dihapus',
      polyclinic: queue.polyclinicId?.name || 'Poli Dihapus',
      appointmentTime: formatAppointmentTime(queue.scheduleId),
      status: transformStatus(queue.status),
      waitTime: calculateWaitTime(queue.createdAt, queue.status),
      queueNumber: queue.queueNumber || 0,
    }));
    
    io.emit("queueUpdate", { success: true, data: transformedQueues });
    console.log("📢 Emitted queueUpdate to all clients.");
  } catch (error) {
    console.error("❌ Error emitting queue update:", error);
  }
}

class QueueController {
  public async getAllQueues(req: Request, res: Response, next: NextFunction) {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const queues = await Queue.find({ queueDate: { $gte: todayStart } })
        .populate("patientId", "name")
        .populate("polyclinicId", "name")
        .populate("scheduleId", "startTime")
        .sort({ queueNumber: 1 })
        .limit(100)
        .lean<PopulatedQueueForList[]>();

      const transformedQueues = queues.map(queue => ({
          id: queue._id.toString(),
          patientName: queue.patientId?.name || 'Pasien Dihapus',
          polyclinic: queue.polyclinicId?.name || 'Poli Dihapus',
          appointmentTime: formatAppointmentTime(queue.scheduleId),
          status: transformStatus(queue.status),
          waitTime: calculateWaitTime(queue.createdAt, queue.status),
          queueNumber: queue.queueNumber || 0,
      }));
      
      res.json({ success: true, data: transformedQueues });
    } catch (error) {
      next(error);
    }
  }

  public async getQueueById(req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await Queue.findById(req.params.id)
        .populate("patientId", "name phone")
        .populate("doctorId", "name specialization")
        .populate("polyclinicId", "name")
        .populate("scheduleId", "date startTime endTime")
        .lean<IQueue>();

      if (!queue) {
        return res.status(404).json({ success: false, message: "Antrian tidak ditemukan" });
      }

      res.json({ success: true, data: queue });
    } catch (error) {
      next(error);
    }
  }

  public async createQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { patientId, scheduleId, notes } = req.body;
        
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
        }

        if(schedule.availableSlots <= 0) {
            return res.status(400).json({ success: false, message: "Kuota untuk jadwal ini sudah penuh." });
        }

        const lastQueue = await Queue.findOne({ scheduleId }).sort({ queueNumber: -1 });
        const queueNumber = (lastQueue?.queueNumber || 0) + 1;

        const queue = new Queue({
            patientId,
            scheduleId,
            notes,
            doctorId: schedule.doctorId,
            polyclinicId: schedule.polyclinicId,
            queueNumber,
            queueDate: schedule.date,
            createdBy: req.user?._id,
        });
        await queue.save();

        await Schedule.findByIdAndUpdate(scheduleId, { $inc: { bookedSlots: 1, availableSlots: -1 } });
        
        await emitQueueUpdate(req.app.get("io"));

        res.status(201).json({ success: true, message: "Antrian berhasil dibuat.", data: queue.toObject() });
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

        await emitQueueUpdate(req.app.get("io"));

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
        
        await emitQueueUpdate(req.app.get("io"));

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