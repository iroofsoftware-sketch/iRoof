import express from "express";
import { addUser, getUsers, editUser, getUserById, deleteMultipleEmployees } from "../../controllers/admin/employee/usersController.js";
import { createCategory, getAllCategories, getCategoryById, addProjectType, getAllProjectTypes, getProjectTypeById } from "../../controllers/admin/product/productCategoryController.js";
import { addProduct, updateProduct, getAllProducts, getFilteredProducts } from "../../controllers/admin/product/productConteroller.js";
import { addClient, getClients, deleteMultipleClients } from "../../controllers/admin/client/clientController.js";
import { createOrUpdateLabourCost, setGST, getGST } from "../../controllers/admin/labourCost/labourCost.js";
import { authenticateUser } from '../../middlewares/jwt.middleware.js';
import upload from '../../middlewares/Multer.js';

const router = express.Router();

router.route("/profile").get(authenticateUser);
router.route("/profile/:userId").get(authenticateUser, getUserById).put(authenticateUser, editUser);
router.route('/employee').post(authenticateUser, addUser).get(authenticateUser, getUsers);
router.route('/client').post(authenticateUser, addClient).get(authenticateUser, getClients);
router.post("/labourcost/:category", authenticateUser, createOrUpdateLabourCost);
router.post('/createprojectType', authenticateUser, addProjectType);
router.get('/getAllProjectType', authenticateUser, getAllProjectTypes);
router.get('/getProjectType/:id', authenticateUser, getProjectTypeById);
router.post('/createCategory', authenticateUser, upload.single('roofModelImage'), createCategory);
router.get('/getAllCategories', authenticateUser, getAllCategories);
router.get('/getCategoryById/:id', authenticateUser, getCategoryById);
router.post('/addProduct', authenticateUser, upload.single('uploadImage'), addProduct);
router.put("/updateProduct/:id", authenticateUser, upload.single("uploadImage"), updateProduct);
router.get('/getAllProducts', authenticateUser, getAllProducts);
router.get('/getFilteredProducts', authenticateUser, getFilteredProducts);
router.post('/deteletEmploye', authenticateUser, deleteMultipleEmployees);
router.post('/deteletClient', authenticateUser, deleteMultipleClients);
router.post('/gst', authenticateUser, setGST);
router.get('/gst', authenticateUser, getGST);

export default router;