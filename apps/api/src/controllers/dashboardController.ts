import { Request, Response, NextFunction } from 'express';
import Visit from "../models/Visit";
import Patient from "../models/Patient";
import Queue from "../models/Queue";
import Inventory from "../models/Inventory";

// Interface definitions
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
  queueDate: Date;
  status: 'Waiting' | 'In Progress' | 'Completed';
  priority: 'Normal' | 'Emergency';
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

interface ChartDataset {
  label: string;
  data: number[];
  tension: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class DashboardController {
  
  public async getDashboardOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [visitCount, queueCount, emergencyCount] = await Promise.all([
        Visit.countDocuments({ visitDate: { $gte: today } }),
        Queue.countDocuments({ queueDate: { $gte: today } }),
        Queue.countDocuments({ queueDate: { $gte: today }, priority: "Emergency" }),
      ]);
      
      const response: ApiResponse<DashboardOverviewData> = { 
        success: true, 
        data: { 
          todayVisits: visitCount, 
          todayQueues: queueCount,
          todayEmergencies: emergencyCount 
        } 
      };

      res.json(response);
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

      const queues: PopulatedQueue[] = await Queue.find({ 
        queueDate: { $gte: today, $lt: tomorrow } 
      })
        .populate("patientId", "name phone")
        .populate("polyclinicId", "name")
        .sort({ queueNumber: 1 })
        .lean();

      const summary: QueueSummary = {
          waiting: queues.filter((q) => q.status === "Waiting").length,
          inProgress: queues.filter((q) => q.status === "In Progress").length,
          completed: queues.filter((q) => q.status === "Completed").length,
      };

      const response: ApiResponse<QueueListData> = {
        success: true,
        data: { totalQueues: queues.length, summary, queues },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  public async getChartData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.query as { type?: string };
      let chartData: ChartData;

      if (type === "weekly-patients") {
        const labels: string[] = [];
        const data: number[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString("id-ID", { weekday: "short" }));

          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);

          const count = await Visit.countDocuments({
            visitDate: { $gte: startOfDay, $lt: endOfDay },
          });
          data.push(count);
        }
        
        chartData = { 
          labels, 
          datasets: [{ 
            label: "Pasien per Hari", 
            data, 
            tension: 0.1 
          }] 
        };
      } else {
        const errorResponse: ApiResponse<never> = { 
          success: false, 
          message: "Tipe chart tidak valid" 
        };
        res.status(400).json(errorResponse);
        return;
      }

      const response: ApiResponse<ChartData> = { 
        success: true, 
        data: chartData 
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // --- Metode Placeholder ---
  public async getPatientStats(req: Request, res: Response, next: NextFunction): Promise<void> { 
    const response: ApiResponse<never> = { 
      success: true, 
      message: "Patient stats endpoint" 
    };
    res.json(response);
  }

  public async getAppointmentStats(req: Request, res: Response, next: NextFunction): Promise<void> { 
    const response: ApiResponse<never> = { 
      success: true, 
      message: "Appointment stats endpoint" 
    };
    res.json(response);
  }

  public async getRevenueStats(req: Request, res: Response, next: NextFunction): Promise<void> { 
    const response: ApiResponse<never> = { 
      success: true, 
      message: "Revenue stats endpoint" 
    };
    res.json(response);
  }

  public async getInventoryStats(req: Request, res: Response, next: NextFunction): Promise<void> { 
    const response: ApiResponse<never> = { 
      success: true, 
      message: "Inventory stats endpoint" 
    };
    res.json(response);
  }

  public async getRecentActivities(req: Request, res: Response, next: NextFunction): Promise<void> { 
    const response: ApiResponse<never> = { 
      success: true, 
      message: "Recent activities endpoint" 
    };
    res.json(response);
  }

  public async getSystemHealth(req: Request, res: Response, next: NextFunction): Promise<void> { 
    const response: ApiResponse<never> = { 
      success: true, 
      message: "System health endpoint" 
    };
    res.json(response);
  }
}

export default new DashboardController();