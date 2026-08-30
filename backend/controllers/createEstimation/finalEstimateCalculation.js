import Estimate from "../../models/estimateModel.js";
import { calculateSheetingPrice } from "../createEstimation/sheetingPrice/sheetingPrice.js";
import { calculateTransportationCharge, getTotalTransportationCost } from "../createEstimation/transporationCharge/transporationCharge.js";
import { calculateLabourCharge } from "../createEstimation/labourCharge/labourCharge.js";
import Client from "../../models/clientModel.js";
import Category from '../../models/productCategoryModel.js';
import GST from "../../models/gstModel.js"; 
import mongoose from "mongoose";




// export const calculateEstimate = async (req, res) => {
//   try {
//       const { 
//           clientId,
//           siteVisitorId, 
//           sitevisitDate,
//           sitevisitTime, 
//           areas, 
//           transportations = [], 
//           labourData, 
//           materialItems, 
//           cranePrice = 0, 
//           otherExpenses = 0, 
//           sellingRate = 0,
//           status
//       } = req.body;

//       let totalAreaSqFt = 0;
//       let totalNumberofSheetAllArea = 0;
//       let totalSheetingCost = 0;
//       let updatedAreas = [];
//       let updatedTransportations = [];
//       let totalTransportationCost = 0;
//       let totalMaterialCharge = 0;

//       const parsedAreas = typeof areas === "string" ? JSON.parse(areas) : areas;

//       const existingEstimate = await Estimate.findOne({ clientId });

//       // Retrieve previous images if an estimate exists
//       const previousImages = existingEstimate ? existingEstimate.sheetingPrice.map(area => area.areaImage) : [];

//       updatedAreas = await Promise.all(parsedAreas.map(async (area, index) => {
//           if (!area.projectType || !area.roofModel) {
//               console.warn("Skipping area due to missing ProjectType or RoofModel", area);
//               return null;
//           }

//           let uploadedImageUrl = previousImages[index] || null; 

//           if (req.files && req.files[index]) {
//               uploadedImageUrl = req.files[index].path;
//           }

//           const calculatedArea = await calculateSheetingPrice(area);
//           calculatedArea.areaImage = uploadedImageUrl; 

//           totalAreaSqFt += calculatedArea.areaSqFt ?? 0;
//           totalSheetingCost += calculatedArea.totalSheetingPrice ?? 0;
//           totalMaterialCharge += calculatedArea.materialCharge?.totalCharge ?? 0;

//           return calculatedArea;
//       }));

//       updatedAreas = updatedAreas.filter(Boolean);

//       try {
//         const transportResult = await calculateTransportationCharge({
//           transportations,
//           cranePrice,
//           otherExpenses,
//         });
//         updatedTransportations = transportResult.transportations;
//         totalTransportationCost = transportResult.totalTransportationCost;
//       } catch (error) {
//         console.error("Error calculating transportation charge:", error);
//       }
//       let calculatedLabourCharge = { 
//           totalLabourCharge: 0, 
//           foodAndAccommodation: 0, 
//           enquiryExpense: 0, 
//           transportationLabour: 0, 
//           weldingLabour: { totalCost: 0 }, 
//           sheetingLabour: { totalCost: 0 }
//       };

//       try {
//           calculatedLabourCharge = await calculateLabourCharge(labourData) ?? calculatedLabourCharge;
//       } catch (error) {
//           console.error("Error calculating labour charge:", error);
//       }

//       const finalTransportationCost = totalTransportationCost;
//       const totalProjectExpense = 
//           (totalSheetingCost ?? 0) + 
//           (finalTransportationCost ?? 0) + 
//           (calculatedLabourCharge.totalLabourCharge ?? 0) + 
//           (totalMaterialCharge ?? 0);

//       const marginPercentage = 15;
//       const marginAmount = (marginPercentage / 100) * totalProjectExpense;
//       const newProjectValue = marginAmount + totalProjectExpense;
//       const ratePerSqFt = totalAreaSqFt > 0 ? newProjectValue / totalAreaSqFt : 0;
//       const finalRate = (sellingRate ?? 0) * totalAreaSqFt;
//       const taxPercentage = 18;
//       const taxAmount = (taxPercentage / 100) * finalRate;
//       const totalBudget = finalRate + taxAmount;

