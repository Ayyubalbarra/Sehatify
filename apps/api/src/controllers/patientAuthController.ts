// apps/api/src/controllers/patientAuthController.ts

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt, { SignOptions } from 'jsonwebtoken';
import PatientUser from '../models/patientUser.model';

// Helper function untuk generate JWT (bisa di-refactor ke util)
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
      
      const token = generateToken((patientUser._id as any).toString());
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

      const token = generateToken((patientUser._id as any).toString());
      
      const userData = patientUser.toObject();
      delete userData.password;

      res.json({ 
        success: true, 
        message: "Login berhasil", 
        data: { user: userData, token } 
      });
    } catch (error) {
      next(error);
    }
  }

  public async demoLogin(req: Request, res: Response): Promise<void> {
    try {
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

    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Terjadi kesalahan pada demo login pasien." });
    }
  }

  public async getProfile(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: "Not Implemented" });
  }

  public async updateProfile(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: "Not Implemented" });
  }

  public async changePassword(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: "Not Implemented" });
  }

  public async logout(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: "Not Implemented" });
  }

  public async verifyToken(req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: "Not Implemented" });
  }
}

export default new PatientAuthController();