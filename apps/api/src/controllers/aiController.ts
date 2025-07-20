// apps/api/src/controllers/aiController.ts

import { GoogleGenerativeAI, GenerativeModel, Part, Tool, SchemaType } from "@google/generative-ai";
import { Request, Response, NextFunction } from "express";
import Inventory, { IInventory } from "../models/Inventory";
import Schedule from "../models/Schedule";
import PatientUser, { IPatientUser } from "../models/patientUser.model";
import User from '../models/User';
import Queue from "../models/Queue";
import Bed from "../models/Bed";
import Visit from "../models/Visit";
import moment from "moment-timezone";

// Interface untuk menyimpan ringkasan data rumah sakit
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

// --- FUNGSI "ALAT" UNTUK AI ---

const get_patient_list = async ({ limit = 5, format = 'text' }: { limit?: number, format?: 'text' | 'table' }): Promise<any> => {
    console.log(`AI is calling function: get_patient_list with limit: ${limit} and format: ${format}`);
    try {
        const patients = await PatientUser.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('fullName email phone createdAt')
            .lean();
        
        if (format === 'table') {
            return {
                type: 'table',
                content: {
                    title: `Menampilkan ${patients.length} Pasien Terakhir`,
                    headers: ['Nama Lengkap', 'Email', 'Telepon', 'Tanggal Daftar'],
                    rows: patients.map((p: IPatientUser) => [
                        p.fullName,
                        p.email,
                        p.phone,
                        moment(p.createdAt).format('DD MMM YYYY, HH:mm')
                    ])
                }
            };
        }
        
        return { patients };
    } catch (error: any) {
        console.error("Error fetching patient list:", error);
        return { error: "Gagal mengambil data pasien.", details: error.message };
    }
};

