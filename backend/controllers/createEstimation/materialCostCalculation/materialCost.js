import Items from "../../../models/itemModel.js";
import mongoose from "mongoose";

export const calculateMaterialCharge = async (materialItems) => {
    console.log(" Material Items Received:", materialItems);

    try {
        let totalCharge = 0;
        let processedItems = [];

        
        if (!Array.isArray(materialItems) || materialItems.length === 0) {
            console.log("❌ No material items provided");
            return { totalCharge: 0, materials: [] };
        }

    
        for (const material of materialItems) {
            const { itemId, unit } = material;

           
            if (!mongoose.Types.ObjectId.isValid(itemId)) {
                console.log(`❌ Invalid item ID: ${itemId}`);
                continue;
            }

            
            const item = await Items.findById(itemId);

          
            if (!item) {
                console.log(`❌ Item with ID ${itemId} not found`);
                continue;
            }

           
            const cost = item.finalPerMeter * unit;
        
            totalCharge += cost;

      
            processedItems.push({
                itemId: item._id,
                itemName: item.item,   
                unit,
                ratePerMeter: item.finalPerMeter,
                cost,
            });
        }

      
        console.log("Processed Items:", processedItems);

        return { 
            totalCharge: parseFloat(totalCharge.toFixed(2)), 
            materials: processedItems 
        };
    } catch (error) {
        console.error(" Error calculating material charge:", error);
        return { totalCharge: 0, materials: [] };
    }
};
