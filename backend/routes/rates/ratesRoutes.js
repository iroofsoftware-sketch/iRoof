import express from "express";
import { addThicknessPricing,editThicknessPricing,getAllThicknessPricing,getThicknessPricingByThickness,deleteMultipleThicknessPricing} from "../../controllers/rates/thickness/thicknessControlleer.js";
import { calculateTripCost,addTransportation,editTransportation,getTransportationByType,getAllTransportation} from "../../controllers/rates/transportation/transportationController.js";
import { getUserById, editUser,changePassword} from "../../controllers/rates/profile/profile.js";
import { addMaterial, getAllMaterials, materialItemAdding,getMaterialById,getAllItems,getItemById,editMaterial,editMaterialItem,updateMaterial} from "../../controllers/rates/material/materialController.js";

const router = express.Router();


router.get("/getAllItems", getAllItems);
router.get("/getAllTransportation", getAllTransportation); 
router.get("/getTransportationByType", getTransportationByType); 
router.get("/thickness-pricing", getAllThicknessPricing);
router.get("/thickness-pricing/:thickness", getThicknessPricingByThickness);
router.post('/addThickness',addThicknessPricing);
router.post('/editThickness',editThicknessPricing);
router.post('/calculateTripCost',calculateTripCost);
router.post('/addTransportation',addTransportation);
router.post('/editTransportation',editTransportation);
router.put("/:userId", editUser);
router.put("/change-password", changePassword);
router.post("/addMaterial", addMaterial);
router.post("/updateMaterial/:id", updateMaterial);
router.get("/getAllMaterials", getAllMaterials);
router.get("/:userId", getUserById);
router.get("/getMaterialById/:id", getMaterialById);
router.post("/materialItemAdding", materialItemAdding);
router.post("/editMaterialItem/:id",editMaterialItem);
router.get("/getItemById/:id", getItemById);
router.post("/deletethickness", deleteMultipleThicknessPricing);


export default router;
