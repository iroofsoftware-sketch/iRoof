import express from "express";
import adminRoutes from "./admin/adminRoutes.js";
import ratesRoutes from "./rates/ratesRoutes.js";
import authRoutes from "./auth/auth.js";
import EstimateRoutes from "./finlEstimate/finalEstimateRoutes.js";
import siteVisitorsRoutes from "./siteVisitorsRoutes/siteVisitorsRoutes.js"

const router = express.Router();


router.use("/admin",adminRoutes);
router.use("/rates",ratesRoutes);
router.use("/estimate",EstimateRoutes);
router.use("/siteVisitor", siteVisitorsRoutes)
router.use("/auth",authRoutes);

export default router;




