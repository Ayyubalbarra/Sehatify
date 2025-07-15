// apps/api/src/middleware/auth.ts

import { type Request, type Response, type NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import User, { type IUser } from '../models/User'; // Pastikan ini mengimpor model User

// Interface untuk JWT payload yang di-decode
interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

// Tipe kustom untuk Request yang sudah terotentikasi
export interface AuthRequest extends Request {
  user?: IUser; // req.user akan berisi seluruh dokumen user (admin/staf)
}

// Middleware untuk memverifikasi token
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: "Akses ditolak. Token tidak disediakan." 
      });
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
    
    // Cari user berdasarkan ID dari token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: "Token tidak valid atau akun tidak aktif." });
      return;
    }
    
    req.user = user;
    next();
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false, 
        message: error.message === 'jwt expired' ? 'Token sudah kedaluwarsa.' : 'Token tidak valid.' 
      });
      return;
    }
    
    next(error);
  }
};

// Middleware untuk otorisasi berdasarkan peran
export const authorizeRoles = (...roles: Array<IUser['role']>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: "Akses ditolak. Anda tidak memiliki izin yang cukup." 
      });
      return;
    }
    
    next();
  };
};

// Middleware opsional untuk mendapatkan info user tanpa mewajibkan otentikasi
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
                const user = await User.findById(decoded.userId).select('-password');
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