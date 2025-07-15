import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { Request, Response, NextFunction } from "express";
import Patient from "../models/Patient";
import Queue from "../models/Queue";
import Inventory from "../models/Inventory";
import Bed from "../models/Bed";
import Schedule from "../models/Schedule";
import Visit from "../models/Visit";

// Type definitions
interface HospitalMetrics {
  totalPatients: number;
  todayQueues: number;
  emergencyToday: number;
  lowStockCount: number;
  availableBeds: number;
  icuOccupancy: number;
  todayVisits: number;
  activeSchedules: number;
}

interface QueueItem {
  patientId?: {
    name: string;
  };
  polyclinicId?: {
    name: string;
  };
  status: string;
}

interface InventoryItem {
  name: string;
  currentStock: number;
  minimumStock: number;
  category: string;
}

interface HospitalDetails {
  queueList: QueueItem[];
  lowStockItems: InventoryItem[];
  criticalAlerts: string[];
}

interface HospitalSnapshot {
  metrics: HospitalMetrics;
  details: HospitalDetails;
}

interface ShortcutCard {
  title: string;
  value: string;
  status: "success" | "warning" | "danger";
  description: string;
  priority: "high" | "medium" | "low";
}

interface AIAnalysis {
  insight: string;
  shortcutCards: ShortcutCard[];
  recommendations: string[];
  highlights: string[];
}

interface DashboardInsightsResponse {
  success: boolean;
  message?: string;
  error?: string;
  data: {
    metrics: HospitalMetrics;
    aiInsight: string;
    recommendations: string[];
    shortcutCards: ShortcutCard[];
    highlights: string[];
    timestamp: string;
  };
}

interface ChatRequest {
  message: string;
}

interface AnalysisRequest {
  analysisType: string;
}

class AIController {
  private genAI: GoogleGenerativeAI | null;
  private model: GenerativeModel | null;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️  GEMINI_API_KEY is not set. AI features will be disabled.");
      this.genAI = null;
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

