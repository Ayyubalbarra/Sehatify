// apps/api/src/controllers/doctorController.ts

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import User from "../models/User";
import Schedule from '../models/Schedule'; // Impor model Schedule
import { IDoctor, WorkSchedule } from "../interfaces/IDoctor"; // Asumsi interface dipindah ke file terpisah
import { ISchedule } from '../interfaces/IQueue'; // Impor ISchedule jika diperlukan

// Interface lokal untuk request dan response
interface DoctorQueryParams {
  page?: string;
  limit?: string;
  specialization?: string;
  status?: string;
  search?: string;
}

interface DoctorFilter {
  role: 'doctor'; // Dibuat lebih spesifik
  specialization?: RegExp;
  isActive?: boolean;
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
}

interface PaginationInfo {
  totalPages: number;
  currentPage: number;
  total: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: PaginationInfo;
}

class DoctorController {
  // Get all doctors with filtering and pagination
  async getAllDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '10', specialization, status, search } = req.query as DoctorQueryParams;
      
      const filter: DoctorFilter = { role: "doctor" };
      
      if (specialization) {
        filter.specialization = new RegExp(`^${specialization}$`, "i");
      }
      if (status) {
        filter.isActive = status === "active";
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      const [doctors, total] = await Promise.all([
        User.find(filter)
          .select("-password -__v")
          .sort({ name: 1 })
          .limit(limitNum)
          .skip((pageNum - 1) * limitNum)
          .lean(),
        User.countDocuments(filter),
      ]);

      const response: ApiResponse<IDoctor[]> = { // Ganti ke IDoctor[] untuk konsistensi
        success: true,
        data: doctors as IDoctor[], 
        pagination: { 
          totalPages: Math.ceil(total / limitNum), 
          currentPage: pageNum, 
          total 
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get a single doctor by ID
  async getDoctorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctor = await User.findOne({ 
        _id: req.params.id, 
        role: "doctor" 
      }).select("-password").lean();

      if (!doctor) {
        res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
        return;
      }

      res.json({ success: true, data: doctor as IDoctor }); 
    } catch (error) {
      next(error);
    }
  }

  // Create a new doctor (as a User with 'doctor' role)
  async createDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    try {
      const { email, licenseNumber } = req.body;
      
      const existingUser = await User.findOne({ 
        $or: [{ email: email.toLowerCase() }, { licenseNumber }] 
      }).lean();

      if (existingUser) {
        const message = existingUser.email === email.toLowerCase() ? "Email sudah terdaftar" : "Nomor lisensi sudah terdaftar";
        res.status(400).json({ success: false, message });
        return;
      }

      const doctor = new User({ ...req.body, role: "doctor", email: email.toLowerCase() });
      await doctor.save();

      const doctorResponse = doctor.toObject();
      delete doctorResponse.password;

      res.status(201).json({ 
        success: true, 
        message: "Dokter berhasil dibuat", 
        data: doctorResponse as IDoctor 
      });
    } catch (error) {
      next(error);
    }
  }

  // Update doctor's details
  async updateDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { licenseNumber } = req.body;
      
      if (licenseNumber) {
        const existingLicense = await User.findOne({ 
          licenseNumber, 
          _id: { $ne: req.params.id } 
        }).lean();
        
        if (existingLicense) {
          res.status(400).json({ success: false, message: "Nomor lisensi sudah terdaftar pada dokter lain" });
          return;
        }
      }
      
      const doctor = await User.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true, runValidators: true }
      ).select("-password").lean(); 

      if (!doctor || doctor.role !== 'doctor') {
        res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
        return;
      }

      res.json({ success: true, message: "Dokter berhasil diupdate", data: doctor as IDoctor });
    } catch (error) {
      next(error);
    }
  }

  // Soft delete a doctor by setting them as inactive
  async deleteDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctor = await User.findOneAndUpdate(
        { _id: req.params.id, role: "doctor" }, 
        { isActive: false }, 
        { new: true }
      ).lean();

      if (!doctor) {
        res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
        return;
      }
      res.json({ success: true, message: "Dokter berhasil dinonaktifkan" });
    } catch (error) {
      next(error);
    }
  }

  // Get doctor statistics
  async getDoctorStats(req: Request, res: Response, next: NextFunction): Promise<void> {
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
  
  // Implementasi Get doctor's available schedules
  async getDoctorSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const doctorId = req.params.id;
        const { date, polyclinicId } = req.query; // Query params untuk filter

        let query: any = { doctorId: doctorId, status: "Active", availableSlots: { $gt: 0 } };

        if (date) {
            // Pastikan format tanggal sesuai ISO 8601 YYYY-MM-DD untuk query database
            const startOfDay = new Date(date as string);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date as string);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        } else {
            // Jika tidak ada tanggal, hanya ambil jadwal yang akan datang
            query.date = { $gte: new Date() };
        }

        if (polyclinicId) {
            query.polyclinicId = polyclinicId;
        }

        // Ambil jadwal dari model Schedule
        const schedules = await Schedule.find(query)
                                        .populate('polyclinicId', 'name') // Ambil nama poli
                                        .sort({ date: 1, startTime: 1 })
                                        .lean();

        // Anda bisa memfilter lebih lanjut jika ada jadwal yang sudah lewat waktu di hari yang sama
        const filteredSchedules = schedules.filter(schedule => {
            if (date && new Date(date as string).toDateString() === new Date().toDateString()) {
                const [hour, minute] = schedule.startTime.split(':').map(Number);
                const scheduleDateTime = new Date();
                scheduleDateTime.setHours(hour, minute, 0, 0);
                return scheduleDateTime > new Date(); // Hanya slot yang belum lewat
            }
            return true;
        });

        res.json({ success: true, data: filteredSchedules });
    } catch (error) {
        next(error);
    }
  }

  // Update doctor's work schedule (method ini mungkin lebih cocok untuk admin setting jadwal, bukan booking)
  async updateDoctorSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ success: false, message: "Update Doctor Schedule not implemented yet or should be handled via admin." });
  }
}

export default new DoctorController();