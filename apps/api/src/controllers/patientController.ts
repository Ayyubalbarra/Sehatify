// apps/api/src/controllers/patientController.ts

import { type Request, type Response, type NextFunction } from 'express';
import PatientUser from "../models/patientUser.model";
import Visit from "../models/Visit"; // Asumsi ada model Visit
import Queue from "../models/Queue"; // Asumsi ada model Queue
import { validateNIK, calculateAge } from "../utils/modelHelpers";

// Definisikan tipe untuk query parameter agar lebih aman
interface PatientQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
}

// Tipe untuk hasil populate yang lebih spesifik
interface IPatientPopulated extends PatientUser { // Sesuaikan dengan IPatientUser
  // tambahkan properti yang di-populate jika ada
}


class PatientController {
  // Get all patients with filtering and pagination
  async getPatients(req: Request<{}, {}, {}, PatientQuery>, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search, status } = req.query;
      const query: any = {};

      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: "i" } }, // Ganti 'name' ke 'fullName'
          { patientId: { $regex: search, $options: "i" } } // Jika patientId ada di PatientUser
        ];
      }
      if (status && status !== "all") {
        // Asumsi PatientUser punya field status
        // Jika tidak, Anda perlu cara lain untuk memfilter status
        // query.status = status; 
      }
      
      const pageNum = Number(page);
      const limitNum = Number(limit);

      const [patients, total] = await Promise.all([
        Patient.find(query)
          .sort({ createdAt: -1 }) // Urutkan berdasarkan createdAt
          .limit(limitNum)
          .skip((pageNum - 1) * limitNum)
          .lean<IPatientPopulated[]>(), 
        Patient.countDocuments(query),
      ]);
      
      // Menambahkan properti 'age' ke setiap objek pasien
      const patientsWithAge = patients.map(p => ({
        ...p, 
        age: calculateAge(p.dateOfBirth) 
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
        const patient = await Patient.findOne({ _id: patientId }).lean<IPatientPopulated>(); // Cari berdasarkan _id
        
        if (!patient) {
            return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
        }
        
        // Asumsi Visit model memiliki field patientId yang merujuk ke _id PatientUser
        const recentVisits = await Visit.find({ patientId: patient._id }).sort({ visitDate: -1 }).limit(5).lean();
        const lifetimeValue = recentVisits.reduce((sum, visit) => sum + (visit.totalCost || 0), 0);

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
        // Jika PatientUser tidak punya status, ini perlu logika lain
        Patient.countDocuments({ /* status: "Active" */ }), 
        Patient.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
        Patient.aggregate([
          { $group: { _id: "$gender", count: { $sum: 1 } } }
        ]),
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
      // NIK tidak ada di PatientUser.model.ts yang diberikan sebelumnya.
      // Jika Anda ingin menggunakan NIK, tambahkan ke PatientUser model.
      // const { nik } = req.body;
      // if (!validateNIK(nik)) { 
      //   return res.status(400).json({ success: false, message: "Format NIK tidak valid" });
      // }
      const { email } = req.body;
      const existingPatient = await Patient.findOne({ email: email.toLowerCase() }).lean();
      if (existingPatient) {
        return res.status(400).json({ success: false, message: "Email sudah terdaftar" });
      }

      const patient = new Patient(req.body);
      await patient.save();
      res.status(201).json({ success: true, message: "Pasien berhasil ditambahkan", data: patient.toObject() });
    } catch (error) {
      next(error);
    }
  }

  // Update a patient's data
  async updatePatient(req: Request, res: Response, next: NextFunction) {
    try {
      // Update berdasarkan _id, bukan patientId string
      const patient = await Patient.findByIdAndUpdate(req.params.patientId, req.body, { new: true, runValidators: true }).lean();
      if (!patient) {
        return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
      }
      res.json({ success: true, message: "Data pasien berhasil diupdate", data: patient });
    } catch (error) {
      next(error);
    }
  }

  // Delete a patient (soft delete jika ada status)
  async deletePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await Patient.findById(req.params.patientId).lean(); // Cari berdasarkan _id
      if (!patient) {
        return res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
      }
      
      const [activeVisits, activeQueues] = await Promise.all([
        Visit.countDocuments({ patientId: patient._id, status: "Ongoing" }),
        Queue.countDocuments({ patientId: patient._id, status: { $in: ["Waiting", "In Progress"] } }),
      ]);

      if (activeVisits > 0 || activeQueues > 0) {
        return res.status(400).json({ success: false, message: "Tidak dapat menghapus pasien dengan kunjungan atau antrian aktif" });
      }

      await Patient.findByIdAndDelete(req.params.patientId); // Hapus berdasarkan _id
      res.json({ success: true, message: "Pasien berhasil dihapus" });
    } catch (error) {
      next(error);
    }
  }
}

export default new PatientController();