const get_doctor_schedule = async ({ doctor_name }: { doctor_name?: string }): Promise<any> => {
    if (!doctor_name) {
        return { error: "Nama dokter tidak diberikan oleh AI." };
    }
    console.log(`AI is calling function: get_doctor_schedule for: ${doctor_name}`);
    try {
        const doctor = await User.findOne({ name: new RegExp(doctor_name, 'i'), role: 'doctor' }).lean();
        if (!doctor) {
            return { result: `Dokter dengan nama yang mirip "${doctor_name}" tidak ditemukan dalam sistem.` };
        }
        
        const today = moment().tz(process.env.TIMEZONE || "Asia/Jakarta").startOf('day').toDate();
        const schedules = await Schedule.find({ doctorId: doctor._id, date: { $gte: today } })
            .populate('polyclinicId', 'name')
            .sort({ date: 1, startTime: 1 })
            .limit(5)
            .lean();

        if (schedules.length === 0) {
            return { result: `Saat ini tidak ada jadwal yang akan datang untuk dr. ${doctor.name}.` };
        }

        return { scheduleFound: true, doctorName: doctor.name, schedules };
    } catch (error: any) {
        console.error("Error fetching doctor schedule:", error);
        return { error: "Gagal mengambil jadwal dokter.", details: error.message };
    }
};

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
      
      const tools: Tool[] = [{
        functionDeclarations: [
          {
            name: "get_patient_list",
            description: "Mengambil daftar pasien terbaru dari database.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                limit: { type: SchemaType.NUMBER, description: "Jumlah pasien yang ingin ditampilkan." },
                format: { type: SchemaType.STRING, description: "Format output, bisa 'text' atau 'table'.", format: "enum", enum: ['text', 'table'] }
              }
            }
          },
          {
            name: "get_doctor_schedule",
            description: "Mendapatkan jadwal praktek seorang dokter berdasarkan nama dokter.",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                  doctor_name: { type: SchemaType.STRING, description: "Nama dokter yang ingin dicari jadwalnya." }
              },
              required: ["doctor_name"]
            }
          }
        ]
      }];
      
      this.model = this.genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash", tools });
    }
    this.chatWithAI = this.chatWithAI.bind(this);
  }

  private async getHospitalSnapshot(): Promise<HospitalSnapshot> {
    const timezone = process.env.TIMEZONE || "Asia/Jakarta";
    const today = moment().tz(timezone).startOf('day').toDate();
    const tomorrow = moment().tz(timezone).endOf('day').toDate();
    const [
      totalPatients, todayQueues, emergencyToday, lowStockCount,
      availableBeds, activeSchedules, todayVisits, totalICU, occupiedICU
    ] = await Promise.all([
      PatientUser.countDocuments({ isActive: true }).catch(() => 0),
      Queue.countDocuments({ queueDate: { $gte: today, $lt: tomorrow } }).catch(() => 0),
      Visit.countDocuments({ visitDate: { $gte: today, $lt: tomorrow }, visitType: 'Emergency' }).catch(() => 0),
      Inventory.countDocuments({ $expr: { $lte: ["$currentStock", "$minimumStock"] } }).catch(() => 0),
      Bed.countDocuments({ status: "available" }).catch(() => 0),
      Schedule.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'Active' }).catch(() => 0),
      Visit.countDocuments({ visitDate: { $gte: today, $lt: tomorrow } }).catch(() => 0),
      Bed.countDocuments({ ward: 'ICU' }).catch(() => 0),
      Bed.countDocuments({ ward: 'ICU', status: 'occupied' }).catch(() => 0)
    ]);
    const icuOccupancy = totalICU > 0 ? Math.round((occupiedICU / totalICU) * 100) : 0;
    return { metrics: { totalPatients, todayQueues, emergencyToday, lowStockCount, availableBeds, icuOccupancy, todayVisits, activeSchedules } };
  }
  
  private async getVisitChartData(days: number): Promise<any> {
    const timezone = process.env.TIMEZONE || "Asia/Jakarta";
    const data = [];
    for (let i = 0; i < days; i++) {
        const date = moment().tz(timezone).subtract(i, 'days');
        const startOfDay = date.startOf('day').toDate();
        const endOfDay = date.endOf('day').toDate();
        const count = await Visit.countDocuments({ visitDate: { $gte: startOfDay, $lt: endOfDay } });
        data.push({ name: date.format('DD MMM'), value: count });
    }
    return { type: 'chart', content: { title: `Total Kunjungan Pasien (${days} Hari Terakhir)`, dataLabel: 'Kunjungan', data: data.reverse() } };
  }

  public async chatWithAI(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.model) {
        res.status(503).json({ success: false, message: "Layanan AI tidak tersedia karena kunci API belum diatur." });
        return;
      }

      const { message } = req.body;
      if (!message || message.trim() === "") {
        res.status(400).json({ success: false, message: "Pesan tidak boleh kosong" });
        return;
      }
      
      const lowerCaseMessage = message.toLowerCase();
      
      const chat = this.model.startChat();
      const result = await chat.sendMessage(message);
      const call = result.response.functionCalls()?.[0];

      if (call) {
        let functionResponse: any;

        switch (call.name) {
            case 'get_patient_list':
                functionResponse = await get_patient_list(call.args);
                if (functionResponse?.type === 'table') {
                    res.json({ success: true, data: functionResponse });
                    return;
                }
                break;
            case 'get_doctor_schedule':
                functionResponse = await get_doctor_schedule(call.args);
                break;
            default:
                functionResponse = { error: `Fungsi ${call.name} tidak dikenal.` };
        }

        const result2 = await chat.sendMessage([
            { functionResponse: { name: call.name, response: functionResponse } }
        ] as unknown as Part[]);
        
        const textResponse = result2.response.text();
        res.json({ success: true, data: { type: 'text', content: textResponse } });
        return;
      }

      if (lowerCaseMessage.includes("stok") && (lowerCaseMessage.includes("rendah") || lowerCaseMessage.includes("habis"))) {
        const lowStockItems = await Inventory.find({ $expr: { $lte: ["$currentStock", "$minimumStock"] } }).sort({ currentStock: 1 }).limit(10).lean();
        if (lowStockItems.length === 0) {
            res.json({ success: true, data: { type: 'text', content: 'Analisis cepat: Saat ini tidak ada item dengan stok rendah.' } });
            return;
        }
        const cardContent = { title: `Laporan Stok Kritis (${lowStockItems.length} Item)`, items: lowStockItems.map((item: IInventory) => ({ _id: item._id.toString(), name: item.name, stock: item.currentStock, minStock: item.minimumStock, unit: item.unit })) };
        res.json({ success: true, data: { type: 'low_stock_card', content: cardContent } });
        return;
      }
      
      if ((lowerCaseMessage.includes("grafik") || lowerCaseMessage.includes("chart")) && (lowerCaseMessage.includes("pasien") || lowerCaseMessage.includes("kunjungan"))) {
         const chartData = await this.getVisitChartData(7); 
         res.json({ success: true, data: chartData });
         return;
      }

      const textResponse = result.response.text();
      res.json({ success: true, data: { type: 'text', content: textResponse || "Maaf, saya tidak mengerti. Bisa coba tanyakan hal lain?" } });
      return;

    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ success: false, message: error.message || "Terjadi kesalahan pada server AI." });
    }
  }
}

export default new AIController();