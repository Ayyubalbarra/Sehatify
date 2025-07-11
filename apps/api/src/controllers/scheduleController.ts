import { Request, Response, NextFunction } from 'express';
import Schedule from "../models/Schedule";
import Queue from "../models/Queue";
import User from "../models/User"; // Menggunakan model User
import Polyclinic from "../models/Polyclinic";
import { generateScheduleId } from "../utils/modelHelpers";
import { AuthRequest } from '../middleware/auth';

class ScheduleController {
  // Get all schedules with filtering and pagination
  public async getAllSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, doctorId, polyclinicId, date, status } = req.query;
      const query: any = {};
      
      if (doctorId) query.doctorId = doctorId;
      if (polyclinicId) query.polyclinicId = polyclinicId;
      if (status) query.status = status;
      if (date) {
        const searchDate = new Date(date as string);
        query.date = { $gte: new Date(searchDate.setHours(0, 0, 0, 0)), $lt: new Date(new Date(date as string).setHours(23, 59, 59, 999)) };
      }

      const [schedules, total] = await Promise.all([
        Schedule.find(query)
          .populate("doctorId", "name specialization")
          .populate("polyclinicId", "name")
          .sort({ date: 1, startTime: 1 })
          .limit(Number(limit))
          .skip((Number(page) - 1) * Number(limit))
          .lean(),
        Schedule.countDocuments(query),
      ]);
      
      res.json({ success: true, data: schedules, pagination: { totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page), total } });
    } catch (error) {
      next(error);
    }
  }

  // Get a single schedule by ID with its queue list
  public async getScheduleById(req: Request, res: Response, next: NextFunction) {
    try {
      const [schedule, queues] = await Promise.all([
        Schedule.findById(req.params.id).populate("doctorId", "name").populate("polyclinicId", "name").lean(),
        Queue.find({ scheduleId: req.params.id }).populate("patientId", "name").sort({ queueNumber: 1 }).lean(),
      ]);

      if (!schedule) {
        return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
      }
      res.json({ success: true, data: { ...schedule, queues } });
    } catch (error) {
      next(error);
    }
  }

  // Create a new schedule
  public async createSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { doctorId, date, startTime, endTime } = req.body;
      const [doctor, polyclinic] = await Promise.all([
          User.findOne({ _id: doctorId, role: 'doctor' }),
          Polyclinic.findById(req.body.polyclinicId)
      ]);
      
      if (!doctor) return res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
      if (!polyclinic) return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });

      const conflict = await Schedule.findOne({ doctorId, date: new Date(date), $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }] });
      if (conflict) {
        return res.status(400).json({ success: false, message: "Dokter sudah memiliki jadwal yang berbenturan pada waktu tersebut" });
      }

      const schedule = new Schedule({ ...req.body, scheduleId: generateScheduleId(), createdBy: req.user?.userId, availableSlots: req.body.totalSlots });
      await schedule.save();

      await schedule.populate([{ path: "doctorId", select: "name" }, { path: "polyclinicId", select: "name" }]);
      res.status(201).json({ success: true, message: "Jadwal berhasil ditambahkan", data: schedule });
    } catch (error) {
      next(error);
    }
  }

  // Update a schedule
  public async updateSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const schedule = await Schedule.findById(req.params.id);
      if (!schedule) {
        return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
      }

      const updateData: any = { ...req.body, updatedBy: req.user?.userId, updatedAt: new Date() };
      if (req.body.totalSlots) {
        updateData.availableSlots = req.body.totalSlots - schedule.bookedSlots;
        if (updateData.availableSlots < 0) return res.status(400).json({ success: false, message: "Total slot tidak boleh kurang dari slot yang sudah dibooking" });
      }

      const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate("doctorId", "name").populate("polyclinicId", "name");
      res.json({ success: true, message: "Jadwal berhasil diperbarui", data: updatedSchedule });
    } catch (error) {
      next(error);
    }
  }

  // Cancel a schedule
  public async deleteSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const queueCount = await Queue.countDocuments({ scheduleId: req.params.id });
      if (queueCount > 0) {
        return res.status(400).json({ success: false, message: "Tidak dapat membatalkan jadwal yang sudah memiliki antrian" });
      }

      const schedule = await Schedule.findByIdAndUpdate(req.params.id, { status: "Cancelled", updatedBy: req.user?.userId }, { new: true });
      if (!schedule) {
        return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
      }
      res.json({ success: true, message: "Jadwal berhasil dibatalkan" });
    } catch (error) {
      next(error);
    }
  }

  // Get available schedules for a doctor on a specific date
  public async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { doctorId, date } = req.query;
      if (!doctorId || !date) {
        return res.status(400).json({ success: false, message: "Doctor ID dan tanggal harus diisi" });
      }
      const searchDate = new Date(date as string);
      const schedules = await Schedule.find({
        doctorId,
        date: { $gte: new Date(searchDate.setHours(0, 0, 0, 0)), $lt: new Date(new Date(date as string).setHours(23, 59, 59, 999)) },
        status: "Active",
        availableSlots: { $gt: 0 }
      }).populate("polyclinicId", "name").lean();
      
      res.json({ success: true, data: schedules });
    } catch (error) {
      next(error);
    }
  }
}

export default new ScheduleController();