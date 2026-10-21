const RateMaster = require('../models/RateMaster');
const SectionMaster = require('../models/SectionMaster');

// ──────────────────────────────────────────
// RATE MASTER CONTROLLER
// ──────────────────────────────────────────

// @desc    Get all rate master items
// @route   GET /api/admin/rates
// @access  Private (Admin)
const getRates = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'all' ? { category } : {};
    const rates = await RateMaster.find(filter).sort({ category: 1, itemName: 1 });
    return res.status(200).json({
      success: true,
      count: rates.length,
      rates
    });
  } catch (error) {
    console.error('Error fetching rates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve rates',
      error: error.message
    });
  }
};

// @desc    Create new rate master item
// @route   POST /api/admin/rates
// @access  Private (Admin)
const createRate = async (req, res) => {
  try {
    const { itemName, unit, rate, category } = req.body;

    if (!itemName || rate === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Item name and rate are required'
      });
    }

    const newRate = await RateMaster.create({
      itemName: itemName.trim(),
      unit: unit ? unit.trim() : 'kg',
      rate: Number(rate),
      category: category ? category.trim() : 'general'
    });

    return res.status(201).json({
      success: true,
      message: 'Rate item created successfully',
      rate: newRate
    });
  } catch (error) {
    console.error('Error creating rate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create rate item',
      error: error.message
    });
  }
};

// @desc    Update rate master item
// @route   PUT /api/admin/rates/:id
// @access  Private (Admin)
const updateRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, unit, rate, category } = req.body;

    const rateItem = await RateMaster.findById(id);
    if (!rateItem) {
      return res.status(404).json({
        success: false,
        message: 'Rate item not found'
      });
    }

    if (itemName) rateItem.itemName = itemName.trim();
    if (unit) rateItem.unit = unit.trim();
    if (rate !== undefined) rateItem.rate = Number(rate);
    if (category) rateItem.category = category.trim();

    await rateItem.save();

    return res.status(200).json({
      success: true,
      message: 'Rate item updated successfully',
      rate: rateItem
    });
  } catch (error) {
    console.error('Error updating rate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update rate item',
      error: error.message
    });
  }
};

// @desc    Delete rate master item
// @route   DELETE /api/admin/rates/:id
// @access  Private (Admin)
const deleteRate = async (req, res) => {
  try {
    const { id } = req.params;
    const rateItem = await RateMaster.findByIdAndDelete(id);
    if (!rateItem) {
      return res.status(404).json({
        success: false,
        message: 'Rate item not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rate item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete rate item',
      error: error.message
    });
  }
};

// ──────────────────────────────────────────
// SECTION MASTER CONTROLLER
// ──────────────────────────────────────────

// @desc    Get all steel section master items
// @route   GET /api/admin/sections
// @access  Private (Admin)
const getSections = async (req, res) => {
  try {
    const sections = await SectionMaster.find().sort({ sectionName: 1 });
    return res.status(200).json({
      success: true,
      count: sections.length,
      sections
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve section masters',
      error: error.message
    });
  }
};

// @desc    Create new steel section
// @route   POST /api/admin/sections
// @access  Private (Admin)
const createSection = async (req, res) => {
  try {
    const { sectionName, weight, rate, unit } = req.body;

    if (!sectionName || weight === undefined || rate === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Section name, weight (kg/m), and rate are required'
      });
    }

    const newSection = await SectionMaster.create({
      sectionName: sectionName.trim(),
      weight: Number(weight),
      rate: Number(rate),
      unit: unit ? unit.trim() : 'kg'
    });

    return res.status(201).json({
      success: true,
      message: 'Steel section created successfully',
      section: newSection
    });
  } catch (error) {
    console.error('Error creating section:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create section',
      error: error.message
    });
  }
};

// @desc    Update steel section
// @route   PUT /api/admin/sections/:id
// @access  Private (Admin)
const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionName, weight, rate, unit } = req.body;

    const section = await SectionMaster.findById(id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    if (sectionName) section.sectionName = sectionName.trim();
    if (weight !== undefined) section.weight = Number(weight);
    if (rate !== undefined) section.rate = Number(rate);
    if (unit) section.unit = unit.trim();

    await section.save();

    return res.status(200).json({
      success: true,
      message: 'Steel section updated successfully',
      section
    });
  } catch (error) {
    console.error('Error updating section:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update section',
      error: error.message
    });
  }
};

// @desc    Delete steel section
// @route   DELETE /api/admin/sections/:id
// @access  Private (Admin)
const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await SectionMaster.findByIdAndDelete(id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Steel section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete section',
      error: error.message
    });
  }
};

module.exports = {
  getRates,
  createRate,
  updateRate,
  deleteRate,
  getSections,
  createSection,
  updateSection,
  deleteSection
};
