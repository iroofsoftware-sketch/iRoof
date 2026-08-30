import User from "../../../models/userModel.js";


export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password"); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const editUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, mobileNumber, password } = req.body;

  
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

 
    if (name) user.name = name;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (password) user.password = password; 

   
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
 
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
 
    // Change password
    await user.changePassword(oldPassword, newPassword);
 
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
 
