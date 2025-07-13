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

  const expiresInSeconds = process.env.JWT_EXPIRES_IN 
    ? parseInt(process.env.JWT_EXPIRES_IN, 10)
    : 604800; 

  const options: SignOptions = {
    expiresIn: expiresInSeconds,
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
      
      const patientUser = new PatientUser({
        fullName,
        email: email.toLowerCase(),
        password,
        phone,
        dateOfBirth,
        address
      });

      await patientUser.save();
      
      const userData = patientUser.toObject();
      
      res.status(201).json({ success: true, message: "Pendaftaran berhasil!", data: { user: userData } });
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

      // 1. Cek dulu apakah user ditemukan
      if (!patientUser) {
        res.status(401).json({ success: false, message: "Email atau password salah" });
        return;
      }

      // 2. Jika user ada, baru bandingkan passwordnya
      const isMatch = await patientUser.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: "Email atau password salah" });
        return;
      }

      // Setelah dua pengecekan di atas, TypeScript sekarang yakin patientUser ada.
      const token = generateToken((patientUser._id as any).toString());
      
      const userData = patientUser.toObject();

      res.json({ success: true, message: "Login berhasil", data: { user: userData, token } });
    } catch (error) {
      next(error);
    }
  }
}

export default new PatientAuthController();