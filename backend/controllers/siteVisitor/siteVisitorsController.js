import User from "../../models/userModel.js"
import Estimate from "../../models/estimateModel.js";

export const getSiteVisitors = async (req, res) => {
    try {
      const salesVisitors = await User.find({isSiteVisitor:true}).select("-password -resetOtp -resetOtpExpire")
      res.status(200).json({
        success: true,
        data: salesVisitors,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  };


  export const getMyWorks = async (req, res) => {
    try {
      const { siteVisitorId } = req.params;
  console.log(siteVisitorId);
  
      const myWorks = await Estimate.find({ siteVisitorId })
        .populate("clientId") // ✅ Populate Client Details
        .populate("siteVisitorId") // ✅ Populate Site Visitor Details
        .populate({
          path: "sheetingPrice",
          populate: [
            { path: "projectType", select: "projectType" },
            { path: "roofModel", select: "roofModel" },
            { 
              path: "materialCharge.materials.itemId", 
              select: "item" 
            } // ✅ Populate materials correctly inside sheetingPrice
          ]
        });
  
      const formattedWorks = myWorks.map(work => ({
        ...work._doc,
        sheetingPrice: work.sheetingPrice.map(sheeting => ({
          ...sheeting._doc,
          materialDetails: sheeting.materialCharge.materials.map(material => ({
            itemName: material.itemId?.item || "N/A",
            finalPerMeterCost: material.itemId?.finalPerMeter || 0,
            unit: material.unit,
            totalCost: material.cost
          }))
        }))
      }));
  
      res.status(200).json({
        success: true,
        data: formattedWorks
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message
      });
    }
  };
  

export const getEstimatesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const estimates = await Estimate.find({ status });
    res.status(200).json({ success: true, data: estimates });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
// export const getEstimatesByStatus = async (req, res) => {
//   try {
//     const { status } = req.params;

//     const estimates = await Estimate.find({ status })
//       .populate("clientId")
//       .populate("siteVisitorId")
//       .populate({
//         path: "sheetingPrice",
//         populate: [
//           { path: "projectType" },
//           { path: "roofModel" },
//           {
//             path: "materialCharge.materials.itemId",
//             select: "item finalPerMeter", // Selecting specific fields
//           },
//         ],
//       })
//       .populate("transportations")
//       .populate("labourCharge")
//       .exec();

//     if (!estimates || estimates.length === 0) {
//       return res.status(404).json({ success: false, message: "No estimates found for this status" });
//     }

//     res.status(200).json({ success: true, data: estimates });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };


export const getEstimatesBySiteVisitorAndStatus = async (req, res) => {
  try {
    const { siteVisitorId, status } = req.params;
    const estimates = await Estimate.find({ siteVisitorId,status }).populate("clientId");
    res.status(200).json({ success: true, data: estimates });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


export const updateEstimateStatus = async (req, res) => {
  try {
    const { estimateId } = req.params;
    const { status } = req.body;

    const estimate = await Estimate.findByIdAndUpdate(
      estimateId,
      { status },
      { new: true }
    );

    if (!estimate) {
      return res.status(404).json({ success: false, message: "Estimate not found" });
    }

    res.status(200).json({ success: true, message: "Status updated successfully", data: estimate });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateEstimateStatusByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { status } = req.body;

    // Check if the status provided is valid
    const validStatus = [
      "Site Visit",
      "Start to Build",
      "Project Evaluation in Progress",
      "Quotation Provided",
      "Awaiting Client Response",
      "Call Back",
      "No Response from Client",
      "Project Rejected from Client",
      "Finished",
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided.",
      });
    }

    // Update the status of estimates linked to the clientId
    const updatedEstimates = await Estimate.updateMany(
      { clientId },
      { status }
    );

    if (updatedEstimates.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No estimates found for this client.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Estimate status updated successfully.",
      data: updatedEstimates,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};


  
  