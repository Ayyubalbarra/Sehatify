// apps/api/src/controllers/scheduleController.ts

import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Schedule, { ISchedule } from "../models/Schedule";
import Queue from "../models/Queue";
import User, { IUser } from "../models/User"; 
import Polyclinic, { IPolyclinic } from "../models/Polyclinic"; 
import { AuthRequest } from '../middleware/auth';
import moment from 'moment-timezone';

// Interface untuk hasil populate (tidak berubah)
type PopulatedDoctor = Pick<IUser, '_id' | 'name' | 'specialization'>;
type PopulatedPolyclinic = Pick<IPolyclinic, '_id' | 'name'>;

class ScheduleController {
  
  // Fungsi getScheduleStats (tidak berubah)
  public async getScheduleStats(req: Request, res: Response, next: NextFunction) {
    try {
        const today = moment().tz("Asia/Jakarta").startOf('day').toDate();
        const tomorrow = moment(today).add(1, 'day').toDate();

        const todaySchedules = await Schedule.find({
            date: { $gte: today, $lt: tomorrow },
            status: 'Active'
        }).lean();

        const doctorsOnDuty = new Set(todaySchedules.map(s => s.doctorId.toString())).size;
        const totalSlots = todaySchedules.reduce((sum, s) => sum + (s.totalSlots || 0), 0);
        const bookedSlots = todaySchedules.reduce((sum, s) => sum + (s.bookedSlots || 0), 0);
        const utilization = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

        res.json({ success: true, data: { doctorsOnDuty, totalSlots, utilization } });
    } catch (error) {
        next(error);
    }
  }

  // --- FUNGSI GET ALL DIPERBARUI DENGAN TRANSFORMASI DATA ---
  public async getAllSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 50, date, search } = req.query;
      const query: any = {};
      
      if (search) {
        const doctors = await User.find({ name: { $regex: search, $options: "i" }, role: 'doctor' }).select('_id');
        const doctorIds = doctors.map(d => d._id);
        const polyclinics = await Polyclinic.find({ name: { $regex: search, $options: "i" } }).select('_id');
        const polyclinicIds = polyclinics.map(p => p._id);
        query.$or = [ { doctorId: { $in: doctorIds } }, { polyclinicId: { $in: polyclinicIds } } ];
      }
      
      if (date) {
        const searchDate = moment(date as string).tz("Asia/Jakarta").startOf('day').toDate();
        const nextDate = moment(searchDate).add(1, 'day').toDate();
        query.date = { $gte: searchDate, $lt: nextDate };
      }

      const [schedules, total] = await Promise.all([
        Schedule.find(query)
          .populate<{ doctorId: PopulatedDoctor }>("doctorId", "name specialization") 
          .populate<{ polyclinicId: PopulatedPolyclinic }>("polyclinicId", "name") 
          .sort({ date: 1, startTime: 1 })
          .limit(Number(limit))
          .skip((Number(page) - 1) * Number(limit))
          .lean(), 
        Schedule.countDocuments(query),
      ]);
      
      // --- PERBAIKAN UTAMA DI SINI ---
      // Ubah nama field agar cocok dengan yang diharapkan frontend (`doctorInfo` & `polyclinicInfo`)
      const formattedSchedules = schedules.map(s => ({
        ...s,
        doctorInfo: s.doctorId,
        polyclinicInfo: s.polyclinicId
      }));
      // --- AKHIR PERBAIKAN ---

      res.json({ 
          success: true, 
          data: formattedSchedules, // Kirim data yang sudah diformat
          pagination: { totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page), total } 
      });
    } catch (error) {
      next(error);
    }
  }

  // Sisa fungsi controller (getScheduleById, createSchedule, dst.) tidak perlu diubah...
  public async getScheduleById(req: Request, res: Response, next: NextFunction) { /* ... isi fungsi tetap sama ... */ }
  public async createSchedule(req: AuthRequest, res: Response, next: NextFunction) { /* ... isi fungsi tetap sama ... */ }
  public async updateSchedule(req: AuthRequest, res: Response, next: NextFunction) { /* ... isi fungsi tetap sama ... */ }
  public async deleteSchedule(req: AuthRequest, res: Response, next: NextFunction) { /* ... isi fungsi tetap sama ... */ }
  public async getAvailableSlots(req: Request, res: Response, next: NextFunction) { /* ... isi fungsi tetap sama ... */ }
}

