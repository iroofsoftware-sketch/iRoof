import express from "express";
import {calculateEstimate,getAllEstimates,getEstimateByClientId,getEstimateById,getEstimateByClient,deleteEstimate} from "../../controllers/createEstimation/finalEstimateCalculation.js";
import upload from'../../middlewares/Multer.js'; 
const router = express.Router();


router.post("/finalEstimate", upload.array("areaImages"), calculateEstimate);
router.get("/getAllEstimates", getAllEstimates);
router.get("/client/:clientId", getEstimateByClientId);
router.get("/getestimate/:id", getEstimateById);
router.get("/getEstimateByClientAndPhone",getEstimateByClient);
router.post("/delete", deleteEstimate);


export default router;