//       if (existingEstimate) {
//           existingEstimate.siteVisitorId = siteVisitorId;
//           existingEstimate.sitevisitDate = sitevisitDate; 
//           existingEstimate.sitevisitTime = sitevisitTime;
//           existingEstimate.sheetingPrice = updatedAreas;
//           existingEstimate.transportations = updatedTransportations;
//           existingEstimate.labourCharge = calculatedLabourCharge;
//           existingEstimate.totalEstimate = totalProjectExpense;
//           existingEstimate.finalTransportationCost = finalTransportationCost;
//           existingEstimate.totalProjectExpense = totalProjectExpense;
//           existingEstimate.marginPercentage = marginPercentage;
//           existingEstimate.marginAmount = marginAmount;
//           existingEstimate.totalAreaSqFt = totalAreaSqFt;
//           existingEstimate.totalNumberofSheetAllArea = totalNumberofSheetAllArea;
//           existingEstimate.totalSheetingCost = totalSheetingCost;
//           existingEstimate.newProjectValue = newProjectValue;
//           existingEstimate.ratePerSqFt = ratePerSqFt;
//           existingEstimate.sellingRate = sellingRate;
//           existingEstimate.taxPercentage = taxPercentage;
//           existingEstimate.taxAmount = taxAmount;
//           existingEstimate.totalBudget = totalBudget;
//           existingEstimate.finalRate = finalRate;
//           existingEstimate.status = status;

//           await existingEstimate.save();

//           return res.status(200).json({ message: "Estimate updated successfully!", estimate: existingEstimate });
//       } else {
//           const newEstimate = new Estimate({
//               clientId,
//               siteVisitorId,
//               sitevisitDate,
//               sitevisitTime,
//               status,
//               sheetingPrice: updatedAreas,
//               transportations: transportResult,
//               labourCharge: calculatedLabourCharge, 
//               totalMaterialCharge,
//               finalTransportationCost,
//               totalEstimate: totalProjectExpense, 
//               totalProjectExpense,
//               marginPercentage,
//               marginAmount,
//               totalAreaSqFt, 
//               totalNumberofSheetAllArea, 
//               totalSheetingCost,
//               newProjectValue,
//               ratePerSqFt,
//               sellingRate,
//               taxPercentage,
//               taxAmount,
//               totalBudget,
//               finalRate,
//           });

//           await newEstimate.save();

//           return res.status(201).json({ message: "Estimate calculated successfully!", estimate: newEstimate });
//       }
//   } catch (error) {
//       console.error("Error calculating estimate:", error);
//       return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };


// export const calculateEstimate = async (req, res) => {
//   try {
//       const { 
//           clientId,
//           siteVisitorId, 
//           sitevisitDate,
//           sitevisitTime, 
//           areas, 
//           transportations = [], 
//           labourData, 
//           materialItems, 
//           cranePrice = 0, 
//           otherExpenses = 0, 
//           sellingRate = 0,
//           status
//       } = req.body;

//       let totalAreaSqFt = 0;
//       let totalNumberofSheetAllArea = 0;
//       let totalSheetingCost = 0;
//       let updatedAreas = [];
//       let updatedTransportations = [];
//       let totalTransportationCost = 0;
//       let totalMaterialCharge = 0;

//       const parsedAreas = typeof areas === "string" ? JSON.parse(areas) : areas;

//       const existingEstimate = await Estimate.findOne({ clientId });

//       // Retrieve previous images if an estimate exists
//       const previousImages = existingEstimate ? existingEstimate.sheetingPrice.map(area => area.areaImage) : [];

//       updatedAreas = await Promise.all(parsedAreas.map(async (area, index) => {
//           if (!area.projectType || !area.roofModel) {
//               console.warn("Skipping area due to missing ProjectType or RoofModel", area);
//               return null;
//           }

//           let uploadedImageUrl = previousImages[index] || null; 

//           if (req.files && req.files[index]) {
//               uploadedImageUrl = req.files[index].path;
//           }

//           const calculatedArea = await calculateSheetingPrice(area);
//           calculatedArea.areaImage = uploadedImageUrl; 

//           totalAreaSqFt += calculatedArea.areaSqFt ?? 0;
//           totalSheetingCost += calculatedArea.totalSheetingPrice ?? 0;
//           totalMaterialCharge += calculatedArea.materialCharge?.totalCharge ?? 0;

//           return calculatedArea;
//       }));

//       updatedAreas = updatedAreas.filter(Boolean);

//       try {
//         const transportResult = await calculateTransportationCharge({ 
//             transportations, 
//             cranePrice, 
//             otherExpenses 
//         });
//         updatedTransportations = transportResult
//         console.log("trans",updatedTransportations);
        
