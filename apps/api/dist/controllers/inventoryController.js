"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Inventory_1 = __importDefault(require("../models/Inventory"));
const ModelHelpers = __importStar(require("../utils/modelHelpers")); // Pastikan path ini benar
// Definisikan interface lain yang spesifik untuk controller ini jika perlu
class InventoryController {
    // Get all inventory items with filters and pagination
    async getInventoryItems(req, res, next) {
        try {
            const { page = '1', limit = '10', search, category, status, sortBy = 'name', sortOrder = 'asc' } = req.query;
            const query = {};
            if (search)
                query.$or = [{ name: { $regex: search, $options: "i" } }, { itemId: { $regex: search, $options: "i" } }];
            if (category)
                query.category = category;
            if (status === 'Low Stock')
                query.$expr = { $lte: ["$currentStock", "$minimumStock"] };
            else if (status)
                query.status = status;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const sortDirection = sortOrder === "desc" ? -1 : 1;
            const [items, total] = await Promise.all([
                Inventory_1.default.find(query)
                    .sort({ [sortBy]: sortDirection })
                    .limit(limitNum)
                    .skip((pageNum - 1) * limitNum)
                    .lean(), // <-- Perbaikan
                Inventory_1.default.countDocuments(query),
            ]);
            res.json({
                success: true,
                data: items, // <-- Perbaikan
                pagination: { totalPages: Math.ceil(total / limitNum), currentPage: pageNum, total }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get single inventory item by ID
    async getInventoryItemById(req, res, next) {
        try {
            const item = await Inventory_1.default.findById(req.params.id).lean(); // <-- Perbaikan
            if (!item) {
                res.status(404).json({ success: false, message: "Item tidak ditemukan" });
                return;
            }
            res.json({ success: true, data: item }); // <-- Perbaikan
        }
        catch (error) {
            next(error);
        }
    }
    // Get inventory statistics
    async getInventoryStats(req, res, next) {
        try {
            const [totalItems, lowStock, outOfStock, valueResult] = await Promise.all([
                Inventory_1.default.countDocuments(),
                Inventory_1.default.countDocuments({ $expr: { $lte: ["$currentStock", "$minimumStock"] } }),
                Inventory_1.default.countDocuments({ currentStock: 0 }),
                Inventory_1.default.aggregate([
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
        }
        catch (error) {
            next(error);
        }
    }
    // Create a new inventory item
    async createInventoryItem(req, res, next) {
        try {
            const { name, category } = req.body;
            const item = new Inventory_1.default({
                ...req.body,
                itemId: ModelHelpers.generateItemId() // Menggunakan helper yang diimpor
            });
            await item.save();
            res.status(201).json({
                success: true,
                message: "Item berhasil ditambahkan",
                data: item.toObject() // <-- Perbaikan
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Update an inventory item
    async updateInventoryItem(req, res, next) {
        try {
            const item = await Inventory_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean(); // <-- Perbaikan
            if (!item) {
                res.status(404).json({ success: false, message: "Item tidak ditemukan" });
                return;
            }
            res.json({ success: true, message: "Item berhasil diupdate", data: item });
        }
        catch (error) {
            next(error);
        }
    }
    // Delete an inventory item
    async deleteInventoryItem(req, res, next) {
        try {
            const item = await Inventory_1.default.findByIdAndDelete(req.params.id).lean(); // <-- Perbaikan
            if (!item) {
                res.status(404).json({ success: false, message: "Item tidak ditemukan" });
                return;
            }
            res.json({ success: true, message: "Item berhasil dihapus" });
        }
        catch (error) {
            next(error);
        }
    }
    // Update stock for an item
    async updateStock(req, res, next) {
        try {
            const { quantity, type } = req.body;
            const item = await Inventory_1.default.findById(req.params.id);
            if (!item) {
                res.status(404).json({ success: false, message: "Item tidak ditemukan" });
                return;
            }
            if (type === "add") {
                item.currentStock += Number(quantity);
                item.lastRestockDate = new Date();
            }
            else if (type === "subtract") {
                if (item.currentStock < Number(quantity)) {
                    res.status(400).json({ success: false, message: "Stok tidak mencukupi" });
                    return;
                }
                item.currentStock -= Number(quantity);
            }
            else {
                res.status(400).json({ success: false, message: "Tipe update tidak valid (add/subtract)" });
                return;
            }
            await item.save();
            res.json({ success: true, message: "Stok berhasil diupdate", data: item.toObject() });
        }
        catch (error) {
            next(error);
        }
    }
    // Get low stock alerts
    async getLowStockAlerts(req, res, next) {
        try {
            const lowStockItems = await Inventory_1.default.find({
                $expr: { $lte: ["$currentStock", "$minimumStock"] }
            })
                .sort({ currentStock: 1 })
                .lean(); // <-- Perbaikan
            res.json({
                success: true,
                data: lowStockItems, // <-- Perbaikan
                summary: {
                    total: lowStockItems.length,
                    critical: lowStockItems.filter(item => item.currentStock === 0).length
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new InventoryController();
