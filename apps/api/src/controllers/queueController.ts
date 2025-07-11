import { Request, Response, NextFunction } from 'express';
import { Server } from 'socket.io';
import Queue, { IQueue } from "../models/Queue";
import Schedule from "../models/Schedule";
import Patient from "../models/Patient";
import { AuthRequest } from '../middleware/auth';

// Helper Functions dengan Tipe Data

function calculateWaitTime(queue: IQueue): number {
  if (queue.status === 'Completed' || queue.status === 'Cancelled') return 0;
  const now = new Date();
  const queueTime = new Date(queue.createdAt);
  const diffInMinutes = Math.floor((now.getTime() - queueTime.getTime()) / (1000 * 60));
  return Math.max(0, diffInMinutes);
}

function transformStatus(status?: string): string {
  if (!status) return 'waiting';
  return status.toLowerCase().replace(/\s+/g, '-');
}

function formatAppointmentTime(schedule: any): string {
  if (!schedule || !schedule.startTime) return 'N/A';
  try {
    return new Date(schedule.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch (error) {
    return 'N/A';
  }
}

// Fungsi untuk mengambil dan memancarkan data antrian terbaru
async function emitQueueUpdate(io: Server) {
  try {
    const today = new Date();
    const query = {
      queueDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    };

    const queues = await Queue.find(query)
      .populate("patientId", "name")
      .populate("polyclinicId", "name")
      .populate("scheduleId", "startTime")
      .sort({ queueNumber: 1 })
      .limit(100)
      .lean<IQueue[]>();

    const transformedQueues = queues.map(queue => ({
      id: queue._id.toString(),
      patientName: (queue.patientId as any)?.name || 'Pasien Tidak Dikenal',
      polyclinic: (queue.polyclinicId as any)?.name || 'Poli Tidak Dikenal',
      appointmentTime: formatAppointmentTime(queue.scheduleId),
      status: transformStatus(queue.status),
      waitTime: calculateWaitTime(queue),
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
      const io: Server = req.app.get("io");
      const today = new Date();
      const query = {
        queueDate: {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lt: new Date(new Date(today).setHours(23, 59, 59, 999)),
        },
      };

      const queues = await Queue.find(query)
        .populate("patientId", "name")
        .populate("polyclinicId", "name")
        .populate("scheduleId", "startTime")
        .sort({ queueNumber: 1 })
        .limit(100)
        .lean<IQueue[]>();

      const transformedQueues = queues.map(queue => ({
          id: queue._id.toString(),
          patientName: (queue.patientId as any)?.name || 'Pasien Tidak Dikenal',
          polyclinic: (queue.polyclinicId as any)?.name || 'Poli Tidak Dikenal',
          appointmentTime: formatAppointmentTime(queue.scheduleId),
          status: transformStatus(queue.status),
          waitTime: calculateWaitTime(queue),
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
            createdBy: req.user?.userId,
        });
        await queue.save();

        await Schedule.findByIdAndUpdate(scheduleId, { $inc: { bookedSlots: 1, availableSlots: -1 } });
        
        const io: Server = req.app.get("io");
        await emitQueueUpdate(io);

        res.status(201).json({ success: true, message: "Antrian berhasil dibuat.", data: queue });
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

        const io: Server = req.app.get("io");
        await emitQueueUpdate(io);

        res.json({ success: true, message: "Status antrian diperbarui.", data: updatedQueue });
    } catch (error) {
      next(error);
    }
  }
  
  public async cancelQueue(req: Request, res: Response, next: NextFunction) {
     try {
        const queue = await Queue.findById(req.params.id);
        if (!queue) return res.status(404).json({ success: false, message: "Antrian tidak ditemukan" });

        queue.status = "Cancelled";
        await queue.save();
        
        await Schedule.findByIdAndUpdate(queue.scheduleId, { $inc: { bookedSlots: -1, availableSlots: 1 } });
        
        const io: Server = req.app.get("io");
        await emitQueueUpdate(io);

        res.json({ success: true, message: "Antrian dibatalkan." });
    } catch (error) {
        next(error);
    }
  }
  
  public async getQueueStats(req: Request, res: Response, next: NextFunction) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [totalQueues, waitingQueues, completedQueues] = await Promise.all([
        Queue.countDocuments({ queueDate: { $gte: today, $lt: tomorrow } }),
        Queue.countDocuments({ queueDate: { $gte: today, $lt: tomorrow }, status: "Waiting" }),
        Queue.countDocuments({ queueDate: { $gte: today, $lt: tomorrow }, status: "Completed" }),
      ]);

      res.json({
        success: true,
        data: {
          total: totalQueues,
          waiting: waitingQueues,
          completed: completedQueues,
          inProgress: totalQueues - waitingQueues - completedQueues, // Asumsi sisanya In Progress
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getTodayQueueSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const queues = await Queue.aggregate([
        { $match: { queueDate: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: "$polyclinicId", count: { $sum: 1 } } },
        { $lookup: { from: "polyclinics", localField: "_id", foreignField: "_id", as: "polyclinicInfo" } },
        { $unwind: "$polyclinicInfo" },
        { $project: { _id: 0, polyclinicName: "$polyclinicInfo.name", count: 1 } },
      ]);

      res.json({ success: true, data: queues });
    } catch (error) {
      next(error);
    }
  }
}

export default new QueueController();