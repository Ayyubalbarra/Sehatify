// apps/api/src/routes/settingRoutes.ts

import express, { type Router } from "express";
import settingController from "../controllers/settingController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router: Router = express.Router();

router.use(authenticateToken);

// Hanya Super Admin yang boleh mengakses pengaturan global
router.get("/", authorizeRoles("Super Admin"), settingController.getSettings);
router.put("/", authorizeRoles("Super Admin"), settingController.updateSettings);

export default router;