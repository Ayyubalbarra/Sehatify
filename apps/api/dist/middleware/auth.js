"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Middleware untuk memverifikasi token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Akses ditolak. Token tidak disediakan." });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET tidak diatur di file .env');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (typeof decoded !== 'object' || !decoded.userId) {
            return res.status(401).json({ success: false, message: "Format token tidak valid." });
        }
        const user = await User_1.default.findById(decoded.userId).select('role isActive');
        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: "Token tidak valid atau akun tidak aktif." });
        }
        // [FIX] Menggunakan user._id yang benar, bukan user.id
        req.user = {
            userId: user._id.toString(),
            role: user.role,
        };
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token sudah kedaluwarsa.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Token tidak valid.' });
        }
        next(error);
    }
};
exports.authenticateToken = authenticateToken;
// Middleware untuk otorisasi berdasarkan peran
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user?.role) {
            return res.status(403).json({ success: false, message: "Akses ditolak. Role tidak terdefinisi." });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Akses ditolak. Anda tidak memiliki izin yang cukup." });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
