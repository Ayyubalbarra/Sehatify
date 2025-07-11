import { Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';

// Import models and utilities - adjust paths as needed
import Inventory from "../models/Inventory";
import { generateItemId } from "../utils/modelHelpers";

// Interface definitions
interface InventoryQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface InventoryFilter {
  $or?: Array<{
    name?: { $regex: string; $options: string };
    itemId?: { $regex: string; $options: string };
  }>;
  category?: string;
  status?: string;
  $expr?: { $lte: [string, string] };
}

interface InventoryItem {
  save(): unknown;
  _id: string;
  itemId: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  status: 'Active' | 'Inactive' | 'Low Stock' | 'Out of Stock';
  supplier?: string;
  description?: string;
  lastRestockDate?: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginationInfo {
  totalPages: number;
  currentPage: number;
  total: number;
}

interface InventoryListResponse {
  success: boolean;
  data: InventoryItem[];
  pagination: PaginationInfo;
}

interface InventoryStats {
  total: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

interface InventoryStatsResponse {
  success: boolean;
  data: InventoryStats;
}

interface CreateInventoryRequest {
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  currentStock?: number;
  minimumStock?: number;
  maximumStock?: number;
  supplier?: string;
  description?: string;
  expiryDate?: Date;
}

interface UpdateInventoryRequest {
  name?: string;
  category?: string;
  unit?: string;
  unitPrice?: number;
  currentStock?: number;
  minimumStock?: number;
  maximumStock?: number;
  supplier?: string;
  description?: string;
  status?: 'Active' | 'Inactive';
  expiryDate?: Date;
}

interface UpdateStockRequest {
  quantity: number;
  type: 'add' | 'subtract';
}

interface LowStockSummary {
  total: number;
  critical: number;
}

interface LowStockResponse {
  success: boolean;
  data: InventoryItem[];
  summary: LowStockSummary;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationInfo;
  summary?: LowStockSummary;
}

class InventoryController {
  // Get all inventory items with filters and pagination
  async getInventoryItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        page = '1', 
        limit = '10', 
        search, 
        category, 
        status, 
        sortBy = 'name', 
        sortOrder = 'asc' 
      } = req.query as InventoryQueryParams;
      
      const query: InventoryFilter = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } }, 
          { itemId: { $regex: search, $options: "i" } }
        ];
      }
      
      if (category && category !== "all") {
        query.category = category;
      }
      
      if (status && status !== "all") {
        if (status === 'Low Stock') {
          query.$expr = { $lte: ["$currentStock", "$minimumStock"] };
        } else {
          query.status = status;
        }
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const sortDirection = sortOrder === "desc" ? -1 : 1;

      const [items, total] = await Promise.all([
        Inventory.find(query)
          .sort({ [sortBy]: sortDirection })
          .limit(limitNum)
          .skip((pageNum - 1) * limitNum)
          .lean(),
        Inventory.countDocuments(query),
      ]);
      
      const response: InventoryListResponse = {
        success: true,
        data: items,
        pagination: {
          totalPages: Math.ceil(total / limitNum),
          currentPage: pageNum,
          total
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get single inventory item by ID
  async getInventoryItemById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item: InventoryItem | null = await Inventory.findById(req.params.id).lean();
      
      if (!item) {
        const response: ApiResponse<never> = {
          success: false,
          message: "Item tidak ditemukan"
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<InventoryItem> = {
        success: true,
        data: item
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get inventory statistics
  async getInventoryStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [totalItems, lowStock, outOfStock, totalValue] = await Promise.all([
        Inventory.countDocuments(),
        Inventory.countDocuments({ $expr: { $lte: ["$currentStock", "$minimumStock"] } }),
        Inventory.countDocuments({ currentStock: 0 }),
        Inventory.aggregate([
          { 
            $group: { 
              _id: null, 
              totalValue: { 
                $sum: { $multiply: ["$currentStock", "$unitPrice"] } 
              } 
            } 
          }
        ]),
      ]);
      
      const response: InventoryStatsResponse = {
        success: true,
        data: {
          total: totalItems,
          lowStock,
          outOfStock,
          totalValue: totalValue[0]?.totalValue || 0
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Create a new inventory item
  async createInventoryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, category, unit, unitPrice }: CreateInventoryRequest = req.body;
      
      if (!name || !category || !unit || unitPrice === undefined) {
        const response: ApiResponse<never> = {
          success: false,
          message: "Nama, kategori, unit, dan harga wajib diisi"
        };
        res.status(400).json(response);
        return;
      }

      const item = new Inventory({ 
        ...req.body, 
        itemId: ModelHelpers.generateItemId(category) 
      });
      await item.save();

      const response: ApiResponse<InventoryItem> = {
        success: true,
        message: "Item berhasil ditambahkan",
        data: item
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Update an inventory item
  async updateInventoryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item: InventoryItem | null = await Inventory.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!item) {
        const response: ApiResponse<never> = {
          success: false,
          message: "Item tidak ditemukan"
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<InventoryItem> = {
        success: true,
        message: "Item berhasil diupdate",
        data: item
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Delete an inventory item
  async deleteInventoryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item: InventoryItem | null = await Inventory.findByIdAndDelete(req.params.id);
      
      if (!item) {
        const response: ApiResponse<never> = {
          success: false,
          message: "Item tidak ditemukan"
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<never> = {
        success: true,
        message: "Item berhasil dihapus"
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Update stock for an item
  async updateStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quantity, type }: UpdateStockRequest = req.body;
      
      const item: InventoryItem | null = await Inventory.findById(req.params.id);
      
      if (!item) {
        const response: ApiResponse<never> = {
          success: false,
          message: "Item tidak ditemukan"
        };
        res.status(404).json(response);
        return;
      }

      if (type === "add") {
        item.currentStock += quantity;
        item.lastRestockDate = new Date();
      } else if (type === "subtract") {
        if (item.currentStock < quantity) {
          const response: ApiResponse<never> = {
            success: false,
            message: "Stok tidak mencukupi"
          };
          res.status(400).json(response);
          return;
        }
        item.currentStock -= quantity;
      } else {
        const response: ApiResponse<never> = {
          success: false,
          message: "Tipe update tidak valid (add/subtract)"
        };
        res.status(400).json(response);
        return;
      }

      await item.save();

      const response: ApiResponse<InventoryItem> = {
        success: true,
        message: "Stok berhasil diupdate",
        data: item
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get low stock alerts
  async getLowStockAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lowStockItems: InventoryItem[] = await Inventory.find({ 
        $expr: { $lte: ["$currentStock", "$minimumStock"] } 
      })
      .sort({ currentStock: 1 })
      .lean();

      const summary: LowStockSummary = {
        total: lowStockItems.length,
        critical: lowStockItems.filter(item => item.currentStock === 0).length
      };

      const response: LowStockResponse = {
        success: true,
        data: lowStockItems,
        summary
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new InventoryController();