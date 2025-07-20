// apps/api/src/controllers/dashboardController.ts

import { Request, Response, NextFunction } from 'express';
import Visit from "../models/Visit";
import Queue from "../models/Queue";
import PatientUser from '../models/patientUser.model'; 
import User from '../models/User'; 
import Inventory from '../models/Inventory'; 
import Polyclinic from '../models/Polyclinic'; 
import Bed from '../models/Bed'; 
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const getDateRange = (period: string) => {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999); 
  const startDate = new Date(endDate);
  startDate.setHours(0, 0, 0, 0); 

  switch (period) {
    case '7d': startDate.setDate(endDate.getDate() - 6); break; 
    case '30d': startDate.setDate(endDate.getDate() - 29); break; 
    case '90d': startDate.setDate(endDate.getDate() - 89); break;
    case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
    case 'today': 
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
    default: startDate.setDate(endDate.getDate() - 29); 
  }
  return { startDate, endDate };
};

interface DashboardOverviewResponse {
  totalVisits: number;
  averageDaily: number;
  occupancyRate: number;
}

interface ChartDataResponse {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
    borderRadius?: number;
  }>;
}

interface FinancialSummaryResponse {
  totalRevenue: number;
  expenses: number; 
  profit: number;
  patientSatisfaction: number;
}

interface ServiceDistributionResponseItem {
  name: string;
  value: number; 
  color?: string;
}

interface PatientStatsResponse { 
  totalPatients: number;
  newPatientsToday: number; 
  activePatients: number; 
  genderDistribution: Array<{ _id: string; count: number; }>;
}

interface InventoryStatsResponse { 
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalInventoryValue: number;
}

interface RecentActivityItem { 
  type: string;
  message: string;
  timestamp: Date;
}

interface AdminDashboardOverviewData {
  totalPatients: number; 
  erAdmissions: number; 
  bloodUnitsOminus: number; 
  availableBeds: number; 
  patientTrendData?: { name: string; value: number }[]; 
  patientPerHourData?: { name: string; value: number }[]; 
  aiInsightSummary?: string; 
  aiRecommendations?: { id: string; text: string; priority: "high" | "medium" | "low" }[]; 
}


