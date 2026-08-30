import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        roofModel: {
            type: String,
            required: true,
            unique: true, 
        },
        roofModelImage: {
            type: String,
         
        },
         roofType: {
                   type: mongoose.Schema.Types.ObjectId,
                   ref: 'ProjectType', 
                   required: true
               },
    },
    { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