//         totalTransportationCost = transportResult.totalTransportationCost;
//     } catch (error) {
//         console.error("Error calculating transportation charge:", error);
//     }
    

//       let calculatedLabourCharge = { 
//           totalLabourCharge: 0, 
//           foodAndAccommodation: 0, 
//           enquiryExpense: 0, 
//           transportationLabour: 0, 
//           weldingLabour: { totalCost: 0 }, 
//           sheetingLabour: { totalCost: 0 }
//       };

//       try {
//           calculatedLabourCharge = await calculateLabourCharge(labourData) ?? calculatedLabourCharge;
//       } catch (error) {
//           console.error("Error calculating labour charge:", error);
//       }

//       const finalTransportationCost = totalTransportationCost;
//       const totalProjectExpense = 
//           (totalSheetingCost ?? 0) + 
//           (finalTransportationCost ?? 0) + 
//           (calculatedLabourCharge.totalLabourCharge ?? 0) + 
//           (totalMaterialCharge ?? 0);

//       const marginPercentage = 15;
//       const marginAmount = (marginPercentage / 100) * totalProjectExpense;
//       const newProjectValue = marginAmount + totalProjectExpense;
//       const ratePerSqFt = totalAreaSqFt > 0 ? newProjectValue / totalAreaSqFt : 0;
//       const finalRate = (sellingRate ?? 0) * totalAreaSqFt;
//       const taxPercentage = 18;
//       const taxAmount = (taxPercentage / 100) * finalRate;
//       const totalBudget = finalRate + taxAmount;

//       if (existingEstimate) {
        
//           existingEstimate.siteVisitorId = siteVisitorId;
//           existingEstimate.sitevisitDate = sitevisitDate; 
//           existingEstimate.sitevisitTime = sitevisitTime;
//           existingEstimate.sheetingPrice = updatedAreas;
//           existingEstimate.transportations = updatedTransportations;
//           existingEstimate.labourCharge = calculatedLabourCharge;
//           existingEstimate.totalEstimate = totalProjectExpense;
//           existingEstimate.finalTransportationCost = finalTransportationCost;
//           existingEstimate.totalProjectExpense = totalProjectExpense;
//           existingEstimate.marginPercentage = marginPercentage;
//           existingEstimate.marginAmount = marginAmount;
//           existingEstimate.totalAreaSqFt = totalAreaSqFt;
//           existingEstimate.totalNumberofSheetAllArea = totalNumberofSheetAllArea;
//           existingEstimate.totalSheetingCost = totalSheetingCost;
//           existingEstimate.newProjectValue = newProjectValue;
//           existingEstimate.ratePerSqFt = ratePerSqFt;
//           existingEstimate.sellingRate = sellingRate;
//           existingEstimate.taxPercentage = taxPercentage;
//           existingEstimate.taxAmount = taxAmount;
//           existingEstimate.totalBudget = totalBudget;
//           existingEstimate.finalRate = finalRate;
//           existingEstimate.status = status;

//           await existingEstimate.save();

//           return res.status(200).json({ message: "Estimate updated successfully!", estimate: existingEstimate });
//       } else {
//           const newEstimate = new Estimate({
//               clientId,
//               siteVisitorId,
//               sitevisitDate,
//               sitevisitTime,
//               status,
//               sheetingPrice: updatedAreas,
//               transportations: updatedTransportations,
//               labourCharge: calculatedLabourCharge, 
//               totalMaterialCharge,
//               finalTransportationCost,
//               totalEstimate: totalProjectExpense, 
//               totalProjectExpense,
//               marginPercentage,
//               marginAmount,
//               totalAreaSqFt, 
//               totalNumberofSheetAllArea, 
//               totalSheetingCost,
//               newProjectValue,
//               ratePerSqFt,
//               sellingRate,
//               taxPercentage,
//               taxAmount,
//               totalBudget,
//               finalRate,
//           });

//           await newEstimate.save();