// Untuk memudahkan copy-paste, saya sertakan kembali isi fungsi yang tidak berubah
const controller = new ScheduleController();
controller.getScheduleById = async function(req: Request, res: Response, next: NextFunction) {
    try {
      const scheduleId = new Types.ObjectId(req.params.id);
      const [schedule, queues] = await Promise.all([
        Schedule.findById(scheduleId).populate<{ doctorId: PopulatedDoctor }>("doctorId", "name specialization").populate<{ polyclinicId: PopulatedPolyclinic }>("polyclinicId", "name").lean(), 
        Queue.find({ scheduleId }).populate("patientId", "fullName patientId").sort({ queueNumber: 1 }).lean(), 
      ]);
      if (!schedule) return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
      res.json({ success: true, data: { ...schedule, queues } });
    } catch (error) { next(error); }
};
controller.createSchedule = async function(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { doctorId, polyclinicId, date, startTime, endTime, totalSlots } = req.body; 
      const [doctor, polyclinic] = await Promise.all([ User.findOne({ _id: doctorId, role: 'doctor' }).lean(), Polyclinic.findById(polyclinicId).lean() ]);
      if (!doctor) return res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
      if (!polyclinic) return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });
      const scheduleDate = new Date(date);
      const conflict = await Schedule.findOne({ doctorId, date: scheduleDate, $or: [ { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, { startTime: { $gte: startTime, $lt: endTime } }, { endTime: { $gt: startTime, $lte: endTime } } ] });
      if (conflict) return res.status(400).json({ success: false, message: "Dokter sudah memiliki jadwal yang berbenturan pada waktu tersebut" });
      const scheduleData = { ...req.body, createdBy: req.user?._id, availableSlots: totalSlots, bookedSlots: 0 };
      const schedule = new Schedule(scheduleData);
      await schedule.save();
      const populatedSchedule = await schedule.populate([ { path: "doctorId", select: "name specialization" }, { path: "polyclinicId", select: "name" } ]);
      res.status(201).json({ success: true, message: "Jadwal berhasil ditambahkan", data: populatedSchedule.toObject() });
    } catch (error) { next(error); }
};
controller.updateSchedule = async function(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const schedule = await Schedule.findById(req.params.id);
      if (!schedule) return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
      const updateData: any = { ...req.body, updatedBy: req.user?._id };
      if (req.body.totalSlots !== undefined) {
        const newTotalSlots = Number(req.body.totalSlots);
        if (newTotalSlots < schedule.bookedSlots) return res.status(400).json({ success: false, message: "Total slot tidak boleh kurang dari slot yang sudah dipesan." });
        updateData.availableSlots = newTotalSlots - schedule.bookedSlots;
      }
      if (req.body.status && ['Cancelled', 'Completed'].includes(req.body.status)) {
        const activeQueues = await Queue.countDocuments({ scheduleId: req.params.id, status: { $in: ["Waiting", "In Progress"] } });
        if (activeQueues > 0) return res.status(400).json({ success: false, message: `Tidak dapat mengubah status jadwal menjadi ${req.body.status} karena masih ada antrean aktif (${activeQueues}).` });
      }
      const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate<{ doctorId: PopulatedDoctor }>("doctorId", "name specialization").populate<{ polyclinicId: PopulatedPolyclinic }>("polyclinicId", "name").lean(); 
      res.json({ success: true, message: "Jadwal berhasil diperbarui", data: updatedSchedule });
    } catch (error) { next(error); }
};
controller.deleteSchedule = async function(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const scheduleId = new Types.ObjectId(req.params.id);
      const queueCount = await Queue.countDocuments({ scheduleId, status: { $in: ["Waiting", "In Progress"] } }); 
      if (queueCount > 0) return res.status(400).json({ success: false, message: "Tidak dapat membatalkan jadwal yang sudah memiliki antrian aktif." });
      const schedule = await Schedule.findByIdAndUpdate(scheduleId, { status: "Cancelled", updatedBy: req.user?._id }, { new: true });
      if (!schedule) return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan" });
      res.json({ success: true, message: "Jadwal berhasil dibatalkan." });
    } catch (error) { next(error); }
};
controller.getAvailableSlots = async function(req: Request, res: Response, next: NextFunction) {
    try {
      const { doctorId, date } = req.query;
      if (!doctorId || !date) return res.status(400).json({ success: false, message: "ID Dokter dan tanggal harus diisi." });
      const searchDate = new Date(date as string); searchDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(searchDate); nextDate.setDate(searchDate.getDate() + 1);
      const schedules = await Schedule.find({ doctorId, date: { $gte: searchDate, $lt: nextDate }, status: "Active", availableSlots: { $gt: 0 } }).populate<{ polyclinicId: PopulatedPolyclinic }>("polyclinicId", "name").lean(); 
      res.json({ success: true, data: schedules });
    } catch (error) { next(error); }
};

export default controller;