import Category from '../../../models/productCategoryModel.js';
import ProjectType from "../../../models/projuctTypeModel.js";



export const addProjectType = async (req, res) => {
    try {
        const { projectType } = req.body;

        if (!projectType) {
            return res.status(400).json({ success: false, message: "Project Type is required" });
        }

        const existingType = await ProjectType.findOne({ projectType });

        if (existingType) {
            return res.status(400).json({ success: false, message: "Project Type already exists" });
        }

        const newProjectType = new ProjectType({ projectType });
        await newProjectType.save();

        res.status(201).json({ success: true, message: "Project Type added successfully", projectType: newProjectType });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding project type", error: error.message });
    }
};


export const getAllProjectTypes = async (req, res) => {
    try {
        const projectTypes = await ProjectType.find();
        res.status(200).json({ success: true, projectTypes });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching project types", error: error.message });
    }
};


export const getProjectTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const projectType = await ProjectType.findById(id);

        if (!projectType) {
            return res.status(404).json({ success: false, message: "Project Type not found" });
        }

        res.status(200).json({ success: true, projectType });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching project type", error: error.message });
    }
};




export const createCategory = async (req, res) => {
    try {
        const { roofModel, roofType } = req.body;

        if (!roofModel || !roofType) {
            return res.status(400).json({ success: false, message: "Roof Model and Roof Type are required" });
        }

        // Check if the provided roofType exists
        const existingProjectType = await ProjectType.findById(roofType);
        if (!existingProjectType) {
            return res.status(400).json({ success: false, message: "Invalid Roof Type ID" });
        }

        // Check if the category with the same roofModel already exists
        const existingCategory = await Category.findOne({ roofModel });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Roof Model already exists" });
        }

        // Handle image upload
        let roofModelImage = null;
        if (req.file) {
            roofModelImage = req.file.path; // Cloudinary returns the image URL in req.file.path
        }

        const newCategory = new Category({ roofModel, roofType, roofModelImage });
        await newCategory.save();

        res.status(200).json({ success: true, message: "Category added successfully", category: newCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding category", error: error.message });
    }
};



export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate("roofType"); // Populating roofType from ProjectType
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching categories", error: error.message });
    }
};


export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id).populate("roofType");

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching category", error: error.message });
    }
};

