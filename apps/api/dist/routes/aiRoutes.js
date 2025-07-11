"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const aiController_1 = __importDefault(require("../controllers/aiController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Semua rute di bawah ini memerlukan otentikasi
router.use(auth_1.authenticateToken);
// Aturan validasi
const chatValidation = [
    (0, express_validator_1.body)("message").trim().isLength({ min: 1, max: 1000 }).withMessage("Pesan harus antara 1-1000 karakter"),
    (0, express_validator_1.body)("context").optional().isIn(["medical", "administrative", "general"]).withMessage("Konteks tidak valid"),
];
const analysisValidation = [
    (0, express_validator_1.body)("data").isObject().withMessage("Data harus berupa object"),
    (0, express_validator_1.body)("analysisType")
        .isIn(["patient", "inventory", "financial", "operational"])
        .withMessage("Tipe analisis tidak valid"),
];
// Rute untuk berinteraksi dengan AI
router.post("/chat", chatValidation, aiController_1.default.chatWithAI);
router.get("/insights/dashboard", aiController_1.default.getDashboardInsights);
router.post("/analysis", analysisValidation, aiController_1.default.getAIAnalysis);
router.get("/recommendations/:type", aiController_1.default.getAIRecommendations);
// Rute dengan otorisasi peran spesifik
router.post("/predictions/health", (0, auth_1.authorizeRoles)("doctor", "admin", "Super Admin"), aiController_1.default.getHealthPredictions);
router.get("/optimization/inventory", (0, auth_1.authorizeRoles)("admin", "Super Admin", "staff"), aiController_1.default.getInventoryOptimization);
router.get("/suggestions/scheduling", (0, auth_1.authorizeRoles)("admin", "Super Admin"), aiController_1.default.getSchedulingSuggestions);
exports.default = router;
