import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        roofType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProjectType', 
            required: true
        },
        roofModel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category', 
            required: true
        },
        roofPreference: {
            type: String,
            enum: ['Single Car Parking', 'Double Car Parking'], // Predefined options
            required: true
        },
       materials: [
         {
           itemId: {
             type: mongoose.Schema.Types.ObjectId,
             ref: "Item",
             required: true,
           },
           unit: {
             type: Number,
             required: true,
           }
         },
       ],
        uploadImage: {
            type: String 
        },
        span: {
            type: Number
        },
        length: {
            type: Number
        },
        height: {
            type: Number
        },
        typeOfPanel: {
            type: Number 
        },
        sheetThickness: {
            type: Number
        },
        numberOfPanels: {
            type: Number
        },
        newLength: {
            type: Number
        },
        centerHeight: {
            type: Number
        },
        finalCuttingLength: {
            type: Number
        },
        totalArea: {
            type: Number
        },
        sheetRate: {
            type: Number
        }
    },
    { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
