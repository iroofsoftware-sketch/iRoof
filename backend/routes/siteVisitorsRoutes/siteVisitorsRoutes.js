import express from "express";
import {
    getEstimatesBySiteVisitorAndStatus, getEstimatesByStatus,
    getMyWorks, getSiteVisitors, updateEstimateStatus, updateEstimateStatusByClientId
} from "../../controllers/siteVisitor/siteVisitorsController.js";
import { authenticateUser } from "../../middlewares/jwt.middleware.js";

const router = express.Router();

router.get('/getSiteVisitors', authenticateUser, getSiteVisitors);
router.get('/getMyWork/:siteVisitorId', authenticateUser, getMyWorks);
router.get('/estimateStatus/:status', authenticateUser, getEstimatesByStatus);
router.post('/updateEstimateStatusByClientId/:clientId', authenticateUser, updateEstimateStatusByClientId);
router.get('/:siteVisitorId/estimateStatus/:status', authenticateUser, getEstimatesBySiteVisitorAndStatus);
router.put('/updateStatus/:estimateId', authenticateUser, updateEstimateStatus);

export default router;