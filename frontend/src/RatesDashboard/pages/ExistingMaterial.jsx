import { useState, useEffect } from "react";
import Header from "../../RatesDashboard/components/Header";
import Sidebar from "../../RatesDashboard/components/Sidebar";
import { getAllMaterials } from "../../api/admin/materials/additem";
import {updateMaterial} from "../../api/admin/materials/addmaterials"
import { getAllitems } from "../../api/admin/materials/additem";
import { updateItem } from "../../api/admin/materials/additem";

const ExistingMaterial = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  // Fetch materials when component mounts
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const materialsData = await getAllMaterials();
        setMaterials(materialsData); // Store materials in state
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };
    fetchMaterials();
  }, []);



  const handleMaterialChange = (event) => {
    const selectedMaterialId = event.target.value;
    const material = materials.find((mat) => mat._id === selectedMaterialId);
    
    setSelectedMaterial(material || null); // ✅ Correct state update
  };
  
  

// Handle input changes in edit mode
const handleInputChange = (event) => {
  const { name, value } = event.target;
  setSelectedMaterial((prev) => ({
    ...prev,
    [name]: value, // Update the selected material properties
  }));
};
 
// Handle edit button click
const handleEditClick = () => {
  setIsEditing(true);
};
 
// Handle cancel button click
const handleCancelClick = () => {
  setIsEditing(false);
};
 
// Handle save button click
const handleSaveClick = async () => {
  if (!selectedMaterial || !selectedMaterial._id) {
    console.error("No material selected or missing ID");
    alert("No material selected or missing ID");
    return;
  }
 
  try {
    console.log("Updating material with data:", selectedMaterial);
    const response = await updateMaterial(selectedMaterial._id, selectedMaterial);
 
    console.log("Update response:", response);
    alert("Material updated successfully!");
    setIsEditing(false);
  } catch (error) {
    console.error("Error updating material:", error);
    alert("Failed to update material. Check console for details.");
  }
};
//  -------------------------------------------------------------------------------------
const [items, setItems] = useState([]);
const [selectedItem, setSelectedItem] = useState(null);
const [isItemEditing, setIsItemEditing] = useState(false);

useEffect(() => {
  const fetchItems = async () => {
    try {
      const response = await getAllitems(); // Fetch data
      console.log("Fetched Items Response:", response); // Debug API response
      if (response.success && Array.isArray(response.items)) {
        setItems(response.items); // ✅ Extract and set correct array
      } else {
        console.error("Invalid response format:", response);
        setItems([]); // Set an empty array to prevent errors
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]); // Fallback to avoid crashing UI
    }
  };
  fetchItems();
}, []);


const handleItemChange = (event) => {
  const selectedId = event.target.value;
  const item = items.find((itm) => itm._id === selectedId);
  setSelectedItem(item || null);
};

// Handle input changes dynamically
const handleItemInputChange = (event) => {
  const { name, value } = event.target;
  setSelectedItem((prev) => ({
    ...prev,
    [name]: value,
  }));
};

