// apps/api/src/controllers/dashboardController.ts

import { Request, Response, NextFunction } from 'express';
import Visit from "../models/Visit";
import Queue from "../models/Queue";
import PatientUser from '../models/patientUser.model'; 
import User from '../models/User'; 
import Inventory from '../models/Inventory'; 
import Polyclinic from '../models/Polyclinic'; 
import Bed from '../models/Bed'; // Import model Bed yang baru Anda berikan

// Helper untuk menghitung tanggal berdasarkan periode
const getDateRange = (period: string) => {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999); // Akhir hari
  const startDate = new Date(endDate);
  startDate.setHours(0, 0, 0, 0); // Awal hari

  switch (period) {
    case '7d': startDate.setDate(endDate.getDate() - 6); break; 
    case '30d': startDate.setDate(endDate.getDate() - 29); break; 
    case '90d': startDate.setDate(endDate.getDate() - 89); break;
    case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
    default: startDate.setDate(endDate.getDate() - 29); 
  }
  return { startDate, endDate };
};

// Interfaces untuk respons API (konsisten dengan frontend api.ts)
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
  operationalCost: number;
  profitMargin: number;
  patientSatisfaction: number;
}

interface ServiceDistributionResponseItem {
  name: string;
  value: number;
  color?: string;
}

interface PatientStatsResponse { 
  totalPatients: number;
  newPatientsLast30Days: number;
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

// Interface untuk data admin overview yang diperluas
interface AdminDashboardOverviewData {
  totalPatients: number; // Total Pasien
  erAdmissions: number; // Penerimaan Gawat Darurat
  bloodUnitsOminus: number; // O- Satuan Darah
  availableBeds: number; // Tempat Tidur Tersedia
  patientTrendData?: { name: string; value: number }[]; // Data grafik pasien minggu ini
  patientPerHourData?: { name: string; value: number }[]; // Data grafik pasien per jam
  aiInsightSummary?: string; // Ringkasan AI Insight
  aiRecommendations?: { id: string; text: string; priority: "high" | "medium" | "low" }[]; // Rekomendasi AI
  todayAbsorption?: { // Serapan Hari Ini
    bloodOminus?: number; // Jumlah stok O-
    patientsIncreased?: number; // Persentase kenaikan pasien
    nightShiftNurses?: number; // Info tambahan untuk AI Insight
  }
}


class DashboardController {
  
  public async getDashboardOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period = '30d' } = req.query; 
      const { startDate, endDate } = getDateRange(period as string);

      const [totalVisits, totalPatients, totalDoctors] = await Promise.all([
        Visit.countDocuments({ visitDate: { $gte: startDate, $lte: endDate } }),
        PatientUser.countDocuments(), 
        User.countDocuments({ role: 'doctor', isActive: true }), 
      ]);

      const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const averageDailyVisits = daysInPeriod > 0 ? totalVisits / daysInPeriod : 0;
      
      const occupancyRate = totalVisits > 0 && totalDoctors > 0 && daysInPeriod > 0
                            ? Math.min(100, (totalVisits / (totalDoctors * 5 * daysInPeriod)) * 100) 
                            : 0;

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

  // NEW: Get Admin Dashboard Overview (sesuai desain baru)
  public async getAdminDashboardOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const [totalPatients, erAdmissionsToday, oMinusBloodStock, availableBeds] = await Promise.all([
            PatientUser.countDocuments(), // Total Pasien
            Visit.countDocuments({ visitDate: { $gte: today, $lt: tomorrow }, visitType: 'Emergency' }), // Penerimaan Gawat Darurat (hari ini)
            // Asumsi "O- Satuan Darah" adalah item inventaris dengan nama mengandung "darah O-"
            Inventory.findOne({ name: { $regex: /darah o-/i } }).select('currentStock').lean(),
            Bed.countDocuments({ status: 'available' }) // Tempat Tidur Tersedia
        ]);

