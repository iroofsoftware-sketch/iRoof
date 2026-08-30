import Client from "../../../models/clientModel.js";
import Estimate from "../../../models/estimateModel.js";


export const addClient = async (req, res) => {
  try {
    const { name, phoneNo, place, district, comments } = req.body;

   
    const existingClient = await Client.findOne({ phoneNo });
    if (existingClient) {
      return res.status(400).json({ message: "Client with this phone number already exists" });
    }

    
    const newClient = new Client({
      name,
      phoneNo,
      place,
      district,
      comments,
    });

    await newClient.save();
    res.status(201).json({ message: "Client added successfully", client: newClient });
  } catch (error) {
    res.status(500).json({ message: "Failed to add client", error: error.message });
  }
};



export const getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 }); 
    console.log(clients);

    res.status(200).json({ clients });
  } catch (error) {
    console.error("Error fetching clients:", error.message);
    res.status(500).json({ error: "An error occurred while fetching clients." });
  }
};



export const deleteMultipleClients = async (req, res) => {
  try {
    const { clientIds } = req.body;

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide an array of client IDs." });
    }

    // Check if any of the clients have estimates
    const clientsWithEstimates = await Estimate.find({ clientId: { $in: clientIds } });

    if (clientsWithEstimates.length > 0) {
      return res.status(400).json({
        message: "Some clients cannot be deleted as they have linked estimates.",
        clientsWithEstimates: clientsWithEstimates.map((est) => est.clientId),
      });
    }

    // Delete clients who have no estimates
    const result = await Client.deleteMany({ _id: { $in: clientIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No clients found to delete." });
    }

    res.status(200).json({
      message: "Clients deleted successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const logoutController = (req, res) => {
 const isProduction = process.env.NODE_ENV === "production";
res.cookie("token", "", {
    httpOnly: true,
    secure: isProduction, 
    sameSite: isProduction ? "None" : "Lax",
    expires: new Date(0),
    path: "/",
  });

  return res.status(200).json({ message: "Logout successful" });
};


