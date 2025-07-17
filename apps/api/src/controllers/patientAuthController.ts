// apps/api/src/controllers/patientAuthController.ts

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt, { SignOptions } from 'jsonwebtoken';
import PatientUser from '../models/patientUser.model';
import { AuthRequest } from '../middleware/auth'; // Import AuthRequest

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

  // ✅ SOLUSI: Tambahkan constructor untuk melakukan bind pada semua metode
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

      console.log(`[PatientAuth] Mencoba mendaftar user baru: ${email}`); // Log 1

      const existingUser = await PatientUser.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        console.log(`[PatientAuth] Pendaftaran gagal: Email ${email} sudah digunakan.`); // Log 2
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
      console.log(`[PatientAuth] User ${email} berhasil didaftarkan.`); // Log 3
      
      const token = generateToken((patientUser._id as any).toString());
      const userData = patientUser.toObject();
      delete userData.password;
      
      res.status(201).json({ 
        success: true, 
        message: "Pendaftaran berhasil!", 
        data: { user: userData, token } 
      });
    } catch (error) {
      console.error(`[PatientAuth] Error saat pendaftaran user: ${error.message || error}`); // Log Error
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("[PatientAuth] Validasi login gagal:", errors.array()); // Log Validasi Gagal
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    try {
      const { email, password } = req.body;
      console.log(`[PatientAuth] Mencoba login untuk email: ${email}`); // Log 1: Mulai Login
      
      const patientUser = await PatientUser.findOne({ email: email.toLowerCase() }).select('+password');
      console.log(`[PatientAuth] Hasil findOne untuk ${email}: ${patientUser ? 'Ditemukan' : 'Tidak Ditemukan'}`); // Log 2: User Ditemukan?

      if (!patientUser) {
        console.log(`[PatientAuth] Login gagal: Email ${email} tidak ditemukan.`); // Log 3: User Tidak Ditemukan
        res.status(401).json({ success: false, message: "Email atau password salah" });
        return;
      }

      console.log(`[PatientAuth] Mencoba membandingkan password untuk user: ${email}`); // Log 4: Membandingkan Password
      const isMatch = await patientUser.comparePassword(password);
      
      if (!isMatch) {
        console.log(`[PatientAuth] Login gagal: Password tidak cocok untuk user ${email}.`); // Log 5: Password Tidak Cocok
        res.status(401).json({ success: false, message: "Email atau password salah" });
        return;
      }

      const token = generateToken((patientUser._id as any).toString());
      console.log(`[PatientAuth] Token berhasil dibuat untuk user ${email}.`); // Log 6: Token Dibuat
      
      const userData = patientUser.toObject();
      delete userData.password;

      res.json({ 
        success: true, 
        message: "Login berhasil", 
        data: { user: userData, token } 
      });
      console.log(`[PatientAuth] Login berhasil untuk user ${email}.`); // Log 7: Login Berhasil
    } catch (error) {
      console.error(`[PatientAuth] Error saat login untuk pasien: ${error.message || error}`); // Log Error
      next(error);
    }
  }

  public async demoLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("[PatientAuth] Mencoba demo login pasien."); // Log Demo
      const demoPatient = await PatientUser.findOne({ email: 'patient@demo.com' }).select('+password'); 
      
      if (!demoPatient) {
        console.log("[PatientAuth] User demo pasien tidak ditemukan."); // Log Demo Not Found
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
      console.log("[PatientAuth] Demo login pasien berhasil."); // Log Demo Success

    } catch (error) {
      console.error(`[PatientAuth] Error saat demo login pasien: ${error.message || error}`); // Log Error Demo
      next(error);
    }
  }
  
  // ✅ PERBAIKAN: Gunakan AuthRequest agar bisa mengakses req.user
  public async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.user sekarang adalah PatientUser
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
      // Implementasi logika update profile pasien di sini
      res.status(501).json({ success: false, message: "Not Implemented" });
  }

  public async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
      // Implementasi logika ganti password pasien di sini
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