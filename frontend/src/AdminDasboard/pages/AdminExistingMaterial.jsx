import { useState, useEffect } from "react";
import Header from "../../AdminDasboard/components/Header";
import Sidebar from "../../AdminDasboard/components/SideNav";
import { useNavigate } from "react-router-dom";
import {updateMaterial } from "../../api/admin/materials/addmaterials";
import { getAllMaterials, getAllitems, updateItem } from "../../api/admin/materials/additem";

const AdminExistingMaterial = () => {
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
        console.log("Fetched materials:", materialsData);
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };
    fetchMaterials();
  }, []);

  const handleMaterialChange = (event) => {
    const selectedMaterialId = event.target.value;
    const material = materials.find((mat) => mat._id === selectedMaterialId);
    setSelectedMaterial(material || null);
    setIsEditing(false); // Reset edit mode when changing selection
  };
  
  // Handle input changes in edit mode
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSelectedMaterial((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value,
      };
    });
  };
   
  // Handle edit button click
  const handleEditClick = () => {
    if (selectedMaterial) {
      setIsEditing(true);
    } else {
      alert("Please select a material first");
    }
  };
   
  // Handle cancel button click
  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset to original values by re-fetching the selected material
    if (selectedMaterial && selectedMaterial._id) {
      const originalMaterial = materials.find(m => m._id === selectedMaterial._id);
      setSelectedMaterial(originalMaterial);
    }
  };
   
  // Handle save button click
  const handleSaveClick = async () => {
    if (!selectedMaterial || !selectedMaterial._id) {
      console.error("No material selected or missing ID");
      alert("No material selected or missing ID");
      return;
    }
   
    try {
     
      const response = await updateMaterial(selectedMaterial._id, selectedMaterial);
      console.log("material",response);
      
      if (response.status==200) {
       
        // Update the materials list with the updated material
        setMaterials(prevMaterials => 
          prevMaterials.map(mat => 
            mat._id === selectedMaterial._id ? selectedMaterial : mat
          )
        );
        
        console.log("Update response:", response);
        alert("Material updated successfully!");
        setIsEditing(false);
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Error updating material:", error);
      alert("Failed to update material. Check console for details.");
    }
  };

  // Items section
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isItemEditing, setIsItemEditing] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await getAllitems(); 
        console.log("Fetched Items Response:", response);
        if (response && response.success && Array.isArray(response.items)) {
          setItems(response.items);
        } else {
          console.error("Invalid response format:", response);
          setItems([]);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        setItems([]);
      }
    };
    fetchItems();
  }, []);

  const handleItemChange = (event) => {
    const selectedId = event.target.value;
    const item = items.find((itm) => itm._id === selectedId);
    setSelectedItem(item || null);
    setIsItemEditing(false); // Reset edit mode when changing selection
  };

  // Handle input changes dynamically
  const handleItemInputChange = (event) => {
    const { name, value } = event.target;
    setSelectedItem((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  // Handle edit item button
  const handleItemEditClick = () => {
    if (selectedItem) {
      setIsItemEditing(true);
    } else {
      alert("Please select an item first");
    }
  };

  // Handle cancel item edit
  const handleItemCancelClick = () => {
    setIsItemEditing(false);
    // Reset to original values
    if (selectedItem && selectedItem._id) {
      const originalItem = items.find(i => i._id === selectedItem._id);
      setSelectedItem(originalItem);
    }
  };

  // Save function for updating item
  const handleItemSaveClick = async () => {
    if (!selectedItem || !selectedItem._id) {
      alert("No item selected or missing ID");
      return;
    }

    try {
      console.log("Updating item with data:", selectedItem);
      const response = await updateItem(selectedItem._id, selectedItem);
      
      if (response && response.status==200) {
        getAllitems()
        // Update the items list with the updated item
        setItems(prevItems => 
          prevItems.map(itm => 
            itm._id === selectedItem._id ? selectedItem : itm
          )
        );
        
        alert("Item updated successfully!");
        setIsItemEditing(false);
      } else {
        throw new Error("Update failed");
      }
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
              <select 
                className="flex-1 p-2 border border-gray-300 rounded-md w-80" 
                onChange={handleMaterialChange}
                value={selectedMaterial?._id || ""}
              >
                <option value="">Select</option>
                {materials.map((material) => (
                  <option key={material._id} value={material._id}>
                    {material.material} {/* Ensure this matches your API field name */}
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
                  readOnly={!isEditing}
                  disabled={!selectedMaterial}
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-[#15164A]">Including Tax</label>
                <input
                  type="number"
                  className="flex-1 p-2 border border-gray-300 rounded-md w-80"
                  value={selectedMaterial?.includingTax || ""}
                  onChange={handleInputChange}
                  name="includingTax"
                  readOnly={!isEditing}
                  disabled={!selectedMaterial}
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-[#15164A]">Last Updated Date</label>
                <input
                  type="date" 
                  className="flex-1 p-2 border border-gray-300 rounded-md w-80"
                  value={selectedMaterial?.lastUpdatedDate || ""}
                  onChange={handleInputChange}
                  name="lastUpdatedDate"
                  readOnly={!isEditing}
                  disabled={!selectedMaterial}
                />
              </div>
            </form>

            <div className="flex flex-col md:flex-row justify-left items-start md:items-center md:pt-5 gap-5 md:gap-28">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#15164A]">Bending Cost For C Channel Per Meter</label>
                <input
                  type="number"
                  className="flex-1 p-2 border border-gray-300 rounded-md w-full md:w-[480px] mt-3"
                  value={selectedMaterial?.bendingCostschannelPerMeter || ""}
                  onChange={handleInputChange}
                  name="bendingCostschannelPerMeter"
                  readOnly={!isEditing}
                  disabled={!selectedMaterial}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#15164A]">Bending Cost For Gutter Per Meter</label>
                <input
                  type="number"
                  className="flex-1 p-2 border border-gray-300 rounded-md w-full md:w-[480px] mt-3"
                  value={selectedMaterial?.bendingCostsgutterPerMeter || ""}
                  onChange={handleInputChange}
                  name="bendingCostsgutterPerMeter"
                  readOnly={!isEditing}
                  disabled={!selectedMaterial}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center items-center gap-4 md:pt-10">
              {!isEditing ? (
                <button 
                  onClick={handleEditClick} 
                  className={`px-5 py-2 rounded-md ${selectedMaterial ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  disabled={!selectedMaterial}
                >
                  Edit
                </button>
              ) : (
                <>
                  <button onClick={handleSaveClick} className="bg-green-600 px-5 text-white py-2 rounded-md">Save</button>
                  <button onClick={handleCancelClick} className="bg-red-600 px-5 text-white py-2 rounded-md">Cancel</button>
                </>
              )}
            </div>
          </div>

          {/* Items section */}
          <div className="bg-white rounded-xl shadow-md p-4 md:m-5 m-4">
            <h2 className="text-2xl font-bold mb-4">Items</h2>
            
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
                          {item.item} {/* Ensure this matches your API field name */}
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
                    type="number"
                    name="stdKg"
                    value={selectedItem?.stdKg || ""}
                    onChange={handleItemInputChange}
                    className="flex-1 p-2 border border-gray-300 rounded-md w-80"
                    placeholder="Enter Std.Kg"
                    readOnly={!isItemEditing}
                    disabled={!selectedItem}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-[#15164A]">
                    Painting cost/Zinc dipping cost
                  </label>
                  <input
                    type="number"
                    name="paintingCostOrZinkDippingCost"
                    value={selectedItem?.paintingCostOrZinkDippingCost || ""}
                    onChange={handleItemInputChange}
                    className="flex-1 p-2 border border-gray-300 rounded-md w-80"
                    placeholder="Enter Cost"
                    readOnly={!isItemEditing}
                    disabled={!selectedItem}
                  />
                </div>
              </div>

              {/* Second Column */}
              <div className="col-span-1 space-y-3">
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-gray-700">Material Name</label>
                  <select
                    className="flex-1 p-2 border border-gray-300 rounded-md w-80"
                    onChange={(e) => {
                      if (isItemEditing && selectedItem) {
                        const materialId = e.target.value;
                        const material = materials.find(m => m._id === materialId);
                        setSelectedItem(prev => ({
                          ...prev,
                          material: material || null,
                          materialId: materialId || ""
                        }));
                      }
                    }}
                    value={selectedItem?.material?._id || selectedItem?.materialId || ""}
                    disabled={!isItemEditing || !selectedItem}
                  >
                    <option value="">Select Material</option>
                    {Array.isArray(materials) && materials.length > 0 ? (
                      materials.map((material) => (
                        <option key={material._id} value={material._id}>
                          {material.material} {/* Ensure this matches your API field name */}
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
                    type="number"
                    name="ratePerMeter"
                    value={selectedItem?.ratePerMeter || ""}
                    onChange={handleItemInputChange}
                    className="flex-1 p-2 border border-gray-300 rounded-md w-80"
                    placeholder="Enter Rate"
                    readOnly={!isItemEditing}
                    disabled={!selectedItem}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-[#15164A]">Surface Area Per Meter</label>
                  <input
                    type="number"
                    name="surfaceAreaPerMeter"
                    value={selectedItem?.surfaceAreaPerMeter || ""}
                    onChange={handleItemInputChange}
                    className="flex-1 p-2 border border-gray-300 rounded-md w-80"
                    placeholder="Enter Surface Area"
                    readOnly={!isItemEditing}
                    disabled={!selectedItem}
                  />
                </div>
              </div>

              {/* Third Column */}
              <div className="col-span-1 md:space-y-3">
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-[#15164A]">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={selectedItem?.quantity || ""}
                    onChange={handleItemInputChange}
                    className="flex-1 p-2 border border-gray-300 rounded-md w-80"
                    placeholder="Enter Quantity"
                    readOnly={!isItemEditing}
                    disabled={!selectedItem}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-[#15164A]">Kg/Meter</label>
                  <input
                    type="number"
                    name="kgPerMeter"
                    value={selectedItem?.kgPerMeter || ""}
                    onChange={handleItemInputChange}
                    className="flex-1 p-2 border border-gray-300 rounded-md w-80"
                    placeholder="Kg/Meter"
                    readOnly={!isItemEditing}
                    disabled={!selectedItem}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-[#15164A]">Final Rate Per Meter</label>
                  <input
                    type="number"
                    name="finalPerMeter"
                    value={selectedItem?.finalPerMeter || ""}
                    onChange={handleItemInputChange}
                    className="flex-1 p-2 border border-gray-300 rounded-md w-80"
                    placeholder="Final Meter"
                    readOnly={!isItemEditing}
                    disabled={!selectedItem}
                  />
                </div>
              </div>
            </div>

            {/* Item Buttons */}
            <div className="flex justify-center items-center gap-4 md:pt-10">
              {!isItemEditing ? (
                <button 
                  onClick={handleItemEditClick} 
                  className={`px-5 py-2 rounded-md ${selectedItem ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  disabled={!selectedItem}
                >
                  Edit
                </button>
              ) : (
                <>
                  <button onClick={handleItemSaveClick} className="bg-green-600 px-5 text-white py-2 rounded-md">Save</button>
                  <button onClick={handleItemCancelClick} className="bg-red-600 px-5 text-white py-2 rounded-md">Cancel</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminExistingMaterial;