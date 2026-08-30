import Transportation from '../../../models/transportationModel.js';

export const calculateTripCost = async (req, res) => {
  try {
    const { vehicleType, km, numberOfTrips } = req.body;

    if (!vehicleType || !km || !numberOfTrips) {
      return res.status(400).json({ message: 'Vehicle type, kilometers, and number of trips are required.' });
    }

    if (numberOfTrips <= 0) {
      return res.status(400).json({ message: 'Number of trips must be greater than 0.' });
    }

    const vehicle = await Transportation.findOne({ vehicleType });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle type not found.' });
    }

    let costPerTrip;

    if (km <= vehicle.minKmCovered) {
      costPerTrip = vehicle.minCharge;
    } else {
      const additionalKm = km - vehicle.minKmCovered;
      const additionalCharge = additionalKm * vehicle.perKmCharge;
      costPerTrip = vehicle.minCharge + additionalCharge;
    }

    const totalCost = costPerTrip * numberOfTrips;

    return res.status(200).json({
      vehicleType,
      km,
      numberOfTrips,
      costPerTrip,
      totalCost,
      message: `The total cost for ${numberOfTrips} trip(s) of ${km} km each with ${vehicleType} is ₹${totalCost}.`,
    });
  } catch (error) {
    console.error('Error calculating trip cost:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const addTransportation = async (req, res) => {
  try {
    const { vehicleType, minCharge, minKmCovered, perKmCharge, petrolCharge } = req.body;

    if (!vehicleType || !minCharge || !minKmCovered || !perKmCharge) {
      return res.status(400).json({ message: 'All fields are required (vehicleType, minCharge, minKmCovered, perKmCharge).' });
    }

    const existingVehicle = await Transportation.findOne({ vehicleType });
    if (existingVehicle) {
      return res.status(400).json({ message: `Transportation type '${vehicleType}' already exists.` });
    }

    const newTransportation = new Transportation({
      vehicleType,
      minCharge,
      minKmCovered,
      perKmCharge,
      petrolCharge: petrolCharge || 115,
    });

    await newTransportation.save();

    return res.status(201).json({ message: 'Transportation added successfully.', data: newTransportation });
  } catch (error) {
    console.error('Error adding transportation:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// export const editTransportation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { vehicleType, minCharge, minKmCovered, perKmCharge, petrolCharge } = req.body;

//     const updateData = {};
//     if (vehicleType) {
//       if (!['Eicher', 'Trailer'].includes(vehicleType)) {
//         return res.status(400).json({ message: 'Invalid vehicleType. Must be "Eicher" or "Trailer".' });
//       }
//       updateData.vehicleType = vehicleType;
//     }
//     if (minCharge !== undefined) updateData.minCharge = minCharge;
//     if (minKmCovered !== undefined) updateData.minKmCovered = minKmCovered;
//     if (perKmCharge !== undefined) updateData.perKmCharge = perKmCharge;
//     if (petrolCharge !== undefined) updateData.petrolCharge = petrolCharge;

//     if (Object.keys(updateData).length === 0) {
//       return res.status(400).json({ message: 'No data provided to update.' });
//     }

//     const updatedTransportation = await Transportation.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     if (!updatedTransportation) {
//       return res.status(404).json({ message: 'Transportation record not found.' });
//     }

//     return res.status(200).json({ message: 'Transportation updated successfully.', data: updatedTransportation });
//   } catch (error) {
//     console.error('Error updating transportation:', error);
//     return res.status(500).json({ message: 'Internal server error.' });
//   }
// };

export const editTransportation = async (req, res) => {
  try {
 
    const { vehicleType,minCharge, minKmCovered, perKmCharge, petrolCharge } = req.body;
 
    // Find the transportation record by vehicleType
    const transportation = await Transportation.findOne({ vehicleType });
 
    if (!transportation) {
      return res.status(404).json({ message: "Vehicle type not found" });
    }
 
    // Update fields if provided
    if (minCharge !== undefined) transportation.minCharge = minCharge;
    if (minKmCovered !== undefined) transportation.minKmCovered = minKmCovered;
    if (perKmCharge !== undefined) transportation.perKmCharge = perKmCharge;
    if (petrolCharge !== undefined) transportation.petrolCharge = petrolCharge;
 
    // Save updated record
    await transportation.save();
 
    res.status(200).json({ message: "Transportation details updated successfully", transportation });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllTransportation = async (req, res) => {
  try {
    const transportationList = await Transportation.find();
    res.status(200).json(transportationList);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTransportationByType = async (req, res) => {
  try {
    const { vehicleType } = req.body;

    const transportation = await Transportation.findOne({ vehicleType });

    if (!transportation) {
      return res.status(404).json({ message: "Vehicle type not found" });
    }

    res.status(200).json(transportation);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
