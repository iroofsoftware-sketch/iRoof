import mongoose from 'mongoose';

const projectTypeSchema = new mongoose.Schema(
    {
        projectType: {
            type: String,
            required: true,
            unique: true, 
        }
    },
    { timestamps: true }
);

const Category = mongoose.model('ProjectType', projectTypeSchema);

export default Category;
