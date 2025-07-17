// apps/api/src/config/database.ts

import mongoose, { ConnectOptions } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Fatal: MONGODB_URI tidak terdefinisi di file .env");
}

// ✅ PERBAIKAN: Menambahkan opsi koneksi yang lebih tangguh
const options: ConnectOptions = {
  // Opsi ini membantu Mongoose menemukan server yang aktif lebih cepat
  serverSelectionTimeoutMS: 5000, 
  // Opsi ini membantu mencegah timeout pada query yang berjalan lama
  socketTimeoutMS: 45000, 
};

const dbConnection = {
  connect: async (): Promise<void> => {
    try {
      await mongoose.connect(MONGODB_URI, options);
      
      const db = mongoose.connection;
      
      db.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      db.once('open', () => {
        const dbInfo = db.getClient().db(db.name);
        console.log('✅ MongoDB Connected Successfully');
        console.log(`📊 Database: ${dbInfo.databaseName}`);
        console.log(`🌐 Host: ${db.host}`);
      });

    } catch (error) {
      console.error('❌ Could not connect to MongoDB:', error);
      process.exit(1); // Hentikan aplikasi jika koneksi awal gagal
    }
  },

  disconnect: async (): Promise<void> => {
    await mongoose.disconnect();
    console.log('🔌 MongoDB Disconnected');
  },
};

export default dbConnection;