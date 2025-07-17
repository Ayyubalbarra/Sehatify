// apps/api/src/controllers/aiController.ts

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { Request, Response, NextFunction } from "express";
import Inventory from "../models/Inventory";
import Schedule from "../models/Schedule";
import User from "../models/User";
import PatientUser from "../models/patientUser.model";
import Queue from "../models/Queue";
import Bed from "../models/Bed";
import Visit from "../models/Visit";

interface HospitalSnapshot {
  metrics: {
    totalPatients: number;
    todayQueues: number;
    emergencyToday: number;
    lowStockCount: number;
    availableBeds: number;
    icuOccupancy: number;
    todayVisits: number;
    activeSchedules: number;
  };
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
      this.model = this.genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });
    }

    this.chatWithAI = this.chatWithAI.bind(this);
  }

  private async getHospitalSnapshot(): Promise<HospitalSnapshot> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalPatients = await PatientUser.countDocuments({ isActive: true }).catch(() => 0);
    const todayQueues = await Queue.countDocuments({ queueDate: { $gte: today, $lt: tomorrow } }).catch(() => 0);
    const emergencyToday = await Queue.countDocuments({ queueDate: { $gte: today, $lt: tomorrow }, priority: "Emergency" }).catch(() => 0);
    const lowStockCount = await Inventory.countDocuments({ $expr: { $lte: ["$currentStock", "$minimumStock"] } }).catch(() => 0);
    const availableBeds = await Bed.countDocuments({ status: "available" }).catch(() => 0);
    const activeSchedules = await Schedule.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'Active' }).catch(() => 0);
    const todayVisits = await Visit.countDocuments({ visitDate: { $gte: today, $lt: tomorrow } }).catch(() => 0);

    const totalICU = await Bed.countDocuments({ ward: 'ICU' }).catch(() => 0);
    const occupiedICU = await Bed.countDocuments({ ward: 'ICU', status: 'occupied' }).catch(() => 0);
    const icuOccupancy = totalICU > 0 ? Math.round((occupiedICU / totalICU) * 100) : 0;

    return {
      metrics: {
        totalPatients,
        todayQueues,
        emergencyToday,
        lowStockCount,
        availableBeds,
        icuOccupancy,
        todayVisits,
        activeSchedules,
      },
    };
  }

  public async chatWithAI(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.model) {
        res.status(503).json({ success: false, data: { type: 'text', content: "Layanan AI tidak tersedia saat ini." } });
        return;
      }

      const { message } = req.body;
      if (!message || message.trim() === "") {
        res.status(400).json({ success: false, message: "Pesan tidak boleh kosong" });
        return;
      }
      
      const lowerCaseMessage = message.toLowerCase();

      // 1. Intent: Cek Stok Rendah
      if (lowerCaseMessage.includes("stok") && (lowerCaseMessage.includes("rendah") || lowerCaseMessage.includes("kritis") || lowerCaseMessage.includes("habis"))) {
        const lowStockItems = await Inventory.find({ $expr: { $lte: ["$currentStock", "$minimumStock"] } })
          .sort({ currentStock: 1 })
          .limit(10)
          .lean();

        if (lowStockItems.length === 0) {
          // ✅ PERBAIKAN
          res.json({ success: true, data: { type: 'text', content: 'Analisis cepat: Saat ini tidak ada item dengan stok rendah. Semua persediaan aman!' } });
          return;
        }
        
        // ✅ PERBAIKAN
        res.json({ success: true, data: { type: 'low_stock_card', items: lowStockItems } });
        return;
      }

      // 2. Intent: Cek Jadwal Dokter
      if (lowerCaseMessage.includes("jadwal") && lowerCaseMessage.includes("dokter")) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const schedules = await Schedule.find({ date: { $gte: today, $lt: tomorrow }, status: 'Active' })
          .populate<{ doctorId: { name: string, specialization: string } }>('doctorId', 'name specialization')
          .populate<{ polyclinicId: { name: string } }>('polyclinicId', 'name')
          .sort('startTime')
          .lean();

        if (schedules.length === 0) {
          // ✅ PERBAIKAN
          res.json({ success: true, data: { type: 'text', content: 'Tidak ada jadwal dokter yang aktif untuk hari ini.' } });
          return;
        }
        
        const scheduleContext = schedules.map(s => {
            const doctorName = s.doctorId?.name || '(Dokter Tidak Ditemukan)';
            const specialization = s.doctorId?.specialization || 'N/A';
            const polyclinicName = s.polyclinicId?.name || '(Poli Tidak Ditemukan)';
            return `- ${doctorName} (${specialization}) di Poli ${polyclinicName} dari jam ${s.startTime} sampai ${s.endTime}.`;
        }).join('\n');
        
        const prompt = `Anda adalah asisten AI rumah sakit. Berdasarkan data jadwal dokter hari ini, rangkum dan jawab pertanyaan pengguna dengan ramah. Data:\n${scheduleContext}\n\nPertanyaan Pengguna: "${message}"\n\nJawaban Anda:`;
        const result = await this.model.generateContent(prompt);
        const textResponse = result.response.text();

        // ✅ PERBAIKAN
        res.json({ success: true, data: { type: 'text', content: textResponse } });
        return;
      }

      // 3. Fallback ke General Chat
      const hospitalContext = await this.getHospitalSnapshot();
      const systemPrompt = `Anda adalah asisten AI untuk Sistem Manajemen Rumah Sakit "Sehatify". Jawab pertanyaan pengguna secara singkat dan informatif berdasarkan konteks data rumah sakit saat ini. Konteks: Total Pasien ${hospitalContext.metrics.totalPatients}, Antrian Hari Ini ${hospitalContext.metrics.todayQueues}, Stok Kritis ${hospitalContext.metrics.lowStockCount} item. Pertanyaan dari pengguna: "${message}"`;
      
      const result = await this.model.generateContent(systemPrompt);
      const textResponse = result.response.text();
      res.json({ success: true, data: { type: 'text', content: textResponse } });

    } catch (error) {
      console.error("AI Chat Error:", error);
      next(error);
    }
  }
}

export default new AIController();