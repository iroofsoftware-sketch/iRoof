const PurchaseOrder = require('../models/PurchaseOrder');
const PurchaseRequest = require('../models/PurchaseRequest');
const Supplier = require('../models/Supplier');
const WorkOrder = require('../models/WorkOrder');

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private (admin, purchase)
const getPurchaseOrders = async (req, res) => {
  try {
    const { status, supplierId, search, limit, page } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (supplierId && supplierId !== 'all') {
      filter.supplierId = supplierId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { refCode: { $regex: q, $options: 'i' } }
      ];
    }

    const query = PurchaseOrder.find(filter)
      .populate('supplierId', 'name contactPerson phone email gstin paymentTerms')
      .populate('purchaseRequestId', 'refCode status items')
      .populate('workOrderId', 'refCode clientName roofModel')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    if (limit) query.limit(Number(limit));
    if (page && limit) query.skip((Number(page) - 1) * Number(limit));

    const [purchaseOrders, total] = await Promise.all([
      query.exec(),
      PurchaseOrder.countDocuments(filter)
    ]);

    // Check for search by supplier name client-side if needed or populate matches
    let result = purchaseOrders;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = purchaseOrders.filter((po) => {
        const refMatch = po.refCode && po.refCode.toLowerCase().includes(q);
        const suppMatch = po.supplierId?.name && po.supplierId.name.toLowerCase().includes(q);
        const prMatch = po.purchaseRequestId?.refCode && po.purchaseRequestId.refCode.toLowerCase().includes(q);
        return refMatch || suppMatch || prMatch;
      });
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      total,
      data: result
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve purchase orders',
      error: error.message
    });
  }
};

// @desc    Get single purchase order by ID
// @route   GET /api/purchase-orders/:id
// @access  Private (admin, purchase)
const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id)
      .populate('supplierId')
      .populate('purchaseRequestId')
      .populate({
        path: 'workOrderId',
        populate: { path: 'enquiryId', select: 'clientName phone email address' }
      })
      .populate('createdBy', 'name email');

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: purchaseOrder
    });
  } catch (error) {
    console.error('Error fetching purchase order by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve purchase order details',
      error: error.message
    });
  }
};

// @desc    Create purchase order from approved purchase request
// @route   POST /api/purchase-orders
// @access  Private (admin, purchase)
const createPurchaseOrder = async (req, res) => {
  try {
    const {
      purchaseRequestId,
      supplierId,
      expectedDelivery,
      deliveryAddress,
      notes
    } = req.body;

    if (!purchaseRequestId || !supplierId || !expectedDelivery) {
      return res.status(400).json({
        success: false,
        message: 'Purchase request, supplier, and expected delivery date are required'
      });
    }

    const [purchaseRequest, supplier] = await Promise.all([
      PurchaseRequest.findById(purchaseRequestId).populate('workOrderId'),
      Supplier.findById(supplierId)
    ]);

    if (!purchaseRequest) {
      return res.status(404).json({
        success: false,
        message: 'Purchase request not found'
      });
    }

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Build line items from purchaseRequest.items
    const prItems = purchaseRequest.items || [];
    const lineItems = [];
    let subtotal = 0;

    if (prItems.length > 0) {
      prItems.forEach((item) => {
        const qty = Number(item.quantity) || 1;
        const totalEst = Number(item.estimatedCost) || 0;
        let rate = 0;
        let amount = 0;

        if (totalEst > 0) {
          rate = Math.max(1, Math.round(totalEst / qty));
          amount = totalEst;
        } else {
          rate = 100;
          amount = rate * qty;
        }

        lineItems.push({
          description: item.name || 'Material Item',
          quantity: qty,
          unit: item.unit || 'kg',
          rate,
          amount
        });

        subtotal += amount;
      });
    } else {
      // Fallback line item if PR had no structured items
      const amount = purchaseRequest.totalEstimate || 50000;
      lineItems.push({
        description: `Roofing Fabrication Materials — ${purchaseRequest.refCode || 'Order'}`,
        quantity: 1,
        unit: 'lot',
        rate: amount,
        amount
      });
      subtotal = amount;
    }

    const gstRate = 18;
    const gstAmount = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gstAmount;

    // Delivery address default to work order site address if not specified
    const finalAddress =
      deliveryAddress ||
      purchaseRequest.workOrderId?.siteAddress ||
      'I Roofing Enterprises Central Workshop, Kochi';

    const purchaseOrder = new PurchaseOrder({
      purchaseRequestId: purchaseRequest._id,
      workOrderId: purchaseRequest.workOrderId?._id || undefined,
      supplierId: supplier._id,
      expectedDelivery: new Date(expectedDelivery),
      deliveryAddress: finalAddress,
      lineItems,
      subtotal,
      gstRate,
      gstAmount,
      grandTotal,
      status: 'draft',
      notes: notes || '',
      createdBy: req.user._id
    });

    await purchaseOrder.save();

    // Update PurchaseRequest status to 'ordered'
    purchaseRequest.status = 'ordered';
    purchaseRequest.supplierName = supplier.name;
    await purchaseRequest.save();

    const populatedPO = await PurchaseOrder.findById(purchaseOrder._id)
      .populate('supplierId')
      .populate('purchaseRequestId')
      .populate('workOrderId')
      .populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      message: `Purchase Order ${purchaseOrder.refCode || 'PO'} created successfully`,
      purchaseOrder: populatedPO
    });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create purchase order',
      error: error.message
    });
  }
};

