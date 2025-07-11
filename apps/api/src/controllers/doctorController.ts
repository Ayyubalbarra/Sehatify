import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { Document } from 'mongoose';

// Import models - adjust paths as needed
import User from "../models/User";

// Interface definitions
interface DoctorQueryParams {
  page?: string;
  limit?: string;
  specialization?: string;
  status?: string;
  search?: string;
}

interface DoctorFilter {
  role: string;
  specialization?: RegExp;
  isActive?: boolean;
  $or?: Array<{
    name?: { $regex: string; $options: string };
    email?: { $regex: string; $options: string };
  }>;
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialization: string;
  licenseNumber: string;
  isActive: boolean;
  workSchedule?: WorkSchedule[];
  createdAt: Date;
  updatedAt: Date;
}

interface WorkSchedule {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface PaginationInfo {
  totalPages: number;
  currentPage: number;
  total: number;
}

interface DoctorListResponse {
  success: boolean;
  data: Doctor[];
  pagination: PaginationInfo;
}

interface SpecializationStats {
  _id: string;
  count: number;
}

interface DoctorOverview {
  total: number;
  active: number;
  inactive: number;
}

interface DoctorStatsResponse {
  success: boolean;
  data: {
    overview: DoctorOverview;
    specializations: SpecializationStats[];
  };
}

interface CreateDoctorRequest {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  password: string;
  workSchedule?: WorkSchedule[];
}

interface UpdateDoctorRequest {
  name?: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  isActive?: boolean;
  workSchedule?: WorkSchedule[];
}

interface UpdateScheduleRequest {
  schedule: WorkSchedule[];
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

      const response: DoctorListResponse = {
        success: true,
        data: doctors,
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
      const doctor: Doctor | null = await User.findOne({ 
        _id: req.params.id, 
        role: "doctor" 
      }).select("-password").lean();

      if (!doctor) {
        const response: ApiResponse<never> = { 
          success: false, 
          message: "Dokter tidak ditemukan" 
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Doctor> = { 
        success: true, 
        data: doctor 
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Create a new doctor (as a User with 'doctor' role)
  async createDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse<never> = { 
        success: false, 
        errors: errors.array() 
      };
      res.status(400).json(response);
      return;
    }

    try {
      const { email, licenseNumber }: CreateDoctorRequest = req.body;
      
      const existingUser = await User.findOne({ 
        $or: [
          { email: email.toLowerCase() }, 
          { licenseNumber }
        ] 
      });

      if (existingUser) {
        const message = existingUser.email === email.toLowerCase() 
          ? "Email sudah terdaftar" 
          : "Nomor lisensi sudah terdaftar";
        
        const response: ApiResponse<never> = { 
          success: false, 
          message 
        };
        res.status(400).json(response);
        return;
      }

      const doctor = new User({ 
        ...req.body, 
        role: "doctor", 
        email: email.toLowerCase() 
      });
      await doctor.save();

      const doctorResponse = doctor.toObject();
      delete doctorResponse.password;

      const response: ApiResponse<Doctor> = { 
        success: true, 
        message: "Dokter berhasil dibuat", 
        data: doctorResponse 
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Update doctor's details
  async updateDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { licenseNumber }: UpdateDoctorRequest = req.body;
      
      if (licenseNumber) {
        const existingLicense = await User.findOne({ 
          licenseNumber, 
          _id: { $ne: req.params.id } 
        });
        
        if (existingLicense) {
          const response: ApiResponse<never> = { 
            success: false, 
            message: "Nomor lisensi sudah terdaftar pada dokter lain" 
          };
          res.status(400).json(response);
          return;
        }
      }
      
      const doctor: Doctor | null = await User.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true, runValidators: true }
      ).select("-password");

      if (!doctor || doctor.role !== 'doctor') {
        const response: ApiResponse<never> = { 
          success: false, 
          message: "Dokter tidak ditemukan" 
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Doctor> = { 
        success: true, 
        message: "Dokter berhasil diupdate", 
        data: doctor 
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Soft delete a doctor by setting them as inactive
  async deleteDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctor: Doctor | null = await User.findOneAndUpdate(
        { _id: req.params.id, role: "doctor" }, 
        { isActive: false }, 
        { new: true }
      );

      if (!doctor) {
        const response: ApiResponse<never> = { 
          success: false, 
          message: "Dokter tidak ditemukan" 
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<never> = { 
        success: true, 
        message: "Dokter berhasil dinonaktifkan" 
      };
      res.json(response);
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

      const response: DoctorStatsResponse = {
        success: true,
        data: {
          overview: { 
            total: totalDoctors, 
            active: activeDoctors, 
            inactive: totalDoctors - activeDoctors 
          },
          specializations: specializationStats,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get doctor's work schedule
  async getDoctorSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctor: Pick<Doctor, '_id' | 'name' | 'specialization' | 'workSchedule'> | null = 
        await User.findOne({ 
          _id: req.params.id, 
          role: "doctor" 
        }).select("name specialization workSchedule").lean();

      if (!doctor) {
        const response: ApiResponse<never> = { 
          success: false, 
          message: "Dokter tidak ditemukan" 
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Pick<Doctor, '_id' | 'name' | 'specialization' | 'workSchedule'>> = { 
        success: true, 
        data: doctor 
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Update doctor's work schedule
  async updateDoctorSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { schedule }: UpdateScheduleRequest = req.body;
      
      const doctor: Pick<Doctor, '_id' | 'name' | 'specialization' | 'workSchedule'> | null = 
        await User.findOneAndUpdate(
          { _id: req.params.id, role: "doctor" },
          { workSchedule: schedule },
          { new: true, runValidators: true }
        ).select("name specialization workSchedule");

      if (!doctor) {
        const response: ApiResponse<never> = { 
          success: false, 
          message: "Dokter tidak ditemukan" 
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Pick<Doctor, '_id' | 'name' | 'specialization' | 'workSchedule'>> = { 
        success: true, 
        message: "Jadwal dokter berhasil diupdate", 
        data: doctor 
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new DoctorController();