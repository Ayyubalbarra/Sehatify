import { Request, Response, NextFunction } from 'express';
import Visit from "../models/Visit";
import PatientUser from "../models/patientUser.model"; // ✅ INI YANG BENAR!
import User from "../models/User"; 
import Polyclinic from "../models/Polyclinic";
import { AuthRequest } from '../middleware/auth';
// import { IVisit } from '../interfaces/IVisit'; // ✅ PASTIKAN BARIS INI DIHAPUS TOTAL!

class VisitController {
  constructor() {
    this.getAllVisits = this.getAllVisits.bind(this);
    this.getVisitById = this.getVisitById.bind(this);
    this.createVisit = this.createVisit.bind(this);
    this.updateVisit = this.updateVisit.bind(this);
    this.completeVisit = this.completeVisit.bind(this);
    this.cancelVisit = this.cancelVisit.bind(this); 
    this.deleteVisit = this.deleteVisit.bind(this); 
    this.getVisitStats = this.getVisitStats.bind(this); 
    this.getVisitsByPatient = this.getVisitsByPatient.bind(this); 
    this.getVisitsByDoctor = this.getVisitsByDoctor.bind(this); 
    this.getVisitsByDateRange = this.getVisitsByDateRange.bind(this); 
    this.addMedicalRecord = this.addMedicalRecord.bind(this); 
    this.addPrescription = this.addPrescription.bind(this); 
  }

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
        const start = new Date(startDate as string);
        start.setHours(0,0,0,0);
        const end = new Date(endDate as string);
        end.setHours(23,59,59,999);
        query.visitDate = { $gte: start, $lte: end };
      }

      const [visits, total] = await Promise.all([
        Visit.find(query)
          .populate("patientId", "fullName nik") 
          .populate("doctorId", "name specialization")
          .populate("polyclinicId", "name")
          .sort({ visitDate: -1 })
          .limit(Number(limit))
          .skip((Number(page) - 1) * Number(limit))
          // Anda mungkin perlu menyesuaikan tipe lean di sini jika IVisit tidak lagi kompatibel
          // Misalnya, jika IVisit masih mereferensikan IPatient lama
          .lean<any[]>(), // Gunakan any[] sebagai fallback jika IVisit bermasalah
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
        .populate("patientId", "fullName nik phone") 
        .populate("doctorId", "name specialization email")
        .populate("polyclinicId", "name")
        .populate("bedId", "bedNumber ward")
        .lean<any>(); // Gunakan any sebagai fallback jika IVisit bermasalah
        
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
          PatientUser.findById(patientId).lean(), 
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
          { path: "patientId", select: "fullName" }, 
          { path: "doctorId", select: "name" }, 
          { path: "polyclinicId", select: "name" }
      ]);
      res.status(201).json({ 
          success: true, 
          message: "Kunjungan berhasil ditambahkan", 
          data: populatedVisit.toObject() 
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
          .populate("patientId", "fullName") 
          .populate("doctorId", "name")
          .populate("polyclinicId", "name")
          .lean<any>(); // Gunakan any sebagai fallback jika IVisit bermasalah

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

  public async cancelVisit(req: AuthRequest, res: Response, next: NextFunction) { 
    res.status(501).json({ success: false, message: "Not Implemented" });
  }
  public async deleteVisit(req: Request, res: Response, next: NextFunction) { 
    res.status(501).json({ success: false, message: "Not Implemented" });
  }
  public async getVisitStats(req: Request, res: Response, next: NextFunction) { 
    res.status(501).json({ success: false, message: "Not Implemented" });
  }
  public async getVisitsByPatient(req: Request, res: Response, next: NextFunction) { 
    res.status(501).json({ success: false, message: "Not Implemented" });
  }
  public async getVisitsByDoctor(req: Request, res: Response, next: NextFunction) { 
    res.status(501).json({ success: false, message: "Not Implemented" });
  }
  public async getVisitsByDateRange(req: Request, res: Response, next: NextFunction) { 
    res.status(501).json({ success: false, message: "Not Implemented" });
  }
  public async addMedicalRecord(req: AuthRequest, res: Response, next: NextFunction) { 
    res.status(501).json({ success: false, message: "Not Implemented" });
  }
  public async addPrescription(req: AuthRequest, res: Response, next: NextFunction) { 
    res.status(501).json({ success: false, message: "Not Implemented" });
  }
}

export default new VisitController();