import mongoose, { type Mongoose } from 'mongoose';

class DatabaseConnection {
  private connection: Mongoose | null = null;

  async connect(): Promise<void> {
    // Jika koneksi sudah ada, tidak perlu melakukan apa-apa
    if (this.connection) {
      return;
    }

    // [FIX] Ambil dan periksa MONGODB_URI di dalam metode ini
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      console.error("❌ Variabel MONGODB_URI tidak ditemukan di file .env");
      // Hentikan aplikasi dengan error yang jelas
      throw new Error('Pastikan MONGODB_URI sudah diatur di file .env');
    }

    try {
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      // Sekarang TypeScript tahu MONGODB_URI adalah string yang valid di sini
      this.connection = await mongoose.connect(MONGODB_URI, options);

      console.log('✅ MongoDB Connected Successfully');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🌐 Host: ${mongoose.connection.host}`);

      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB Connection Error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("⚠️ MongoDB Disconnected");
      });

    } catch (error) {
      console.error("❌ MongoDB Connection Failed:", error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
    }
  }
}

const dbConnection = new DatabaseConnection();

export default dbConnection;