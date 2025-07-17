// apps/api/src/middleware/auth.ts

import { type Request, type Response, type NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import User, { type IUser } from '../models/User';
import PatientUser, { type IPatientUser } from '../models/patientUser.model';

interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

export interface AuthRequest extends Request {
  user?: IUser | IPatientUser; 
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, message: "Akses ditolak. Token tidak disediakan." });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET tidak diatur di file .env');
    }

    const decoded = jwt.verify(token, secret) as CustomJwtPayload;

    if (typeof decoded !== 'object' || !decoded.userId) {
      res.status(401).json({ success: false, message: "Format token tidak valid." });
      return;
    }
    
    let user: IUser | IPatientUser | null = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      user = await PatientUser.findById(decoded.userId).select('-password');
    }
    
    // Pemeriksaan isActive sekarang aman karena properti ada di kedua model
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: "Token tidak valid atau akun tidak aktif." });
      return;
    }
    
    req.user = user;
    next();
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Token tidak valid atau kedaluwarsa.' });
      return;
    }
    next(error);
  }
};

export const authorizeRoles = (...roles: Array<string>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // ✅ PERBAIKAN: Lakukan "type guard" untuk memeriksa keberadaan properti 'role'
    // Ini memastikan hanya pengguna yang memiliki role (admin/staf) yang bisa lolos
    if (!req.user || !('role' in req.user) || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Akses ditolak. Anda tidak memiliki izin yang cukup." });
      return;
    }
    
    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (token) {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        const decoded = jwt.verify(token, secret) as CustomJwtPayload;
        if (typeof decoded === 'object' && decoded.userId) {
          let user: IUser | IPatientUser | null = await User.findById(decoded.userId).select('-password');
          if (!user) {
              user = await PatientUser.findById(decoded.userId).select('-password');
          }
          if (user && user.isActive) {
            req.user = user;
          }
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};