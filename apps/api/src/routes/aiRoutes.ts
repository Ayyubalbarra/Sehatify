import express, { type Router } from "express";
import { body } from "express-validator";
import aiController from "../controllers/aiController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router: Router = express.Router();

// Semua rute di bawah ini memerlukan otentikasi
router.use(authenticateToken);

// Aturan validasi
const chatValidation = [
  body("message").trim().isLength({ min: 1, max: 1000 }).withMessage("Pesan harus antara 1-1000 karakter"),
  body("context").optional().isIn(["medical", "administrative", "general"]).withMessage("Konteks tidak valid"),
];

const analysisValidation = [
  body("data").isObject().withMessage("Data harus berupa object"),
  body("analysisType")
    .isIn(["patient", "inventory", "financial", "operational"])
    .withMessage("Tipe analisis tidak valid"),
];

// Rute untuk berinteraksi dengan AI
router.post("/chat", chatValidation, aiController.chatWithAI);
router.get("/insights/dashboard", aiController.getDashboardInsights);
router.post("/analysis", analysisValidation, aiController.getAIAnalysis);
router.get("/recommendations/:type", aiController.getAIRecommendations);

// Rute dengan otorisasi peran spesifik
router.post("/predictions/health", authorizeRoles("doctor", "admin", "Super Admin"), aiController.getHealthPredictions);
router.get("/optimization/inventory", authorizeRoles("admin", "Super Admin", "staff"), aiController.getInventoryOptimization);
router.get("/suggestions/scheduling", authorizeRoles("admin", "Super Admin"), aiController.getSchedulingSuggestions);

export default router;