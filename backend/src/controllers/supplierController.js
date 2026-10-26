const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private (admin, purchase)
const getSuppliers = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const filter = {};

    if (isActive !== undefined && isActive !== 'all') {
      filter.isActive = isActive === 'true';
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { contactPerson: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { materials: { $elemMatch: { $regex: q, $options: 'i' } } }
      ];
    }

    const suppliers = await Supplier.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve suppliers',
      error: error.message
    });
  }
};

// @desc    Get single supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private (admin, purchase)
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id).populate('createdBy', 'name email');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Error fetching supplier by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve supplier details',
      error: error.message
    });
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private (admin only)
const createSupplier = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      phone,
      email,
      address,
      gstin,
      materials,
      paymentTerms,
      bankName,
      bankAccount,
      ifscCode,
      notes
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Supplier name is required'
      });
    }

    const supplier = new Supplier({
      name: name.trim(),
      contactPerson,
      phone,
      email,
      address,
      gstin,
      materials: Array.isArray(materials) ? materials : [],
      paymentTerms: paymentTerms || '30 days',
      bankName,
      bankAccount,
      ifscCode,
      notes,
      createdBy: req.user._id
    });

    await supplier.save();

    return res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      supplier
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create supplier',
      error: error.message
    });
  }
};

// @desc    Update supplier
// @route   PATCH /api/suppliers/:id
// @access  Private (admin only)
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const supplier = await Supplier.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'name email');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      supplier
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update supplier',
      error: error.message
    });
  }
};

// @desc    Soft delete supplier (deactivate)
// @route   DELETE /api/suppliers/:id
// @access  Private (admin only)
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Supplier deactivated successfully',
      supplier
    });
  } catch (error) {
    console.error('Error deactivating supplier:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate supplier',
      error: error.message
    });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
