import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDashboardStats, getRecentActivity } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/", requireAuth, getDashboardStats);
router.get("/activity", requireAuth, getRecentActivity);

export default router;