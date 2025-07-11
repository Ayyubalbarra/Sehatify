import { type Request, type Response, type NextFunction } from 'express';
import Patient, { type IPatient } from "../models/Patient";
import Visit from "../models/Visit";
import Queue from "../models/Queue";
import { validateNIK, calculateAge } from "../utils/modelHelpers";

// Definisikan tipe untuk query parameter agar lebih aman
interface PatientQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
}

class PatientController {
  // Get all patients with filtering and pagination
  async getPatients(req: Request<{}, {}, {}, PatientQuery>, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search, status } = req.query;
      const query: any = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { patientId: { $regex: search, $options: "i" } }
        ];
      }
      if (status && status !== "all") {
        query.status = status;
      }
      
      const pageNum = Number(page);
      const limitNum = Number(limit);

      const [patients, total] = await Promise.all([
        Patient.find(query)
          .sort({ registrationDate: -1 })
          .limit(limitNum)
          .skip((pageNum - 1) * limitNum)
          .lean<IPatient[]>(), // Menggunakan .lean<IPatient[]>() untuk mendapatkan objek JS biasa dengan tipe yang benar
        Patient.countDocuments(query),
      ]);
      
      const patientsWithAge = patients.map(p => ({
        ...p, 
        age: ModelHelpers.calculateAge(p.dateOfBirth)
      }));

      res.json({ 
        success: true, 
        data: patientsWithAge, 
        pagination: { 
          totalPages: Math.ceil(total / limitNum), 
          currentPage: pageNum, 
          total 
        } 
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get a single patient's details
  async getPatient(req: Request<{ patientId: string }>, res: Response, next: NextFunction) {
    try {
        const { patientId } = req.params;
        const patient = await Patient.findOne({ patientId }).lean<IPatient>();
        
        if (!patient) {
            return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
        }
        
        const recentVisits = await Visit.find({ patientId: patient._id }).sort({ visitDate: -1 }).limit(5).lean();
        const lifetimeValue = recentVisits.reduce((sum, visit: any) => sum + (visit.totalCost || 0), 0);

        res.json({ 
            success: true, 
            data: { 
                ...patient, 
                age: calculateAge(patient.dateOfBirth), 
                recentVisits, 
                lifetimeValue 
            } 
        });
    } catch (error) {
      next(error);
    }
  }

  // Get patient statistics
  async getPatientStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [totalPatients, activePatients, newPatients, genderStats] = await Promise.all([
        Patient.countDocuments(),
        Patient.countDocuments({ status: "Active" }),
        Patient.countDocuments({ registrationDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
        Patient.aggregate([{ $group: { _id: "$gender", count: { $sum: 1 } } }]),
      ]);

      res.json({
        success: true,
        data: { total: totalPatients, active: activePatients, new: newPatients, genderStats },
      });
    } catch (error) {
      next(error);
    }
  }

  // Create a new patient
  async createPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { nik } = req.body;
      if (!ModelHelpers.validateNIK(nik)) {
        return res.status(400).json({ success: false, message: "Format NIK tidak valid" });
      }
      const existingPatient = await Patient.findOne({ nik });
      if (existingPatient) {
        return res.status(400).json({ success: false, message: "NIK sudah terdaftar" });
      }

      const patient = new Patient(req.body);
      await patient.save();
      res.status(201).json({ success: true, message: "Pasien berhasil ditambahkan", data: patient });
    } catch (error) {
      next(error);
    }
  }

  // Update a patient's data
  async updatePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await Patient.findOneAndUpdate({ patientId: req.params.patientId }, req.body, { new: true, runValidators: true });
      if (!patient) {
        return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
      }
      res.json({ success: true, message: "Data pasien berhasil diupdate", data: patient });
    } catch (error) {
      next(error);
    }
  }

  // Delete a patient
  async deletePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await Patient.findOne({ patientId: req.params.patientId });
      if (!patient) {
        return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
      }
      
      const [activeVisits, activeQueues] = await Promise.all([
        Visit.countDocuments({ patientId: patient._id, status: "Ongoing" }),
        Queue.countDocuments({ patientId: patient._id, status: { $in: ["Waiting", "In Progress"] } }),
      ]);

      if (activeVisits > 0 || activeQueues > 0) {
        return res.status(400).json({ success: false, message: "Tidak dapat menghapus pasien dengan kunjungan/antrian aktif" });
      }

      await Patient.findOneAndDelete({ patientId: req.params.patientId });
      res.json({ success: true, message: "Pasien berhasil dihapus" });
    } catch (error) {
      next(error);
    }
  }
}

export default new PatientController();