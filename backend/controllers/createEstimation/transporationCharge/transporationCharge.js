// import Transportation from "../../../models/transportationModel.js";

// export const calculateTransportationCharge = async ({ transportations = [], cranePrice = 0, otherExpenses = 0 }) => {
//     if (!transportations || !Array.isArray(transportations)) {
//         throw new Error("Invalid transportations data. Expected an array.");
//     }
    
//     try {
//         let totalTransportationCost = 0;

//         console.log("Transportations Data:", transportations);

//         const updatedTransportations = await Promise.all(
//             transportations.map(async (transport) => {
//                 if (!transport.vehicleType || !transport.totalKilometer || transport.numberOfTrips === undefined) {
//                     throw new Error("Missing transportation data fields.");
//                 }
        
//                 if (!Number.isInteger(transport.numberOfTrips) || transport.numberOfTrips < 0) {
//                     throw new Error("Invalid number of trips. It must be a non-negative integer.");
//                 }

//                 const { vehicleType, totalKilometer, numberOfTrips } = transport;

//                 const transportData = await Transportation.findOne({ vehicleType });

//                 if (!transportData) {
//                     throw new Error(`Transportation details not found for vehicle type: ${vehicleType}`);
//                 }

//                 const { petrolCharge } = transportData;
//                 console.log("petrol",petrolCharge);
                
//                 let transportCost = 0;

//                 switch (vehicleType) {
//                     case "Ace":
//                         transportCost =
//                             ((totalKilometer * numberOfTrips * 2) / 10) * petrolCharge +
//                             ((totalKilometer * numberOfTrips * 2) / 100) * 300;
//                         break;
//                     case "Eicher":
//                         transportCost =
//                             ((totalKilometer * numberOfTrips * 2) / 5) * petrolCharge +
//                             ((totalKilometer * numberOfTrips * 2) / 100) * 300;
//                         break;
//                     case "Trailer":
//                         transportCost =
//                             ((totalKilometer * numberOfTrips * 2) / 3) * petrolCharge +
//                             ((totalKilometer * numberOfTrips * 2) / 100) * 300;
//                         break;
//                     default:
//                         throw new Error(`Unsupported vehicle type: ${vehicleType}`);
//                 }

//                 totalTransportationCost += transportCost;

//                 return {
//                     vehicleType,
//                     totalKilometer,
//                     numberOfTrips,
//                     price: transportCost,
//                 };
//             })
//         );

//         totalTransportationCost += cranePrice + otherExpenses;

//         return {
//             transportationslist: updatedTransportations,
//             cranePrice,
//             otherExpenses,
//             totalTransporation:totalTransportationCost
//         };
//     } catch (error) {
//         throw new Error(`Error calculating transportation charge: ${error.message}`);
//     }
// };


// export const getTotalTransportationCost = async (params) => {
//     const { totalTransportationCost } = await calculateTransportationCharge(params);
//     return totalTransportationCost;
// };

import Transportation from "../../../models/transportationModel.js";

export const calculateTransportationCharge = async ({ transportations = [], cranePrice = 0, otherExpenses = 0 }) => {
    console.log("transportations", transportations);
    
    if (!transportations || !Array.isArray(transportations)) {
        throw new Error("Invalid transportations data. Expected an array.");
    }
    
    try {
        let totalTransportationCost = 0;

        console.log("Transportations Data:", transportations);

        const updatedTransportations = await Promise.all(
            transportations.map(async (transport) => {
                if (!transport.vehicleType || !transport.totalKilometer || transport.numberOfTrips === undefined) {
                    throw new Error("Missing transportation data fields.");
                }
        
                if (!Number.isInteger(transport.numberOfTrips) || transport.numberOfTrips < 0) {
                    throw new Error("Invalid number of trips. It must be a non-negative integer.");
                }

                const { vehicleType, totalKilometer, numberOfTrips } = transport;

                const transportData = await Transportation.findOne({ vehicleType });
console.log("transportData", transportData);

                if (!transportData) {
                    throw new Error(`Transportation details not found for vehicle type: ${vehicleType}`);
                }

                const { perKmCharge, minCharge, petrolCharge } = transportData;
                console.log(`Vehicle: ${vehicleType}, Per KM Charge: ${perKmCharge}, Min Charge: ${minCharge}`);

                let transportCost = 0;

                switch (vehicleType) {
                    case "Ace":
                        transportCost =
                            ((totalKilometer * numberOfTrips * 2) / 10) * petrolCharge +
                            ((totalKilometer * numberOfTrips * 2) / 100) * 300;
                        break;
                    case "Eicher":
                    case "Trailer":
                        transportCost = (totalKilometer * perKmCharge * numberOfTrips * 2) + minCharge;
                        break;
                    default:
                        throw new Error(`Unsupported vehicle type: ${vehicleType}`);
                }

                totalTransportationCost += transportCost;

                return {
                    vehicleType,
                    totalKilometer,
                    numberOfTrips,
                    price: transportCost,
                };
            })
        );

        totalTransportationCost += cranePrice + otherExpenses;

        return {
            transportationslist: updatedTransportations,
            cranePrice,
            otherExpenses,
            totalTransportation: totalTransportationCost
        };
    } catch (error) {
        throw new Error(`Error calculating transportation charge: ${error.message}`);
    }
};

export const getTotalTransportationCost = async (params) => {
    const { totalTransportation } = await calculateTransportationCharge(params);
    return totalTransportation;
};