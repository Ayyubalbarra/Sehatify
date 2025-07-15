import { Request, Response, NextFunction } from 'express';
import Inventory from "../models/Inventory";
import * as ModelHelpers from "../utils/modelHelpers"; // Pastikan path ini benar
import { IInventory as InventoryItem } from '../interfaces/IInventory'; // Gunakan nama alias untuk konsistensi

// Definisikan interface lain yang spesifik untuk controller ini jika perlu

class InventoryController {
  // Get all inventory items with filters and pagination
  async getInventoryItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '10', search, category, status, sortBy = 'name', sortOrder = 'asc' } = req.query;
      
      const query: any = {};
      if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { itemId: { $regex: search, $options: "i" } }];
      if (category) query.category = category;
      if (status === 'Low Stock') query.$expr = { $lte: ["$currentStock", "$minimumStock"] };
      else if (status) query.status = status;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const sortDirection = sortOrder === "desc" ? -1 : 1;

      const [items, total] = await Promise.all([
        Inventory.find(query)
          .sort({ [sortBy as string]: sortDirection })
          .limit(limitNum)
          .skip((pageNum - 1) * limitNum)
          .lean(), // <-- Perbaikan
        Inventory.countDocuments(query),
      ]);
      
      res.json({
        success: true,
        data: items as InventoryItem[], // <-- Perbaikan
        pagination: { totalPages: Math.ceil(total / limitNum), currentPage: pageNum, total }
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get single inventory item by ID
  async getInventoryItemById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await Inventory.findById(req.params.id).lean(); // <-- Perbaikan
      
      if (!item) {
        res.status(404).json({ success: false, message: "Item tidak ditemukan" });
        return;
      }

      res.json({ success: true, data: item as InventoryItem }); // <-- Perbaikan
    } catch (error) {
      next(error);
    }
  }

  // Get inventory statistics
  async getInventoryStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [totalItems, lowStock, outOfStock, valueResult] = await Promise.all([
        Inventory.countDocuments(),
        Inventory.countDocuments({ $expr: { $lte: ["$currentStock", "$minimumStock"] } }),
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
      const { name, category } = req.body;
      const item = new Inventory({ 
        ...req.body, 
        itemId: ModelHelpers.generateItemId() // Menggunakan helper yang diimpor
      });
      await item.save();

      res.status(201).json({
        success: true,
        message: "Item berhasil ditambahkan",
        data: item.toObject() as InventoryItem // <-- Perbaikan
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
      ).lean(); // <-- Perbaikan

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
      const item = await Inventory.findByIdAndDelete(req.params.id).lean(); // <-- Perbaikan
      
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
        $expr: { $lte: ["$currentStock", "$minimumStock"] } 
      })
      .sort({ currentStock: 1 })
      .lean(); // <-- Perbaikan

      res.json({
        success: true,
        data: lowStockItems as InventoryItem[], // <-- Perbaikan
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