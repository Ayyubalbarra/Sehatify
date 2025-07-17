// apps/api/src/routes/aiRoutes.ts

import express, { type Router } from "express";
import { body } from "express-validator";
import aiController from "../controllers/aiController";
import { authenticateToken } from "../middleware/auth";

const router: Router = express.Router();

// Semua rute di bawah ini memerlukan otentikasi
router.use(authenticateToken);

// Aturan validasi untuk chat
const chatValidation = [
  body("message").trim().isLength({ min: 1, max: 2000 }).withMessage("Pesan harus antara 1-2000 karakter"),
];

// ✅ HANYA mendaftarkan rute yang fungsinya ada di controller
router.post("/chat", chatValidation, aiController.chatWithAI);

export default router;