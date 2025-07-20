// apps/api/src/routes/notificationRoutes.ts

import express, { Router } from "express";
import notificationController from "../controllers/notificationController";
import { authenticateToken } from "../middleware/auth"; // Middleware autentikasi

const router: Router = express.Router();

// Semua rute notifikasi ini memerlukan otentikasi
router.use(authenticateToken);

router.get("/", notificationController.getNotifications);
router.put("/:id/read", notificationController.markAsRead);
router.put("/mark-all-read", notificationController.markAllAsRead); // Rute baru untuk markAllAsRead
router.delete("/:id", notificationController.deleteNotification);

export default router;