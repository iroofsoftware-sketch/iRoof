import express from "express";
import {
    getEstimatesBySiteVisitorAndStatus, getEstimatesByStatus,
    getMyWorks, getSiteVisitors, updateEstimateStatus,updateEstimateStatusByClientId
} from "../../controllers/siteVisitor/siteVisitorsController.js";

const router = express.Router();

router.get('/getSiteVisitors', getSiteVisitors);
router.get('/getMyWork/:siteVisitorId', getMyWorks);
router.get('/estimateStatus/:status', getEstimatesByStatus);
router.post('/updateEstimateStatusByClientId/:clientId',updateEstimateStatusByClientId);
router.get('/:siteVisitorId/estimateStatus/:status',getEstimatesBySiteVisitorAndStatus);
router.put('/updateStatus/:estimateId', updateEstimateStatus);

export default router;