// apps/api/src/controllers/patientAuthController.ts

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt, { SignOptions } from 'jsonwebtoken';
import PatientUser from '../models/patientUser.model';
import { AuthRequest } from '../middleware/auth'; 
import notificationService from '../services/notificationService'; // ✅ Import notificationService
import { Server as SocketIOServer } from 'socket.io'; // ✅ Import Socket.IO Server type

// Helper function untuk generate JWT
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    console.error('JWT_SECRET tidak terdefinisi di file .env');
    throw new Error('Kesalahan konfigurasi server');
  }

  const options: SignOptions = {
    expiresIn: expiresIn,
  };
  
  return jwt.sign({ userId }, secret, options);
};

class PatientAuthController {

  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.demoLogin = this.demoLogin.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.logout = this.logout.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
  }

  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    try {
      const { fullName, email, password, phone, dateOfBirth, address } = req.body;

      console.log(`[PatientAuth] Mencoba mendaftar user baru: ${email}`); 

      const existingUser = await PatientUser.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        console.log(`[PatientAuth] Pendaftaran gagal: Email ${email} sudah digunakan.`); 
        res.status(400).json({ success: false, message: "Email sudah digunakan" });
        return;
      }
      
      const patientUser = new PatientUser({
        fullName,
        email: email.toLowerCase(),
        password,
        phone,
        dateOfBirth,
        address
      });

      await patientUser.save();
      console.log(`[PatientAuth] User ${email} berhasil didaftarkan.`); 
      
      const token = generateToken((patientUser._id as any).toString());
      const userData = patientUser.toObject();
      delete userData.password;

      // ✅ LOGIKA NOTIFIKASI REGISTRASI PASIEN BARU
      const notificationMessage = `Pasien baru bernama ${userData.fullName} (${userData.email}) telah berhasil mendaftar.`;
      const notification = await notificationService.createNotification({
          message: notificationMessage,
          type: 'new_patient_registration', // Tipe baru
          targetRoles: ['admin', 'staff'], 
          relatedEntityId: userData._id,
          link: `/data-pasien?id=${userData._id}` // Link ke halaman detail pasien di admin
      });

      const io: SocketIOServer = req.app.get("io");
      if (io) {
          notificationService.emitNotification(io, notification);
          console.log(`✅ Notifikasi registrasi pasien baru dipancarkan: ${notification.message}`);
      } else {
          console.warn("❌ Socket.IO instance tidak ditemukan di Express app. Notifikasi registrasi real-time mungkin tidak berfungsi.");
      }
      // ✅ AKHIR LOGIKA NOTIFIKASI

      res.status(201).json({ 
        success: true, 
        message: "Pendaftaran berhasil!", 
        data: { user: userData, token } 
      });
    } catch (error) {
      console.error(`[PatientAuth] Error saat pendaftaran user: ${error.message || error}`); 
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("[PatientAuth] Validasi login gagal:", errors.array()); 
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    try {
      const { email, password } = req.body;
      console.log(`[PatientAuth] Mencoba login untuk email: ${email}`); 
      
      const patientUser = await PatientUser.findOne({ email: email.toLowerCase() }).select('+password');
      console.log(`[PatientAuth] Hasil findOne untuk ${email}: ${patientUser ? 'Ditemukan' : 'Tidak Ditemukan'}`); 

      if (!patientUser) {
        console.log(`[PatientAuth] Login gagal: Email ${email} tidak ditemukan.`); 
        res.status(401).json({ success: false, message: "Email atau password salah" });
        return;
      }

      console.log(`[PatientAuth] Mencoba membandingkan password untuk user: ${email}`); 
      const isMatch = await patientUser.comparePassword(password);
      
      if (!isMatch) {
        console.log(`[PatientAuth] Login gagal: Password tidak cocok untuk user ${email}.`); 
        res.status(401).json({ success: false, message: "Email atau password salah" });
        return;
      }

      const token = generateToken((patientUser._id as any).toString());
      console.log(`[PatientAuth] Token berhasil dibuat untuk user ${email}.`); 
      
      const userData = patientUser.toObject();
      delete userData.password;

      res.json({ 
        success: true, 
        message: "Login berhasil", 
        data: { user: userData, token } 
      });
      console.log(`[PatientAuth] Login berhasil untuk user ${email}.`); 
    } catch (error) {
      console.error(`[PatientAuth] Error saat login untuk pasien: ${error.message || error}`); 
      next(error);
    }
  }

  public async demoLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("[PatientAuth] Mencoba demo login pasien."); 
      const demoPatient = await PatientUser.findOne({ email: 'patient@demo.com' }).select('+password'); 
      
      if (!demoPatient) {
        res.status(404).json({ success: false, message: "User demo pasien tidak ditemukan." });
        return;
      }

      const token = generateToken(demoPatient._id.toString());
      const userData = demoPatient.toObject();
      delete userData.password;

      res.json({ 
        success: true, 
        message: `Login demo pasien berhasil! Selamat datang, ${userData.fullName}.`, 
        data: { user: userData, token } 
      });

    } catch (error) {
      console.error(`[PatientAuth] Error saat demo login pasien: ${error.message || error}`); 
      next(error);
    }
  }
  
  public async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(404).json({ success: false, message: "Pasien tidak ditemukan" });
        return;
      }
      const userData = req.user.toObject();
      delete userData.password;
      res.json({ success: true, data: { user: userData } });
    } catch (error) {
      next(error);
    }
  }

  public async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
      res.status(501).json({ success: false, message: "Not Implemented" });
  }

  public async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
      res.status(501).json({ success: false, message: "Not Implemented" });
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
      res.json({ success: true, message: "Logout berhasil" });
  }

  public async verifyToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Token tidak valid atau kedaluwarsa." });
        return;
      }
      const userData = req.user.toObject();
      delete userData.password;
      res.json({ success: true, message: "Token valid", data: { user: userData } });
    } catch (error) {
      next(error);
    }
  }
}

export default new PatientAuthController();