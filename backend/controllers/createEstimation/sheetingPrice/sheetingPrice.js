// // sheetingPrice.js
// import ThicknessPricing from "../../../models/thicknessModel.js";

// export const calculateSheetingPrice = async (area) => {
//     const { span, length, typeOfPanel, offset = 0, sheetThickness,noOfBay=1,NoofWorkingDays,extraPanel=0 } = area;

//     const centerHeight = span / 5;  
//     const noOfPanels = Math.round(length / typeOfPanel); 
//     const totalnoOfPanels = Math.round(length / typeOfPanel)+extraPanel; 
//     const totalNumberofSheet=(noOfPanels*noOfBay)+extraPanel;
//     let calculatedOffset = offset > 0 ? offset * 2.8 : 0;  
//     const cuttingLength = span + ((8 * Math.pow(centerHeight, 2)) / (3 * span)); 
//     const finalCuttingLength = cuttingLength + calculatedOffset;  
//     const newLength = noOfPanels * typeOfPanel; 
//     const finalNewlength=totalNumberofSheet*typeOfPanel
//      const totalNewLength= newLength*noOfBay;
     
//     const areaSqFt =Math.round(((finalCuttingLength * finalNewlength)*10.76));  


//     const thicknessData = await ThicknessPricing.findOne({ thickness: sheetThickness });
//     const pricePerSqFt = thicknessData ? thicknessData.sellingPrice : 0; 
//     const totalSheetingPrice = areaSqFt * pricePerSqFt; 

//     return {
//         ...area,
//         centerHeight,
//         noOfPanels,
//         cuttingLength,
//         finalCuttingLength,
//         newLength,
//         areaSqFt,
//         pricePerSqFt,
//         totalSheetingPrice,
//         totalnoOfPanels,
//         finalNewlength,
//         NoofWorkingDays,
//         totalNumberofSheet,
//         totalNewLength
//     };
// };

// sheetingPrice.js
// import ThicknessPricing from "../../../models/thicknessModel.js";

// export const calculateSheetingPrice = async (area) => {
//     const { 
//         span, 
//         length,
//         height, 
//         typeOfPanel, 
//         offset = 0, 
//         sheetThickness, 
//         noOfBay = 1, 
//         NoofWorkingDays, 
//         extraPanel = 0, 
//         noOfPanels: reqNoOfPanels, 
//         newLength: reqNewLength, 
//         areaSqFt: reqAreaSqFt, 
//         pricePerSqFt: reqPricePerSqFt, 
//         totalSheetingPrice: reqTotalSheetingPrice 
//     } = area;

//     // Check if span, length, noOfPanels, newLength, areaSqFt, pricePerSqFt already exists in request
//     const centerHeight = span ? (span / 5) : (area.centerHeight || 0);
//     const noOfPanels = reqNoOfPanels || Math.round(length / typeOfPanel);
//     const totalnoOfPanels = Math.round(length / typeOfPanel) + extraPanel;
//     const totalNumberofSheet = (noOfPanels * noOfBay) + extraPanel;

//     let calculatedOffset = offset > 0 ? offset * 2.8 : 0;
//     const cuttingLength = span ? (span + ((8 * Math.pow((span / 5), 2)) / (3 * span))) : (area.cuttingLength || 0);
//     const finalCuttingLength = cuttingLength + calculatedOffset;
    
//     const newLength = reqNewLength || (noOfPanels * typeOfPanel);
//     const finalNewlength = totalNumberofSheet * typeOfPanel;
//     const totalNewLength = newLength * noOfBay;

//     // Check if areaSqFt is already provided, if not calculate it
//     const areaSqFt = reqAreaSqFt || Math.round(((finalCuttingLength * finalNewlength) * 10.76));

//     // Check if pricePerSqFt is provided, if not fetch from database
//     let pricePerSqFt = reqPricePerSqFt;
//     if (!reqPricePerSqFt) {
//         const thicknessData = await ThicknessPricing.findOne({ thickness: sheetThickness });
//         pricePerSqFt = thicknessData ? thicknessData.sellingPrice : 0;
//     }

//     // Check if totalSheetingPrice is provided, if not calculate it
//     const totalSheetingPrice = reqTotalSheetingPrice || (areaSqFt * pricePerSqFt);

