// apps/api/src/controllers/patientAuthController.ts

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt, { SignOptions } from 'jsonwebtoken';
import PatientUser from '../models/patientUser.model';
import { AuthRequest } from '../middleware/auth';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('Kesalahan konfigurasi server: JWT_SECRET tidak ditemukan');
  }

  return jwt.sign({ userId }, secret, { expiresIn });
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

      const existingUser = await PatientUser.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({ success: false, message: "Email sudah terdaftar" });
        return;
      }
      
      const patientUser = new PatientUser({ fullName, email: email.toLowerCase(), password, phone, dateOfBirth, address });
      await patientUser.save();
      
      const token = generateToken(patientUser._id.toString());
      const userData = patientUser.toObject();
      delete userData.password;
      
      res.status(201).json({ 
        success: true, 
        message: "Pendaftaran berhasil!", 
        data: { user: userData, token } 
      });
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }
    try {
      const { email, password } = req.body;
      const patientUser = await PatientUser.findOne({ email: email.toLowerCase() }).select('+password');
      if (!patientUser) {
        res.status(401).json({ success: false, message: "Email atau password salah" });
        return;
      }
      const isMatch = await patientUser.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: "Email atau password salah" });
        return;
      }
      const token = generateToken(patientUser._id.toString());
      const userData = patientUser.toObject();
      delete userData.password;
      res.json({ success: true, message: "Login berhasil", data: { user: userData, token } });
    } catch (error) {
      next(error);
    }
  }

  public async demoLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
      // Implementasi demo login untuk pasien jika ada
      res.status(501).json({ success: false, message: "Demo login pasien belum tersedia" });
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