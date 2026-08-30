import User from "../../../models/userModel.js";

export const getMyProfile = async (req, res) => {
    try {
        const {userId} = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error.message);
        res.status(500).json({ error: "An error occurred while fetching user." });
    }
}

export const editMyProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const { name, mobileNumber, oldPassword, newPassword } = req.body;

        console.log("bodyyyyyyyy:",req.body);
        

        
        if (!oldPassword) {
            return res.status(400).json({ message: "Old password is required." });
        }

       
        if (newPassword && newPassword.trim() === '') {
            return res.status(400).json({ message: "New password cannot be empty." });
        }

        
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect." });
        }

        
        user.name = name;
        user.mailId = mailId;
        user.mobileNumber = mobileNumber;

       
        if (newPassword) {
            user.password = newPassword;
        }

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).json({ error: "An error occurred while updating user." });
    }
};


