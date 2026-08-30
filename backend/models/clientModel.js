import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
    unique: true, 
  },
  place: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  comments: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

export default mongoose.model("Client", clientSchema);
