// apps/api/src/controllers/scheduleController.ts

import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Schedule from "../models/Schedule";
import Queue from "../models/Queue";
import User, { IUser } from "../models/User"; 
import Polyclinic, { IPolyclinic } from "../models/Polyclinic"; 
import { generateScheduleId } from "../utils/modelHelpers"; 
import { AuthRequest } from '../middleware/auth';
import { ISchedule } from '../interfaces/ISchedule'; 
import { IPatientUser } from '../models/patientUser.model'; 

// Interface baru untuk Schedule yang sudah di-populate
interface ISchedulePopulated extends ISchedule {
  // Overwrite properti dari ISchedule yang akan di-populate
  doctorId: IUser; 
  polyclinicId: IPolyclinic; 
  queues?: Array<{
    _id: Types.ObjectId;
    patientId: IPatientUser; // Menggunakan IPatientUser yang diimpor
    queueNumber: number;
    status: string;
  }>;
}

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
        searchDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(searchDate);
        nextDate.setDate(searchDate.getDate() + 1);
        query.date = { $gte: searchDate, $lt: nextDate };
      }

      const [schedules, total] = await Promise.all([
        Schedule.find(query)
          .populate("doctorId", "name specialization") 
          .populate("polyclinicId", "name") 
          .sort({ date: 1, startTime: 1 })
          .limit(Number(limit))
          .skip((Number(page) - 1) * Number(limit))
          .lean<ISchedulePopulated[]>(), 
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
      const scheduleId = new Types.ObjectId(req.params.id);

      const [schedule, queues] = await Promise.all([
        Schedule.findById(scheduleId)
          .populate("doctorId", "name specialization") 
          .populate("polyclinicId", "name")
          .lean<ISchedulePopulated>(), 
        // Populate patientId dengan fullName dari PatientUser
        Queue.find({ scheduleId }).populate("patientId", "fullName patientId").sort({ queueNumber: 1 }).lean(), 
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
      const { doctorId, polyclinicId, date, startTime, endTime, totalSlots, notes, status } = req.body; 

      const [doctor, polyclinic] = await Promise.all([
          User.findOne({ _id: doctorId, role: 'doctor' }).lean(),
          Polyclinic.findById(polyclinicId).lean()
      ]);
      
      if (!doctor) return res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
      if (!polyclinic) return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });

      const scheduleDate = new Date(date);
      const conflict = await Schedule.findOne({ 
        doctorId, 
        date: scheduleDate, 
        $or: [
          { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
          { startTime: { $gte: startTime, $lt: endTime } },
          { endTime: { $gt: startTime, $lte: endTime } }
        ]
      });
      
      if (conflict) {
        return res.status(400).json({ success: false, message: "Dokter sudah memiliki jadwal yang berbenturan pada waktu tersebut" });
      }

      const scheduleData = { 
        ...req.body, 
        scheduleId: generateScheduleId(), 
        createdBy: req.user?._id, 
        availableSlots: totalSlots, 
        bookedSlots: 0, 
        status: status || 'Active' 
      };

      const schedule = new Schedule(scheduleData);
      await schedule.save();

      const populatedSchedule = await schedule.populate([
        { path: "doctorId", select: "name specialization" }, 
        { path: "polyclinicId", select: "name" }
      ]);
      
      res.status(201).json({ success: true, message: "Jadwal berhasil ditambahkan", data: populatedSchedule.toObject() });
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

      const updateData: any = { ...req.body, updatedBy: req.user?._id };

      if (req.body.totalSlots !== undefined) {
        const newTotalSlots = Number(req.body.totalSlots);
        if (newTotalSlots < schedule.bookedSlots) {
          return res.status(400).json({ success: false, message: "Total slot tidak boleh kurang dari slot yang sudah dipesan." });
        }
        updateData.availableSlots = newTotalSlots - schedule.bookedSlots;
      }
      
      if (req.body.status && ['Cancelled', 'Completed'].includes(req.body.status)) {
          const activeQueues = await Queue.countDocuments({ 
              scheduleId: req.params.id, 
              status: { $in: ["Waiting", "In Progress"] } 
          });
          if (activeQueues > 0) {
              return res.status(400).json({ success: false, message: `Tidak dapat mengubah status jadwal menjadi ${req.body.status} karena masih ada antrean aktif (${activeQueues}).` });
          }
      }

      const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, updateData, { new: true })
        .populate("doctorId", "name specialization") 
        .populate("polyclinicId", "name")
        .lean<ISchedulePopulated>(); 

      res.json({ success: true, message: "Jadwal berhasil diperbarui", data: updatedSchedule });
    } catch (error) {
      next(error);
    }
  }

  // Cancel a schedule (Soft delete)
  public async deleteSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const scheduleId = new Types.ObjectId(req.params.id);
      const queueCount = await Queue.countDocuments({ scheduleId, status: { $in: ["Waiting", "In Progress"] } }); 
      if (queueCount > 0) {
        return res.status(400).json({ success: false, message: "Tidak dapat membatalkan jadwal yang sudah memiliki antrian aktif." });
      }

      const schedule = await Schedule.findByIdAndUpdate(scheduleId, { status: "Cancelled", updatedBy: req.user?._id }, { new: true });
      if (!schedule) {
        return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
      }
      res.json({ success: true, message: "Jadwal berhasil dibatalkan." });
    } catch (error) {
      next(error);
    }
  }

  // Get available schedules for a doctor on a specific date
  public async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { doctorId, date } = req.query;
      if (!doctorId || !date) {
        return res.status(400).json({ success: false, message: "ID Dokter dan tanggal harus diisi." });
      }

      const searchDate = new Date(date as string);
      searchDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(searchDate);
      nextDate.setDate(searchDate.getDate() + 1);

      const schedules = await Schedule.find({
        doctorId,
        date: { $gte: searchDate, $lt: nextDate },
        status: "Active",
        availableSlots: { $gt: 0 }
      }).populate("polyclinicId", "name").lean<ISchedulePopulated[]>(); 
      
      res.json({ success: true, data: schedules });
    } catch (error) {
      next(error);
    }
  }
}

export default new ScheduleController();