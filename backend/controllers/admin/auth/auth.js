import User from "../../../models/userModel.js";
import { generateToken ,generateResetToken } from "../../../utils/generateToken.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendEmail from "../../../middlewares/nodeMailer.js";

export const login = async (req, res) => {
  const { mailId, password } = req.body;

  try {
    const user = await User.findOne({ mailId });

    if (!user) {
      return res.status(404).json({ message: "Invalid username or password. Please try again" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password. Please try again" });
    }

    const userType = user.isAdmin
      ? "admin"
      : user.isSales
      ? "sales"
      : user.isSiteVisitor
      ? "siteVisitor"
      : user.isRates
      ? "rates"
      : "user";

    const token = generateToken(res, user._id);

    res.status(200).json({
      token, // Include the token in the response body
      userType,
      user: {
        _id: user._id,
        name: user.name,
        mailId: user.mailId,
        mobileNumber: user.mobileNumber,
        location: user.location,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Error during login.", error });
  }
};



export const requestOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ mailId: email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await user.hashOtp(otp);

    user.resetOtp = hashedOtp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000; 
    await user.save();

    const subject = "Password Reset OTP";
    const text = `Dear ${user.name},

Your OTP for password reset is: ${otp}

This OTP is valid for 10 minutes.

If you did not request a password reset, please ignore this email.

Regards,
HR Team`;

    await sendEmail(user.mailId, subject, text);

    res.status(200).json({ email: user.mailId });
  } catch (error) {
    console.error("OTP Request Error:", error);
    res.status(500).json({ message: "Error requesting OTP.", error });
  }
};


export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ mailId: email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.resetOtp || user.resetOtpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    const isMatch = await user.compareOtp(otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP." });

    const token = generateResetToken(res, user._id);

    res.status(200).json({ message: "OTP verified successfully.", token });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP.", error });
  }
};


export const resetPassword = async (req, res) => {
  const { newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;

    await user.save();

    res.clearCookie("resetToken"); 
    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password.", error });
  }
};
