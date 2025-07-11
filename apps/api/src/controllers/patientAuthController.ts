import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt, { SignOptions } from 'jsonwebtoken';
import PatientUser from '../models/patientUser.model';

// Helper function untuk generate JWT
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('JWT_SECRET tidak terdefinisi di file .env');
    throw new Error('Kesalahan konfigurasi server');
  }

  // --- PERBAIKAN DI SINI ---
  const expiresInSeconds = process.env.JWT_EXPIRES_IN 
    ? parseInt(process.env.JWT_EXPIRES_IN, 10) // Ubah string dari .env menjadi angka
    : 604800; // Fallback 7 hari dalam detik (7 * 24 * 60 * 60)

  const options: SignOptions = {
    expiresIn: expiresInSeconds, // Gunakan nilai angka
  };
  
  return jwt.sign({ userId }, secret, options);
};

class PatientAuthController {
  // Registrasi Pasien Baru
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

      const patientUser = new PatientUser({ ...req.body, email: email.toLowerCase() });
      await patientUser.save();
      
      const userData = patientUser.toObject();
      
      res.status(201).json({ success: true, message: "Pendaftaran berhasil", data: { user: userData } });
    } catch (error) {
      next(error);
    }
  }

  // Login Pasien
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    try {
      const { email, password } = req.body;
      
      const patientUser = await PatientUser.findOne({ email: email.toLowerCase() }).select('+password');

      if (!patientUser || !(await patientUser.comparePassword(password))) {
        res.status(401).json({ success: false, message: "Email atau password salah" });
        return;
      }

      const token = generateToken((patientUser._id as any).toString());
      
      const userData = patientUser.toObject();

      res.json({ success: true, message: "Login berhasil", data: { user: userData, token } });
    } catch (error) {
      next(error);
    }
  }
}

export default new PatientAuthController();