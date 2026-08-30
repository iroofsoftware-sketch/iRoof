import express from "express";
import { addUser, getUsers,editUser,getUserById,deleteMultipleEmployees } from "../../controllers/admin/employee/usersController.js";
import {createCategory,getAllCategories,getCategoryById,addProjectType,getAllProjectTypes,getProjectTypeById} from "../../controllers/admin/product/productCategoryController.js";
import {addProduct,updateProduct,getAllProducts,getFilteredProducts} from "../../controllers/admin/product/productConteroller.js";
import { addClient, getClients,deleteMultipleClients } from "../../controllers/admin/client/clientController.js";
import { createOrUpdateLabourCost,setGST,getGST} from "../../controllers/admin/labourCost/labourCost.js";
import { authenticateUser }from '../../middlewares/jwt.middleware.js'
import upload from'../../middlewares/Multer.js'; 

const router = express.Router();

router.route("/profile").get(authenticateUser);
router.route("/profile/:userId").get(getUserById).put(editUser);
router.route('/employee').post(addUser).get(getUsers);
router.route('/client').post(addClient).get(getClients);
router.post("/labourcost/:category",createOrUpdateLabourCost);
router.post('/createprojectType',addProjectType);
router.get('/getAllProjectType', getAllProjectTypes);
router.get('/getProjectType/:id', getProjectTypeById);
router.post('/createCategory', upload.single('roofModelImage'), createCategory);
router.get('/getAllCategories', getAllCategories);
router.get('/getCategoryById/:id', getCategoryById);
router.post('/addProduct', upload.single('uploadImage'), addProduct);
router.put("/updateProduct/:id", upload.single("uploadImage"), updateProduct);  
router.get('/getAllProducts', getAllProducts);
router.get('/getFilteredProducts', getFilteredProducts);
router.post('/deteletEmploye', deleteMultipleEmployees);
router.post('/deteletClient', deleteMultipleClients);
router.post('/gst', setGST);
router.get('/gst', getGST);

export default router;