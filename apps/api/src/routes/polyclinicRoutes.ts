import express, { type Router } from "express";
import polyclinicController from "../controllers/polyclinicController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router: Router = express.Router();

// Semua rute di bawah ini memerlukan otentikasi
router.use(authenticateToken);

// Rute untuk mendapatkan semua poliklinik
router.get("/", polyclinicController.getAllPolyclinics);

// Rute untuk mendapatkan daftar departemen yang unik
router.get("/departments", polyclinicController.getDepartments);

// Rute untuk mendapatkan detail satu poliklinik berdasarkan ID
router.get("/:id", polyclinicController.getPolyclinicById);

// Rute khusus Admin
router.post("/", authorizeRoles("Super Admin", "Admin"), polyclinicController.createPolyclinic);
router.put("/:id", authorizeRoles("Super Admin", "Admin"), polyclinicController.updatePolyclinic);
router.delete("/:id", authorizeRoles("Super Admin", "Admin"), polyclinicController.deletePolyclinic);

export default router;