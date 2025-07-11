import express, { type Router, type Request, type Response } from "express";
import { EnhancedDataSeeder } from "../scripts/seedDatabase";

const router: Router = express.Router();

/**
 * @route   POST /api/v1/seed
 * @desc    Seed database with sample data
 * @access  Public (for development purposes)
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // Check if running in production and prevent seeding
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "Database seeding is disabled in production environment.",
      });
    }

    console.log("🌱 Starting database seed via API...");

    const seeder = new EnhancedDataSeeder();
    await seeder.seedAll();

    res.status(200).json({
      success: true,
      message: "Database seeded successfully with sample data.",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Error seeding database via API:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed the database.",
      error: error.message,
    });
  }
});

export default router;