"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 1. Muat variabel dari .env di baris paling atas agar bisa dibaca
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// 2. Gunakan sintaks modern 'import' agar cocok dengan file lain
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("../models/User"));
async function createAdminUser() {
    try {
        console.log("🔌 Connecting to database...");
        await database_1.default.connect();
        // Cek apakah admin sudah ada
        const existingAdmin = await User_1.default.findOne({ email: "admin@sehatify.com" });
        if (existingAdmin) {
            console.log("✅ Admin user already exists");
            console.log("📧 Email: admin@sehatify.com");
            console.log("🔑 Password: admin123");
            return;
        }
        // 3. Hapus hashing manual. Biarkan model Mongoose yang bekerja.
        const adminUser = new User_1.default({
            name: "Administrator",
            email: "admin@sehatify.com",
            password: "admin123", // Berikan password teks biasa
            role: "Super Admin", // role ini ada di kode asli Anda
            status: "Active",
        });
        await adminUser.save();
        console.log("✅ Admin user created successfully!");
        console.log("📧 Email: admin@sehatify.com");
        console.log("🔑 Password: admin123");
        console.log("👤 Role: Super Admin");
    }
    catch (error) {
        console.error("❌ Error creating admin user:", error);
    }
    finally {
        console.log("🔌 Disconnecting from database...");
        await database_1.default.disconnect();
    }
}
// Langsung jalankan fungsi utama
createAdminUser();
