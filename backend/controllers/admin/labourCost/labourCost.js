import LabourCost from "../../../models/labourCostModel.js"; 
import GST from "../../../models/gstModel.js";

export const createOrUpdateLabourCost = async (req, res) => {
  try {
    const { category } = req.params;
    const updateFields = req.body;

    const validCategories = ["Sheeting", "Welding"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: "Invalid category. Only 'Sheeting' and 'Welding' are allowed." });
    }

    // Find existing labour cost entry
    let existingLabourCost = await LabourCost.findOne({ category });

    if (existingLabourCost) {
      // Update only the provided fields without setting undefined or null values
      Object.keys(updateFields).forEach((key) => {
        if (updateFields[key] !== undefined && updateFields[key] !== null&& updateFields[key] !=="") {
          existingLabourCost[key] = updateFields[key];
        }
      });

      await existingLabourCost.save();
      return res.status(200).json({ success: true, data: existingLabourCost });
    } else {
      // Create a new entry if not found
      const newLabourCost = new LabourCost({ category, ...updateFields });
      await newLabourCost.save();
      return res.status(201).json({ success: true, data: newLabourCost });
    }
  } catch (error) {
    console.error("Error updating or creating labour cost:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

  // Adjust the path if needed

// Function to set or update GST Percentage (Single Record)
export const setGST = async (req, res) => {
    try {
        const { gstPercentage } = req.body;

        if (!gstPercentage) {
            return res.status(400).json({ message: "GST percentage is required." });
        }

        // Find the existing GST record
        let gstRecord = await GST.findOne();

        if (gstRecord) {
            // If exists, update it
            gstRecord.gstPercentage = gstPercentage;
            await gstRecord.save();
            return res.status(200).json({ message: "GST updated successfully.", gst: gstRecord });
        } else {
            // If not exists, create a new one
            gstRecord = new GST({ gstPercentage });
            await gstRecord.save();
            return res.status(201).json({ message: "GST added successfully.", gst: gstRecord });
        }

    } catch (error) {
        return res.status(500).json({ message: "Error setting GST.", error: error.message });
    }
};

// Function to get the current GST percentage
export const getGST = async (req, res) => {
    try {
        const gstRecord = await GST.findOne();

        if (!gstRecord) {
            return res.status(404).json({ message: "GST record not found." });
        }

        return res.status(200).json({ gst: gstRecord });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching GST.", error: error.message });
    }
};