//           return res.status(201).json({ message: "Estimate calculated successfully!", estimate: newEstimate });
//       }
//   } catch (error) {
//       console.error("Error calculating estimate:", error);
//       return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };
export const calculateEstimate = async (req, res) => {
  try {
      const { 
          clientId,
          siteVisitorId, 
          sitevisitDate,
          sitevisitTime, 
          areas, 
          transportations = [], 
          labourData, 
          materialItems, 
          cranePrice = 0, 
          otherExpenses = 0, 
          sellingRate = 0,
          status,
          PercentageOfMargin,
          totalProjectCost
      } = req.body;
console.log("body",req.body);

      let totalAreaSqFt = 0;
      let totalNumberofSheetAllArea = 0;
      let totalSheetingCost = 0;
      let updatedAreas = [];
      let updatedTransportations = [];
      let totalTransportationCost = 0;
      let totalMaterialCharge = 0;

      const parsedAreas = Array.isArray(areas) 
      ? areas 
      : typeof areas === "string" 
          ? JSON.parse(areas) 
          : [];
  
  if (!Array.isArray(parsedAreas)) {
      return res.status(400).json({ message: "Invalid areas data format" });
  }

      const existingEstimate = await Estimate.findOne({ clientId });
      
      const previousImages = existingEstimate && Array.isArray(existingEstimate.sheetingPrice) 
          ? existingEstimate.sheetingPrice.map(area => area.areaImage) 
          : [];
          updatedAreas = await Promise.all(parsedAreas.map(async (area, index) => {
            if (!area || !area.projectType || !area.roofModel) {
                console.warn("Skipping area due to missing ProjectType or RoofModel", area);
                return null;
            }
            
            let uploadedImageUrl = previousImages[index]!= null?previousImages[index]:null;

            if (uploadedImageUrl==null) {
                const category = await Category.findOne({ _id: area.roofModel });
                if (category) {
                    uploadedImageUrl = category.roofModelImage;
                   }
            }
        
            
            if (req.files && req.files[index]) {
                uploadedImageUrl = req.files[index].path;
            }
            const calculatedArea = await calculateSheetingPrice(area);
            console.log(uploadedImageUrl);
            
            calculatedArea.areaImage = uploadedImageUrl;
        
            totalAreaSqFt += calculatedArea.areaSqFt ?? 0;
            totalSheetingCost += calculatedArea.totalSheetingPrice ?? 0;
            totalMaterialCharge += calculatedArea.materialCharge?.totalCharge ?? 0;
            totalNumberofSheetAllArea+=calculatedArea.totalNumberofSheet??0;
            return calculatedArea;
        }));

      updatedAreas = updatedAreas.filter(Boolean); 

      try {
        if (Array.isArray(transportations) && transportations.length > 0) {
            const transportResult = await calculateTransportationCharge({ 
                transportations, 
                cranePrice, 
                otherExpenses 
            });
    
            updatedTransportations = transportResult || [];
            totalTransportationCost =transportResult.totalTransportation
  
    // console.log("total",transportResult);
    
            console.log("🚀 New transportation data calculated:", updatedTransportations);
        } else {
        
            updatedTransportations = existingEstimate?.transportations || [];
            totalTransportationCost = existingEstimate?.finalTransportationCost ?? 0;
    
            console.log("⚠️ Keeping existing transportation data");
        }
    
        console.log("✅ Final Updated Transportations:", updatedTransportations);
    
    } catch (error) {
        console.error("❌ Error calculating transportation charge:", error);
    }
    
    
    

      let calculatedLabourCharge = { 
          totalLabourCharge: 0, 
          foodAndAccommodation: 0, 
          enquiryExpense: 0, 
          transportationLabour: 0, 
          weldingLabour: { totalCost: 0 }, 
          sheetingLabour: { totalCost: 0 }
      };

      try {
          calculatedLabourCharge = await calculateLabourCharge(labourData) ?? calculatedLabourCharge;
      } catch (error) {
          console.error("Error calculating labour charge:", error);
      }

      const finalTransportationCost = totalTransportationCost;
      const totalProjectExpense = 
          (totalSheetingCost ?? 0) + 
          (finalTransportationCost ?? 0) + 
          (calculatedLabourCharge.totalLabourCharge ?? 0) + 
          (totalMaterialCharge ?? 0);

      const marginPercentage = PercentageOfMargin ?? 15;
      const marginAmount = (marginPercentage / 100) * totalProjectExpense;
      const newProjectValue = marginAmount + totalProjectExpense;
     
      
      const ratePerSqFt = totalAreaSqFt > 0 ? newProjectValue / totalAreaSqFt : 0;
      const finalRate = (sellingRate ?? ratePerSqFt) * totalAreaSqFt;
      const gstRecord = await GST.findOne();
        const taxPercentage = gstRecord ? gstRecord.gstPercentage : 18; 
      const taxAmount = (taxPercentage / 100) * finalRate;
      const totalBudget = totalProjectCost??finalRate + taxAmount;

      if (existingEstimate) {
          
          existingEstimate.siteVisitorId = siteVisitorId || existingEstimate.siteVisitorId;
          existingEstimate.sitevisitDate = sitevisitDate || existingEstimate.sitevisitDate; 
          existingEstimate.sitevisitTime = sitevisitTime || existingEstimate.sitevisitTime;
          existingEstimate.sheetingPrice = updatedAreas.length > 0 ? updatedAreas : existingEstimate.sheetingPrice;
      
          existingEstimate.transportations = Array.isArray(updatedTransportations?.transportationslist) && updatedTransportations.transportationslist.length > 0 
          ? updatedTransportations 
          : existingEstimate.transportations;
      
          existingEstimate.labourCharge = calculatedLabourCharge.totalLabourCharge > 0 ? calculatedLabourCharge : existingEstimate.labourCharge;
          existingEstimate.totalEstimate = totalProjectExpense || existingEstimate.totalEstimate;
          existingEstimate.finalTransportationCost = finalTransportationCost || existingEstimate.finalTransportationCost;
          existingEstimate.totalProjectExpense = totalProjectExpense || existingEstimate.totalProjectExpense;
          existingEstimate.marginPercentage = marginPercentage || existingEstimate.marginPercentage;
          existingEstimate.marginAmount = marginAmount || existingEstimate.marginAmount;
          existingEstimate.totalmaterialCharge = totalMaterialCharge || existingEstimate.totalmaterialCharge;
          existingEstimate.totalAreaSqFt = totalAreaSqFt > 0 ? totalAreaSqFt : existingEstimate.totalAreaSqFt;
          existingEstimate.totalNumberofSheetAllArea = totalNumberofSheetAllArea > 0 ? totalNumberofSheetAllArea : existingEstimate.totalNumberofSheetAllArea;
          existingEstimate.totalSheetingCost = totalSheetingCost > 0 ? totalSheetingCost : existingEstimate.totalSheetingCost;
          existingEstimate.totalSheetingCost = totalSheetingCost > 0 ? totalSheetingCost : existingEstimate.totalSheetingCost;
          existingEstimate.newProjectValue = newProjectValue || existingEstimate.newProjectValue;
          existingEstimate.ratePerSqFt = ratePerSqFt || existingEstimate.ratePerSqFt;
          existingEstimate.sellingRate = sellingRate || existingEstimate.sellingRate;
          existingEstimate.taxPercentage = taxPercentage || existingEstimate.taxPercentage;
          existingEstimate.taxAmount = taxAmount || existingEstimate.taxAmount;
          existingEstimate.totalBudget = totalBudget > 0 ? totalBudget : existingEstimate.totalBudget;
          existingEstimate.finalRate = finalRate > 0 ? finalRate : existingEstimate.finalRate;
          existingEstimate.status = status || existingEstimate.status;

          await existingEstimate.save();

          return res.status(200).json({ message: "Estimate updated successfully!", estimate: existingEstimate });
      } else {
          const newEstimate = new Estimate({
              clientId,
              siteVisitorId,
              sitevisitDate,
              sitevisitTime,
              status,
              sheetingPrice: updatedAreas,
              transportations: updatedTransportations,
              labourCharge: calculatedLabourCharge, 
              totalMaterialCharge,
              finalTransportationCost,
              totalEstimate: totalProjectExpense, 
              totalProjectExpense,
              marginPercentage,
              marginAmount,
              totalAreaSqFt, 
              totalNumberofSheetAllArea, 
              totalSheetingCost,
              newProjectValue,
              ratePerSqFt,
              sellingRate,
              taxPercentage,
              taxAmount,
              finalRate,
              totalBudget,
          });

          await newEstimate.save();

          return res.status(201).json({ message: "Estimate calculated successfully!", estimate: newEstimate });
      }
  } catch (error) {
      console.error("Error calculating estimate:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



export const getEstimateById = async (req, res) => {
  try {
      const { id } = req.params;

      const estimate = await Estimate.findById(id)
          .populate("clientId")
          .populate("siteVisitorId")
          .populate({
              path: "sheetingPrice",
              populate: [
                  { path: "projectType" },
                  { path: "roofModel" },
                  {
                      path: "materialCharge.materials.itemId",
                      select: "item finalPerMeter", // Selecting required fields
                  },
              ],
          })
          .populate("transportations")
          .populate("labourCharge")
          .exec();

      if (!estimate) {
          return res.status(404).json({ message: "Estimate not found" });
      }

      res.status(200).json(estimate);
  } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getEstimateByClientId = async (req, res) => {
    const { clientId } = req.params;
  
    try {
      const estimates = await Estimate.find({ clientId })
        .populate("clientId")
        .populate("siteVisitorId")
        .populate({
          path: "sheetingPrice",
          populate: [
            { path: "projectType" },
            { path: "roofModel" },
            {
              path: "materialCharge.materials.itemId",
              select: "item finalPerMeter",
            },
          ],
        })
        .populate("transportations")
        .populate("labourCharge")
        .exec();
  
      if (!estimates || estimates.length === 0) {
        return res.status(404).json({ message: "No estimates found for this client" });
      }
  
      res.status(200).json(estimates);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };
  

export const getAllEstimates = async (req, res) => {
  try {
      const estimates = await Estimate.find()
          .populate("clientId")
          .populate("siteVisitorId")
          .populate({
              path: "sheetingPrice",
              populate: [
                  { path: "projectType" },
                  { path: "roofModel" },
                  {
                      path: "materialCharge.materials.itemId",
                      select: "item finalPerMeter",
                  },
              ],
          })
          .populate("transportations")
          .populate("labourCharge")
          .exec();

      if (!estimates || estimates.length === 0) {
          return res.status(404).json({ message: "No estimates found" });
      }

      res.status(200).json(estimates);
  } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
  }
};




// export const getEstimateByClient = async (req, res) => {
//   try {
//     const { clientId, phoneNo } = req.query;

//     let matchQuery = {};
    
//     if (clientId) {
//       matchQuery.clientId = new mongoose.Types.ObjectId(clientId);
//     } 

//     if (phoneNo) {
//       const client = await Client.findOne({ phoneNo }).select("_id");
//       if (client) {
//         matchQuery.clientId = client._id;
//       } else {
//         return res.status(404).json({ message: "Client not found with this phone number" });
//       }
//     }

//     const estimates = await Estimate.find(matchQuery)
//       .populate({
//         path: "clientId",
//         model: "Client",
//       })
//       .populate({
//         path: "siteVisitorId",
//         model: "User",
//       })
//       .populate({
//         path: "sheetingPrice.projectType",
//         model: "ProjectType",
//       })
//       .populate({
//         path: "sheetingPrice.roofModel",
//         model: "Category",
//       })
//       .populate({
//         path: "sheetingPrice.materialCharge.materials.itemId",
//         model: "Item",
//       });

//     if (!estimates.length) {
//       return res.status(404).json({ message: "No estimates found" });
//     }

//     res.status(200).json(estimates);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

export const getEstimateByClient = async (req, res) => {
  try {
    const { clientName, phoneNo } = req.query;

    let matchQuery = {};

    if (clientName) {
      const client = await Client.findOne({
        name: { $regex: `^${clientName}$`, $options: "i" } // Case-insensitive exact match
      }).select("_id");

      if (client) {
        matchQuery.clientId = client._id;
      } else {
        return res.status(404).json({ message: "Client not found with this name" });
      }
    }

    if (phoneNo) {
      const client = await Client.findOne({
        phoneNo: { $regex: `^${phoneNo}$`, $options: "i" } // Case-insensitive exact match
      }).select("_id");

      if (client) {
        matchQuery.clientId = client._id;
      } else {
        return res.status(404).json({ message: "Client not found with this phone number" });
      }
    }

    const estimates = await Estimate.find(matchQuery)
      .populate({
        path: "clientId",
        model: "Client",
      })
      .populate({
        path: "siteVisitorId",
        model: "User",
      })
      .populate({
        path: "sheetingPrice.projectType",
        model: "ProjectType",
      })
      .populate({
        path: "sheetingPrice.roofModel",
        model: "Category",
      })
      .populate({
        path: "sheetingPrice.materialCharge.materials.itemId",
        model: "Item",
      });

    if (!estimates.length) {
      return res.status(404).json({ message: "No estimates found" });
    }

    res.status(200).json(estimates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const deleteEstimate = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No estimates selected for deletion" });
    }

   
    const estimates = await Estimate.find({ _id: { $in: ids } });
    if (estimates.length !== ids.length) {
      return res.status(404).json({ message: "One or more estimates not found" });
    }

   
    await Estimate.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ message: "Selected estimates deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting estimates", error });
  }
};


