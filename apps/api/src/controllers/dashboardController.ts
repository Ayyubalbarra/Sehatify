import { Request, Response, NextFunction } from 'express';
import Visit from "../models/Visit";
import Queue from "../models/Queue";

// Definisikan interface yang dibutuhkan oleh dashboard
interface DashboardOverviewData {
  todayVisits: number;
  todayQueues: number;
  todayEmergencies: number;
}

interface QueueSummary {
  waiting: number;
  inProgress: number;
  completed: number;
}

interface PopulatedQueue {
  _id: string;
  queueNumber: number;
  status: 'Waiting' | 'In Progress' | 'Completed';
  patientId: {
    _id: string;
    name: string;
    phone: string;
  };
  polyclinicId: {
    _id: string;
    name: string;
  };
}

interface QueueListData {
  totalQueues: number;
  summary: QueueSummary;
  queues: PopulatedQueue[];
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    tension: number;
  }[];
}

class DashboardController {
  
  public async getDashboardOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [visitCount, queueStats] = await Promise.all([
        Visit.countDocuments({ visitDate: { $gte: today, $lt: tomorrow } }),
        Queue.aggregate([
          { $match: { queueDate: { $gte: today, $lt: tomorrow } } },
          { 
            $group: {
              _id: null,
              total: { $sum: 1 },
              emergency: { $sum: { $cond: [{ $eq: ["$priority", "Emergency"] }, 1, 0] } }
            }
          }
        ])
      ]);
      
      const responseData: DashboardOverviewData = { 
        todayVisits: visitCount, 
        todayQueues: queueStats[0]?.total || 0,
        todayEmergencies: queueStats[0]?.emergency || 0
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

      // PERBAIKAN: Menambahkan .lean() untuk memastikan tipe data sesuai
      const queues = await Queue.find({ 
        queueDate: { $gte: today, $lt: tomorrow } 
      })
        .populate("patientId", "name phone")
        .populate("polyclinicId", "name")
        .sort({ queueNumber: 1 })
        .lean();

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
          queues: queues as unknown as PopulatedQueue[] // PERBAIKAN: Type assertion untuk meyakinkan TypeScript
        },
      });
    } catch (error) {
      next(error);
    }
  }
  
  public async getChartData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type = "weekly-patients" } = req.query as { type?: string };
      let chartData: ChartData;

      if (type === "weekly-patients") {
        const labels: string[] = [];
        const dataPromises: Promise<number>[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString("id-ID", { weekday: "short" }));

          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);

          dataPromises.push(Visit.countDocuments({
            visitDate: { $gte: startOfDay, $lt: endOfDay },
          }));
        }
        
        const data = await Promise.all(dataPromises);
        
        chartData = { 
          labels, 
          datasets: [{ 
            label: "Pasien per Hari", 
            data, 
            tension: 0.1 
          }] 
        };
      } else {
        res.status(400).json({ success: false, message: "Tipe chart tidak valid" });
        return;
      }

      res.json({ success: true, data: chartData });
    } catch (error) {
      next(error);
    }
  }

  // --- Metode Placeholder ---
  public async getPatientStats(req: Request, res: Response, next: NextFunction): Promise<void> { res.json({ success: true }); }
  public async getAppointmentStats(req: Request, res: Response, next: NextFunction): Promise<void> { res.json({ success: true }); }
  public async getRevenueStats(req: Request, res: Response, next: NextFunction): Promise<void> { res.json({ success: true }); }
  public async getInventoryStats(req: Request, res: Response, next: NextFunction): Promise<void> { res.json({ success: true }); }
  public async getRecentActivities(req: Request, res: Response, next: NextFunction): Promise<void> { res.json({ success: true }); }
  public async getSystemHealth(req: Request, res: Response, next: NextFunction): Promise<void> { res.json({ success: true }); }
}

export default new DashboardController();