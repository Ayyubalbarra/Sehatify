// apps/api/src/controllers/doctorController.ts

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import User from "../models/User";
import Polyclinic from '../models/Polyclinic';
import Schedule from '../models/Schedule';

class DoctorController {

  constructor() {
    this.getAllDoctors = this.getAllDoctors.bind(this);
    this.getDoctorById = this.getDoctorById.bind(this);
    this.createDoctor = this.createDoctor.bind(this);
    this.updateDoctor = this.updateDoctor.bind(this);
    this.deleteDoctor = this.deleteDoctor.bind(this);
    this.getDoctorStats = this.getDoctorStats.bind(this);
    this.getDoctorSchedule = this.getDoctorSchedule.bind(this);
    this.updateDoctorSchedule = this.updateDoctorSchedule.bind(this);
  }

  public async getAllDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '10', specialization, status, search, polyclinicId } = req.query as any;
      
      const filter: any = { role: "doctor", isActive: true }; // Tampilkan hanya dokter yang aktif

      // --- PERBAIKAN DI SINI ---
      // Logika diubah menjadi lebih sederhana dan langsung
      if (polyclinicId) {
        // Langsung filter User (dokter) yang memiliki polyclinicId yang cocok.
        filter.polyclinicId = polyclinicId;
      }
      // --- AKHIR PERBAIKAN ---
      
      if (specialization) filter.specialization = specialization;
      if (status) filter.isActive = status === "active";
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      const [doctors, total] = await Promise.all([
        User.find(filter).select("-password").sort({ name: 1 }).limit(limitNum).skip((pageNum - 1) * limitNum).lean(),
        User.countDocuments(filter),
      ]);
      
      res.json({ success: true, data: doctors, pagination: { totalPages: Math.ceil(total / limitNum), currentPage: pageNum, total }});
    } catch (error) {
      next(error);
    }
  }

  public async getDoctorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctor = await User.findOne({ _id: req.params.id, role: "doctor" }).select("-password").lean();
      if (!doctor) {
        res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
        return;
      }
      res.json({ success: true, data: doctor });
    } catch (error) {
      next(error);
    }
  }

  public async createDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }
    try {
      const doctorData = { ...req.body, role: "doctor" };
      const doctor = new User(doctorData);
      await doctor.save();
      const doctorResponse = doctor.toObject();
      delete (doctorResponse as any).password;
      res.status(201).json({ success: true, message: "Dokter berhasil dibuat", data: doctorResponse });
    } catch (error) {
      next(error);
    }
  }

  public async updateDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctor = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select("-password").lean();
      if (!doctor || doctor.role !== 'doctor') {
        res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
        return;
      }
      res.json({ success: true, message: "Dokter berhasil diupdate", data: doctor });
    } catch (error) {
      next(error);
    }
  }

  public async deleteDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctor = await User.findOneAndUpdate({ _id: req.params.id, role: "doctor" }, { isActive: false }, { new: true });
      if (!doctor) {
        res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
        return;
      }
      res.json({ success: true, message: "Dokter berhasil dinonaktifkan" });
    } catch (error) {
      next(error);
    }
  }

  public async getDoctorStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [totalDoctors, activeDoctors, specializationStats] = await Promise.all([
        User.countDocuments({ role: "doctor" }),
        User.countDocuments({ role: "doctor", isActive: true }),
        User.aggregate([
          { $match: { role: "doctor", isActive: true } },
          { $group: { _id: "$specialization", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);
      res.json({
        success: true,
        data: {
          overview: { total: totalDoctors, active: activeDoctors, inactive: totalDoctors - activeDoctors },
          specializations: specializationStats,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  
  public async getDoctorSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: doctorId } = req.params;
      const { date } = req.query;
      const query: any = { doctorId, status: "Active" };

      if (date) {
        const startOfDay = new Date(date as string);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(startOfDay.getDate() + 1);
        query.date = { $gte: startOfDay, $lt: endOfDay };
      }

      const schedules = await Schedule.find(query).populate('polyclinicId', 'name').sort({ date: 1, startTime: 1 }).lean();
      res.json({ success: true, data: schedules });
    } catch (error) {
      next(error);
    }
  }

  public async updateDoctorSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ success: false, message: "Fungsi update jadwal dokter belum diimplementasikan." });
  }
}

export default new DoctorController();