import LabourCost from "../../../models/labourCostModel.js"; 

export const calculateLabourCharge = async (labourData) => {
    try {
        console.log("labourData:", labourData); 

        const { sheetingLabour, weldingLabour, transportationLabour, enquiryExpense, foodAndAccommodation } = labourData;

        if (!sheetingLabour || !weldingLabour) {
            throw new Error("Labour cost details  Missing");
        }

        const sheetingLabourCost = await LabourCost.findOne({ category: "Sheeting" });
        const weldingLabourCost = await LabourCost.findOne({ category: "Welding" });

        if (!sheetingLabourCost || !weldingLabourCost) {
            throw new Error("Labour cost details not found in database.");
        }


        const totalSheetingLocalCost = sheetingLabour.localWorkers * sheetingLabourCost.localWork;
        const totalSheetingSiteCost = sheetingLabour.siteWorkers * sheetingLabourCost.siteWork;
        const totalSheetingCost = totalSheetingLocalCost + totalSheetingSiteCost;

        const totalWeldingLocalCost = weldingLabour.localWorkers * weldingLabourCost.localWork;
        const totalWeldingSiteCost = weldingLabour.siteWorkers * weldingLabourCost.siteWork;
        const totalWeldingCost = totalWeldingLocalCost + totalWeldingSiteCost;

        const totalLabourCharge = totalSheetingCost + totalWeldingCost + transportationLabour + enquiryExpense + foodAndAccommodation;

        return {
            sheetingLabour: {
                localWork: totalSheetingLocalCost,
                siteWork: totalSheetingSiteCost,
                totalCost: totalSheetingCost
            },
            weldingLabour: {
                localWork: totalWeldingLocalCost,
                siteWork: totalWeldingSiteCost,
                totalCost: totalWeldingCost
            },
            transportationLabour,
            enquiryExpense,
            foodAndAccommodation,
            totalLabourCharge
        };

    } catch (error) {
        console.error("Error calculating labour charge:", error);
        throw new Error("Labour charge calculation failed.");
    }
};

