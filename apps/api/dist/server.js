"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const database_1 = __importDefault(require("./config/database"));
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints")); // <-- 1. Impor library debug
// Impor semua rute
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const patientAuthRoutes_1 = __importDefault(require("./routes/patientAuthRoutes"));
const queueRoutes_1 = __importDefault(require("./routes/queueRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const bedRoutes_1 = __importDefault(require("./routes/bedRoutes"));
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
const patientRoutes_1 = __importDefault(require("./routes/patientRoutes"));
const polyclinicRoutes_1 = __importDefault(require("./routes/polyclinicRoutes"));
const scheduleRoutes_1 = __importDefault(require("./routes/scheduleRoutes"));
const seedRoutes_1 = __importDefault(require("./routes/seedRoutes"));
const visitRoutes_1 = __importDefault(require("./routes/visitRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const API_BASE_PATH = process.env.API_BASE_PATH || "/api/v1";
const server = http_1.default.createServer(app);
const corsOptions = {
    origin: process.env.FRONTEND_URL?.split(',').map(url => url.trim()),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};
const io = new socket_io_1.Server(server, { cors: corsOptions });
app.set("io", io);
io.on("connection", (socket) => {
    console.log(`✅ User connected via WebSocket: ${socket.id}`);
    socket.on("disconnect", () => console.log(`❌ User disconnected: ${socket.id}`));
});
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Pendaftaran Rute API
app.use(`${API_BASE_PATH}/auth`, authRoutes_1.default);
app.use(`${API_BASE_PATH}/patient`, patientAuthRoutes_1.default);
app.use(`${API_BASE_PATH}/queues`, queueRoutes_1.default);
app.use(`${API_BASE_PATH}/dashboard`, dashboardRoutes_1.default);
app.use(`${API_BASE_PATH}/ai`, aiRoutes_1.default);
app.use(`${API_BASE_PATH}/beds`, bedRoutes_1.default);
app.use(`${API_BASE_PATH}/doctors`, doctorRoutes_1.default);
app.use(`${API_BASE_PATH}/inventory`, inventoryRoutes_1.default);
app.use(`${API_BASE_PATH}/patients`, patientRoutes_1.default);
app.use(`${API_BASE_PATH}/polyclinics`, polyclinicRoutes_1.default);
app.use(`${API_BASE_PATH}/schedules`, scheduleRoutes_1.default);
app.use(`${API_BASE_PATH}/seed`, seedRoutes_1.default);
app.use(`${API_BASE_PATH}/visits`, visitRoutes_1.default);
// ================== KODE DEBUGGING ==================
console.log("==================== REGISTERED ENDPOINTS ====================");
console.log((0, express_list_endpoints_1.default)(app));
console.log("============================================================");
// ======================================================================
// Global Error Handler
app.use((error, req, res, next) => {
    console.error("❌ Global Error Handler:", error.message);
    const status = error.statusCode || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
});
// Fungsi untuk memulai server
async function startServer() {
    try {
        console.log("🔌 Menghubungkan ke database...");
        await database_1.default.connect();
        server.listen(PORT, () => {
            console.log(`🚀 Server berjalan di port ${PORT}`);
            console.log(`📡 Rute API tersedia di path: ${API_BASE_PATH}`);
        });
    }
    catch (error) {
        console.error("❌ Gagal memulai server:", error);
        process.exit(1);
    }
}
startServer();