  async getDashboardInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.model) {
        res.status(503).json({ 
          success: false, 
          message: "AI service is not available. Please check GEMINI_API_KEY configuration.",
          error: "AI_SERVICE_UNAVAILABLE"
        });
        return;
      }

      const hospitalData: HospitalSnapshot = await this.getHospitalSnapshot();
      const aiAnalysis: AIAnalysis = await this.analyzeHospitalData(hospitalData);

      const response: DashboardInsightsResponse = {
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
    } catch (error) {
      const fallbackData = this.getFallbackAnalysis(await this.getHospitalSnapshot());
      res.status(500).json({
          success: false,
          message: "Failed to generate AI insights, returning fallback data.",
          error: error instanceof Error ? error.message : "Unknown error",
          data: {
            ...fallbackData,
            metrics: (await this.getHospitalSnapshot()).metrics,
            timestamp: new Date().toISOString(),
          }
      });
    }
  }

  async chatWithAI(req: Request<{}, any, ChatRequest>, res: Response, next: NextFunction): Promise<void> {
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
      
      const hospitalContext: HospitalSnapshot = await this.getHospitalSnapshot();

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

      res.json({ 
        success: true, 
        data: { 
          message: aiResponse,
          timestamp: new Date().toISOString()
        } 
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat memproses pesan. Silakan coba lagi.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  
  async getAIAnalysis(req: Request<{}, any, AnalysisRequest>, res: Response, next: NextFunction): Promise<void> {
    // ... Implementasi Kerangka ...
  }

  async getAIRecommendations(req: Request<{ type: string }>, res: Response, next: NextFunction): Promise<void> {
    // ... Implementasi Kerangka ...
  }

  async getHealthPredictions(req: Request, res: Response, next: NextFunction): Promise<void> {
    // ... Implementasi Kerangka ...
  }

  async getInventoryOptimization(req: Request, res: Response, next: NextFunction): Promise<void> {
    // ... Implementasi Kerangka ...
  }

  async getSchedulingSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    // ... Implementasi Kerangka ...
  }

  // --- Helper Methods ---

  private async getHospitalSnapshot(): Promise<HospitalSnapshot> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [
        totalPatients, 
        todayQueues, 
        emergencyToday, 
        lowStockItems, 
        availableBeds, 
        icuOccupancy, 
        todayVisits, 
        activeSchedules, 
        criticalAlerts
      ] = await Promise.all([
        Patient.countDocuments({ status: "Active" }).catch(() => 0),
        Queue.find({ queueDate: { $gte: today, $lt: tomorrow } })
          .select('patientId polyclinicId status')
          .populate("patientId", "name")
          .populate("polyclinicId", "name")
          .lean()
          .catch(() => []),
        Queue.countDocuments({ queueDate: { $gte: today, $lt: tomorrow }, priority: "Emergency" }).catch(() => 0),
        Inventory.find({ $expr: { $lte: ["$currentStock", "$minimumStock"] } })
          .select("name currentStock minimumStock category")
          .lean()
          .catch(() => []),
        Bed.countDocuments({ status: "Available" }).catch(() => 0),
        this.getICUOccupancy(),
        Visit.countDocuments({ visitDate: { $gte: today, $lt: tomorrow } }).catch(() => 0),
        Schedule.countDocuments({ date: { $gte: today }, status: "Active" }).catch(() => 0),
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
          queueList: Array.isArray(todayQueues) ? todayQueues as QueueItem[] : [], 
          lowStockItems: Array.isArray(lowStockItems) ? lowStockItems as InventoryItem[] : [], 
          criticalAlerts: Array.isArray(criticalAlerts) ? criticalAlerts : [] 
        },
      };
    } catch (error) {
      // Return default values if database queries fail
      return {
        metrics: { totalPatients: 0, todayQueues: 0, emergencyToday: 0, lowStockCount: 0, availableBeds: 0, icuOccupancy: 0, todayVisits: 0, activeSchedules: 0 },
        details: { queueList: [], lowStockItems: [], criticalAlerts: ["Database connection error"] },
      };
    }
  }

  private async analyzeHospitalData(hospitalData: HospitalSnapshot): Promise<AIAnalysis> {
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

      const result = await this.model!.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedText = responseText.replace(/```json\n?|\n?```/g, "").trim();
      
      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        return this.getFallbackAnalysis(hospitalData);
      }
    } catch (error) {
      return this.getFallbackAnalysis(hospitalData);
    }
  }
  
  private getFallbackAnalysis(hospitalData: HospitalSnapshot): AIAnalysis {
    const metrics = hospitalData.metrics;
    
    return {
      insight: "Analisis AI sedang tidak tersedia. Data menunjukkan operasional berjalan dengan beberapa area yang memerlukan perhatian khusus pada antrian dan stok inventaris.",
      shortcutCards: [
        { 
          title: "Antrian Aktif", 
          value: metrics.todayQueues.toString(), 
          status: metrics.todayQueues > 50 ? "warning" : "success", 
          description: "Pasien dalam antrian hari ini", 
          priority: "high" 
        },
        { 
          title: "Stok Kritis", 
          value: metrics.lowStockCount.toString(), 
          status: metrics.lowStockCount > 5 ? "danger" : "warning", 
          description: "Item dengan stok rendah", 
          priority: "high" 
        },
        { 
          title: "Tempat Tidur", 
          value: metrics.availableBeds.toString(), 
          status: metrics.availableBeds < 10 ? "warning" : "success", 
          description: "Tempat tidur tersedia", 
          priority: "medium" 
        },
        { 
          title: "ICU Ocupancy", 
          value: `${metrics.icuOccupancy}%`, 
          status: metrics.icuOccupancy > 80 ? "danger" : "warning", 
          description: "Tingkat okupansi ICU", 
          priority: "high" 
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

  private async getICUOccupancy(): Promise<number> {
    try {
      const totalICU = await Bed.countDocuments({ ward: "ICU" });
      if (totalICU === 0) return 0;
      
      const occupiedICU = await Bed.countDocuments({ ward: "ICU", status: "Occupied" });
      return Math.round((occupiedICU / totalICU) * 100);
    } catch (error) {
      return 0;
    }
  }

  private async getCriticalAlerts(): Promise<string[]> {
    try {
      const alerts: string[] = [];
      
      const criticalStock = await Inventory.countDocuments({ currentStock: 0 });
      if (criticalStock > 0) {
        alerts.push(`⚠️ ${criticalStock} item stok habis`);
      }

      const icuOccupancy = await this.getICUOccupancy();
      if (icuOccupancy >= 90) {
        alerts.push(`🚨 ICU hampir penuh (${icuOccupancy}%)`);
      }

      const emergencyCount = await Queue.countDocuments({ 
        priority: "Emergency", 
        status: "Waiting" 
      });
      if (emergencyCount > 5) {
        alerts.push(`🚨 ${emergencyCount} pasien gawat darurat menunggu`);
      }

      return alerts;
    } catch (error) {
      return ["❌ Tidak dapat mengambil data alert kritis"];
    }
  }
}

export default new AIController();