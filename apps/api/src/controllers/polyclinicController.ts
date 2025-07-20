// apps/api/src/controllers/polyclinicController.ts

import { Request, Response, NextFunction } from 'express';
import Polyclinic from "../models/Polyclinic";
import Hospital from '../models/Hospital';
import { AuthRequest } from '../middleware/auth';

class PolyclinicController {

  constructor() {
    this.getAllPolyclinics = this.getAllPolyclinics.bind(this);
    this.getPolyclinicById = this.getPolyclinicById.bind(this);
    this.createPolyclinic = this.createPolyclinic.bind(this);
    this.updatePolyclinic = this.updatePolyclinic.bind(this);
    this.deletePolyclinic = this.deletePolyclinic.bind(this);
    this.getDepartments = this.getDepartments.bind(this);
  }

  public async getAllPolyclinics(req: Request, res: Response, next: NextFunction) {
    try {
      const { hospitalId, search, department, status, page = 1, limit = 10 } = req.query;

      // --- PERBAIKAN DI SINI: Logika untuk Web Pasien disederhanakan ---
      if (hospitalId) {
        // Langsung cari Poliklinik berdasarkan hospitalId yang diberikan.
        // Ini lebih andal dan tidak bergantung pada data di model Hospital.
        const polyclinics = await Polyclinic.find({
          hospitalId: hospitalId as string,
          status: 'Active' // Pasien hanya bisa melihat poli yang aktif
        }).lean();
        
        return res.json({ success: true, data: polyclinics });
      }
      // --- AKHIR PERBAIKAN ---

      // Logika untuk dashboard admin (tidak berubah)
      const query: any = {};
      if (search) query.name = { $regex: search as string, $options: "i" };
      if (department) query.department = department as string;
      if (status && status !== 'all') query.status = status as string;

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const [polyclinics, total] = await Promise.all([
        Polyclinic.find(query)
          .populate({
            path: 'assignedDoctors.doctorId',
            model: 'User',
            select: 'name specialization'
          })
          .sort({ name: 1 })
          .limit(limitNum)
          .skip((pageNum - 1) * limitNum)
          .lean(), 
        Polyclinic.countDocuments(query),
      ]);
      
      res.json({ 
          success: true, 
          data: polyclinics, 
          pagination: { totalPages: Math.ceil(total / limitNum), currentPage: pageNum, total } 
      });
    } catch (error) {
      next(error);
    }
  }

  public async getPolyclinicById(req: Request, res: Response, next: NextFunction) {
    try {
      const polyclinic = await Polyclinic.findById(req.params.id)
        .populate({
          path: 'assignedDoctors.doctorId',
          model: 'User',
          select: 'name specialization'
        })
        .lean(); 

      if (!polyclinic) {
        return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });
      }
      res.json({ success: true, data: polyclinic });
    } catch (error) {
      next(error);
    }
  }

  public async createPolyclinic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hospitalId = (req.user as any).hospital;
      if (!hospitalId) {
          return res.status(400).json({ success: false, message: "Admin tidak terasosiasi dengan rumah sakit manapun." });
      }
      
      const polyclinicData = { ...req.body, hospitalId };
      const polyclinic = new Polyclinic(polyclinicData);
      await polyclinic.save();

      await Hospital.findByIdAndUpdate(hospitalId, { $addToSet: { polyclinics: polyclinic._id } });

      res.status(201).json({ 
        success: true, 
        message: "Poliklinik berhasil ditambahkan", 
        data: polyclinic.toObject() 
      });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: `Nama poliklinik sudah digunakan.` });
      }
      next(error);
    }
  }

  public async updatePolyclinic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const polyclinic = await Polyclinic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean();
      if (!polyclinic) {
        return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });
      }
      res.json({ 
        success: true, 
        message: "Data poliklinik berhasil diperbarui", 
        data: polyclinic
      });
    } catch (error) {
      next(error);
    }
  }

  public async deletePolyclinic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const polyclinicId = req.params.id;
      const polyclinic = await Polyclinic.findByIdAndDelete(polyclinicId);
      if (!polyclinic) {
        return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });
      }
      
      await Hospital.findByIdAndUpdate(polyclinic.hospitalId, { $pull: { polyclinics: polyclinicId } });

      res.json({ success: true, message: "Poliklinik berhasil dihapus" });
    } catch (error) {
      next(error);
    }
  }

  public async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
        const departments = (Polyclinic.schema.path('department') as any).enumValues;
        res.json({ success: true, data: departments.filter(Boolean) });
    } catch (error) {
        next(error);
    }
  }
}

export default new PolyclinicController();