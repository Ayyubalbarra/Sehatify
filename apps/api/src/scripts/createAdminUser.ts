// 1. Muat variabel dari .env di baris paling atas agar bisa dibaca
import dotenv from 'dotenv';
dotenv.config();

// 2. Gunakan sintaks modern 'import' agar cocok dengan file lain
import dbConnection from '../config/database';
import User from '../models/User';

async function createAdminUser() {
  try {
    console.log("🔌 Connecting to database...");
    await dbConnection.connect();

    // Cek apakah admin sudah ada
    const existingAdmin = await User.findOne({ email: "admin@sehatify.com" });
    
    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      console.log("📧 Email: admin@sehatify.com");
      console.log("🔑 Password: admin123");
      return;
    }

    // 3. Hapus hashing manual. Biarkan model Mongoose yang bekerja.
    const adminUser = new User({
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

  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    console.log("🔌 Disconnecting from database...");
    await dbConnection.disconnect();
  }
}

// Langsung jalankan fungsi utama
createAdminUser();