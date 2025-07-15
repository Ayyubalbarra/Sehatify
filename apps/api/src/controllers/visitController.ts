import { Request, Response, NextFunction } from 'express';
import Visit from "../models/Visit";
import Patient from "../models/Patient";
import User from "../models/User"; // Dokter adalah User dengan role 'doctor'
import Polyclinic from "../models/Polyclinic";
import { AuthRequest } from '../middleware/auth';
import { IVisit } from '../interfaces/IVisit'; // Asumsikan Anda memiliki interface ini

class VisitController {
  // Get all visits with filtering and pagination
  public async getAllVisits(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, search, patientId, doctorId, status, startDate, endDate } = req.query;
      const query: any = {};

      if (patientId) query.patientId = patientId;
      if (doctorId) query.doctorId = doctorId;
      if (status) query.status = status;
      if (search) query['diagnosis.primary'] = { $regex: search as string, $options: "i" };
      if (startDate && endDate) {
        query.visitDate = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
      }

      const [visits, total] = await Promise.all([
        Visit.find(query)
          .populate("patientId", "name nik")
          .populate("doctorId", "name specialization")
          .populate("polyclinicId", "name")
          .sort({ visitDate: -1 })
          .limit(Number(limit))
          .skip((Number(page) - 1) * Number(limit))
          .lean<IVisit[]>(), // <-- Perbaikan
        Visit.countDocuments(query),
      ]);

      res.json({ success: true, data: visits, pagination: { totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page), total } });
    } catch (error) {
      next(error);
    }
  }

  // Get a single visit by ID
  public async getVisitById(req: Request, res: Response, next: NextFunction) {
    try {
      const visit = await Visit.findById(req.params.id)
        .populate("patientId")
        .populate("doctorId", "name specialization email")
        .populate("polyclinicId", "name")
        .populate("bedId", "bedNumber ward")
        .lean<IVisit>(); // <-- Perbaikan
        
      if (!visit) {
        return res.status(404).json({ success: false, message: "Kunjungan tidak ditemukan" });
      }
      res.json({ success: true, data: visit });
    } catch (error) {
      next(error);
    }
  }

  // Create a new visit
  public async createVisit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { patientId, doctorId, polyclinicId } = req.body;

      const [patient, doctor, polyclinic] = await Promise.all([
          Patient.findById(patientId).lean(),
          User.findOne({ _id: doctorId, role: 'doctor' }).lean(),
          Polyclinic.findById(polyclinicId).lean()
      ]);
      
      if (!patient) return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
      if (!doctor) return res.status(404).json({ success: false, message: "Dokter tidak ditemukan" });
      if (!polyclinic) return res.status(404).json({ success: false, message: "Poliklinik tidak ditemukan" });

      const visitData = { ...req.body, visitDate: new Date(), createdBy: req.user?._id };
      const visit = new Visit(visitData);
      await visit.save();
      
      const populatedVisit = await visit.populate([
          { path: "patientId", select: "name" }, 
          { path: "doctorId", select: "name" }, 
          { path: "polyclinicId", select: "name" }
      ]);
      res.status(201).json({ 
          success: true, 
          message: "Kunjungan berhasil ditambahkan", 
          data: populatedVisit.toObject() // <-- Perbaikan
      });
    } catch (error) {
      next(error);
    }
  }

  // Update a visit's details
  public async updateVisit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updateData = { ...req.body, updatedBy: req.user?._id };
      const visit = await Visit.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
            .populate("patientId", "name")
            .populate("doctorId", "name")
            .populate("polyclinicId", "name")
            .lean<IVisit>(); // <-- Perbaikan

      if (!visit) {
        return res.status(404).json({ success: false, message: "Kunjungan tidak ditemukan" });
      }
      res.json({ success: true, message: "Data kunjungan berhasil diperbarui", data: visit });
    } catch (error) {
      next(error);
    }
  }

  // Complete a visit
  public async completeVisit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const visit = await Visit.findById(req.params.id);
      if (!visit) {
        return res.status(404).json({ success: false, message: "Kunjungan tidak ditemukan" });
      }
      if (visit.status === "Completed") {
        return res.status(400).json({ success: false, message: "Kunjungan sudah selesai" });
      }

      const updateData = { ...req.body, status: "Completed", completedTime: new Date(), updatedBy: req.user?._id };
      const updatedVisit = await Visit.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).lean();
      
      res.json({ success: true, message: "Kunjungan berhasil diselesaikan", data: updatedVisit });
    } catch (error) {
      next(error);
    }
  }

  // Metode lainnya bisa Anda lanjutkan dengan pola yang sama...
  public async cancelVisit(req: AuthRequest, res: Response, next: NextFunction) { /* ... */ }
  public async deleteVisit(req: Request, res: Response, next: NextFunction) { /* ... */ }
  public async getVisitStats(req: Request, res: Response, next: NextFunction) { /* ... */ }
  public async getVisitsByPatient(req: Request, res: Response, next: NextFunction) { /* ... */ }
  public async getVisitsByDoctor(req: Request, res: Response, next: NextFunction) { /* ... */ }
  public async getVisitsByDateRange(req: Request, res: Response, next: NextFunction) { /* ... */ }
  public async addMedicalRecord(req: AuthRequest, res: Response, next: NextFunction) { /* ... */ }
  public async addPrescription(req: AuthRequest, res: Response, next: NextFunction) { /* ... */ }
}

export default new VisitController();