"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Helper function to generate JWT
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'supersecret', {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};
class AuthController {
    // Register a new user
    async register(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        try {
            const { name, email, password, role } = req.body;
            const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                res.status(400).json({ success: false, message: "Email sudah terdaftar" });
                return;
            }
            const user = new User_1.default({ ...req.body, email: email.toLowerCase(), role: role || "staff" });
            await user.save();
            const token = generateToken(user._id.toString());
            const userData = user.toObject();
            delete userData.password;
            res.status(201).json({ success: true, message: "User berhasil didaftarkan", data: { user: userData, token } });
        }
        catch (error) {
            next(error);
        }
    }
    // Login a user
    async login(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        try {
            const { email, password } = req.body;
            const user = await User_1.default.findOne({ email: email.toLowerCase() }).select('+password');
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
        }
        catch (error) {
            next(error);
        }
    }
    async demoLogin(req, res, next) {
        try {
            const user = await User_1.default.findOne({ email: "admin@sehatify.com" });
            if (!user) {
                res.status(404).json({ success: false, message: "Akun demo tidak ditemukan. Jalankan 'npm run seed'." });
                return;
            }
            await user.updateLastLogin();
            const token = generateToken(user._id.toString());
            const userData = user.toObject();
            res.json({ success: true, message: "Login demo berhasil", data: { user: userData, token } });
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const user = await User_1.default.findById(req.user?.userId).select("-password");
            if (!user) {
                res.status(404).json({ success: false, message: "User tidak ditemukan" });
                return;
            }
            res.json({ success: true, data: { user } });
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        try {
            const user = await User_1.default.findByIdAndUpdate(req.user?.userId, req.body, { new: true, runValidators: true }).select("-password");
            if (!user) {
                res.status(404).json({ success: false, message: "User tidak ditemukan" });
                return;
            }
            res.json({ success: true, message: "Profil berhasil diupdate", data: { user } });
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        try {
            const { currentPassword, newPassword } = req.body;
            const user = await User_1.default.findById(req.user?.userId).select('+password');
            if (!user || !(await user.comparePassword(currentPassword))) {
                res.status(400).json({ success: false, message: "Password lama salah" });
                return;
            }
            user.password = newPassword;
            await user.save();
            res.json({ success: true, message: "Password berhasil diubah" });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res) {
        res.json({ success: true, message: "Logout berhasil" });
    }
    async verifyToken(req, res, next) {
        try {
            const user = await User_1.default.findById(req.user?.userId).select("-password");
            if (!user || !user.isActive) {
                res.status(401).json({ success: false, message: "Token tidak valid atau akun tidak aktif" });
                return;
            }
            res.json({ success: true, data: { user } });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new AuthController();
