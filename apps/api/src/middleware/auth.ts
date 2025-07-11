import { type Request, type Response, type NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import User, { type IUser } from '../models/User';

// Interface untuk JWT payload yang di-decode
interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

// Tipe kustom untuk Request yang sudah terotentikasi
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: IUser['role'];
  };
}

// Middleware untuk memverifikasi token
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

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

    // Verifikasi token dengan type assertion yang lebih aman
    const decoded = jwt.verify(token, secret) as CustomJwtPayload;

    // Validasi struktur payload
    if (typeof decoded !== 'object' || !decoded.userId) {
      res.status(401).json({ 
        success: false, 
        message: "Format token tidak valid." 
      });
      return;
    }
    
    // Cari user berdasarkan ID dari token
    const user = await User.findById(decoded.userId).select('role isActive');
    
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: "Token tidak valid. User tidak ditemukan." 
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ 
        success: false, 
        message: "Akun tidak aktif." 
      });
      return;
    }
    
    // Set user info ke request object
    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error: unknown) {
    // Type guard untuk error handling
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false, 
        message: 'Token sudah kedaluwarsa.' 
      });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false, 
        message: 'Token tidak valid.' 
      });
      return;
    }
    
    // Pass error lain ke error handler
    next(error);
  }
};

// Middleware untuk otorisasi berdasarkan peran
export const authorizeRoles = (...roles: Array<IUser['role']>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user?.role) {
      res.status(403).json({ 
        success: false, 
        message: "Akses ditolak. Role tidak terdefinisi." 
      });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: "Akses ditolak. Anda tidak memiliki izin yang cukup." 
      });
      return;
    }
    
    next();
  };
};

// Helper function untuk ekstrak token dari header
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

// Middleware optional untuk mendapatkan user info tanpa mengharuskan authentication
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      next();
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, secret) as CustomJwtPayload;

    if (typeof decoded === 'object' && decoded.userId) {
      const user = await User.findById(decoded.userId).select('role isActive');
      
      if (user && user.isActive) {
        req.user = {
          userId: user._id.toString(),
          role: user.role,
        };
      }
    }

    next();
  } catch (error) {
    // Jika terjadi error, lanjutkan tanpa user info
    next();
  }
};