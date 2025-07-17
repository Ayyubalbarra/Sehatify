// apps/api/src/controllers/userAuthController.ts

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

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

class UserAuthController {
    
  // ✅ TAMBAHKAN CONSTRUCTOR UNTUK BIND 'THIS'
  constructor() {
    this.login = this.login.bind(this);
    this.demoLogin = this.demoLogin.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.logout = this.logout.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user || !user.isActive) {
        res.status(401).json({ success: false, message: "Email atau password salah, atau akun tidak aktif" });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: "Email atau password salah" });
        return;
      }

      await user.updateLastLogin();

      const token = generateToken(user._id.toString());
      
      const userData = user.toObject();
      delete userData.password;

      res.json({ 
        success: true, 
        message: `Selamat datang, ${user.name}!`, 
        data: { user: userData, token } 
      });
    } catch (error) {
      next(error);
    }
  }

  public async demoLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const demoAdmin = await User.findOne({ email: 'admin@demo.com' }).select('+password'); 
      
      if (!demoAdmin) {
        res.status(404).json({ success: false, message: "User demo admin tidak ditemukan." });
        return;
      }

      if (!demoAdmin.isActive) {
        res.status(401).json({ success: false, message: "Akun demo tidak aktif." });
        return;
      }

      await demoAdmin.updateLastLogin();

      const token = generateToken(demoAdmin._id.toString());
      const userData = demoAdmin.toObject();
      delete userData.password;

      res.json({ 
        success: true, 
        message: `Login demo berhasil! Selamat datang, ${userData.name}.`, 
        data: { user: userData, token } 
      });

    } catch (error) {
      next(error);
    }
  }

  public async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(404).json({ success: false, message: "User not found" });
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }
    try {
      if (!req.user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      const { name, email, phone, specialization, twoFactorEnabled, notifications } = req.body;
      
      if (email && email.toLowerCase() !== req.user.email.toLowerCase()) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          res.status(400).json({ success: false, message: "Email sudah digunakan oleh user lain" });
          return;
        }
      }

      req.user.name = name ?? req.user.name;
      req.user.email = email ? email.toLowerCase() : req.user.email;
      req.user.phone = phone ?? req.user.phone;
      req.user.specialization = specialization ?? req.user.specialization;
      if (twoFactorEnabled !== undefined) {
          req.user.twoFactorEnabled = twoFactorEnabled;
      }
      if (notifications) {
          req.user.notifications = {
              email: notifications.email ?? req.user.notifications.email,
              push: notifications.push ?? req.user.notifications.push,
          };
      }


      await req.user.save();
      const updatedUser = req.user.toObject();
      delete updatedUser.password; 

      res.json({ success: true, message: "Profil berhasil diperbarui", data: { user: updatedUser } });
    } catch (error) {
      next(error);
    }
  }

  public async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }
    try {
      if (!req.user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
      const { currentPassword, newPassword } = req.body;

      const userWithPassword = await User.findById(req.user._id).select('+password');
      if (!userWithPassword) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      const isMatch = await userWithPassword.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(400).json({ success: false, message: "Password saat ini salah" });
        return;
      }

      userWithPassword.password = newPassword;
      await userWithPassword.save();

      res.json({ success: true, message: "Password berhasil diubah" });
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    res.json({ success: true, message: "Logout berhasil (token harus dihapus di klien)" });
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

export default new UserAuthController();