// @desc    Update purchase order status, delivery, notes
// @route   PATCH /api/purchase-orders/:id
// @access  Private (admin, purchase)
const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, expectedDelivery, deliveryAddress, notes } = req.body;

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    if (status) po.status = status;
    if (expectedDelivery) po.expectedDelivery = new Date(expectedDelivery);
    if (deliveryAddress !== undefined) po.deliveryAddress = deliveryAddress;
    if (notes !== undefined) po.notes = notes;

    await po.save();

    // If status updated to 'delivered', also mark PurchaseRequest as 'received'
    if (status === 'delivered' && po.purchaseRequestId) {
      await PurchaseRequest.findByIdAndUpdate(po.purchaseRequestId, { status: 'received' });
    }

    const updatedPO = await PurchaseOrder.findById(id)
      .populate('supplierId')
      .populate('purchaseRequestId')
      .populate('workOrderId')
      .populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Purchase order updated successfully',
      purchaseOrder: updatedPO
    });
  } catch (error) {
    console.error('Error updating purchase order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update purchase order',
      error: error.message
    });
  }
};

// @desc    Get aggregate stats for purchase orders
// @route   GET /api/purchase-orders/stats
// @access  Private (admin, purchase)
const getPurchaseOrderStats = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let totalValue = 0;
    let openPOs = 0;
    let deliveredPOs = 0;
    let pendingDelivery = 0;
    let thisMonthValue = 0;

    orders.forEach((po) => {
      const gt = po.grandTotal || 0;

      if (po.status !== 'cancelled') {
        totalValue += gt;

        if (['draft', 'sent', 'acknowledged'].includes(po.status)) {
          openPOs++;
        }

        if (['sent', 'acknowledged'].includes(po.status)) {
          pendingDelivery++;
        }

        if (po.status === 'delivered') {
          deliveredPOs++;
        }

        if (po.createdAt >= startOfMonth) {
          thisMonthValue += gt;
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalPOs: orders.length,
        totalValue,
        openPOs,
        deliveredPOs,
        pendingDelivery,
        thisMonthValue
      }
    });
  } catch (error) {
    console.error('Error fetching purchase order stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve purchase order statistics',
      error: error.message
    });
  }
};

module.exports = {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  getPurchaseOrderStats
};
