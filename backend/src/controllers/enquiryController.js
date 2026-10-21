const { Enquiry, ENQUIRY_STATUSES } = require('../models/Enquiry');

// @desc    Get all enquiries with optional filters
// @route   GET /api/enquiries
// @access  Private (Sales, Admin, PM, Accounts)
const getEnquiries = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { clientName: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { address: searchRegex }
      ];
    }

    const enquiries = await Enquiry.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ enquiryDate: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve enquiries',
      error: error.message
    });
  }
};

// @desc    Get single enquiry by ID
// @route   GET /api/enquiries/:id
// @access  Private
const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findById(id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    return res.status(200).json({
      success: true,
      enquiry
    });
  } catch (error) {
    console.error('Error fetching enquiry by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve enquiry',
      error: error.message
    });
  }
};

// @desc    Create new enquiry
// @route   POST /api/enquiries
// @access  Private
const createEnquiry = async (req, res) => {
  try {
    const {
      clientName,
      phone,
      email,
      address,
      roofType,
      enquiryDate,
      status,
      assignedTo,
      notes
    } = req.body;

    if (!clientName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Client name and phone number are required'
      });
    }

    const newEnquiry = await Enquiry.create({
      clientName: clientName.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      address: address ? address.trim() : undefined,
      roofType: roofType ? roofType.trim() : 'Normal Cantilever',
      enquiryDate: enquiryDate ? new Date(enquiryDate) : new Date(),
      status: status || 'new',
      assignedTo: assignedTo || undefined,
      notes: notes ? notes.trim() : undefined,
      createdBy: req.user._id
    });

    const populated = await Enquiry.findById(newEnquiry._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Enquiry registered successfully',
      enquiry: populated
    });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create enquiry',
      error: error.message
    });
  }
};

// @desc    Update enquiry details
// @route   PUT /api/enquiries/:id
// @access  Private
const updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientName,
      phone,
      email,
      address,
      roofType,
      enquiryDate,
      status,
      assignedTo,
      notes
    } = req.body;

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    if (clientName) enquiry.clientName = clientName.trim();
    if (phone) enquiry.phone = phone.trim();
    if (email !== undefined) enquiry.email = email ? email.trim().toLowerCase() : '';
    if (address !== undefined) enquiry.address = address.trim();
    if (roofType) enquiry.roofType = roofType.trim();
    if (enquiryDate) enquiry.enquiryDate = new Date(enquiryDate);
    if (status) {
      if (!ENQUIRY_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${ENQUIRY_STATUSES.join(', ')}`
        });
      }
      enquiry.status = status;
    }
    if (assignedTo !== undefined) enquiry.assignedTo = assignedTo || null;
    if (notes !== undefined) enquiry.notes = notes.trim();

    await enquiry.save();

    const populated = await Enquiry.findById(id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      enquiry: populated
    });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update enquiry',
      error: error.message
    });
  }
};

// @desc    Quick status update
// @route   PATCH /api/enquiries/:id/status
// @access  Private
const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ENQUIRY_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Must be one of: ${ENQUIRY_STATUSES.join(', ')}`
      });
    }

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    enquiry.status = status;
    await enquiry.save();

    return res.status(200).json({
      success: true,
      message: `Enquiry status changed to '${status}'`,
      enquiry
    });
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update enquiry status',
      error: error.message
    });
  }
};

// @desc    Delete enquiry
// @route   DELETE /api/enquiries/:id
// @access  Private (Admin or Sales Manager)
const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findByIdAndDelete(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete enquiry',
      error: error.message
    });
  }
};

module.exports = {
  getEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiry,
  updateEnquiryStatus,
  deleteEnquiry
};