//     return {
//         ...area,
//         centerHeight,
//         noOfPanels,
//         cuttingLength,
//         finalCuttingLength,
//         newLength,
//         areaSqFt,
//         pricePerSqFt,
//         totalSheetingPrice,
//         totalnoOfPanels,
//         finalNewlength,
//         NoofWorkingDays,
//         totalNumberofSheet,
//         totalNewLength
//     };
// };


import ThicknessPricing from "../../../models/thicknessModel.js";
import ProjectType from "../../../models/projuctTypeModel.js";
import Category from "../../../models/productCategoryModel.js";
import { calculateMaterialCharge } from "../../createEstimation/materialCostCalculation/materialCost.js"; 

export const calculateSheetingPrice = async (area) => {
    const { 
        span, 
        length, 
        height,
        typeOfPanel, 
        offset = 0, 
        sheetThickness, 
        noOfBay = 1, 
        NoofWorkingDays=0, 
        extraPanel = 0, 
        noOfPanels: reqNoOfPanels, 
        newLength: reqNewLength, 
        areaSqFt: reqAreaSqFt, 
        pricePerSqFt: reqPricePerSqFt, 
        totalSheetingPrice: reqTotalSheetingPrice,
        projectType,
        roofModel,
        roofPreference,
        materialItems,
        areaImage =null
    } = area;

  
    if (!projectType || !roofModel) {
        throw new Error("ProjectType or RoofModel ID is missing.");
    }

   
    if (projectType.length !== 24 || roofModel.length !== 24) {
        throw new Error("Invalid ProjectType or RoofModel ID.");
    }

    
    const projectTypeData = await ProjectType.findById(projectType).catch(() => null);
    const roofModelData = await Category.findById(roofModel).catch(() => null);

    if (!projectTypeData || !roofModelData) {
        throw new Error("Invalid Project Type or Roof Model.");
    }

  
    const centerHeight = span ? (span / 5) : (area.centerHeight || 0);

   
    const noOfPanels = reqNoOfPanels || Math.round(length / typeOfPanel);
    const totalnoOfPanels = Math.round(length / typeOfPanel) + extraPanel;
    const totalNumberofSheet = (noOfPanels * noOfBay) + extraPanel;

  
    let calculatedOffset = offset > 0 ? offset * 2.8 : 0;

 
    const cuttingLength = span ? (span + ((8 * Math.pow((span / 5), 2)) / (3 * span))) : (area.cuttingLength || 0);
    const finalCuttingLength = cuttingLength + calculatedOffset;


    const newLength = reqNewLength || (noOfPanels * typeOfPanel);
    const finalNewlength = totalNumberofSheet * typeOfPanel;
    const totalNewLength = newLength * noOfBay;

    
    const areaSqFt = reqAreaSqFt || Math.round(((finalCuttingLength * finalNewlength) * 10.76));

   
    let pricePerSqFt = reqPricePerSqFt;
    if (!reqPricePerSqFt) {
        const thicknessData = await ThicknessPricing.findOne({ thickness: sheetThickness });
        pricePerSqFt = thicknessData ? thicknessData.sellingPrice : 0;
    }
    let materialCharge = 0;
     try {
              materialCharge = await calculateMaterialCharge(materialItems);
    
           
              if (materialCharge.materials.length > 0) {
                  console.log("✅ Saving Material Charge in Estimate");
              }
    
          } catch (error) {
              console.error("Error calculating material charge:", error);
              materialCharge = { totalCharge: 0, materials: [] };
          }

    const totalSheetingPrice = reqTotalSheetingPrice || (areaSqFt * pricePerSqFt);


    return {
        ...area,
        centerHeight,
        noOfPanels,
        cuttingLength,
        finalCuttingLength,
        newLength,
        areaSqFt,
        pricePerSqFt,
        totalSheetingPrice,
        totalnoOfPanels,
        finalNewlength,
        NoofWorkingDays,
        totalNumberofSheet,
        totalNewLength,
        projectType: projectTypeData,  
        roofModel: roofModelData,
        roofPreference,
        materialCharge,
        areaImage
    };
};