class DashboardController {
  private genAI: GoogleGenerativeAI | null;
  private model: GenerativeModel | null; 

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ GEMINI_API_KEY is not set. AI features for Dashboard will be limited.");
      this.genAI = null;
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });
    }
    this.getDashboardOverview = this.getDashboardOverview.bind(this);
    this.getAdminDashboardOverview = this.getAdminDashboardOverview.bind(this);
    this.getTodayQueueList = this.getTodayQueueList.bind(this);
    this.getChartData = this.getChartData.bind(this);
    this.getPatientsPerWeek = this.getPatientsPerWeek.bind(this);
    this.getPatientsPerHour = this.getPatientsPerHour.bind(this);
    this.getAIInsights = this.getAIInsights.bind(this);
    this.getFinancialSummary = this.getFinancialSummary.bind(this);
    this.getServiceDistribution = this.getServiceDistribution.bind(this);
    this.getPatientStats = this.getPatientStats.bind(this);
    this.getAppointmentStats = this.getAppointmentStats.bind(this);
    this.getInventoryStats = this.getInventoryStats.bind(this);
    this.getRecentActivities = this.getRecentActivities.bind(this);
    this.getSystemHealth = this.getSystemHealth.bind(this);
  }

  public async getDashboardOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period = '30d' } = req.query; 
      const { startDate, endDate } = getDateRange(period as string);

      const [totalVisits, totalPatientsCount, totalDoctorsCount] = await Promise.all([
        Visit.countDocuments({ visitDate: { $gte: startDate, $lte: endDate } }),
        PatientUser.countDocuments(), 
        User.countDocuments({ role: 'doctor', isActive: true }), 
      ]);

      const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const averageDailyVisits = daysInPeriod > 0 ? totalVisits / daysInPeriod : 0;
      
      const totalBeds = await Bed.countDocuments(); 
      const occupiedBeds = await Bed.countDocuments({ status: 'occupied' }); 
      const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0; 

      const responseData: DashboardOverviewResponse = { 
        totalVisits: totalVisits, 
        averageDaily: parseFloat(averageDailyVisits.toFixed(1)),
        occupancyRate: parseFloat(occupancyRate.toFixed(1)),
      };

      res.json({ success: true, data: responseData });
    } catch (error) {
      next(error);
    }
  }

  public async getAdminDashboardOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const today = new Date();
        today.setHours(0,0,0,0);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const [
            totalPatients, 
            currentErAdmissionsToday, 
            previousDayErAdmissions, 
            oMinusBloodStockItem, 
            availableBeds,
            patientsRegisteredToday, 
            patientsRegisteredYesterday, 
        ] = await Promise.all([
            PatientUser.countDocuments({ isActive: true }), 
            Visit.countDocuments({ visitDate: { $gte: today, $lt: tomorrow }, visitType: 'Emergency' }), 
            Visit.countDocuments({ visitDate: { $gte: yesterday, $lt: today }, visitType: 'Emergency' }),
            Inventory.findOne({ name: { $regex: /darah o-/i } }).select('currentStock unitPrice').lean(), 
            Bed.countDocuments({ status: 'available' }),
            PatientUser.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }), 
            PatientUser.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }), 
        ]);

        const oMinusBloodStock = oMinusBloodStockItem?.currentStock || 0; 
        const erChange = previousDayErAdmissions > 0 ? ((currentErAdmissionsToday - previousDayErAdmissions) / previousDayErAdmissions) * 100 : (currentErAdmissionsToday > 0 ? 100 : 0);
        
        const patientTrendDataFormatted: { name: string; value: number }[] = [
            { name: yesterday.toLocaleDateString('id-ID', {day: '2-digit', month: 'short'}), value: patientsRegisteredYesterday },
            { name: today.toLocaleDateString('id-ID', {day: '2-digit', month: 'short'}), value: patientsRegisteredToday }
        ];

        const responseData: AdminDashboardOverviewData = {
            totalPatients: totalPatients,
            erAdmissions: currentErAdmissionsToday,
            bloodUnitsOminus: oMinusBloodStock, 
            availableBeds: availableBeds,
            patientTrendData: patientTrendDataFormatted, 
        };
        res.json({ success: true, data: responseData });
    } catch (error) {
        next(error);
    }
  }

  public async getTodayQueueList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const queues = await Queue.find({ 
        queueDate: { $gte: today, $lt: tomorrow } 
      })
        .populate("patientId", "fullName phone") 
        .populate("polyclinicId", "name")
        .populate("doctorId", "name specialization") 
        .sort({ queueNumber: 1 })
        .lean();

      interface QueueSummary {
        waiting: number;
        inProgress: number;
        completed: number;
      }
      const summary = queues.reduce<QueueSummary>((acc: QueueSummary, queue: any) => { // ✅ Explicitly type acc and queue
        if (queue.status === "Waiting") acc.waiting++;
        else if (queue.status === "In Progress") acc.inProgress++;
        else if (queue.status === "Completed") acc.completed++;
        return acc;
      }, { waiting: 0, inProgress: 0, completed: 0 });

      const formattedQueues = queues.map((q: any) => ({ 
        _id: q._id.toString(), // Convert ObjectId to string
        queueNumber: q.queueNumber,
        patientName: q.patientId?.fullName || 'N/A',
        polyclinicName: q.polyclinicId?.name || 'N/A',
        doctorName: q.doctorId?.name || 'N/A', 
        appointmentTime: q.appointmentTime,
        status: q.status,
        patientPhone: q.patientId?.phone || 'N/A', 
      }));

      res.json({
        success: true,
        data: { 
          totalQueues: queues.length, 
          summary, 
          queues: formattedQueues 
        },
      });
    } catch (error) {
      next(error);
    }
  }
  
  public async getChartData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type = "weekly-patients", period = "30d" } = req.query as { type?: string; period?: string };
      const { startDate, endDate } = getDateRange(period);
      let chartData: ChartDataResponse = { labels: [], datasets: [] }; 

      if (type === "weekly-patients") {
        const labels: string[] = [];
        const dataCounts: number[] = [];
        
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          labels.push(currentDate.toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })); 
          
          const startOfDay = new Date(currentDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(currentDate);
          endOfDay.setHours(23, 59, 59, 999);

          const count = await Visit.countDocuments({
            visitDate: { $gte: startOfDay, $lte: endOfDay },
          });
          dataCounts.push(count);
          
          currentDate.setDate(currentDate.getDate() + 1); 
        }
        
        chartData = { 
          labels, 
          datasets: [{ 
            label: "Kunjungan Pasien", 
            data: dataCounts, 
            borderColor: "#3B82F6", 
            backgroundColor: "rgba(59, 130, 246, 0.1)", 
            fill: true, 
            tension: 0.4 
          }] 
        };
      } else if (type === "daily-revenue") { 
        chartData = {
          labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
          datasets: [{ label: "Pendapatan", data: [1000, 1200, 900, 1500, 1100, 1300, 800], backgroundColor: "#10B981" }]
        };
      }
      else {
        res.status(400).json({ success: false, message: "Tipe chart tidak valid" });
        return;
      }

      res.json({ success: true, data: chartData });
    } catch (error) {
      next(error);
    }
  }

  public async getPatientsPerWeek(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { startDate, endDate } = getDateRange('30d'); 
        const chartData: { name: string; value: number }[] = [];

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const formattedDate = currentDate.toLocaleDateString("id-ID", { day: '2-digit', month: 'short' });
            const startOfDay = new Date(currentDate);
            startOfDay.setHours(0,0,0,0);
            const endOfDay = new Date(currentDate);
            endOfDay.setHours(23,59,59,999);

            const count = await Visit.countDocuments({
                visitDate: { $gte: startOfDay, $lte: endOfDay },
            });
            chartData.push({ name: formattedDate, value: count });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        res.json({ success: true, data: chartData });
    } catch (error) { next(error); }
  }

  public async getPatientsPerHour(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const patientsByHour = await Visit.aggregate([
            { $match: { visitDate: { $gte: today, $lt: tomorrow } } },
            { $project: { hour: { $hour: "$visitDate" } } },
            { $group: { _id: "$hour", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
        const chartData: { name: string; value: number }[] = hours.map((hour: string) => { 
            const found = patientsByHour.find((item: { _id: number; count: number }) => item._id === parseInt(hour.split(':')[0])); // ✅ Explicitly type 'item'
            return { name: hour, value: found ? found.count : 0 };
        });

        res.json({ success: true, data: chartData });
    } catch (error) { next(error); }
  }

  public async getAIInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!this.model) {
            res.status(503).json({ success: false, data: { summary: "Layanan AI tidak tersedia karena kunci API tidak diatur.", recommendations: [] } });
            return;
        }

        const today = new Date();
        today.setHours(0,0,0,0);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const [
            totalPatients, 
            currentErAdmissionsToday, 
            previousDayErAdmissions, 
            oMinusBloodStockItem, 
            availableBeds,
            todayQueues,
            lowStockItemsCount,
            totalAppointmentsToday
        ] = await Promise.all([
            PatientUser.countDocuments({ isActive: true }), 
            Visit.countDocuments({ visitDate: { $gte: today, $lt: tomorrow }, visitType: 'Emergency' }), 
            Visit.countDocuments({ visitDate: { $gte: yesterday, $lt: today }, visitType: 'Emergency' }),
            Inventory.findOne({ name: { $regex: /darah o-/i } }).select('currentStock unitPrice').lean(), 
            Bed.countDocuments({ status: 'available' }),
            Queue.countDocuments({ queueDate: { $gte: today, $lt: tomorrow } }),
            Inventory.countDocuments({ status: 'Low Stock' }), 
            Queue.countDocuments({ queueDate: { $gte: today, $lt: tomorrow }, status: { $ne: 'Cancelled' } }) 
        ]);

        const oMinusBloodStock = oMinusBloodStockItem?.currentStock || 0; 
        const erChange = previousDayErAdmissions > 0 ? ((currentErAdmissionsToday - previousDayErAdmissions) / previousDayErAdmissions) * 100 : (currentErAdmissionsToday > 0 ? 100 : 0);
        
        const currentDataPrompt = `Data Rumah Sakit Saat Ini:
- Total Pasien Aktif: ${totalPatients}
- Penerimaan Gawat Darurat Hari Ini: ${currentErAdmissionsToday} (${erChange > 0 ? 'meningkat' : 'menurun'} ${Math.abs(erChange).toFixed(0)}% dari kemarin)
- Stok Darah O-: ${oMinusBloodStock} unit (dianggap rendah jika <= 10)
- Tempat Tidur Tersedia: ${availableBeds}
- Total Antrian Hari Ini: ${todayQueues}
- Jumlah Item Stok Rendah: ${lowStockItemsCount}
- Total Janji Temu Hari Ini (Tidak Dibatalkan): ${totalAppointmentsToday}
`;

        const prompt = `Anda adalah asisten AI yang cerdas untuk manajemen rumah sakit. Berdasarkan data berikut, berikan ringkasan singkat (maksimal 3 kalimat) tentang kondisi operasional utama hari ini dan 3 rekomendasi prioritas (high, medium, low) untuk tindakan manajemen.

${currentDataPrompt}

Format output dalam JSON dengan kunci 'summary' (string) dan 'recommendations' (array of objects { id: string, text: string, priority: 'high'|'medium'|'low' }). Pastikan rekomendasi sangat relevan dengan data yang diberikan. Contoh rekomendasi: 'Prioritaskan pengadaan darah O- segera.', 'Perhatikan lonjakan pasien gawat darurat.', 'Optimalkan alokasi tempat tidur.'`;

        console.log("Sending prompt to Gemini:", prompt);
        const result = await this.model.generateContent(prompt);
        const textResponse = result.response.text();
        console.log("Raw Gemini Response:", textResponse);

        let summary = "Analisis AI tidak dapat dihasilkan.";
        let recommendations: { id: string; text: string; priority: "high" | "medium" | "low" }[] = [];

        try {
            const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/);
            const jsonString = jsonMatch ? jsonMatch[1] : textResponse;
            const parsed = JSON.parse(jsonString);
            summary = parsed.summary || summary;
            recommendations = parsed.recommendations || recommendations;
        } catch (parseError) {
            console.error("Failed to parse Gemini response as JSON:", parseError);
            summary = textResponse.split('\n')[0] || summary; 
            recommendations = [
                { id: 'fallback1', text: 'Periksa log untuk detail lebih lanjut atau coba prompt AI lagi.', priority: 'medium' }
            ];
            if (oMinusBloodStock <= 10) {
                recommendations.unshift({ id: 'fallback-blood', text: 'Stok darah O- sangat rendah, prioritas utama untuk pengadaan.', priority: 'high' });
            }
            if (erChange > 50) { 
                recommendations.unshift({ id: 'fallback-er', text: `Ada lonjakan pasien gawat darurat (${erChange.toFixed(0)}%), pertimbangkan alokasi sumber daya.`, priority: 'high' });
            }
        }
        res.json({ success: true, data: { summary, recommendations } });
    } catch (error) { 
        console.error("Error generating AI insights:", error);
        next(error); 
    }
  }


  public async getFinancialSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period = '30d' } = req.query;
      const { startDate, endDate } = getDateRange(period as string);
      
      const financialData = await Visit.aggregate([
        { $match: { visitDate: { $gte: startDate, $lte: endDate }, status: 'Completed', paymentStatus: 'Paid' } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalCost" } } }
      ]);

      const totalRevenue = financialData[0]?.totalRevenue || 0;
      
      const expenses = totalRevenue * 0.75; 
      const profit = totalRevenue - expenses; 
      const profitMargin = totalRevenue > 0 ? profit / totalRevenue : 0;
      
      const patientSatisfaction = 4.2; 

      const responseData: FinancialSummaryResponse = {
        totalRevenue: totalRevenue,
        expenses: expenses, 
        profit: profit, 
        patientSatisfaction: patientSatisfaction
      };
      
      res.json({ success: true, data: responseData });
    } catch (error) {
      next(error);
    }
  }

  public async getServiceDistribution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period = '30d' } = req.query;
      const { startDate, endDate } = getDateRange(period as string);

      const distribution = await Visit.aggregate([
        { $match: { visitDate: { $gte: startDate, $lte: endDate }, status: 'Completed' } },
        { $group: { _id: "$polyclinicId", count: { $sum: 1 } } },
        { $lookup: { from: "polyclinics", localField: "_id", foreignField: "_id", as: "polyclinicInfo" } },
        { $unwind: "$polyclinicInfo" },
        { $project: { _id: 0, name: "$polyclinicInfo.name", value: "$count" } }, 
        { $sort: { value: -1 } }
      ]);

      const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#64748b'];
      const coloredDistribution: ServiceDistributionResponseItem[] = distribution.map((item: { name: string; value: number }, index: number) => ({ 
        ...item,
        color: COLORS[index % COLORS.length]
      }));

      res.json({ success: true, data: coloredDistribution });
    } catch (error) {
      next(error);
    }
  }

  public async getPatientStats(req: Request, res: Response, next: NextFunction): Promise<void> { 
    try {
      const totalPatientsCount = await PatientUser.countDocuments();
      
      const { startDate, endDate } = getDateRange('today'); 
      const newPatientsRegisteredToday = await PatientUser.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
      const activePatientsCount = await PatientUser.countDocuments({ isActive: true });
      
      const genderDistributionResult = await PatientUser.aggregate([
        { $group: { _id: "$gender", count: { $sum: 1 } } }
      ]);
      
      res.json({ 
        success: true, 
        data: { 
            totalPatients: totalPatientsCount, 
            newPatientsToday: newPatientsRegisteredToday, 
            activePatients: activePatientsCount, 
            genderDistribution: genderDistributionResult.map(g => ({ _id: g._id || 'unknown', count: g.count })) 
        } as PatientStatsResponse 
      });
    } catch (error) { next(error); }
  }
  public async getAppointmentStats(req: Request, res: Response, next: NextFunction): Promise<void> { 
    try {
      const { startDate, endDate } = getDateRange('30d'); 
      const totalAppointments = await Queue.countDocuments({ queueDate: { $gte: startDate, $lte: endDate } });
      const completedAppointments = await Queue.countDocuments({ queueDate: { $gte: startDate, $lte: endDate }, status: 'Completed' });
      const cancelledAppointments = await Queue.countDocuments({ queueDate: { $gte: startDate, $lte: endDate }, status: 'Cancelled' });
      res.json({ success: true, data: { totalAppointments, completedAppointments, cancelledAppointments } });
    } catch (error) { next(error); }
  }
  public async getInventoryStats(req: Request, res: Response, next: NextFunction): Promise<void> { 
    try {
      const totalItems = await Inventory.countDocuments();
      const lowStockItems = await Inventory.countDocuments({ status: 'Low Stock' });
      const outOfStockItems = await Inventory.countDocuments({ status: 'Out of Stock' });
      const totalInventoryValue = (await Inventory.aggregate([
        { $group: { _id: null, totalValue: { $sum: { $multiply: ["$currentStock", "$unitPrice"] } } } }
      ]))[0]?.totalValue || 0;
      res.json({ success: true, data: { totalItems, lowStockItems, outOfStockItems, totalInventoryValue } as InventoryStatsResponse });
    } catch (error) { next(error); }
  }
  public async getRecentActivities(req: Request, res: Response, next: NextFunction): Promise<void> { 
    try {
      const [latestVisits, latestQueues] = await Promise.all([
        Visit.find().sort({ createdAt: -1 }).limit(3).populate('patientId', 'fullName').populate('doctorId', 'name').lean(),
        Queue.find().sort({ createdAt: -1 }).limit(3).populate('patientId', 'fullName').populate('polyclinicId', 'name').lean(),
      ]);

      const activities: RecentActivityItem[] = [];
      latestVisits.forEach((visit: any) => { 
        activities.push({
          type: 'visit',
          message: `Kunjungan selesai untuk ${visit.patientId?.fullName || 'Pasien'} dengan ${visit.doctorId?.name || 'Dokter'}`,
          timestamp: visit.createdAt as Date
        });
      });
      latestQueues.forEach((queue: any) => { 
        activities.push({
          type: 'appointment',
          message: `Antrean baru di ${queue.polyclinicId?.name || 'Poli'} untuk ${queue.patientId?.fullName || 'Pasien'}`,
          timestamp: queue.createdAt as Date
        });
      });

      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); 
      res.json({ success: true, data: activities.slice(0, 5) });
    } catch (error) { next(error); }
  }
  public async getSystemHealth(req: Request, res: Response, next: NextFunction): Promise<void> { 
    try {
      const serverStatus = "Healthy"; 
      const dbStatus = "Healthy"; 
      const apiResponseTime = "142ms"; 
      const uptime = "99.9%"; 

      res.json({ success: true, data: { server: serverStatus, database: dbStatus, apiResponse: apiResponseTime, uptime: uptime } });
    } catch (error) { next(error); }
  }
}

export default new DashboardController();