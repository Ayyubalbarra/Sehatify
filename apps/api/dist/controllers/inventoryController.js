"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import models and utilities - adjust paths as needed
const Inventory_1 = __importDefault(require("../models/Inventory"));
class InventoryController {
    // Get all inventory items with filters and pagination
    async getInventoryItems(req, res, next) {
        try {
            const { page = '1', limit = '10', search, category, status, sortBy = 'name', sortOrder = 'asc' } = req.query;
            const query = {};
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
                }
                else {
                    query.status = status;
                }
            }
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const sortDirection = sortOrder === "desc" ? -1 : 1;
            const [items, total] = await Promise.all([
                Inventory_1.default.find(query)
                    .sort({ [sortBy]: sortDirection })
                    .limit(limitNum)
                    .skip((pageNum - 1) * limitNum)
                    .lean(),
                Inventory_1.default.countDocuments(query),
            ]);
            const response = {
                success: true,
                data: items,
                pagination: {
                    totalPages: Math.ceil(total / limitNum),
                    currentPage: pageNum,
                    total
                }
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    // Get single inventory item by ID
    async getInventoryItemById(req, res, next) {
        try {
            const item = await Inventory_1.default.findById(req.params.id).lean();
            if (!item) {
                const response = {
                    success: false,
                    message: "Item tidak ditemukan"
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: item
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    // Get inventory statistics
    async getInventoryStats(req, res, next) {
        try {
            const [totalItems, lowStock, outOfStock, totalValue] = await Promise.all([
                Inventory_1.default.countDocuments(),
                Inventory_1.default.countDocuments({ $expr: { $lte: ["$currentStock", "$minimumStock"] } }),
                Inventory_1.default.countDocuments({ currentStock: 0 }),
                Inventory_1.default.aggregate([
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
            const response = {
                success: true,
                data: {
                    total: totalItems,
                    lowStock,
                    outOfStock,
                    totalValue: totalValue[0]?.totalValue || 0
                }
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    // Create a new inventory item
    async createInventoryItem(req, res, next) {
        try {
            const { name, category, unit, unitPrice } = req.body;
            if (!name || !category || !unit || unitPrice === undefined) {
                const response = {
                    success: false,
                    message: "Nama, kategori, unit, dan harga wajib diisi"
                };
                res.status(400).json(response);
                return;
            }
            const item = new Inventory_1.default({
                ...req.body,
                itemId: ModelHelpers.generateItemId(category)
            });
            await item.save();
            const response = {
                success: true,
                message: "Item berhasil ditambahkan",
                data: item
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    // Update an inventory item
    async updateInventoryItem(req, res, next) {
        try {
            const item = await Inventory_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!item) {
                const response = {
                    success: false,
                    message: "Item tidak ditemukan"
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                message: "Item berhasil diupdate",
                data: item
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    // Delete an inventory item
    async deleteInventoryItem(req, res, next) {
        try {
            const item = await Inventory_1.default.findByIdAndDelete(req.params.id);
            if (!item) {
                const response = {
                    success: false,
                    message: "Item tidak ditemukan"
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                message: "Item berhasil dihapus"
            };
            res.json(response);
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
                const response = {
                    success: false,
                    message: "Item tidak ditemukan"
                };
                res.status(404).json(response);
                return;
            }
            if (type === "add") {
                item.currentStock += quantity;
                item.lastRestockDate = new Date();
            }
            else if (type === "subtract") {
                if (item.currentStock < quantity) {
                    const response = {
                        success: false,
                        message: "Stok tidak mencukupi"
                    };
                    res.status(400).json(response);
                    return;
                }
                item.currentStock -= quantity;
            }
            else {
                const response = {
                    success: false,
                    message: "Tipe update tidak valid (add/subtract)"
                };
                res.status(400).json(response);
                return;
            }
            await item.save();
            const response = {
                success: true,
                message: "Stok berhasil diupdate",
                data: item
            };
            res.json(response);
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
                .lean();
            const summary = {
                total: lowStockItems.length,
                critical: lowStockItems.filter(item => item.currentStock === 0).length
            };
            const response = {
                success: true,
                data: lowStockItems,
                summary
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new InventoryController();
