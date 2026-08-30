import ThicknessPricing from "../../../models/thicknessModel.js";
import GST from "../../../models/gstModel.js";

export const addThicknessPricing = async (req, res) => {
  try {
    const {
      thickness,
      baseRatePerWt,
      transportation,
      loadingUnloading,
      margin,
    } = req.body;

    console.log(req.body);

    const existingPricing = await ThicknessPricing.findOne({ thickness });
    if (existingPricing) {
      return res
        .status(400)
        .json({ message: "Thickness pricing already exists" });
    }

    const baseRate = Number(baseRatePerWt);
    const trans = Number(transportation);
    const loadUnload = Number(loadingUnloading);
    const marginValue = Number(margin);

    if (
      isNaN(baseRate) ||
      isNaN(trans) ||
      isNaN(loadUnload) ||
      isNaN(marginValue)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid numeric values provided" });
    }
      const gstRecord = await GST.findOne();
        const taxPercentage = gstRecord ? gstRecord.gstPercentage : 18; 
    const taxRate = (taxPercentage / 100) * baseRate;
    const finalRatePerKg = parseFloat((baseRate + taxRate + trans + loadUnload + 2).toFixed(2));

    const thicknessMultipliers = {
      0.5: 0.74,
      0.6: 0.872,
      0.7:0.582,
      0.8: 0.785,
      0.9: 0.879,
      1: 0.974,
      1.1: 1.073,
      1.2: 1.171,
      1.3: 1.374,
      1.4: 1.4,
    };
    const multiplier = thicknessMultipliers[thickness] || 0.872;

    const ratePerSqFt = parseFloat((finalRatePerKg * multiplier).toFixed(2));
    

    const roundOff = Math.round(ratePerSqFt);
    const sellingPrice = Math.ceil(roundOff + marginValue);

    const newPricing = new ThicknessPricing({
      thickness,
      baseRatePerWt: baseRate,
      taxRate,
      transportation: trans,
      loadingUnloading: loadUnload,
      finalRatePerKg,
      ratePerSqFt,
      roundOff,
      margin: marginValue,
      sellingPrice,
    });

    const savedPricing = await newPricing.save();
    res
      .status(201)
      .json({
        message: "Thickness pricing added successfully",
        data: savedPricing,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error adding thickness pricing",
        error: error.message,
      });
  }
};

export const editThicknessPricing = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      thickness,
      baseRatePerWt,
      transportation,
      loadingUnloading,
      margin,
    } = req.body;

    console.log(req.body);

    const baseRate = Number(baseRatePerWt);
    const trans = Number(transportation);
    const loadUnload = Number(loadingUnloading);
    const marginValue = Number(margin);

    if (
      isNaN(baseRate) ||
      isNaN(trans) ||
      isNaN(loadUnload) ||
      isNaN(marginValue)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid numeric values provided" });
    }

    const gstRecord = await GST.findOne();
    const taxPercentage = gstRecord ? gstRecord.gstPercentage : 18; 
const taxRate = (taxPercentage / 100) * baseRate;
const finalRatePerKg = baseRate + taxRate + trans + loadUnload + 2;

    const thicknessMultipliers = {
      0.5: 0.74,
      0.6: 0.872,
      0.7:0.582,
      0.8: 0.785,
      0.9: 0.879,
      1: 0.974,
      1.1: 1.073,
      1.2: 1.171,
      1.3: 1.374,
      1.4: 1.4,
        };
    const multiplier = thicknessMultipliers[thickness] || 0.74;

    const ratePerSqFt = finalRatePerKg * multiplier;
    const roundOff = Math.ceil(ratePerSqFt);
    const sellingPrice = roundOff + marginValue;

    const updatedPricing = await ThicknessPricing.findByIdAndUpdate(
      id,
      {
        thickness,
        baseRatePerWt: baseRate,
        taxRate,
        transportation: trans,
        loadingUnloading: loadUnload,
        finalRatePerKg,
        ratePerSqFt,
        roundOff,
        margin: marginValue,
        sellingPrice,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPricing) {
      return res.status(404).json({ message: "Thickness pricing not found" });
    }

    res
      .status(200)
      .json({
        message: "Thickness pricing updated successfully",
        data: updatedPricing,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error updating thickness pricing",
        error: error.message,
      });
  }
};

export const getAllThicknessPricing = async (req, res) => {
  try {
    const allPricing = await ThicknessPricing.find();
    res.status(200).json({
      message: "All thickness pricing records retrieved successfully",
      data: allPricing,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving thickness pricing records",
      error: error.message,
    });
  }
};

export const getThicknessPricingByThickness = async (req, res) => {
  try {
    const { thickness } = req.params;
    const pricing = await ThicknessPricing.findOne({ thickness });

    if (!pricing) {
      return res.status(404).json({
        message: "No pricing record found for the specified thickness",
      });
    }

    res.status(200).json({
      message: "Thickness pricing record retrieved successfully",
      data: pricing,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving thickness pricing record",
      error: error.message,
    });
  }
};

export const deleteMultipleThicknessPricing = async (req, res) => {
  try {
    const { ids } = req.body;

    await ThicknessPricing.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ message: "Selected thicknesses deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Error deleting selected thicknesses", error });
  }
};

