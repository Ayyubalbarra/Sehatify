import { Request, Response, NextFunction } from 'express';
import Bed from "../models/Bed";
import Patient from "../models/Patient";
import { validationResult } from "express-validator";
import { AuthRequest } from '../middleware/auth';

class BedController {
  public async getAllBeds(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, status, ward, bedType } = req.query;
      const filter: any = {};
      if (status) filter.status = status;
      if (ward) filter.ward = new RegExp(`^${ward as string}$`, "i");
      if (bedType) filter.bedType = bedType;

      const [beds, total] = await Promise.all([
        Bed.find(filter)
          .populate("currentPatient", "name patientId")
          .sort({ ward: 1, roomNumber: 1, bedNumber: 1 })
          .limit(Number(limit))
          .skip((Number(page) - 1) * Number(limit))
          .lean(),
        Bed.countDocuments(filter),
      ]);

      res.json({
        success: true,
        data: beds,
        pagination: { totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page), total },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getBedById(req: Request, res: Response, next: NextFunction) {
    try {
      const bed = await Bed.findById(req.params.id).populate("currentPatient", "name patientId phone").lean();
      if (!bed) {
        return res.status(404).json({ success: false, message: "Tempat tidur tidak ditemukan" });
      }
      res.json({ success: true, data: bed });
    } catch (error) {
      next(error);
    }
  }

  public async createBed(req: AuthRequest, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      const { bedNumber, roomNumber, ward } = req.body;
      const existingBed = await Bed.findOne({ bedNumber, roomNumber, ward });
      if (existingBed) {
        return res.status(400).json({ success: false, message: "Kombinasi tempat tidur, ruangan, dan bangsal sudah ada" });
      }
      
      const bed = new Bed({ ...req.body, createdBy: req.user?.userId });
      await bed.save();
      res.status(201).json({ success: true, message: "Tempat tidur berhasil dibuat", data: bed });
    } catch (error) {
      next(error);
    }
  }

  public async updateBed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bed = await Bed.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.user?.userId }, { new: true });
      if (!bed) {
        return res.status(404).json({ success: false, message: "Tempat tidur tidak ditemukan" });
      }
      res.json({ success: true, message: "Tempat tidur berhasil diupdate", data: bed });
    } catch (error) {
      next(error);
    }
  }

  public async deleteBed(req: Request, res: Response, next: NextFunction) {
    try {
      const bed = await Bed.findById(req.params.id);
      if (!bed) return res.status(404).json({ success: false, message: "Tempat tidur tidak ditemukan" });
      if (bed.status === "occupied") {
        return res.status(400).json({ success: false, message: "Tidak dapat menghapus tempat tidur yang sedang ditempati" });
      }
      await Bed.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: "Tempat tidur berhasil dihapus" });
    } catch (error) {
      next(error);
    }
  }

  public async assignPatientToBed(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.body;
      const bed = await Bed.findById(req.params.id);
      if (!bed || bed.status !== "available") {
        return res.status(400).json({ success: false, message: "Tempat tidur tidak ditemukan atau tidak tersedia" });
      }
      const patient = await Patient.findById(patientId);
      if (!patient) return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
      
      bed.currentPatient = patientId;
      bed.status = "occupied";
      bed.occupiedAt = new Date();
      await bed.save();
      
      res.json({ success: true, message: "Pasien berhasil ditempatkan", data: bed });
    } catch (error) {
      next(error);
    }
  }
  
  public async updateBedStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const updateData: any = { status, updatedBy: req.user?.userId };
      
      if (status === 'available') {
        updateData.currentPatient = null;
        updateData.occupiedAt = null;
      }

      const bed = await Bed.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!bed) return res.status(404).json({ success: false, message: "Tempat tidur tidak ditemukan" });

      res.json({ success: true, message: "Status tempat tidur berhasil diupdate", data: bed });
    } catch (error) {
      next(error);
    }
  }
}

export default new BedController();