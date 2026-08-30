import User from "../../../models/userModel.js";
import cloudinary from "../../../utils/cloudinary.js";
import bcrypt from "bcrypt";


export const addUser = async (req, res) => {
    try {
      const {
        name,
        mailId,
        mobileNumber,
        designations,
        location,
        address,
        password,
      } = req.body;
   
      const existingUser = await User.findOne({ mailId });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists." });
      }
   
      let isAdmin = false;
      let isSales = false;
      let isSiteVisitor = false;
      let isRates = false;
   
      if (designations === "admin") {
        isAdmin = true;
      } else if (designations === "Sales") {
        isSales = true;
      } else if (designations === "Site Visitor") {
        isSiteVisitor = true;
      }
      else if (designations === "Rates") {
        isRates = true;
      }
   
      const newUser = new User({
        name,
        mailId,
        mobileNumber,
        designations,
        location,
        address,
        password,
        isAdmin,
        isSales,
        isRates,
        isSiteVisitor,
      });
   
      await newUser.save();
   
      newUser.password = undefined;
   
      return res
        .status(201)
        .json({ user: newUser });
    } catch (error) {
      console.error("Error adding user:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };

export const getUsers = async (req, res) => {
    try {
        const employees = await User.find().sort({ createdAt: -1 });
        res.status(200).json(employees);
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ error: "An error occurred while fetching users." });
    }
};


export const editUser = async (req, res) => {
  try {
    console.log("heloo edittttt");
    
    const { userId } = req.params;
    const {
      name,
      mobileNumber,
      designations,
      location,
      address,
    } = req.body;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update user fields only if new values are provided
    user.name = name ?? user.name;
    user.mailId = user.mailId;
    user.mobileNumber = mobileNumber ?? user.mobileNumber;
    user.designations = designations ?? user.designations;
    user.location = location ?? user.location;
    user.address = address ?? user.address;

    // Update role flags based on designations (if changed)
    if (designations !== undefined && designations !== null) {
      user.isAdmin = designations === "admin";
      user.isSales = designations === "Sales";
      user.isSiteVisitor = designations === "Site Visitor";
      user.isRates = designations === "Rates";
    }

    // Save updated user data
    await user.save();

    // Remove password from response
    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


export const getUserById = async (req, res) => {
  try {
    console.log("heloooo");
      const userId = req.params.userId;
      console.log(userId);
      const user = await User.findById(userId).select("-password");

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
  } catch (error) {
      res.status(500).json({ message: "Server error", error });
  }
};

export const deleteMultipleEmployees = async (req, res) => {
  try {
    const { employeIds } = req.body; 
console.log(employeIds);

    if (!employeIds || !Array.isArray(employeIds) ) {
      return res.status(400).json({ message: "Invalid request. Provide an array of employee IDs." });
    }

    const result = await User.deleteMany({ _id: { $in: employeIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No employees found to delete." });
    }

    res.status(200).json({
      message: "Employees deleted successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting employees:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
