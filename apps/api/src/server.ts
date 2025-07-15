import dotenv from "dotenv";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dbConnection from "./config/database";
import listEndpoints from 'express-list-endpoints'; // <-- 1. Impor library debug

// Impor semua rute
import authRoutes from "./routes/authRoutes";
import patientAuthRoutes from "./routes/patientAuthRoutes";
import queueRoutes from "./routes/queueRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import aiRoutes from "./routes/aiRoutes";
import bedRoutes from "./routes/bedRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import patientRoutes from "./routes/patientRoutes";
import polyclinicRoutes from "./routes/polyclinicRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import seedRoutes from "./routes/seedRoutes";
import visitRoutes from "./routes/visitRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_BASE_PATH = process.env.API_BASE_PATH || "/api/v1";

const server = http.createServer(app);

const corsOptions = {
  origin: process.env.FRONTEND_URL?.split(',').map(url => url.trim()),
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const io = new Server(server, { cors: corsOptions });
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`✅ User connected via WebSocket: ${socket.id}`);
  socket.on("disconnect", () => console.log(`❌ User disconnected: ${socket.id}`));
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pendaftaran Rute API
app.use(`${API_BASE_PATH}/auth`, authRoutes);
app.use(`${API_BASE_PATH}/patient`, patientAuthRoutes);
app.use(`${API_BASE_PATH}/queues`, queueRoutes);
app.use(`${API_BASE_PATH}/dashboard`, dashboardRoutes);
app.use(`${API_BASE_PATH}/ai`, aiRoutes);
app.use(`${API_BASE_PATH}/beds`, bedRoutes);
app.use(`${API_BASE_PATH}/doctors`, doctorRoutes);
app.use(`${API_BASE_PATH}/inventory`, inventoryRoutes);
app.use(`${API_BASE_PATH}/patients`, patientRoutes);
app.use(`${API_BASE_PATH}/polyclinics`, polyclinicRoutes);
app.use(`${API_BASE_PATH}/schedules`, scheduleRoutes);
app.use(`${API_BASE_PATH}/seed`, seedRoutes);
app.use(`${API_BASE_PATH}/visits`, visitRoutes);


// ================== KODE DEBUGGING ==================
console.log("==================== REGISTERED ENDPOINTS ====================");
console.log(listEndpoints(app));
console.log("============================================================");
// ======================================================================


// Global Error Handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Global Error Handler:", error.message);
  const status = error.statusCode || 500;
  const message = error.message || "Terjadi kesalahan pada server.";
  res.status(status).json({ success: false, message });
});

// Fungsi untuk memulai server
async function startServer() {
  try {
    console.log("🔌 Menghubungkan ke database...");
    await dbConnection.connect();
    server.listen(PORT, () => {
      console.log(`🚀 Server berjalan di port ${PORT}`);
      console.log(`📡 Rute API tersedia di path: ${API_BASE_PATH}`);
    });
  } catch (error) {
    console.error("❌ Gagal memulai server:", error);
    process.exit(1);
  }
}

startServer();