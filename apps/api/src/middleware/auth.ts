// apps/api/src/middleware/auth.ts

import { type Request, type Response, type NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import User, { type IUser } from '../models/User';
import PatientUser, { type IPatientUser } from '../models/patientUser.model';

interface CustomJwtPayload extends JwtPayload {
    userId: string;
}

// Perluas antarmuka Request dari Express untuk menambahkan user dan userType
export interface AuthRequest extends Request {
    user?: IUser | IPatientUser; 
    userType?: 'admin' | 'doctor' | 'staff' | 'Super Admin' | 'patient'; 
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
        
        let user: IUser | IPatientUser | null = null;
        let userType: AuthRequest['userType'] = undefined;

        // Coba cari di model User (admin, doctor, staff, Super Admin)
        const adminOrDoctorUser: IUser | null = await User.findById(decoded.userId).select('-password');
        
        if (adminOrDoctorUser) {
            user = adminOrDoctorUser;
            userType = adminOrDoctorUser.role; // Set userType berdasarkan role dari model User
        } else {
            // Jika tidak ditemukan di User, coba cari di PatientUser
            const patient: IPatientUser | null = await PatientUser.findById(decoded.userId).select('-password');
            if (patient) {
                user = patient;
                userType = 'patient'; // Set userType sebagai 'patient'
            }
        }
        
        // Pemeriksaan isActive sekarang aman karena properti ada di kedua model
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: "Token tidak valid atau akun tidak aktif." });
            return;
        }
        
        req.user = user;
        req.userType = userType; // ✅ Tetapkan userType ke request
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
        if (!req.user || !req.userType || !('role' in req.user) || !roles.includes(req.user.role)) {
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
                    let user: IUser | IPatientUser | null = null;
                    let userType: AuthRequest['userType'] = undefined;

                    // Coba cari di model User
                    const adminOrDoctorUser: IUser | null = await User.findById(decoded.userId).select('-password');
                    if (adminOrDoctorUser) {
                        user = adminOrDoctorUser;
                        userType = adminOrDoctorUser.role;
                    } else {
                        // Jika tidak ditemukan di User, coba cari di PatientUser
                        const patient: IPatientUser | null = await PatientUser.findById(decoded.userId).select('-password');
                        if (patient) {
                            user = patient;
                            userType = 'patient';
                        }
                    }
                    
                    if (user && user.isActive) {
                        req.user = user;
                        req.userType = userType; // ✅ Tetapkan userType ke request di optionalAuth juga
                    }
                }
            }
        }
        next();
    } catch (error) {
        next();
    }
};