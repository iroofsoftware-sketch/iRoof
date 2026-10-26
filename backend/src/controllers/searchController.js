const WorkOrder = require('../models/WorkOrder');
const Customer = require('../models/Customer');
const Estimate = require('../models/Estimate');
const Invoice = require('../models/Invoice');

// @desc    Global search across Work Orders, Customers, Estimates, and Invoices
// @route   GET /api/search?q=...
// @access  Private (all logged in users)
const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim() || q.trim().length < 2) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const query = q.trim();
    const regex = new RegExp(query, 'i');

    const [workOrders, customers, estimates, invoices] = await Promise.all([
      WorkOrder.find({
        $or: [
          { refCode: regex },
          { clientName: regex },
          { siteAddress: regex }
        ]
      })
        .select('refCode clientName status siteAddress')
        .limit(6)
        .lean(),

      Customer.find({
        $or: [
          { name: regex },
          { phone: regex },
          { email: regex }
        ]
      })
        .select('name phone email status')
        .limit(6)
        .lean(),

      Estimate.find({
        $or: [
          { model: regex }
        ]
      })
        .populate('enquiryId', 'clientName')
        .select('model results status enquiryId')
        .limit(6)
        .lean(),

      Invoice.find({
        $or: [
          { refCode: regex },
          { clientName: regex }
        ]
      })
        .select('refCode clientName grandTotal status')
        .limit(6)
        .lean()
    ]);

    const results = [
      ...workOrders.map((wo) => ({
        type: 'workorder',
        id: wo._id,
        title: wo.refCode || `WO-${wo._id.toString().slice(-4).toUpperCase()}`,
        subtitle: `${wo.clientName} · ${(wo.status || 'active').replace(/_/g, ' ')}`,
        link: `/projectmanager/workorders/${wo._id}`,
        tag: 'Work Order'
      })),
      ...customers.map((c) => ({
        type: 'customer',
        id: c._id,
        title: c.name,
        subtitle: `${c.phone || ''} ${c.email ? '· ' + c.email : ''}`,
        link: `/sales/customers`,
        tag: 'Customer'
      })),
      ...estimates.map((e) => {
        const cName = e.enquiryId?.clientName || 'Commercial Estimate';
        const cost = e.results?.costs?.grandTotal || e.results?.grandTotal || 0;
        return {
          type: 'estimate',
          id: e._id,
          title: `EST-${e._id.toString().slice(-6).toUpperCase()}`,
          subtitle: `${cName} · ${e.model || ''} · ₹${Math.round(cost).toLocaleString('en-IN')}`,
          link: `/sales/estimates/${e._id}`,
          tag: 'Estimate'
        };
      }),
      ...invoices.map((inv) => ({
        type: 'invoice',
        id: inv._id,
        title: inv.refCode || `INV-${inv._id.toString().slice(-4).toUpperCase()}`,
        subtitle: `${inv.clientName || ''} · ₹${Number(inv.grandTotal || 0).toLocaleString('en-IN')}`,
        link: `/accounts/invoices`,
        tag: 'Invoice'
      }))
    ];

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Global search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Search query failed',
      error: error.message
    });
  }
};

module.exports = {
  globalSearch
};
