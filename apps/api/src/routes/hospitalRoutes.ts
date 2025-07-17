// apps/api/src/routes/hospitalRoutes.ts
import express, { Router } from "express";
import hospitalController from "../controllers/hospitalController";

const router: Router = express.Router();
router.get("/", hospitalController.getHospitals);
export default router;