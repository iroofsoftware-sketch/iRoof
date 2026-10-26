const Customer = require('../models/Customer');
const { Enquiry } = require('../models/Enquiry');
const WorkOrder = require('../models/WorkOrder');
const Invoice = require('../models/Invoice');
const Estimate = require('../models/Estimate');

// @desc    Get all customers with CRM stats
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { gstin: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    // Aggregate overall CRM statistics
    const totalCount = await Customer.countDocuments();
    const activeCount = await Customer.countDocuments({ status: 'Active' });
    const leadCount = await Customer.countDocuments({ status: 'Lead' });

    // Aggregate invoices for financial health
    const invoiceAgg = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalInvoiced: { $sum: '$grandTotal' },
          totalPaid: { $sum: '$amountPaid' },
          totalDue: { $sum: '$amountDue' }
        }
      }
    ]);

    const stats = {
      totalCustomers: totalCount,
      activeCustomers: activeCount,
      leadCustomers: leadCount,
      totalInvoiced: invoiceAgg[0]?.totalInvoiced || 0,
      totalPaid: invoiceAgg[0]?.totalPaid || 0,
      totalDue: invoiceAgg[0]?.totalDue || 0
    };

    res.status(200).json({
      success: true,
      count: customers.length,
      stats,
      data: customers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message
    });
  }
};

// @desc    Get single customer by ID with 360 CRM history
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('createdBy', 'name email');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Match criteria for customer records: by exact phone or name
    const nameRegex = new RegExp(`^${customer.name.trim()}$`, 'i');
    const phoneRegex = new RegExp(`${customer.phone.replace(/[^0-9]/g, '')}$`);

    // Fetch Enquiries
    const enquiries = await Enquiry.find({
      $or: [
        { clientName: nameRegex },
        { phone: phoneRegex }
      ]
    }).sort({ createdAt: -1 });

    const enquiryIds = enquiries.map((e) => e._id);

    // Fetch Estimates
    const estimates = await Estimate.find({
      enquiryId: { $in: enquiryIds }
    }).sort({ createdAt: -1 });

    // Fetch Work Orders
    const workOrders = await WorkOrder.find({
      $or: [
        { clientName: nameRegex },
        { enquiryId: { $in: enquiryIds } }
      ]
    }).sort({ createdAt: -1 });

    // Fetch Invoices
    const invoices = await Invoice.find({
      $or: [
        { clientName: nameRegex },
        { clientPhone: phoneRegex }
      ]
    }).sort({ createdAt: -1 });

    const totalBilled = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const outstandingBalance = invoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        customer,
        metrics: {
          totalEnquiries: enquiries.length,
          totalEstimates: estimates.length,
          totalWorkOrders: workOrders.length,
          totalInvoices: invoices.length,
          totalBilled,
          totalCollected,
          outstandingBalance
        },
        enquiries,
        estimates,
        workOrders,
        invoices
      }
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer details',
      error: error.message
    });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res) => {
  try {
    const {
      name,
      companyName,
      phone,
      alternatePhone,
      email,
      address,
      city,
      state,
      pincode,
      gstin,
      category,
      status,
      creditLimit,
      paymentTerms,
      notes
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and Phone number are required'
      });
    }

    const existing = await Customer.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Customer with phone number ${phone} already exists (${existing.name})`
      });
    }

    const customer = await Customer.create({
      name: name.trim(),
      companyName: companyName ? companyName.trim() : '',
      phone: phone.trim(),
      alternatePhone: alternatePhone ? alternatePhone.trim() : '',
      email: email ? email.trim().toLowerCase() : '',
      address: address ? address.trim() : '',
      city: city ? city.trim() : '',
      state: state || 'Tamil Nadu',
      pincode: pincode ? pincode.trim() : '',
      gstin: gstin ? gstin.trim().toUpperCase() : '',
      category: category || 'Industrial',
      status: status || 'Active',
      creditLimit: Number(creditLimit) || 0,
      paymentTerms: paymentTerms || '30 days',
      notes: notes ? notes.trim() : '',
      createdBy: req.user ? req.user._id : null
    });

    res.status(201).json({
      success: true,
      message: 'Customer profile created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin only)
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if there are active work orders or invoices
    const hasWorkOrders = await WorkOrder.exists({ clientName: customer.name });
    const hasInvoices = await Invoice.exists({ clientName: customer.name });

    if (hasWorkOrders || hasInvoices) {
      // Instead of hard deleting, set status to Inactive to preserve financial audit trail
      customer.status = 'Inactive';
      await customer.save();
      return res.status(200).json({
        success: true,
        message: 'Customer has associated projects or invoices. Account has been deactivated instead of deleted.',
        data: customer
      });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
};

// @desc    Auto-sync / populate customers from existing Enquiries & WorkOrders
// @route   POST /api/customers/sync
// @access  Private
exports.syncFromExisting = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().lean();
    let syncedCount = 0;

    for (const enq of enquiries) {
      if (!enq.clientName || !enq.phone) continue;

      const cleanPhone = enq.phone.trim();
      const existing = await Customer.findOne({ phone: cleanPhone });

      if (!existing) {
        await Customer.create({
          name: enq.clientName.trim(),
          phone: cleanPhone,
          email: enq.email || '',
          address: enq.address || '',
          category: 'Industrial',
          status: enq.status === 'completed' ? 'Active' : 'Lead',
          notes: `Imported from Enquiry on ${new Date(enq.createdAt).toLocaleDateString()}`,
          createdBy: req.user ? req.user._id : enq.createdBy
        });
        syncedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Sync completed. ${syncedCount} new customer profiles established.`,
      syncedCount
    });
  } catch (error) {
    console.error('Error syncing customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync customers',
      error: error.message
    });
  }
};
