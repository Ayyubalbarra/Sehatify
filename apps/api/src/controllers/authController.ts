import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Helper function to generate JWT
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'supersecret', {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

class AuthController {
  // Register a new user
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    try {
      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({ success: false, message: "Email sudah terdaftar" });
        return;
      }

      const user = new User({ ...req.body, email: email.toLowerCase(), role: role || "staff" });
      await user.save();

      const token = generateToken(user._id.toString());
      
      const userData = user.toObject();
      delete userData.password;

      res.status(201).json({ success: true, message: "User berhasil didaftarkan", data: { user: userData, token } });
    } catch (error) {
      next(error);
    }
  }

  // Login a user
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user || !(await user.comparePassword(password))) {
        res.status(401).json({ success: false, message: "Email atau password salah" });
        return;
      }
      
      if (!user.isActive) {
        res.status(401).json({ success: false, message: "Akun tidak aktif" });
        return;
      }

      await user.updateLastLogin();
      const token = generateToken(user._id.toString());
      
      const userData = user.toObject();
      // Password tidak perlu dihapus di sini karena sudah di-select: false di model

      res.json({ success: true, message: "Login berhasil", data: { user: userData, token } });
    } catch (error) {
      next(error);
    }
  }

  public async demoLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findOne({ email: "admin@sehatify.com" });

      if (!user) {
        res.status(404).json({ success: false, message: "Akun demo tidak ditemukan. Jalankan 'npm run seed'." });
        return;
      }

      await user.updateLastLogin();
      const token = generateToken(user._id.toString());

      const userData = user.toObject();
      
      res.json({ success: true, message: "Login demo berhasil", data: { user: userData, token } });
    } catch (error) {
      next(error);
    }
  }

  public async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user?.userId).select("-password");
      if (!user) {
        res.status(404).json({ success: false, message: "User tidak ditemukan" });
        return;
      }
      res.json({ success: true, data: { user } });
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
      const user = await User.findByIdAndUpdate(req.user?.userId, req.body, { new: true, runValidators: true }).select("-password");
      if (!user) {
        res.status(404).json({ success: false, message: "User tidak ditemukan" });
        return;
      }
      res.json({ success: true, message: "Profil berhasil diupdate", data: { user } });
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
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user?.userId).select('+password');
      if (!user || !(await user.comparePassword(currentPassword))) {
        res.status(400).json({ success: false, message: "Password lama salah" });
        return;
      }
      user.password = newPassword;
      await user.save();
      res.json({ success: true, message: "Password berhasil diubah" });
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    res.json({ success: true, message: "Logout berhasil" });
  }

  public async verifyToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user?.userId).select("-password");
      if (!user || !user.isActive) {
        res.status(401).json({ success: false, message: "Token tidak valid atau akun tidak aktif" });
        return;
      }
      res.json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