        const responseData: AdminDashboardOverviewData = {
            totalPatients: totalPatients,
            erAdmissions: erAdmissionsToday,
            bloodUnitsOminus: oMinusBloodStock?.currentStock || 0, // Ambil stoknya
            availableBeds: availableBeds,
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
        .sort({ queueNumber: 1 })
        .lean();

      interface QueueSummary {
        waiting: number;
        inProgress: number;
        completed: number;
      }
      const summary = queues.reduce<QueueSummary>((acc, queue) => {
        if (queue.status === "Waiting") acc.waiting++;
        else if (queue.status === "In Progress") acc.inProgress++;
        else if (queue.status === "Completed") acc.completed++;
        return acc;
      }, { waiting: 0, inProgress: 0, completed: 0 });

      res.json({
        success: true,
        data: { 
          totalQueues: queues.length, 
          summary, 
          queues: queues 
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
      let chartData: ChartDataResponse; // Ini masih Chart.js format

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
            visitDate: { $gte: startOfDay, $lt: endOfDay },
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

  // NEW: Get Patients Per Week (Line Chart for Admin Dashboard) - Recharts format
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

  // NEW: Get Patients Per Hour (Bar Chart for Admin Dashboard) - Recharts format
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
        const chartData: { name: string; value: number }[] = hours.map(hour => {
            const found = patientsByHour.find(item => item._id === parseInt(hour.split(':')[0]));
            return { name: hour, value: found ? found.count : 0 };
        });

        res.json({ success: true, data: chartData });
    } catch (error) { next(error); }
  }

  // NEW: Get AI Insights (Summary and Recommendations)
  public async getAIInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const today = new Date();
        today.setHours(0,0,0,0);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const totalErAdmissionsToday = await Visit.countDocuments({ visitDate: { $gte: today }, visitType: 'Emergency' });
        const previousDayErAdmissions = await Visit.countDocuments({ visitDate: { $gte: yesterday, $lt: today }, visitType: 'Emergency' });
        
        const erChange = previousDayErAdmissions > 0 ? ((totalErAdmissionsToday - previousDayErAdmissions) / previousDayErAdmissions) * 100 : (totalErAdmissionsToday > 0 ? 100 : 0);
        
        const oMinusBloodStock = (await Inventory.findOne({ name: { $regex: /darah o-/i } }).select('currentStock').lean())?.currentStock || 0;

        const summary = `Hari ini, unit gawat darurat telah menangani ${totalErAdmissionsToday} pasien, ${erChange > 0 ? 'meningkat' : 'menurun'} ${Math.abs(erChange).toFixed(0)}% dibandingkan kemarin. Stok darah O- saat ini ${oMinusBloodStock <=10 ? 'rendah' : 'cukup'} (${oMinusBloodStock} unit).`; // Diperbarui
        
        const recommendations = [
            { id: 'rec1', text: `Stok darah O- rendah (${oMinusBloodStock} unit tersedia)`, priority: oMinusBloodStock <= 10 ? "high" : "low" as "high" | "medium" | "low" },
            { id: 'rec2', text: `Pasien di Gawat Darurat ${erChange > 0 ? 'meningkat' : 'menurun'} ${Math.abs(erChange).toFixed(0)}% dibandingkan kemarin.`, priority: erChange > 20 ? "high" : "medium" as "high" | "medium" | "low" },
            { id: 'rec3', text: `Perkirakan jam sibuk malam antara 18.00 - 20.00 berdasarkan pola historis.`, priority: "medium" as "high" | "medium" | "low" } // Contoh
        ];

        res.json({ success: true, data: { summary, recommendations } });
    } catch (error) { next(error); }
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
      
      const operationalCost = totalRevenue * 0.75; 
      const profitMargin = totalRevenue > 0 ? (totalRevenue - operationalCost) / totalRevenue : 0;
      
      const patientSatisfaction = 4.2; 

      const responseData: FinancialSummaryResponse = {
        totalRevenue: totalRevenue,
        operationalCost: operationalCost,
        profitMargin: parseFloat(profitMargin.toFixed(3)), 
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
      const coloredDistribution: ServiceDistributionResponseItem[] = distribution.map((item, index) => ({ 
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
      const total = await PatientUser.countDocuments();
      const newLast30Days = await PatientUser.countDocuments({ createdAt: { $gte: getDateRange('30d').startDate, $lte: getDateRange('30d').endDate } });
      const genderDistribution = await PatientUser.aggregate([{ $group: { _id: "$gender", count: { $sum: 1 } } }]);
      res.json({ success: true, data: { totalPatients: total, newPatientsLast30Days: newLast30Days, genderDistribution } as PatientStatsResponse });
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
      latestVisits.forEach(visit => {
        activities.push({
          type: 'visit',
          message: `Kunjungan selesai untuk ${visit.patientId?.fullName || 'Pasien'} dengan ${visit.doctorId?.name || 'Dokter'}`,
          timestamp: visit.createdAt as Date
        });
      });
      latestQueues.forEach(queue => {
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
      const serverStatus = "Healthy"; // Mock
      const dbStatus = "Healthy"; // Mock
      const apiResponseTime = "142ms"; // Mock
      const uptime = "99.9%"; // Mock

      res.json({ success: true, data: { server: serverStatus, database: dbStatus, apiResponse: apiResponseTime, uptime: uptime } });
    } catch (error) { next(error); }
  }
}

export default new DashboardController();