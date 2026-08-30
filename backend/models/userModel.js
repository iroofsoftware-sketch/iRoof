import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mailId: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
    },
    designations: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String, 
    },
    coverImage: {
      type: String, 
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isSales: {
      type: Boolean,
      default: false,
    },
    isSiteVisitor: {
      type: Boolean,
      default: false,
    },
    isRates: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: false,
    },
    resetOtp: {
      type: String,
    },
    resetOtpExpire: { type: Date },
  },
  { timestamps: true }
);

// Hash Password Before Saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare Password
UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Hash OTP
UserSchema.methods.hashOtp = async function (otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

// Compare OTP
UserSchema.methods.compareOtp = async function (otp) {
  return bcrypt.compare(otp, this.resetOtp);
};

// Change Password
UserSchema.methods.changePassword = async function (oldPassword, newPassword) {
  const isMatch = await bcrypt.compare(oldPassword, this.password);
  if (!isMatch) {
    throw new Error("Old password is incorrect");
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(newPassword, salt);

  await this.save();
};

export default mongoose.model("User", UserSchema);
