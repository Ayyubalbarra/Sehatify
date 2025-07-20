// apps/api/src/routes/aiRoutes.ts

import express, { type Router } from "express";
import { body } from "express-validator";
import aiController from "../controllers/aiController";
import { authenticateToken } from "../middleware/auth"; // Pastikan path ke middleware auth Anda benar

const router: Router = express.Router();

// Semua rute di bawah ini akan memerlukan token autentikasi
router.use(authenticateToken);

// Aturan validasi untuk pesan chat
const chatValidation = [
  body("message").trim().isLength({ min: 1, max: 2000 }).withMessage("Pesan harus antara 1-2000 karakter"),
];

// Mendaftarkan endpoint POST /chat ke metode chatWithAI di controller
// URL lengkapnya akan menjadi: /api/v1/ai/chat
router.post(
    "/chat", 
    chatValidation, 
    aiController.chatWithAI
);

// PENTING: Mengekspor 'router' yang sudah berisi definisi endpoint, BUKAN controllernya.
export default router;