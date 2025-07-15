"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorizeRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Middleware untuk memverifikasi token
const authenticateToken = async (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (typeof decoded !== 'object' || !decoded.userId) {
            res.status(401).json({ success: false, message: "Format token tidak valid." });
            return;
        }
        // Cari user berdasarkan ID dari token
        const user = await User_1.default.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: "Token tidak valid atau akun tidak aktif." });
            return;
        }
        // PERBAIKAN: Set seluruh objek user ke dalam request
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: error.message === 'jwt expired' ? 'Token sudah kedaluwarsa.' : 'Token tidak valid.'
            });
            return;
        }
        next(error);
    }
};
exports.authenticateToken = authenticateToken;
// Middleware untuk otorisasi berdasarkan peran
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // PERBAIKAN: Pengecekan sekarang lebih sederhana
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
exports.authorizeRoles = authorizeRoles;
// Middleware opsional untuk mendapatkan info user tanpa mewajibkan otentikasi
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];
        if (token) {
            const secret = process.env.JWT_SECRET;
            if (secret) {
                const decoded = jsonwebtoken_1.default.verify(token, secret);
                if (typeof decoded === 'object' && decoded.userId) {
                    const user = await User_1.default.findById(decoded.userId).select('-password');
                    if (user && user.isActive) {
                        req.user = user;
                    }
                }
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
