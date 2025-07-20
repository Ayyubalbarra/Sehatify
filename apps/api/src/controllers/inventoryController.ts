import { Request, Response, NextFunction } from 'express';
import Inventory from "../models/Inventory";
// import * as ModelHelpers from "../utils/modelHelpers"; // ✅ DIHAPUS: Tidak diperlukan lagi
import { IInventory as InventoryItem } from '../interfaces/IInventory'; 

class InventoryController {
  // Get all inventory items with filters and pagination
  async getInventoryItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '10', search, category, status, sortBy = 'name', sortOrder = 'asc' } = req.query;
      
      const query: any = {};
      if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { itemId: { $regex: search, $options: "i" } }];
      if (category) query.category = category;
      // Perbaikan filter status
      if (status === 'Low Stock') query.status = 'Low Stock';
      else if (status === 'Out of Stock') query.status = 'Out of Stock';
      else if (status === 'Available') query.status = 'Available';
      else if (status && status !== 'all') query.status = status;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const sortDirection = sortOrder === "desc" ? -1 : 1;

      const [items, total] = await Promise.all([
        Inventory.find(query)
          .sort({ [sortBy as string]: sortDirection })
          .limit(limitNum)
          .skip((pageNum - 1) * limitNum)
          .lean(), 
        Inventory.countDocuments(query),
      ]);
      
      res.json({
        success: true,
        data: items as InventoryItem[], 
        pagination: { totalPages: Math.ceil(total / limitNum), currentPage: pageNum, total }
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get single inventory item by ID
  async getInventoryItemById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await Inventory.findById(req.params.id).lean(); 
      
      if (!item) {
        res.status(404).json({ success: false, message: "Item tidak ditemukan" });
        return;
      }

      res.json({ success: true, data: item as InventoryItem }); 
    } catch (error) {
      next(error);
    }
  }

  // Get inventory statistics
  async getInventoryStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [totalItems, lowStock, outOfStock, valueResult] = await Promise.all([
        Inventory.countDocuments(),
        Inventory.countDocuments({ status: 'Low Stock' }), 
        Inventory.countDocuments({ currentStock: 0 }), 
        Inventory.aggregate([
          { $group: { _id: null, totalValue: { $sum: { $multiply: ["$currentStock", "$unitPrice"] } } } }
        ]),
      ]);
      
      res.json({
        success: true,
        data: {
          total: totalItems,
          lowStock,
          outOfStock,
          totalValue: valueResult[0]?.totalValue || 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create a new inventory item
  async createInventoryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = new Inventory({ 
        ...req.body, 
        // itemId: ModelHelpers.generateItemId() // ✅ itemId akan digenerate oleh hook pre('save') jika tidak ada
      });
      await item.save();

      res.status(201).json({
        success: true,
        message: "Item berhasil ditambahkan",
        data: item.toObject() as InventoryItem 
      });
    } catch (error) {
      next(error);
    }
  }

  // Update an inventory item
  async updateInventoryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await Inventory.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).lean(); 

      if (!item) {
        res.status(404).json({ success: false, message: "Item tidak ditemukan" });
        return;
      }

      res.json({ success: true, message: "Item berhasil diupdate", data: item as InventoryItem });
    } catch (error) {
      next(error);
    }
  }
  
  // Delete an inventory item
  async deleteInventoryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await Inventory.findByIdAndDelete(req.params.id).lean(); 
      
      if (!item) {
        res.status(404).json({ success: false, message: "Item tidak ditemukan" });
        return;
      }

      res.json({ success: true, message: "Item berhasil dihapus" });
    } catch (error) {
      next(error);
    }
  }

  // Update stock for an item
  async updateStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quantity, type } = req.body;
      const item = await Inventory.findById(req.params.id);
      
      if (!item) {
        res.status(404).json({ success: false, message: "Item tidak ditemukan" });
        return;
      }

      if (type === "add") {
        item.currentStock += Number(quantity);
        item.lastRestockDate = new Date();
      } else if (type === "subtract") {
        if (item.currentStock < Number(quantity)) {
          res.status(400).json({ success: false, message: "Stok tidak mencukupi" });
          return;
        }
        item.currentStock -= Number(quantity);
      } else {
        res.status(400).json({ success: false, message: "Tipe update tidak valid (add/subtract)" });
        return;
      }

      await item.save();
      res.json({ success: true, message: "Stok berhasil diupdate", data: item.toObject() as InventoryItem });
    } catch (error) {
      next(error);
    }
  }
  
  // Get low stock alerts
  async getLowStockAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lowStockItems = await Inventory.find({ 
        status: 'Low Stock' 
      })
      .sort({ currentStock: 1 })
      .lean(); 

      res.json({
        success: true,
        data: lowStockItems as InventoryItem[], 
        summary: {
            total: lowStockItems.length,
            critical: lowStockItems.filter(item => item.currentStock === 0).length
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new InventoryController();