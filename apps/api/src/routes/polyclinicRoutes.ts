// apps/api/src/routes/polyclinicRoutes.ts

import express, { type Router } from "express";
import polyclinicController from "../controllers/polyclinicController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router: Router = express.Router();

router.use(authenticateToken);

router.get("/", polyclinicController.getAllPolyclinics);
router.get("/departments", polyclinicController.getDepartments);
router.get("/:id", polyclinicController.getPolyclinicById);

router.post("/", authorizeRoles("Super Admin", "Admin"), polyclinicController.createPolyclinic);
router.put("/:id", authorizeRoles("Super Admin", "Admin"), polyclinicController.updatePolyclinic);
router.delete("/:id", authorizeRoles("Super Admin", "Admin"), polyclinicController.deletePolyclinic);

export default router;