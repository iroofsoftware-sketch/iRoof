import express from "express";
import { calculateEstimate, getAllEstimates, getEstimateByClientId, getEstimateById, getEstimateByClient, deleteEstimate } from "../../controllers/createEstimation/finalEstimateCalculation.js";
import upload from '../../middlewares/Multer.js';
import { authenticateUser } from '../../middlewares/jwt.middleware.js';

const router = express.Router();

router.post("/finalEstimate", authenticateUser, upload.array("areaImages"), calculateEstimate);
router.get("/getAllEstimates", authenticateUser, getAllEstimates);
router.get("/client/:clientId", authenticateUser, getEstimateByClientId);
router.get("/getestimate/:id", authenticateUser, getEstimateById);
router.get("/getEstimateByClientAndPhone", authenticateUser, getEstimateByClient);
router.post("/delete", authenticateUser, deleteEstimate);

export default router;
