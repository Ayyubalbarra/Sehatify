"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const seedDatabase_1 = require("../scripts/seedDatabase");
const router = express_1.default.Router();
/**
 * @route   POST /api/v1/seed
 * @desc    Seed database with sample data
 * @access  Public (for development purposes)
 */
router.post("/", async (req, res) => {
    try {
        // Check if running in production and prevent seeding
        if (process.env.NODE_ENV === "production") {
            return res.status(403).json({
                success: false,
                message: "Database seeding is disabled in production environment.",
            });
        }
        console.log("🌱 Starting database seed via API...");
        const seeder = new seedDatabase_1.EnhancedDataSeeder();
        await seeder.seedAll();
        res.status(200).json({
            success: true,
            message: "Database seeded successfully with sample data.",
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("❌ Error seeding database via API:", error);
        res.status(500).json({
            success: false,
            message: "Failed to seed the database.",
            error: error.message,
        });
    }
});
exports.default = router;
