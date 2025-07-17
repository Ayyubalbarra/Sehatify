// apps/api/src/controllers/patientController.ts

import { type Request, type Response, type NextFunction } from 'express';
import PatientUser, { IPatientUser } from "../models/patientUser.model";
import Visit from "../models/Visit"; 
import Queue from "../models/Queue"; 
import { calculateAge } from "../utils/modelHelpers";
import { AuthRequest } from '../middleware/auth';

class PatientController {

  constructor() {
    this.getPatients = this.getPatients.bind(this);
    this.getPatient = this.getPatient.bind(this);
    this.createPatient = this.createPatient.bind(this);
    this.updatePatient = this.updatePatient.bind(this);
    this.deletePatient = this.deletePatient.bind(this);
    this.getPatientStats = this.getPatientStats.bind(this);
    this.getUpcomingAppointments = this.getUpcomingAppointments.bind(this);
    this.getMedicalRecords = this.getMedicalRecords.bind(this);
  }

  // --- Metode untuk Admin ---
  public async getPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search = "", status = "all" } = req.query as { [key: string]: string };
      const query: any = {};
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: "i" } }, 
          { email: { $regex: search, $options: "i" } } 
        ];
      }
      if (status && status !== "all") {
        query.status = status;
      }
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const [patients, total] = await Promise.all([
        PatientUser.find(query).sort({ createdAt: -1 }).limit(limitNum).skip((pageNum - 1) * limitNum).lean(),
        PatientUser.countDocuments(query),
      ]);
      const patientsWithAge = patients.map(p => ({ ...p, age: calculateAge(p.dateOfBirth) }));
      res.json({ success: true, data: patientsWithAge, pagination: { totalPages: Math.ceil(total / limitNum), currentPage: pageNum, total } });
    } catch (error) {
      next(error);
    }
  }
  
  public async getPatient(req: Request, res: Response, next: NextFunction) {
    try {
        const patient = await PatientUser.findById(req.params.patientId).lean();
        if (!patient) {
            return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
        }
        res.json({ success: true, data: patient });
    } catch (error) {
        next(error);
    }
  }

  public async createPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const existingPatient = await PatientUser.findOne({ email: email.toLowerCase() }).lean(); 
      if (existingPatient) {
        return res.status(400).json({ success: false, message: "Email sudah terdaftar" });
      }
      const patient = new PatientUser(req.body); 
      await patient.save();
      res.status(201).json({ success: true, message: "Pasien berhasil ditambahkan", data: patient.toObject() });
    } catch (error) {
      next(error);
    }
  }

  public async updatePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientUser.findByIdAndUpdate(req.params.patientId, req.body, { new: true, runValidators: true }).lean(); 
      if (!patient) {
        return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
      }
      res.json({ success: true, message: "Data pasien berhasil diupdate", data: patient });
    } catch (error) {
      next(error);
    }
  }

  public async deletePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientUser.findByIdAndDelete(req.params.patientId);
      if (!patient) {
        return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
      }
      res.json({ success: true, message: "Pasien berhasil dihapus" });
    } catch (error) {
      next(error);
    }
  }

  public async getPatientStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [totalPatients, newPatients, genderStats] = await Promise.all([
        PatientUser.countDocuments(),
        PatientUser.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
        PatientUser.aggregate([{ $group: { _id: "$gender", count: { $sum: 1 } } }]),
      ]);
      res.json({ success: true, data: { total: totalPatients, new: newPatients, genderStats } });
    } catch (error) {
      next(error);
    }
  }

  // --- Metode Baru untuk Pasien yang Login ---

  public async getUpcomingAppointments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patientId = req.user?._id;
      if (!patientId) {
        return res.status(401).json({ success: false, message: "Akses ditolak" });
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const appointments = await Queue.find({
        patientId: patientId,
        status: { $in: ["Waiting", "In Progress"] },
        queueDate: { $gte: today }
      })
      .sort({ queueDate: 1, appointmentTime: 1 })
      .populate('polyclinicId', 'name')
      .populate('doctorId', 'name specialization')
      .limit(5)
      .lean();
      res.json({ success: true, data: appointments });
    } catch (error) {
      next(error);
    }
  }

  public async getMedicalRecords(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patientId = req.user?._id;
      if (!patientId) {
        return res.status(401).json({ success: false, message: "Akses ditolak" });
      }
      const records = await Visit.find({
        patientId: patientId,
        status: 'Completed'
      })
      .sort({ visitDate: -1 })
      .populate('polyclinicId', 'name')
      .populate('doctorId', 'name specialization')
      .limit(10)
      .lean();
      res.json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  }
}

export default new PatientController();