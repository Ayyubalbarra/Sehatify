// apps/api/src/controllers/polyclinicController.ts

import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Polyclinic from "../models/Polyclinic";
import User from "../models/User"; 
import Visit from "../models/Visit";
import { generatePolyclinicId } from "../utils/modelHelpers"; // Asumsi ada util ini
import { AuthRequest } from '../middleware/auth';
import { IPolyclinic } from '../interfaces/IPolyclinic'; 
import { IDoctor } from '../interfaces/IDoctor'; // Ganti dari Doctor ke IDoctor

interface PolyclinicStats {
  monthlyVisits: number;
  activeDoctors: number;
}

class PolyclinicController {
  public async getAllPolyclinics(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, search, department } = req.query;
      const query: any = { status: "Active" }; // Filter hanya poliklinik aktif
      
      if (search) query.name = { $regex: search as string, $options: "i" };
      if (department) query.department = department;

      const [polyclinics, total] = await Promise.all([
        Polyclinic.find(query)
          .sort({ name: 1 })
          .limit(Number(limit))
          .skip((Number(page) - 1) * Number(limit))
          .lean(), 
        Polyclinic.countDocuments(query),
      ]);
      
      const polyclinicsWithStats = await Promise.all(
          polyclinics.map(async (poly) => {
              const stats = await this.getPolyclinicStats(poly._id);
              // Untuk frontend web, mungkin cukup kirimkan nama departemen/spesialisasi
              // atau daftar dokter yang terkait langsung di sini jika ingin pre-load
              return { ...poly, stats }; 
          })
      );

      res.json({ 
          success: true, 
          data: polyclinicsWithStats, 
          pagination: { totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page), total } 
      });
    } catch (error) {
      next(error);
    }
  }

  public async getPolyclinicById(req: Request, res: Response, next: NextFunction) {
    try {
      const polyclinic = await Polyclinic.findById(req.params.id).lean(); 
      if (!polyclinic) {
        return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });
      }
      
      const [stats, doctors] = await Promise.all([
          this.getPolyclinicStats(req.params.id),
          // Cari dokter berdasarkan specialization yang sama dengan nama polyclinic
          User.find({ role: 'doctor', specialization: polyclinic.name, isActive: true }).select("name specialization").lean()
      ]);

      res.json({ 
          success: true, 
          data: { ...polyclinic, stats, doctors: doctors as IDoctor[] } 
      });
    } catch (error) {
      next(error);
    }
  }

  public async createPolyclinic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const polyclinicData = { ...req.body, polyclinicId: generatePolyclinicId(), createdBy: req.user?._id };
      const polyclinic = new Polyclinic(polyclinicData);
      await polyclinic.save();
      res.status(201).json({ 
          success: true, 
          message: "Poliklinik berhasil ditambahkan", 
          data: polyclinic.toObject() as IPolyclinic 
      });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: `Nama atau ID poliklinik sudah digunakan` });
      }
      next(error);
    }
  }

  public async updatePolyclinic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updateData = { ...req.body, updatedBy: req.user?._id };
      const polyclinic = await Polyclinic.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).lean(); 
      if (!polyclinic) {
        return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });
      }
      res.json({ 
          success: true, 
          message: "Data poliklinik berhasil diperbarui", 
          data: polyclinic as IPolyclinic 
        });
    } catch (error) {
      next(error);
    }
  }

  public async deletePolyclinic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updateData = { status: "Closed", updatedBy: req.user?._id }; // Ubah status menjadi Closed
      const polyclinic = await Polyclinic.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!polyclinic) {
        return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });
      }
      res.json({ success: true, message: "Poliklinik berhasil dinonaktifkan" });
    } catch (error) {
      next(error);
    }
  }
  
  public async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
        const departments = await Polyclinic.distinct("name", { status: "Active" }); // Ambil 'name' bukan 'department'
        res.json({ success: true, data: departments.filter(Boolean) });
    } catch (error) {
        next(error);
    }
  }
  
  private async getPolyclinicStats(polyclinicId: Types.ObjectId | string): Promise<PolyclinicStats> {
    try {
        const polyclinicObjectId = new Types.ObjectId(polyclinicId);
        
        const [monthlyVisits, activeDoctors] = await Promise.all([
            Visit.countDocuments({ polyclinicId: polyclinicObjectId, visitDate: { $gte: new Date(new Date().setDate(1)) } }),
            User.countDocuments({ role: 'doctor', specialization: (await Polyclinic.findById(polyclinicObjectId).select('name'))?.name, isActive: true }) 
        ]);
        return { monthlyVisits, activeDoctors };
    } catch (error) {
        console.error(`Error fetching stats for polyclinic ${polyclinicId}:`, error);
        return { monthlyVisits: 0, activeDoctors: 0 };
    }
  }
}

export default new PolyclinicController();