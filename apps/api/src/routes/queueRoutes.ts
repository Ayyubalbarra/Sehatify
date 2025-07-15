// apps/api/src/routes/queueRoutes.ts

import express, { type Router } from "express";
import { body, param } from "express-validator";
import queueController from "../controllers/queueController";
import { authenticateToken } from "../middleware/auth";

const router: Router = express.Router();

router.use(authenticateToken);

const createQueueValidation = [
  body("patientId").isMongoId().withMessage("ID Pasien tidak valid"),
  body("scheduleId").isMongoId().withMessage("ID Jadwal tidak valid"),
  body("notes").optional().trim().isLength({ max: 500 }).withMessage("Catatan maksimal 500 karakter"),
];

const updateStatusValidation = [
  body("status").isIn(["Waiting", "In Progress", "Completed", "Cancelled", "No Show"]).withMessage("Status tidak valid"),
];

router.get("/", queueController.getAllQueues);
router.get("/stats", queueController.getQueueStats);
router.get("/summary", queueController.getTodayQueueSummary);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("ID Antrian tidak valid"),
  queueController.getQueueById
);

router.post("/", createQueueValidation, queueController.createQueue);

router.put(
  "/:id/status",
  param("id").isMongoId().withMessage("ID Antrian tidak valid"),
  updateStatusValidation,
  queueController.updateQueueStatus
);

router.delete(
  "/:id",
  param("id").isMongoId().withMessage("ID Antrian tidak valid"),
  queueController.cancelQueue
);

export default router;