// Save function for updating item
const handleItemSaveClick = async () => {
  if (!selectedItem || !selectedItem._id) {
    alert("No item selected or missing ID");
    return;
  }

  try {
    console.log("Updating item with data:", selectedItem);
    await updateItem(selectedItem._id, selectedItem);
    alert("Item updated successfully!");
    setIsItemEditing(false);
  } catch (error) {
    console.error("Error updating item:", error);
    alert("Failed to update item.");
  }
};















  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 flex flex-col bg-gray-100">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="px-5 mt-3"></div>

          <div className="bg-white rounded-xl shadow-md p-4 md:m-5 m-4">
  <h2 className="text-2xl font-bold mb-4">Materials</h2>

  <div className="flex flex-col gap-3">
    <label className="text-sm font-medium text-gray-700">Material Name</label>
    <select className="flex-1 p-2 border border-gray-300 rounded-md w-80" onChange={handleMaterialChange}>
      <option value="">Select</option>
      {materials.map((material) => (
        <option key={material._id} value={material._id}>
          {material.material} {/* Display material name */}
        </option>
      ))}
    </select>
  </div>

  <form className="grid grid-cols-1 md:grid-cols-3 md:pt-10 gap-3">
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-[#15164A]">Rate Per Meter</label>
      <input
        type="text"
        className="flex-1 p-2 border border-gray-300 rounded-md w-80"
        value={selectedMaterial?.ratePerKg || ""}
        onChange={handleInputChange}
        name="ratePerKg"
        readOnly={!isEditing} // Editable only in edit mode
      />
    </div>
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-[#15164A]">Including Tax</label>
      <input
        type="text"
        className="flex-1 p-2 border border-gray-300 rounded-md w-80"
        value={selectedMaterial?.includingTax || ""}
        onChange={handleInputChange}
        name="includingTax"
        readOnly={!isEditing}
      />
    </div>
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-[#15164A]">Last Updated Date</label>
      <input
        type="text"
        className="flex-1 p-2 border border-gray-300 rounded-md w-80"
        value={selectedMaterial?.lastUpdatedDate || ""}
        onChange={handleInputChange}
        name="lastUpdatedDate"
        readOnly={!isEditing}
      />
    </div>
  </form>

  <div className="flex justify-left items-center md:pt-5 gap-28">
    <div className="flex flex-col">
      <label className="text-sm font-medium text-[#15164A]">Bending Cost For C Channel Per Meter</label>
      <input
        type="text"
        className="flex-1 p-2 border border-gray-300 rounded-md w-[480px] mt-3"
        value={selectedMaterial?.bendingCostschannelPerMeter || ""}
        onChange={handleInputChange}
        name="bendingCostschannelPerMeter"
        readOnly={!isEditing}
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-medium text-[#15164A]">Bending Cost For Gutter Per Meter</label>
      <input
        type="text"
        className="flex-1 p-2 border border-gray-300 rounded-md w-[480px]"
        value={selectedMaterial?.bendingCostsgutterPerMeter || ""}
        onChange={handleInputChange}
        name="bendingCostsgutterPerMeter"
        readOnly={!isEditing}
      />
    </div>
  </div>

  {/* Buttons */}
  <div className="flex justify-center items-center gap-4 md:pt-10">
    {!isEditing ? (
      <button onClick={handleEditClick} className="bg-blue-600 px-5 text-white py-2 rounded-md">Edit</button>
    ) : (
      <>
        <button onClick={handleSaveClick} className="bg-green-600 px-5 text-white py-2 rounded-md">Save</button>
        <button onClick={handleCancelClick} className="bg-red-600 px-5 text-white py-2 rounded-md">Cancel</button>
      </>
    )}
  </div>
</div>

          {/* ---------------------------------------------- */}

          <div className="bg-white rounded-xl shadow-md p-4 md:m-5 m-4">
  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* First Column */}
    <div className="col-span-1 space-y-3">
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-[#15164A]">Item Name</label>
        <select
  className="flex-1 p-2 border border-gray-300 rounded-md w-80"
  onChange={handleItemChange}
  value={selectedItem?._id || ""}
>
  <option value="">Select an Item</option>
  {Array.isArray(items) && items.length > 0 ? (
    items.map((item) => (
      <option key={item._id} value={item._id}>
        {item.item} {/* Ensure the field name matches API */}
      </option>
    ))
  ) : (
    <option disabled>Loading items...</option>
  )}
</select>

      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-[#15164A]">Std.Kg</label>
        <input
          type="text"
          name="stdKg"
          value={selectedItem?.stdKg || ""}
          onChange={handleItemInputChange}
          className="flex-1 p-2 border border-gray-300 rounded-md w-80"
          placeholder="Enter Std.Kg"
          readOnly={!isItemEditing}
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-[#15164A]">
          Painting cost/Zinc dipping cost
        </label>
        <input
          type="text"
          name="paintingCostOrZinkDippingCost"
          value={selectedItem?.paintingCostOrZinkDippingCost || ""}
          onChange={handleItemInputChange}
          className="flex-1 p-2 border border-gray-300 rounded-md w-80"
          placeholder="Enter Cost"
          readOnly={!isItemEditing}
        />
      </div>
    </div>

    {/* Second Column */}
    <div className="col-span-1 space-y-3">
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">Material Name</label>
        <select
  className="flex-1 p-2 border border-gray-300 rounded-md w-80"
  onChange={handleMaterialChange} // Update material change function
  value={selectedItem?.material?._id || ""} // ✅ Default to selected item's material
>
  <option value="">Select Material</option>
  {Array.isArray(materials) && materials.length > 0 ? (
    materials.map((material) => (
      <option key={material._id} value={material._id}>
        {material.name} {/* Ensure field matches API */}
      </option>
    ))
  ) : (
    <option disabled>Loading materials...</option>
  )}
</select>



      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">Rate per Meter</label>
        <input
          type="text"
          name="ratePerMeter"
          value={selectedItem?.ratePerMeter || ""}
          onChange={handleItemInputChange}
          className="flex-1 p-2 border border-gray-300 rounded-md w-80"
          placeholder="Enter Rate"
          readOnly={!isItemEditing}
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-[#15164A]">Surface Area Per Meter</label>
        <input
          type="text"
          name="surfaceArea"
          value={selectedItem?.surfaceAreaPerMeter || ""}
          onChange={handleItemInputChange}
          className="flex-1 p-2 border border-gray-300 rounded-md w-80"
          placeholder="Enter Surface Area"
          readOnly={!isItemEditing}
        />
      </div>
    </div>

    {/* Third Column */}
    <div className="col-span-1 md:space-y-3">
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-[#15164A]">Quantity</label>
        <input
          type="text"
          name="quantity"
          value={selectedItem?.quantity || ""}
          onChange={handleItemInputChange}
          className="flex-1 p-2 border border-gray-300 rounded-md w-80"
          placeholder="Enter Quantity"
          readOnly={!isItemEditing}
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-[#15164A]">Kg/Meter</label>
        <input
          type="text"
          name="kgPerMeter"
          value={selectedItem?.kgPerMeter || ""}
          onChange={handleItemInputChange}
          className="flex-1 p-2 border border-gray-300 rounded-md w-80"
          placeholder="Kg/Meter"
          readOnly={!isItemEditing}
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-[#15164A]">Final Rate Per Meter</label>
        <input
          type="text"
          name="finalMeter"
          value={selectedItem?.finalPerMeter || ""}
          onChange={handleItemInputChange}
          className="flex-1 p-2 border border-gray-300 rounded-md w-80"
          placeholder="Final Meter"
          readOnly={!isItemEditing}
        />
      </div>
    </div>
  </div>

  {/* Buttons */}
  {/* <div className="flex justify-center items-center gap-4 md:pt-10">
    <button onClick={() => setIsItemEditing(true)} className="bg-blue-600 px-5 text-white py-2 rounded-md">
      Edit
    </button>
    <button onClick={handleItemSaveClick} className="bg-green-600 px-5 text-white py-2 rounded-md">
      Save
    </button>
    <button onClick={() => setSelectedItem(null)} className="bg-red-600 px-5 text-white py-2 rounded-md">
      Cancel
    </button>
  </div> */}

<div className="flex justify-center items-center gap-4 md:pt-10">
    {!isItemEditing ? (
     <button onClick={() => setIsItemEditing(true)} className="bg-blue-600 px-5 text-white py-2 rounded-md">
     Edit
   </button>
    ) : (
      <>
       <button onClick={handleItemSaveClick} className="bg-green-600 px-5 text-white py-2 rounded-md">
      Save
    </button>
    <button onClick={() => setSelectedItem(null)} className="bg-red-600 px-5 text-white py-2 rounded-md">
      Cancel
    </button>
      </>
    )}
  </div>
</div>










        </div>
      </div>
    </>
  );
};

export default ExistingMaterial;

