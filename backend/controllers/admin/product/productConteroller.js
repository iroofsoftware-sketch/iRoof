import Product from '../../../models/productModel.js';
import mongoose from "mongoose";
import upload from "../../../middlewares/Multer.js";




export const addProduct = async (req, res) => {
  try {
    const {
      roofType,
      roofModel,
      roofPreference,
      materials,
      span,
      length,
      height,
      typeOfPanel,
      sheetThickness,
      numberOfPanels,
      newLength,
      centerHeight,
      finalCuttingLength,
      totalArea,
      sheetRate,
    } = req.body;
console.log( req.body);
console.log( "file",req.body);

    // Parse JSON materials if needed


    // ✅ Get the uploaded image URL directly from Multer-Cloudinary
    const imageUrl = req.file ? req.file.path : ""; // No need for manual upload

    // ✅ Create a new product with Cloudinary image URL
    const newProduct = new Product({
      roofType,
      roofModel,
      roofPreference,
      materials: materials,
      span,
      length,
      height,
      typeOfPanel,
      sheetThickness,
      numberOfPanels,
      newLength,
      centerHeight,
      finalCuttingLength,
      totalArea,
      sheetRate,
      uploadImage: imageUrl, // ✅ Directly use Multer-Cloudinary's path
    });

    await newProduct.save();
    return res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};




// export const updateProduct = async (req, res) => {  

//         const { id } = req.params;  

//         const {   
//             roofType,   
//             roofModel,   
//             roofPreference,   
//             materials,   
//             span,   
//             length,   
//             height,   
//             typeOfPanel,   
//             sheetThickness,   
//             numberOfPanels,   
//             newLength,   
//             centerHeight,   
//             finalCuttingLength,   
//             totalArea,   
//             sheetRate   
//         } = req.body;  
// console.log( req.body);

//         // Check if product exists  
//         const existingProduct = await Product.findById(id);  
//         if (!existingProduct) {  
//             return res.status(404).json({ success: false, message: "Product not found" });  
//         }  

//         // Update fields only if provided  
//         if (roofType) existingProduct.roofType = roofType;  
//         if (roofModel) existingProduct.roofModel = roofModel;  
//         if (roofPreference) existingProduct.roofPreference = roofPreference;  
//         if (materials) existingProduct.materials = JSON.parse(materials); // Convert JSON string if needed  
//         if (span) existingProduct.span = span;  
//         if (length) existingProduct.length = length;  
//         if (height) existingProduct.height = height;  
//         if (typeOfPanel) existingProduct.typeOfPanel = typeOfPanel;  
//         if (sheetThickness) existingProduct.sheetThickness = sheetThickness;  
//         if (numberOfPanels) existingProduct.numberOfPanels = numberOfPanels;  
//         if (newLength) existingProduct.newLength = newLength;  
//         if (centerHeight) existingProduct.centerHeight = centerHeight;  
//         if (finalCuttingLength) existingProduct.finalCuttingLength = finalCuttingLength;  
//         if (totalArea) existingProduct.totalArea = totalArea;  
//         if (sheetRate) existingProduct.sheetRate = sheetRate;  

//         // Check if a new image is uploaded  
//         if (req.file) {  
//             // Delete old image from Cloudinary  
//             if (existingProduct.uploadImage) {  
//                 const publicId = existingProduct.uploadImage.split('/').pop().split('.')[0];  
//                 await cloudinary.uploader.destroy(`product_images/${publicId}`);  
//             }  

//             // Save new Cloudinary image URL  
//             existingProduct.uploadImage = req.file.path;  
//         }  

//         // Save updated product  
//         await existingProduct.save();  

//         res.status(200).json({  
//             success: true,  
//             message: "Product updated successfully",  
//             product: existingProduct  
//         });  

  
// };

// Fix for updateProduct controller
export const updateProduct = async (req, res) => {  
    try {
        const { id } = req.params;  
        const {   
            roofType,   
            roofModel,   
            roofPreference,   
            materials,   
            span,   
            length,   
            height,   
            typeOfPanel,   
            sheetThickness,   
            numberOfPanels,   
            newLength,   
            centerHeight,   
            finalCuttingLength,   
            totalArea,   
            sheetRate   
        } = req.body;  
        console.log(req.body);
        
        // Check if product exists  
        const existingProduct = await Product.findById(id);  
        if (!existingProduct) {  
            return res.status(404).json({ success: false, message: "Product not found" });  
        }  

        // Update fields only if provided  
        if (roofType) existingProduct.roofType = roofType;  
        if (roofModel) existingProduct.roofModel = roofModel;  
        if (roofPreference) existingProduct.roofPreference = roofPreference;  
        
        // Handle materials array properly - don't use JSON.parse
        if (materials && Array.isArray(materials)) {
            existingProduct.materials = materials;
        }
        
        if (span) existingProduct.span = Number(span);  
        if (length) existingProduct.length = Number(length);  
        if (height) existingProduct.height = Number(height);  
        if (typeOfPanel) existingProduct.typeOfPanel = typeOfPanel;  
        if (sheetThickness) existingProduct.sheetThickness = sheetThickness;  
        if (numberOfPanels) existingProduct.numberOfPanels = Number(numberOfPanels);  
        if (newLength) existingProduct.newLength = Number(newLength);  
        if (centerHeight) existingProduct.centerHeight = centerHeight;  
        if (finalCuttingLength) existingProduct.finalCuttingLength = Number(finalCuttingLength);  
        if (totalArea) existingProduct.totalArea = Number(totalArea);  
        if (sheetRate) existingProduct.sheetRate = Number(sheetRate);  

        // Check if a new image is uploaded  
        if (req.file) {  
            // Delete old image from Cloudinary  
            if (existingProduct.uploadImage) {  
                const publicId = existingProduct.uploadImage.split('/').pop().split('.')[0];  
                await cloudinary.uploader.destroy(`product_images/${publicId}`);  
            }  

            // Save new Cloudinary image URL  
            existingProduct.uploadImage = req.file.path;  
        }  

        // Save updated product  
        await existingProduct.save();  

        res.status(200).json({  
            success: true,  
            message: "Product updated successfully",  
            product: existingProduct  
        });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating product",
            error: error.message
        });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("roofType", "projectType") 
            .populate("roofModel", "roofModel") 
            .populate("materials.itemId", "name price");

        res.status(200).json({ success: true, products });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
    }
};



export const getFilteredProducts = async (req, res) => {
    try {
        const { roofType, roofModel, roofPreference } = req.query;

        
        if (!roofType || !roofModel || !roofPreference) {
            return res.status(200).json({ success: true, totalProducts: 0, products: [] });
        }

        const products = await Product.find({ roofType, roofModel, roofPreference })
            .populate("roofType", "projectType")
            .populate("roofModel", "roofModel")
            .populate("materials.itemId", "item ratePerMeter finalPerMeter");

        res.status(200).json({
            success: true,
            totalProducts: products.length,
            products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching filtered products",
            error: error.message
        });
    }
};



