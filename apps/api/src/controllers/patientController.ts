// apps/api/src/controllers/patientController.ts

import { type Request, type Response, type NextFunction } from 'express';
import PatientUser from "../models/patientUser.model";
import Visit from "../models/Visit"; 
import Queue from "../models/Queue"; 
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

  // --- Metode untuk Pasien yang Login ---
  
  // --- PERBAIKAN UTAMA DI SINI ---
  public async getUpcomingAppointments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Tidak terautentikasi" });
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Cari antrean (janji temu) yang akan datang untuk pasien ini
        const appointments = await Queue.find({
            patientId: req.user._id,
            queueDate: { $gte: today }
        })
        // Sertakan detail dokter dan poliklinik menggunakan populate
        .populate('doctorId', 'name specialization')
        .populate('polyclinicId', 'name')
        .sort({ queueDate: 1 }) // Urutkan dari yang paling dekat
        .lean();

        res.json({ success: true, data: appointments });
    } catch (error) {
        next(error);
    }
  }
  
  // Fungsi getMedicalRecords sudah benar dari perbaikan sebelumnya
  public async getMedicalRecords(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) { return res.status(401).json({ success: false, message: "Tidak terautentikasi" }); }
        const records = await Visit.find({ patientId: req.user._id })
            .populate('doctorId', 'name specialization')
            .populate('polyclinicId', 'name')
            .sort({ visitDate: -1 })
            .lean();
        res.json({ success: true, data: records });
    } catch (error) {
        next(error);
    }
  }

  // --- Metode untuk Admin (tidak perlu diubah) ---
  public async getPatients(req: Request, res: Response, next: NextFunction) { /* ... isi fungsi tetap sama ... */ }
  public async getPatient(req: Request, res: Response, next: NextFunction) { /* ... isi fungsi tetap sama ... */ }
  public async createPatient(req: Request, res: Response, next: NextFunction) { /* ... isi fungsi tetap sama ... */ }
  public async updatePatient(req: Request, res: Response, next: NextFunction) { /* ... isi fungsi tetap sama ... */ }
  public async deletePatient(req: Request, res: Response, next: NextFunction) { /* ... isi fungsi tetap sama ... */ }
  public async getPatientStats(req: Request, res: Response, next: NextFunction) { /* ... isi fungsi tetap sama ... */ }
}

// Untuk memudahkan copy-paste, saya sertakan kembali isi fungsi admin yang tidak berubah
const controller = new PatientController();
controller.getPatients = async function(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search = "", status } = req.query as { [key: string]: string };
      const query: any = {};
      if (search) { query.$or = [ { fullName: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } } ]; }
      if (status && status !== "all") { query.isActive = status === 'Active'; }
      const pageNum = Number(page); const limitNum = Number(limit);
      const [patients, total] = await Promise.all([ PatientUser.find(query).sort({ createdAt: -1 }).limit(limitNum).skip((pageNum - 1) * limitNum).lean(), PatientUser.countDocuments(query), ]);
      res.json({ success: true, data: patients, pagination: { totalPages: Math.ceil(total / limitNum), currentPage: pageNum, total } });
    } catch (error) { next(error); }
};
controller.getPatient = async function(req: Request, res: Response, next: NextFunction) {
    try {
        const patient = await PatientUser.findById(req.params.patientId).lean();
        if (!patient) return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
        res.json({ success: true, data: patient });
    } catch (error) { next(error); }
};
controller.createPatient = async function(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.body;
        const existingPatient = await PatientUser.findOne({ email: email.toLowerCase() }).lean(); 
        if (existingPatient) return res.status(400).json({ success: false, message: "Email sudah terdaftar" });
        const patient = new PatientUser(req.body); 
        await patient.save();
        res.status(201).json({ success: true, message: "Pasien berhasil ditambahkan", data: patient.toObject() });
    } catch (error) { next(error); }
};
controller.updatePatient = async function(req: Request, res: Response, next: NextFunction) {
    try {
        const patient = await PatientUser.findByIdAndUpdate(req.params.patientId, req.body, { new: true, runValidators: true }).lean(); 
        if (!patient) return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
        res.json({ success: true, message: "Data pasien berhasil diupdate", data: patient });
    } catch (error) { next(error); }
};
controller.deletePatient = async function(req: Request, res: Response, next: NextFunction) {
    try {
        const patient = await PatientUser.findByIdAndDelete(req.params.patientId);
        if (!patient) return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
        res.json({ success: true, message: "Pasien berhasil dihapus" });
    } catch (error) { next(error); }
};
controller.getPatientStats = async function(req: Request, res: Response, next: NextFunction) {
    try {
      const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); startOfWeek.setHours(0,0,0,0);
      const [totalPatients, newPatientsThisWeek, activePatients] = await Promise.all([ PatientUser.countDocuments(), PatientUser.countDocuments({ createdAt: { $gte: startOfWeek } }), PatientUser.countDocuments({ isActive: true }), ]);
      res.json({ success: true, data: { totalPatients, newPatientsThisWeek, activePatients } });
    } catch (error) { next(error); }
};

export default controller;