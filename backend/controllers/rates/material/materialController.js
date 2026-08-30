import MaterialCost from '../../../models/materialModel.js';
import Items from '../../../models/itemModel.js';
import mongoose from "mongoose";

export const addMaterial = async (req, res) => {
  try {
    const { material, ratePerKg, includingTax, bendingCostschannelPerMeter,bendingCostsgutterPerMeter } = req.body;

  
    const existingMaterial = await MaterialCost.findOne({ material });
    if (existingMaterial) {
      return res.status(400).json({ message: 'Material already exists' });
    }

    const newMaterial = new MaterialCost({
      material,
      ratePerKg,
      includingTax,
      lastUpdatedDate: new Date(),
      bendingCostschannelPerMeter,
      bendingCostsgutterPerMeter
    });

    await newMaterial.save();
    res.status(201).json({ message: 'Material added successfully', data: newMaterial });
  } catch (error) {
    res.status(500).json({ message: 'Error adding material', error: error.message });
  }
};

export const editMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { material, ratePerKg, includingTax, bendingCostschannelPerMeter, bendingCostsgutterPerMeter } = req.body;

   
    const existingMaterial = await MaterialCost.findOne({ material, _id: { $ne: id } });
    if (existingMaterial) {
      return res.status(400).json({ message: 'Material with this name already exists' });
    }

    const updatedMaterial = await MaterialCost.findByIdAndUpdate(
      id,
      {
        material,
        ratePerKg,
        includingTax,
        bendingCostschannelPerMeter,
        bendingCostsgutterPerMeter,
        lastUpdatedDate: new Date(),
      },
      { new: true }
    );

    if (!updatedMaterial) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.status(200).json({ message: 'Material updated successfully', data: updatedMaterial });
  } catch (error) {
    res.status(500).json({ message: 'Error updating material', error: error.message });
  }
};


export const getAllMaterials = async (req, res) => {
  try {
    console.log("helooo");
    const materials = await MaterialCost.find();
    console.log("materials",materials);
    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching materials', error: error.message });
  }
};


export const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await MaterialCost.findById(id);
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.status(200).json(material);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching material', error: error.message });
  }
};


export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { ratePerKg, includingTax, bendingCostschannelPerMeter,bendingCostsgutterPerMeter } = req.body;

    const updatedMaterial = await MaterialCost.findByIdAndUpdate(
      id,
      { ratePerKg, includingTax, lastUpdatedDate: new Date(),  bendingCostschannelPerMeter,bendingCostsgutterPerMeter },
      { new: true }
    );

    if (!updatedMaterial) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.status(200).json({ message: 'Material updated successfully', data: updatedMaterial });
  } catch (error) {
    res.status(500).json({ message: 'Error updating material', error: error.message });
  }
};

export const materialItemAdding = async (req, res) => {
  try {
    const {
      categoryId,
      item,
      quantity,
      ratePerMeter,
      stdKg,
      kgPerMeter,
      surfaceAreaPerMeter,
      paintingCostOrZinkDippingCost,
      finalPerMeter
    } = req.body;

    console.log(req.body);

    // ✅ Check if item already exists in the same category
    const existingItem = await Items.findOne({ categoryId, item });

    if (existingItem) {
      return res.status(400).json({
        message: "Item already exists in this category",
        existingItem
      });
    }

    // ✅ Create new item if not found
    const newItem = new Items({
      categoryId,
      item,
      quantity,
      ratePerMeter,
      stdKg,
      kgPerMeter,
      surfaceAreaPerMeter,
      paintingCostOrZinkDippingCost,
      finalPerMeter
    });

    await newItem.save();

    return res.status(201).json({ message: "Item added successfully", newItem });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};


export const editMaterialItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      item,
      quantity,
      ratePerMeter,
      stdKg,
      kgPerMeter,
      surfaceAreaPerMeter,
      paintingCostOrZinkDippingCost,
      finalPerMeter
    } = req.body;
    console.log(req.body);
    // Check if the item exists
    const existingItem = await Items.findById(id);
    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update the item
    const updatedItem = await Items.findByIdAndUpdate(
      id,
      {
        categoryId,
        item,
        quantity,
        ratePerMeter,
        stdKg,
        kgPerMeter,
        surfaceAreaPerMeter,
        paintingCostOrZinkDippingCost,
        finalPerMeter
      },
      { new: true }
    );
    console.log(req.body);
    res.status(200).json({ message: 'Item updated successfully', data: updatedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


export const getAllItems = async (req, res) => {
  try {
    console.log("hi");
    
    const items = await Items.find()
      .populate("categoryId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};



export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID." });
    }

    const item = await Items.findById(id).populate("categoryId");
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
