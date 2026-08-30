import express from "express";
import { addThicknessPricing, editThicknessPricing, getAllThicknessPricing, getThicknessPricingByThickness, deleteMultipleThicknessPricing } from "../../controllers/rates/thickness/thicknessControlleer.js";
import { calculateTripCost, addTransportation, editTransportation, getTransportationByType, getAllTransportation } from "../../controllers/rates/transportation/transportationController.js";
import { getUserById, editUser, changePassword } from "../../controllers/rates/profile/profile.js";
import { addMaterial, getAllMaterials, materialItemAdding, getMaterialById, getAllItems, getItemById, editMaterial, editMaterialItem, updateMaterial } from "../../controllers/rates/material/materialController.js";
import { authenticateUser } from "../../middlewares/jwt.middleware.js";

const router = express.Router();

router.get("/getAllItems", authenticateUser, getAllItems);
router.get("/getAllTransportation", authenticateUser, getAllTransportation);
router.get("/getTransportationByType", authenticateUser, getTransportationByType);
router.get("/thickness-pricing", authenticateUser, getAllThicknessPricing);
router.get("/thickness-pricing/:thickness", authenticateUser, getThicknessPricingByThickness);
router.post('/addThickness', authenticateUser, addThicknessPricing);
router.post('/editThickness', authenticateUser, editThicknessPricing);
router.post('/calculateTripCost', authenticateUser, calculateTripCost);
router.post('/addTransportation', authenticateUser, addTransportation);
router.post('/editTransportation', authenticateUser, editTransportation);
router.put("/:userId", authenticateUser, editUser);
router.put("/change-password", authenticateUser, changePassword);
router.post("/addMaterial", authenticateUser, addMaterial);
router.post("/updateMaterial/:id", authenticateUser, updateMaterial);
router.get("/getAllMaterials", authenticateUser, getAllMaterials);
router.get("/:userId", authenticateUser, getUserById);
router.get("/getMaterialById/:id", authenticateUser, getMaterialById);
router.post("/materialItemAdding", authenticateUser, materialItemAdding);
router.post("/editMaterialItem/:id", authenticateUser, editMaterialItem);
router.get("/getItemById/:id", authenticateUser, getItemById);
router.post("/deletethickness", authenticateUser, deleteMultipleThicknessPricing);

export default router;
