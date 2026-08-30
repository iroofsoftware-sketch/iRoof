import express from "express";
import { login,requestOtp,verifyOtp,resetPassword} from "../../controllers/admin/auth/auth.js";
import { logoutController} from "../../controllers/admin/client/clientController.js";
import { authenticateResetToken } from "../../middlewares/jwt.middleware.js";


const router = express.Router();
router.post('/login',login);
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", authenticateResetToken,resetPassword);
router.post("/logout", logoutController);



export default router;
