"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const Patient_1 = __importDefault(require("../models/Patient"));
const Queue_1 = __importDefault(require("../models/Queue"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const Bed_1 = __importDefault(require("../models/Bed"));
const Schedule_1 = __importDefault(require("../models/Schedule"));
const Visit_1 = __importDefault(require("../models/Visit"));
class AIController {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("⚠️  GEMINI_API_KEY is not set. AI features will be disabled.");
            this.genAI = null;
            this.model = null;
        }
        else {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }
        // Bind all methods to preserve 'this' context
        this.getDashboardInsights = this.getDashboardInsights.bind(this);
        this.chatWithAI = this.chatWithAI.bind(this);
        this.getAIAnalysis = this.getAIAnalysis.bind(this);
        this.getAIRecommendations = this.getAIRecommendations.bind(this);
        this.getHealthPredictions = this.getHealthPredictions.bind(this);
        this.getInventoryOptimization = this.getInventoryOptimization.bind(this);
        this.getSchedulingSuggestions = this.getSchedulingSuggestions.bind(this);
    }
    // PERBAIKAN: Nama fungsi diubah agar cocok dengan di aiRoutes.js
    async getDashboardInsights(req, res, next) {
        try {
            // Validasi model AI tersedia
            if (!this.model) {
                res.status(503).json({
                    success: false,
                    message: "AI service is not available. Please check GEMINI_API_KEY configuration.",
                    error: "AI_SERVICE_UNAVAILABLE"
                });
                return;
            }
            console.log("🔍 Fetching hospital data for dashboard insights...");
            const hospitalData = await this.getHospitalSnapshot();
            console.log("🤖 Analyzing hospital data with AI...");
            const aiAnalysis = await this.analyzeHospitalData(hospitalData);
            console.log("✅ Dashboard insights generated successfully");
            const response = {
                success: true,
                data: {
                    metrics: hospitalData.metrics,
                    aiInsight: aiAnalysis.insight,
                    recommendations: aiAnalysis.recommendations,
                    shortcutCards: aiAnalysis.shortcutCards,
                    highlights: aiAnalysis.highlights,
                    timestamp: new Date().toISOString(),
                },
            };
            res.json(response);
        }
        catch (error) {
            console.error("❌ Error in getDashboardInsights:", error);
            // Fallback response jika terjadi error
            const fallbackData = {
                success: false,
                message: "Failed to generate AI insights, returning fallback data",
                error: error instanceof Error ? error.message : "Unknown error",
                data: {
                    metrics: {
                        totalPatients: 0,
                        todayQueues: 0,
                        emergencyToday: 0,
                        lowStockCount: 0,
                        availableBeds: 0,
                        icuOccupancy: 0,
                        todayVisits: 0,
                        activeSchedules: 0
                    },
                    aiInsight: "AI analysis temporarily unavailable. Please try again later.",
                    recommendations: ["Check system configuration", "Verify database connection"],
                    shortcutCards: [],
                    highlights: [],
                    timestamp: new Date().toISOString(),
                },
            };
            res.status(500).json(fallbackData);
            next(error);
        }
    }
    // Chat endpoint untuk AI Assistant popup
    async chatWithAI(req, res, next) {
        try {
            if (!this.model) {
                res.status(503).json({
                    success: false,
                    message: "AI service is not available. Please check GEMINI_API_KEY configuration."
                });
                return;
            }
            const { message } = req.body;
            if (!message || message.trim() === "") {
                res.status(400).json({
                    success: false,
                    message: "Pesan tidak boleh kosong"
                });
                return;
            }
            console.log("🤖 Processing chat message:", message.substring(0, 50) + "...");
            const hospitalContext = await this.getHospitalSnapshot();
            const systemPrompt = `Anda adalah AI Assistant untuk Sistem Manajemen Rumah Sakit "Sehatify". Anda membantu administrator rumah sakit dengan informasi dan saran. 
      
      KONTEKS RUMAH SAKIT SAAT INI: 
      - Total Pasien: ${hospitalContext.metrics.totalPatients}
      - Antrian Hari Ini: ${hospitalContext.metrics.todayQueues}
      - Stok Rendah: ${hospitalContext.metrics.lowStockCount}
      - Tempat Tidur Tersedia: ${hospitalContext.metrics.availableBeds}
      - Okupansi ICU: ${hospitalContext.metrics.icuOccupancy}%
      
      Jawab pertanyaan dengan informasi akurat, saran praktis, bahasa Indonesia yang profesional, dan singkat.`;
            const chat = this.model.startChat({
                history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: "Saya siap membantu Anda mengelola rumah sakit Sehatify. Ada yang bisa saya bantu?" }] }
                ],
            });
            const result = await chat.sendMessage(message);
            const response = await result.response;
            const aiResponse = response.text();
            console.log("✅ AI chat response generated successfully");
            res.json({
                success: true,
                data: {
                    message: aiResponse,
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            console.error("❌ Error in chatWithAI:", error);
            res.status(500).json({
                success: false,
                message: "Terjadi kesalahan saat memproses pesan. Silakan coba lagi.",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            next(error);
        }
    }
    // --- FUNGSI BARU YANG DITAMBAHKAN (KERANGKA) ---
    async getAIAnalysis(req, res, next) {
        try {
            if (!this.model) {
                res.status(503).json({
                    success: false,
                    message: "AI service is not available."
                });
                return;
            }
            const { analysisType } = req.body;
            if (!analysisType) {
                res.status(400).json({
                    success: false,
                    message: "Analysis type is required"
                });
                return;
            }
            console.log(`🔍 Performing AI analysis for type: ${analysisType}`);
            // Logika untuk analisis spesifik bisa ditambahkan di sini
            res.json({
                success: true,
                message: `Fungsi analisis untuk tipe '${analysisType}' berhasil dipanggil.`,
                data: {
                    analysisType,
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            console.error("❌ Error in getAIAnalysis:", error);
            res.status(500).json({
                success: false,
                message: "Failed to perform AI analysis",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            next(error);
        }
    }
    async getAIRecommendations(req, res, next) {
        try {
            if (!this.model) {
                res.status(503).json({
                    success: false,
                    message: "AI service is not available."
                });
                return;
            }
            const { type } = req.params;
            if (!type) {
                res.status(400).json({
                    success: false,
                    message: "Recommendation type is required"
                });
                return;
            }
            console.log(`💡 Generating AI recommendations for type: ${type}`);
            // Logika untuk rekomendasi spesifik bisa ditambahkan di sini
            res.json({
                success: true,
                message: `Fungsi rekomendasi untuk tipe '${type}' berhasil dipanggil.`,
                data: {
                    type,
                    recommendations: [],
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            console.error("❌ Error in getAIRecommendations:", error);
            res.status(500).json({
                success: false,
                message: "Failed to generate AI recommendations",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            next(error);
        }
    }
    async getHealthPredictions(req, res, next) {
        try {
            if (!this.model) {
                res.status(503).json({
                    success: false,
                    message: "AI service is not available."
                });
                return;
            }
            console.log("🔮 Generating health predictions...");
            // Logika untuk prediksi kesehatan bisa ditambahkan di sini
            res.json({
                success: true,
                message: "Fungsi prediksi kesehatan berhasil dipanggil.",
                data: {
                    predictions: [],
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            console.error("❌ Error in getHealthPredictions:", error);
            res.status(500).json({
                success: false,
                message: "Failed to generate health predictions",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            next(error);
        }
    }
    async getInventoryOptimization(req, res, next) {
        try {
            if (!this.model) {
                res.status(503).json({
                    success: false,
                    message: "AI service is not available."
                });
                return;
            }
            console.log("📦 Generating inventory optimization suggestions...");
            // Logika untuk optimisasi inventaris bisa ditambahkan di sini
            res.json({
                success: true,
                message: "Fungsi optimisasi inventaris berhasil dipanggil.",
                data: {
                    optimizations: [],
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            console.error("❌ Error in getInventoryOptimization:", error);
            res.status(500).json({
                success: false,
                message: "Failed to generate inventory optimization",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            next(error);
        }
    }
    async getSchedulingSuggestions(req, res, next) {
        try {
            if (!this.model) {
                res.status(503).json({
                    success: false,
                    message: "AI service is not available."
                });
                return;
            }
            console.log("📅 Generating scheduling suggestions...");
            // Logika untuk saran penjadwalan bisa ditambahkan di sini
            res.json({
                success: true,
                message: "Fungsi saran penjadwalan berhasil dipanggil.",
                data: {
                    suggestions: [],
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            console.error("❌ Error in getSchedulingSuggestions:", error);
            res.status(500).json({
                success: false,
                message: "Failed to generate scheduling suggestions",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            next(error);
        }
    }
    // --- Helper Methods ---
    async getHospitalSnapshot() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            console.log("📊 Fetching hospital snapshot data...");
            const [totalPatients, todayQueues, emergencyToday, lowStockItems, availableBeds, icuOccupancy, todayVisits, activeSchedules, criticalAlerts] = await Promise.all([
                Patient_1.default.countDocuments({ status: "Active" }).catch(() => 0),
                Queue_1.default.find({ queueDate: { $gte: today, $lt: tomorrow } })
                    .select('patientId polyclinicId status')
                    .populate("patientId", "name")
                    .populate("polyclinicId", "name")
                    .catch(() => []),
                Queue_1.default.countDocuments({ queueDate: { $gte: today, $lt: tomorrow }, priority: "Emergency" }).catch(() => 0),
                Inventory_1.default.find({ $expr: { $lte: ["$currentStock", "$minimumStock"] } })
                    .select("name currentStock minimumStock category")
                    .catch(() => []),
                Bed_1.default.countDocuments({ status: "Available" }).catch(() => 0),
                this.getICUOccupancy(),
                Visit_1.default.countDocuments({ visitDate: { $gte: today, $lt: tomorrow } }).catch(() => 0),
                Schedule_1.default.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: "Active" }).catch(() => 0),
                this.getCriticalAlerts(),
            ]);
            return {
                metrics: {
                    totalPatients,
                    todayQueues: Array.isArray(todayQueues) ? todayQueues.length : 0,
                    emergencyToday,
                    lowStockCount: Array.isArray(lowStockItems) ? lowStockItems.length : 0,
                    availableBeds,
                    icuOccupancy,
                    todayVisits,
                    activeSchedules
                },
                details: {
                    queueList: Array.isArray(todayQueues) ? todayQueues : [],
                    lowStockItems: Array.isArray(lowStockItems) ? lowStockItems : [],
                    criticalAlerts: Array.isArray(criticalAlerts) ? criticalAlerts : []
                },
            };
        }
        catch (error) {
            console.error("❌ Error in getHospitalSnapshot:", error);
            // Return default values if database queries fail
            return {
                metrics: {
                    totalPatients: 0,
                    todayQueues: 0,
                    emergencyToday: 0,
                    lowStockCount: 0,
                    availableBeds: 0,
                    icuOccupancy: 0,
                    todayVisits: 0,
                    activeSchedules: 0
                },
                details: {
                    queueList: [],
                    lowStockItems: [],
                    criticalAlerts: ["Database connection error"]
                },
            };
        }
    }
    async analyzeHospitalData(hospitalData) {
        try {
            const prompt = `
        Anda adalah AI Assistant untuk Sistem Manajemen Rumah Sakit "Sehatify". Analisis data rumah sakit berikut dan berikan insight untuk manajer:
        
        DATA HARI INI: 
        - Total Pasien Aktif: ${hospitalData.metrics.totalPatients}
        - Antrian Hari Ini: ${hospitalData.metrics.todayQueues}
        - Gawat Darurat: ${hospitalData.metrics.emergencyToday}
        - Stok Rendah: ${hospitalData.metrics.lowStockCount} item
        - Tempat Tidur Tersedia: ${hospitalData.metrics.availableBeds}
        - Okupansi ICU: ${hospitalData.metrics.icuOccupancy}%
        
        DETAIL ANTRIAN: 
        ${hospitalData.details.queueList.map((q) => `- ${q.patientId?.name || 'Pasien'} di ${q.polyclinicId?.name || 'Poli'} (${q.status})`).join("\n")}
        
        STOK KRITIS: 
        ${hospitalData.details.lowStockItems.map((item) => `- ${item.name}: sisa ${item.currentStock}`).join("\n")}
        
        ALERT KRITIS: 
        ${hospitalData.details.criticalAlerts.join("\n")}
        
        Berikan response dalam format JSON dengan struktur: 
        {
          "insight": "Ringkasan 2 kalimat", 
          "shortcutCards": [
            {
              "title": "", 
              "value": "", 
              "status": "success|warning|danger", 
              "description": "", 
              "priority": "high|medium|low"
            }
          ], 
          "recommendations": ["Rekomendasi 1", "Rekomendasi 2"], 
          "highlights": ["Highlight 1", "Highlight 2"]
        }
        
        Fokus pada 4 area paling krusial. Gunakan bahasa Indonesia yang profesional.`;
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            const cleanedText = responseText.replace(/```json\n?|\n?```/g, "").trim();
            try {
                return JSON.parse(cleanedText);
            }
            catch (parseError) {
                console.warn("⚠️ Failed to parse AI response, using fallback");
                return this.getFallbackAnalysis(hospitalData);
            }
        }
        catch (error) {
            console.error("❌ AI analysis error:", error instanceof Error ? error.message : "Unknown error");
            return this.getFallbackAnalysis(hospitalData);
        }
    }
    getFallbackAnalysis(hospitalData) {
        const metrics = hospitalData.metrics;
        return {
            insight: "Analisis AI sedang tidak tersedia. Data menunjukkan operasional berjalan dengan beberapa area yang memerlukan perhatian khusus pada antrian dan stok inventaris.",
            shortcutCards: [
                {
                    title: "Antrian Aktif",
                    value: metrics.todayQueues.toString(),
                    status: metrics.todayQueues > 50 ? "warning" : metrics.todayQueues > 20 ? "warning" : "success",
                    description: "Pasien dalam antrian hari ini",
                    priority: metrics.todayQueues > 50 ? "high" : "medium"
                },
                {
                    title: "Stok Kritis",
                    value: metrics.lowStockCount.toString(),
                    status: metrics.lowStockCount > 10 ? "danger" : metrics.lowStockCount > 5 ? "warning" : "success",
                    description: "Item dengan stok rendah",
                    priority: metrics.lowStockCount > 5 ? "high" : "medium"
                },
                {
                    title: "Tempat Tidur",
                    value: metrics.availableBeds.toString(),
                    status: metrics.availableBeds < 10 ? "warning" : "success",
                    description: "Tempat tidur tersedia",
                    priority: metrics.availableBeds < 5 ? "high" : "low"
                },
                {
                    title: "ICU Ocupancy",
                    value: `${metrics.icuOccupancy}%`,
                    status: metrics.icuOccupancy > 90 ? "danger" : metrics.icuOccupancy > 70 ? "warning" : "success",
                    description: "Tingkat okupansi ICU",
                    priority: metrics.icuOccupancy > 80 ? "high" : "medium"
                }
            ],
            recommendations: [
                "Pantau antrian di poliklinik dengan waktu tunggu tinggi untuk optimasi pelayanan",
                "Lakukan restocking segera untuk item dengan stok kritis",
                "Evaluasi distribusi tempat tidur untuk antisipasi lonjakan pasien",
                "Monitor perkembangan pasien ICU untuk perencanaan kapasitas"
            ],
            highlights: [
                `${metrics.todayVisits} kunjungan telah selesai hari ini`,
                `${metrics.emergencyToday} kasus gawat darurat berhasil ditangani`,
                `${metrics.activeSchedules} jadwal aktif untuk hari ini`,
                `${metrics.totalPatients} pasien dalam perawatan aktif`
            ],
        };
    }
    async getICUOccupancy() {
        try {
            const totalICU = await Bed_1.default.countDocuments({ ward: "ICU" });
            if (totalICU === 0)
                return 0;
            const occupiedICU = await Bed_1.default.countDocuments({ ward: "ICU", status: "Occupied" });
            return Math.round((occupiedICU / totalICU) * 100);
        }
        catch (error) {
            console.error("❌ Error getting ICU occupancy:", error);
            return 0;
        }
    }
    async getCriticalAlerts() {
        try {
            const alerts = [];
            const criticalStock = await Inventory_1.default.countDocuments({ currentStock: 0 });
            if (criticalStock > 0) {
                alerts.push(`⚠️ ${criticalStock} item stok habis`);
            }
            const icuOccupancy = await this.getICUOccupancy();
            if (icuOccupancy >= 90) {
                alerts.push(`🚨 ICU hampir penuh (${icuOccupancy}%)`);
            }
            const emergencyCount = await Queue_1.default.countDocuments({
                priority: "Emergency",
                status: "Waiting"
            });
            if (emergencyCount > 5) {
                alerts.push(`🚨 ${emergencyCount} pasien gawat darurat menunggu`);
            }
            return alerts;
        }
        catch (error) {
            console.error("❌ Error getting critical alerts:", error);
            return ["❌ Tidak dapat mengambil data alert kritis"];
        }
    }
}
exports.default = new AIController();
