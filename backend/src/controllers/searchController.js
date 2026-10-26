const WorkOrder = require('../models/WorkOrder');
const { Enquiry } = require('../models/Enquiry');
const Estimate = require('../models/Estimate');

// GET /api/search?q=...
const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, data: { workOrders: [], enquiries: [], estimates: [] } });
    }

    const regex = { $regex: q.trim(), $options: 'i' };

    const [workOrders, enquiries, estimates] = await Promise.all([
      WorkOrder.find({ $or: [{ clientName: regex }, { refCode: regex }, { siteAddress: regex }] })
        .select('refCode clientName status grandTotal createdAt').limit(5),
      Enquiry.find({ $or: [{ clientName: regex }, { refCode: regex }, { phone: regex }] })
        .select('refCode clientName stage roofType createdAt').limit(5),
      Estimate.find({ $or: [{ 'inputData.clientName': regex }, { refCode: regex }] })
        .select('refCode model status createdAt').limit(5),
    ]);

    return res.status(200).json({ success: true, data: { workOrders, enquiries, estimates } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { globalSearch };
