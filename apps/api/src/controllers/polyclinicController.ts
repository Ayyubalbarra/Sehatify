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
    this.getDepartments = this.getDepartments.bind(this); // ✅ Tambahkan bind untuk fungsi baru
  }

  public async getAllPolyclinics(req: Request, res: Response, next: NextFunction) {
    try {
      const { hospitalId, search, department } = req.query;

      if (hospitalId) {
        const hospital = await Hospital.findById(hospitalId as string).select('polyclinics').lean();
        if (!hospital) {
          return res.json({ success: true, data: [] });
        }
        
        const polyclinics = await Polyclinic.find({
          '_id': { $in: hospital.polyclinics },
          'status': 'Active'
        }).lean();

        return res.json({ success: true, data: polyclinics });
      }

      const { page = 1, limit = 10 } = req.query;
      const query: any = { status: "Active" };
      
      if (search) query.name = { $regex: search as string, $options: "i" };
      if (department) query.department = department as string;

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const [polyclinics, total] = await Promise.all([
        Polyclinic.find(query)
          .populate("assignedDoctors.doctorId", "name specialization") 
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
        .populate('assignedDoctors.doctorId', 'name specialization')
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
      const polyclinic = new Polyclinic(req.body);
      await polyclinic.save();
      res.status(201).json({ 
        success: true, 
        message: "Poliklinik berhasil ditambahkan", 
        data: polyclinic.toObject() 
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
      const polyclinic = await Polyclinic.findByIdAndDelete(req.params.id);
      if (!polyclinic) {
        return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });
      }
      res.json({ success: true, message: "Poliklinik berhasil dihapus" });
    } catch (error) {
      next(error);
    }
  }

  // ✅ FUNGSI BARU DITAMBAHKAN
  public async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
        const departments = await Polyclinic.distinct("department", { status: "Active" }); 
        res.json({ success: true, data: departments.filter(Boolean) });
    } catch (error) {
        next(error);
    }
  }
}

export default new PolyclinicController();