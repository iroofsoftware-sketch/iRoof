import mongoose from 'mongoose';

const gstSchema = new mongoose.Schema(
    {
        gstPercentage: {
            type: Number,
            required: true, 
        },
    },
    { timestamps: true }  
);

const GST = mongoose.model('GST', gstSchema); 

export default GST;
