"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
// PERBAIKAN: Hapus impor 'StringValue'
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const patientUser_model_1 = __importDefault(require("../models/patientUser.model"));
// Helper function untuk generate JWT
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    if (!secret) {
        console.error('JWT_SECRET tidak terdefinisi di file .env');
        throw new Error('Kesalahan konfigurasi server');
    }
    // PERBAIKAN: Gunakan langsung variabel string tanpa type assertion
    const options = {
        expiresIn: expiresIn,
    };
    return jsonwebtoken_1.default.sign({ userId }, secret, options);
};
class PatientAuthController {
    // Registrasi Pasien Baru
    async register(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        try {
            const { fullName, email, password, phone, dateOfBirth, address } = req.body;
            const existingUser = await patientUser_model_1.default.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                res.status(400).json({ success: false, message: "Email sudah digunakan" });
                return;
            }
            const patientUser = new patientUser_model_1.default({
                fullName,
                email: email.toLowerCase(),
                password,
                phone,
                dateOfBirth,
                address
            });
            await patientUser.save();
            const token = generateToken(patientUser._id.toString());
            const userData = patientUser.toObject();
            delete userData.password;
            res.status(201).json({
                success: true,
                message: "Pendaftaran berhasil!",
                data: { user: userData, token }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Login Pasien
    async login(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        try {
            const { email, password } = req.body;
            const patientUser = await patientUser_model_1.default.findOne({ email: email.toLowerCase() }).select('+password');
            if (!patientUser) {
                res.status(401).json({ success: false, message: "Email atau password salah" });
                return;
            }
            const isMatch = await patientUser.comparePassword(password);
            if (!isMatch) {
                res.status(401).json({ success: false, message: "Email atau password salah" });
                return;
            }
            const token = generateToken(patientUser._id.toString());
            const userData = patientUser.toObject();
            delete userData.password;
            res.json({
                success: true,
                message: "Login berhasil",
                data: { user: userData, token }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // DEMO-LOGIN - Tambahkan method yang diperlukan
    async demoLogin(req, res) {
        // Implementasi demo login
        res.json({ success: true, message: "Demo login berhasil" });
    }
    async getProfile(req, res) {
        // Implementasi get profile
    }
    async updateProfile(req, res) {
        // Implementasi update profile
    }
    async changePassword(req, res) {
        // Implementasi change password
    }
    async logout(req, res) {
        // Implementasi logout
    }
    async verifyToken(req, res) {
        // Implementasi verify token
    }
}
exports.default = new PatientAuthController();
