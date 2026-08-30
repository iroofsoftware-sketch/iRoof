
 
 
import React, { useEffect, useState } from "react";
import Sidebar from "../components/SideNav";
import Header from "../components/Header";
import { addThickness } from "../../api/admin/rates/thicknessrate";
import {getAllThicknessPricing} from "../../api/admin/rates/thicknessrate"
import { addTransportation, getAllTransportation } from "../../api/rates/transportation";
import { useNavigate } from "react-router-dom";
 import { addMaterial } from "../../api/admin/materials/addmaterials";
 import { getAllMaterials } from "../../api/admin/materials/additem";
 import { itemAdding } from "../../api/admin/materials/additem";
import { deleteThickness } from "../../api/rates/thicknessrate";
import { Link } from "react-router-dom";

 
const Rates = () => {
  const [activeTab, setActiveTab] = useState("Materials");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const tabs = ["Materials", "Thickness Rate", "Transportation"];
 
 
  const [thickness, setThicknessRate] = useState("");
    const [baseRatePerWt, setBaseRatePerWt] = useState("");
    const [transportation, setTransportation] = useState("");
    const [loadingUnloading, setLoadingUnloading] = useState("");
    const [margin, setMargin] = useState("");
    const [finalRatePerKg, setFinalRatePerKg] = useState("");
    const [tax, setTax] = useState("");
    const [roundOff, setRoundOff] = useState("");
    const [sellingPrice, setSellingPrice] = useState("");
    const [ratePerSqFt, setRatePerSqFt] = useState("");
    const [responseMessage, setResponseMessage] = useState("");
    const [thicknessData, setThicknessData] = useState([]);
 
 

    const [materialForm, setMaterialForm] = useState({
      material: "",
      ratePerKg: "",
      includingTax: "",
      bendingCostschannelPerMeter: "",
      bendingCostsgutterPerMeter: "",
    });

    const handleMaterialChange = (e) => {
      const { name, value } = e.target;
      setMaterialForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    };
    
 // Submit Materials
 const handleMaterialSubmit = async (e) => {
  e.preventDefault();
  try {
    await addMaterial(materialForm);
    alert("Material added successfully!");
    setMaterialForm({
      material: "",
      ratePerKg: "",
      includingTax: "",
      bendingCostschannelPerMeter: "",
      bendingCostsgutterPerMeter: "",
    });
  } catch (error) {
    alert(error || "An error occurred while adding material.");
  }
};  

// --------------------------------------------------


const [materials, setMaterials] = useState([]);

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



const [itemForm, setItemForm] = useState({
  categoryId: "",
  item: "",
  quantity: "",
  ratePerMeter: "",
  stdKg: "",
  kgPerMeter: "",
  surfaceAreaPerMeter: "",
  paintingCostOrZinkDippingCost: "",
  finalPerMeter: "",
});

// Function to handle form submission
const itemhandleSubmit = async (e) => {
  e.preventDefault(); // Prevent page reload

  // ✅ Validation: Ensure required fields are filled
  if (!itemForm.categoryId || !itemForm.item || !itemForm.quantity) {
    alert("Please fill all required fields.");
    return;
  }

  // ✅ Convert numeric values to numbers
  const formattedData = {
    ...itemForm,
    quantity: Number(itemForm.quantity) || 0,
    ratePerMeter: Number(itemForm.ratePerMeter) || 0,
    stdKg: Number(itemForm.stdKg) || 0,
    kgPerMeter: Number(itemForm.kgPerMeter) || 0,
    surfaceAreaPerMeter: Number(itemForm.surfaceAreaPerMeter) || 0,
    paintingCostOrZinkDippingCost: Number(itemForm.paintingCostOrZinkDippingCost) || 0,
    finalPerMeter: Number(itemForm.finalPerMeter) || 0,
  };

  console.log("Submitting item form:", formattedData); // Debugging

  try {
    const response = await itemAdding(formattedData);
    console.log("Item added successfully:", response);
    alert("Item added successfully!");
  } catch (error) {
    console.error("Error adding item:", error);
    alert("Failed to add item. Please try again.");
  }
};
// ----------------------------------------------------







    
   const handleAddThickness = async (e) => {
         e.preventDefault(); // Prevent page refresh
         try {
           const payload = {
             thickness,
         baseRatePerWt,
         transportation,
         loadingUnloading,
         margin,
           
           };
   
           const data = await addThickness(payload);
           console.log(data);
         
           setResponseMessage(data.message || "Thickness rate added successfully!");
           fetchThicknessPricing()
         } catch (error) {
           setResponseMessage(error.message || "An error occurred.");
         }
       
       };
   
       // -----------------------------------------
       useEffect(() => {
        
   
         fetchThicknessPricing();
       }, []);
       const fetchThicknessPricing = async () => {
        try {
          const data = await getAllThicknessPricing();
          console.log(data);
        
          setThicknessData(data.data);
        } catch (error) {
          console.error("Error fetching thickness pricing:", error);
        }
      
      };
     
   
 
      const [formData, setFormData] = useState({
          person: "Trailer",
          minimumCharge: "",
          minimumKm: "",
          perKm: "",
          petrolCharge: "",
        });
     const [loading, setLoading] = useState(false);
       const [errorMessage, setErrorMessage] = useState("");
       const [successMessage, setSuccessMessage] = useState("");
       const [showTransportation,setShowTransportation] = useState("")
     
       const handleInputChange = (e) => {
         const { name, value } = e.target;
         setFormData((prev) => ({
           ...prev,
           [name]: value,
         }));
       };
     
  const navigate = useNavigate ()



  useEffect(() => {
           
     
    fetchTransportation();
  }, []);
  const fetchTransportation = async () => {
   try {
     const data = await getAllTransportation();
     console.log(data);
   
     setShowTransportation(data);
   } catch (error) {
     console.error("Error fetching thickness pricing:", error);
   }
 
 };


       const handleSubmit = async (e) => {
         e.preventDefault();
         setLoading(true);
         setErrorMessage("");
         setSuccessMessage("");
     
         try {
           const payload = {
             vehicleType: formData.person,
             minCharge: formData.minimumCharge,
             minKmCovered: formData.minimumKm,
             perKmCharge: formData.perKm,
             petrolCharge: formData.petrolCharge,
           };
     
           const response = await addTransportation(payload);
           setSuccessMessage("Rates added successfully!");
           console.log("API Response:", response);
     
           // Clear the form after submission
           setFormData({
             person: "Trailer",
             minimumCharge: "",
             minimumKm: "",
             perKm: "",
             petrolCharge: "",
           });
           fetchTransportation()
         } catch (error) {
           setErrorMessage(
             error || "An error occurred while adding transportation rates."
           );
         } finally {
           setLoading(false);
         }
       };
     
      
// ---------------------------------------------------------------

const [selectedThickness, setSelectedThickness] = useState([]);
 
  // Handle checkbox selection
  const handleCheckboxChange = (id) => {
    setSelectedThickness((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id) // Remove if already selected
        : [...prevSelected, id] // Add if not selected
    );
  };
 
  // Delete selected thicknesses
  const handleDeleteSelected = async () => {
    if (selectedThickness.length === 0) {
      alert("Please select at least one thickness to delete.");
      return;
    }
 
    try {
     const response= await deleteThickness({ids: selectedThickness})
     console.log(response);
     
 
      alert("Selected thicknesses deleted successfully.");
      setSelectedThickness([]); // Clear selection
      fetchThicknessPricing(); // Refresh table data
    } catch (error) {
      console.error("Error deleting thickness:", error);
      alert("Failed to delete selected thicknesses.");
    }
  };
 
 
 
 
 
















     
 
    return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
 
      {/* Main Content */}
      <div className="flex-1 flex flex-col  bg-gray-100">
        {/* Header */}
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
 
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md p-4 md:m-5 m-4 overflow-auto">
          <div className="flex gap-4 sm:gap-6 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`text-lg font-semibold ${
                  activeTab === tab
                    ? "text-[#4c48a5] border-b-2 border-[#4c48a5]"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
 
          {/* Tab Content */}
          <div>
            {activeTab === "Materials" && (
              <div>
                <form onSubmit={handleMaterialSubmit}>
                <h2 className="text-2xl font-bold mb-4">Materials</h2>
                <div className="flex flex-col gap-3  ">
                    <label className="text-sm font-medium text-[#15164A]">
                     Material Name
                    </label>
                    <input
        type="text"
        name="material"
        className="flex-1 p-2 border border-gray-300 rounded-md w-80"
        placeholder="Material Name"
        value={materialForm.material}
        onChange={handleMaterialChange}
      />
                  </div>
 
                <div className="grid grid-cols-1 md:grid-cols-3  md:pt-10 gap-3 ">
                  {/* Row 1 */}
                  <div className="flex flex-col gap-3  ">
                    <label className="text-sm font-medium text-[#15164A]">
                      Rate Per Meter
                    </label>
                    <input
          type="number"
          name="ratePerKg"
          className="flex-1 p-2 border border-gray-300 rounded-md w-80"
          placeholder="1"
          value={materialForm.ratePerKg}
          onChange={handleMaterialChange}
        />
                  </div>
                  <div className="flex flex-col gap-3 ">
                    <label className="text-sm font-medium text-[#15164A]">
                      Including Tax
                    </label>
                    <input
          type="number"
          name="includingTax"
          className="flex-1 p-2 border border-gray-300 rounded-md w-80"
          placeholder="1"
          value={materialForm.includingTax}
          onChange={handleMaterialChange}
        />
                  </div>
                  {/* <div className="flex flex-col gap-3 ">
                    <label className="text-sm font-medium text-[#15164A]">
                      Last Updated Date
                    </label>
                    <input
                      type="text"
                      className="flex-1 p-2 border border-gray-300 rounded-md w-80"
                      placeholder="1"
                   
                    />
                  </div> */}
 
                  {/* Row 2 */}
                </div>
                <div className="flex justify-left items-center  md:pt-5 gap-28 ">
                  <div className="flex flex-col ">
                    <label className="text-sm font-medium text-[#15164A]">
                      Bending Cost For C Channel Per Meter
                    </label>
                    <input
          type="number"
          name="bendingCostschannelPerMeter"
          className="flex-1 p-2 border border-gray-300 rounded-md w-[480px] mt-3"
          value={materialForm.bendingCostschannelPerMeter}
          onChange={handleMaterialChange}
          placeholder="Cost per meter"
        />
                  </div>
 
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-[#15164A]">
                      Bending Cost For Gutter Per Meter
                    </label>
                    <input
          type="number"
          name="bendingCostsgutterPerMeter"
          className="flex-1 p-2 border border-gray-300 rounded-md w-[480px]"
          value={materialForm.bendingCostsgutterPerMeter}
          onChange={handleMaterialChange}
          placeholder="Cost per meter"
        />
                  </div>
                </div>
                <div className="flex justify-center items-center gap-4 md:pt-10">
                  <button className="bg-blue-600 px-5  text-white py-2 rounded-md">
                    Add
                  </button>
                  <button className="bg-red-600 px-5 text-white py-2 rounded-md">
                    Cancel
                  </button>
                </div>
 

</form>

 
                <div
                onClick={() => navigate("/admin/adminexistingmaterial")}
                className="cursor-pointer"
              >

                
                  <h5 className="text-right">Finding existing materials</h5>
               
                </div>

                <hr className="border-t border-gray-300 my-4" />


                {/* Items List */}
                {/* <div className="mt-6 grid sm:grid-cols-2 grid-cols-1 gap-2">
                  <div className="border p-4 rounded-lg">
                    <label className="block mb-2">
                      <input type="radio" name="item" className="mr-2" />
                      ISA 25*25*6mm
                    </label>
                  </div>
                </div> */}
                     <h2 className="text-2xl font-bold mb-4">Item</h2>
                     <form className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* First Column */}
      <div className="col-span-1 space-y-3">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">Material Name</label>
          <select
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            value={itemForm.categoryId}
            onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
          >
            <option value="">Select</option>
            {materials.map((material) => (
              <option key={material._id} value={material._id}>
                {material.material}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Rate Per Meter</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            placeholder="1"
            value={itemForm.ratePerMeter}
            onChange={(e) => setItemForm({ ...itemForm, ratePerMeter: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Surface Area Per Meter</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            placeholder="1"
            value={itemForm.surfaceAreaPerMeter}
            onChange={(e) => setItemForm({ ...itemForm, surfaceAreaPerMeter: e.target.value })}
          />
        </div>
      </div>

      {/* Second Column */}
      <div className="col-span-1 space-y-3">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Item Name</label>
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            placeholder="Item Name"
            value={itemForm.item}
            onChange={(e) => setItemForm({ ...itemForm, item: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Std.Kg</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            placeholder="1"
            value={itemForm.stdKg}
            onChange={(e) => setItemForm({ ...itemForm, stdKg: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Painting Cost/Zinc Dipping Cost</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            placeholder="1"
            value={itemForm.paintingCostOrZinkDippingCost}
            onChange={(e) => setItemForm({ ...itemForm, paintingCostOrZinkDippingCost: e.target.value })}
          />
        </div>
      </div>

      {/* Third Column */}
      <div className="col-span-1 md:space-y-3">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Quantity</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            value={itemForm.quantity}
            onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
            placeholder="1"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Kg/Meter</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            placeholder="1"
            value={itemForm.kgPerMeter}
            onChange={(e) => setItemForm({ ...itemForm, kgPerMeter: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#15164A]">Final Rate Per Meter</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded-md w-80"
            placeholder="1"
            value={itemForm.finalPerMeter}
            onChange={(e) => setItemForm({ ...itemForm, finalPerMeter: e.target.value })}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center items-center md:pt-10">
        <button
          className="bg-blue-600 px-5 text-white py-2 rounded-md"
          onClick={itemhandleSubmit}
        >
          Add
        </button>
        <button
          type="button"
          className="bg-red-600 px-5 text-white py-2 rounded-md ml-3"
          onClick={() => setItemForm({
            materialName: "",
            item: "",
            quantity: "",
            ratePerMeter: "",
            stdKg: "",
            kgPerMeter: "",
            surfaceAreaPerMeter: "",
            paintingCostOrZinkDippingCost: "",
            finalPerMeter: "",
          })}
        >
          Cancel
        </button>
      </div>
    </form>
               
              </div>
            )}
 
       {activeTab === "Thickness Rate" && (
              <div className="bg-white rounded-xl shadow-md p-4 md:m-5 m-4">
              {/* Tab Content */}
              <div>  <button onClick={handleDeleteSelected} className="bg-red-500 text-white px-3 py-1 rounded">
                Delete
              </button>
             
                  {/* Table */}  <div className="flex justify-center mt-4">
         
         
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 border border-gray-300">Select</th>
                  <th className="px-4 py-2 border border-gray-300">Thickness</th>
                  <th className="px-4 py-2 border border-gray-300">
                    Base Rate Per Weight
                  </th>
                  <th className="px-4 py-2 border border-gray-300"> Tax</th>
                  <th className="px-4 py-2 border border-gray-300">Transportation</th>
                  <th className="px-4 py-2 border border-gray-300">
                    Loading & Unloading
                  </th>
                  <th className="px-4 py-2 border border-gray-300">
                    Final Rate Per Kg
                  </th>
                  <th className="px-4 py-2 border border-gray-300">Rate Per Sq.ft</th>
                  <th className="px-4 py-2 border border-gray-300">Round Off</th>
                  <th className="px-4 py-2 border border-gray-300">Selling Price</th>
                </tr>
              </thead>
     
              <tbody>
                {thicknessData.length > 0 ? (
                  thicknessData.map((item, index) => (
                    <tr key={item._id} className="text-center">
                      <td className="px-4 py-2 border border-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedThickness.includes(item._id)}
                          onChange={() => handleCheckboxChange(item._id)}
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-300">{item.thickness}</td>
                      <td className="px-4 py-2 border border-gray-300">{item.baseRatePerWt}</td>
                      <td className="px-4 py-2 border border-gray-300">{item.taxRate}</td>
                      <td className="px-4 py-2 border border-gray-300">{item.transportation}</td>
                      <td className="px-4 py-2 border border-gray-300">{item.loadingUnloading}</td>
                      <td className="px-4 py-2 border border-gray-300">{item.finalRatePerKg}</td>
                      <td className="px-4 py-2 border border-gray-300">{item.ratePerSqFt}</td>
                      <td className="px-4 py-2 border border-gray-300">{item.roundOff}</td>
                      <td className="px-4 py-2 border border-gray-300">{item.sellingPrice}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
     
          
     
                  {/* Add Rates Section */}
                  <div className="mt-6">
                    <h2 className="text-2xl font-normal text-[#2A2493]">
                      Add Rates
                    </h2>
                     <form
                  onSubmit={handleAddThickness}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Thickness
                    </label>
                    {/* <select
                      value={thickness}
                      onChange={(e) => setThicknessRate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select</option>
                      <option>0.5</option>
                      <option>0.6</option>
                      <option>0.7</option>
                    </select> */}
                    <input type="number"  value={thickness}   onChange={(e) => setThicknessRate(e.target.value)}   className="w-full p-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Base Rate Per Weight
                    </label>
                    <input
                      type="number"
                      value={baseRatePerWt}
                      onChange={(e) => setBaseRatePerWt(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Transportation
                    </label>
                    <input
                      type="number"
                      value={transportation}
                      onChange={(e) => setTransportation(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="1.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Loading & Unloading
                    </label>
                    <input
                      type="number"
                      value={loadingUnloading}
                      onChange={(e) => setLoadingUnloading(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="8.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Margin
                    </label>
                    <input
                      type="number"
                      value={margin}
                      onChange={(e) => setMargin(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="00"
                    />
                  </div>
                 
                 
                 
                 
                 
                  <div className="flex gap-4 mt-4 justify-center">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Clear the form
                        setThicknessRate("");
                        setBaseRatePerWt("");
                        setTransportation("");
                        setLoadingUnloading("");
                        setMargin("");
                        setFinalRatePerKg("");
                        setTax("");
                        setRoundOff("");
                        setSellingPrice("");
                        setRatePerSqFt("");
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                {responseMessage && (
                  <div className="text-green-500 mt-4">{responseMessage}</div>
                )}
           
     
                    <div className="flex justify-start md:pr-36">
                      {/* <p className="text-black">
                        Click Here{" "}
                        <Link to="/editthicknessrate">
                        
                        </Link>
                      </p> */}
                    </div>
                  </div>
             
              </div>
            </div>
            )}
 
{activeTab === "Transportation" && (
              <div className="bg-white rounded-xl shadow-md p-4 md:m-5 m-4">
                {/* Table Section */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse border border-gray-300">
                    <thead className="bg-gray-200">
                      <tr>
                      <th className="px-4 py-2 border border-gray-300">
                          vehicleType
                        </th>
                        <th
                          className="px-4 py-2 border border-gray-300"
                       
                        >
                          Minimum Charge
                        </th>
                        <th className="px-4 py-2 border border-gray-300">
                          Minimum Km Covered
                        </th>
                        <th className="px-4 py-2 border border-gray-300">
                          Per Km
                        </th>
                        <th className="px-4 py-2 border border-gray-300">
                          Petrol charge
                        </th>
                      </tr>
                    </thead>
                    <tbody>
             {showTransportation.length > 0 ? (
                    showTransportation.map((item, index) => (
                      <React.Fragment key={index}>
                        <tr className="text-center">
                        <td className="px-4 py-2 border border-gray-300">{item.vehicleType}</td>
                          <td className="px-4 py-2 border border-gray-300">{item.minCharge}</td>
                         
                          <td className="px-4 py-2 border border-gray-300">{item.minKmCovered}</td>
                          <td className="px-4 py-2 border border-gray-300">{item.perKmCharge}</td>
                          <td className="px-4 py-2 border border-gray-300">{item.petrolCharge}</td>
                        </tr>
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-2 border border-gray-300 text-center">
                        No transportation data available
                      </td>
                    </tr>
                  )}
             
                  {/* Petrol Charge Row */}
                 
    </tbody>
  </table>
</div>
 
                {/* Petrol Charge Section */}
                <div className="mt-6">
                <h2 className="text-2xl font-normal text-[#2A2493]">
                  Edit Rates
                </h2>
                <form
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
              onSubmit={handleSubmit}
            >
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Select vehicle
                </label>
                <select
                  name="person"
                  value={formData.person}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Trailer">Trailer</option>
                  <option value="Eicher">Eicher</option>
                  <option value="Ace">Ace</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Minimum Charge
                </label>
                <input
                  type="number"
                  name="minimumCharge"
                  value={formData.minimumCharge}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="2,500/-"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Minimum Km Covered
                </label>
                <input
                  type="number"
                  name="minimumKm"
                  value={formData.minimumKm}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="20km"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Per Km</label>
                <input
                  type="number"
                  name="perKm"
                  value={formData.perKm}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="35"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Petrol Charge
                </label>
                <input
                  type="number"
                  name="petrolCharge"
                  value={formData.petrolCharge}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="115/-"
                />
              </div>
              <div className="flex gap-4 mt-4 justify-center items-center col-span-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Add"}
                </button>
                <button
                  type="button"
                  className="bg-red-600 text-white px-4 py-2 rounded-md"
                  onClick={() =>
                    setFormData({
                      person: "Trailer",
                      minimumCharge: "",
                      minimumKm: "",
                      perKm: "",
                      petrolCharge: "",
                    })
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
            {errorMessage && (
              <p className="mt-4 text-red-600 font-medium">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="mt-4 text-green-600 font-medium">{successMessage}</p>
            )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Rates;
 
 
 