const Estimate = require('../models/Estimate');
const { Enquiry } = require('../models/Enquiry');

// @desc    Save new estimate
// @route   POST /api/estimates
// @access  Private (Sales, Admin)
const saveEstimate = async (req, res) => {
  try {
    const { enquiryId, model, inputData, results, status } = req.body;

    if (!model || !inputData || !results) {
      return res.status(400).json({
        success: false,
        message: 'Model, inputData, and calculation results are required'
      });
    }

    const newEstimate = await Estimate.create({
      enquiryId: enquiryId || undefined,
      model,
      inputData,
      results,
      status: status || 'draft',
      createdBy: req.user._id
    });

    // If enquiryId provided, optionally update enquiry status to 'estimated'
    if (enquiryId) {
      await Enquiry.findByIdAndUpdate(enquiryId, { status: 'estimated' });
    }

    const populated = await Estimate.findById(newEstimate._id)
      .populate('enquiryId', 'clientName phone email address roofType')
      .populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Estimate saved successfully',
      estimate: populated
    });
  } catch (error) {
    console.error('Error saving estimate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save estimate document',
      error: error.message
    });
  }
};

// @desc    Get single estimate by ID
// @route   GET /api/estimates/:id
// @access  Private
const getEstimateById = async (req, res) => {
  try {
    const { id } = req.params;
    const estimate = await Estimate.findById(id)
      .populate('enquiryId', 'clientName phone email address roofType notes')
      .populate('createdBy', 'name email');

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Estimate document not found'
      });
    }

    return res.status(200).json({
      success: true,
      estimate
    });
  } catch (error) {
    console.error('Error fetching estimate by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load estimate',
      error: error.message
    });
  }
};

// @desc    Get all estimates (optionally filtered by enquiryId)
// @route   GET /api/estimates?enquiryId=xxx
// @access  Private
const getEstimates = async (req, res) => {
  try {
    const { enquiryId, status } = req.query;
    const filter = {};

    if (enquiryId) {
      filter.enquiryId = enquiryId;
    }
    if (status) {
      filter.status = status;
    }

    const estimates = await Estimate.find(filter)
      .populate('enquiryId', 'clientName phone email address roofType')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: estimates.length,
      estimates
    });
  } catch (error) {
    console.error('Error fetching estimates list:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve estimates',
      error: error.message
    });
  }
};

// @desc    Update existing estimate
// @route   PUT /api/estimates/:id
// @access  Private
const updateEstimate = async (req, res) => {
  try {
    const { id } = req.params;
    const { model, inputData, results, status } = req.body;

    const estimate = await Estimate.findById(id);
    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found'
      });
    }

    if (model) estimate.model = model;
    if (inputData) estimate.inputData = inputData;
    if (results) estimate.results = results;
    if (status) estimate.status = status;

    await estimate.save();

    const populated = await Estimate.findById(id)
      .populate('enquiryId', 'clientName phone email address roofType')
      .populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Estimate updated successfully',
      estimate: populated
    });
  } catch (error) {
    console.error('Error updating estimate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update estimate',
      error: error.message
    });
  }
};

// @desc    Delete estimate
// @route   DELETE /api/estimates/:id
// @access  Private (Admin, Sales)
const deleteEstimate = async (req, res) => {
  try {
    const { id } = req.params;
    const estimate = await Estimate.findByIdAndDelete(id);

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Estimate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting estimate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete estimate',
      error: error.message
    });
  }
};

module.exports = {
  saveEstimate,
  getEstimateById,
  getEstimates,
  updateEstimate,
  deleteEstimate
};
