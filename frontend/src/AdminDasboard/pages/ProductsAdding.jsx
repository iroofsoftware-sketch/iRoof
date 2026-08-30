import Header from "../components/Header";
import Sidebar from "../components/SideNav";
import { useEffect, useState } from "react";
 
import { useNavigate } from "react-router-dom";
import { createCategory } from "../../api/admin/product/createCategory";
import { addProduct, fetchAllProjectType, getAllCategories, getAllMaterialItem } from "../../api/admin/product/getAllCategories";
 
 
 
function ProductsAdding() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  const [materials, setMaterials] = useState([{ material: "", quantity: "" }]);
  const addNewMaterial = () => {
  setMaterials([...materials, { material: "", quantity: "" }]);
  };
  const handleMaterialChange = (index, field, value) => {
    const updatedMaterials = [...materials];
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };
    setMaterials(updatedMaterials);
    
    // Also update the unit in itemForm.materials if this material already exists
    if (itemForm.materials[index]) {
      setItemForm(prevState => {
        const updatedFormMaterials = [...prevState.materials];
        if (field === "quantity") {
          updatedFormMaterials[index] = {
            ...updatedFormMaterials[index],
            unit: value
          };
        }
        return { ...prevState, materials: updatedFormMaterials };
      });
    }
  };
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };
  const [roofModelData, setRoofModelData] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]); // List of all materials from API
  const [showDropdown, setShowDropdown] = useState(null); // Track which input dropdown is open
  const [categoryForm, setCategoryForm] = useState({ roofModel: "" });
  const [projectTypeData, setProjectTypeData] = useState([]);
 
  const [itemForm, setItemForm] = useState({
    roofType: "",
    roofModel: "",
    roofPreference: "",
    image: null,
    materials: [],
    span: "",
    length: "",
    height: "",
    typeOfPanel: "",
    sheetThickness: "",
    numberOfPanels: "",
    newLength: "",
    centerHeight: "",
    finalCuttingLength: "",
    totalArea: "",
    sheetRate: "",
  });
 
 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setCategoryForm((prev) => ({ ...prev, roofModelImage: file }));
  };
  
 
 
  const handleProductSubmit = async (e) => {
    e.preventDefault();
 
    console.log("Submitting Product Data:", itemForm); // Check before sending
 
    try {
      const response = await addProduct(itemForm);
      console.log(response);
     
      alert("Product added successfully!");
     
      setItemForm({
        roofType: "",
        roofModel: "",
        roofPreference: "",
        image: "",
        materials: [],
        span: "",
        length: "",
        height: "",
        typeOfPanel: "",
        sheetThickness: "",
        numberOfPanels: "",
        newLength: "",
        centerHeight: "",
        finalCuttingLength: "",
        totalArea: "",
        sheetRate: "",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      alert(error);
    }
  };
 
  // -------------------------------------------------
 
  useEffect(() => {
    const fetchAllProjectTypes = async () => {
      try {
        const categoriesData = await fetchAllProjectType();
        console.log("Fetched project types:", categoriesData);
        setProjectTypeData(categoriesData.projectTypes || []);
      } catch (error) {
        console.error("Error fetching project types:", error);
      }
    };
 
    const getAllMaterialItems = async () => {
      try {
        const response = await getAllMaterialItem();
        console.log("Fetched material items:", response);
        setAllMaterials(response.items || []);
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };
 
    getAllMaterialItems();
    fetchAllProjectTypes();
  }, []);
 
 
  const selectMaterial = (index, material) => {
    const selectedMaterial = {
      itemId: material._id, // Store ID for backend
      itemName: material.item, // Store name for UI display
      unit: materials[index].quantity || 1, // Use the quantity from materials array
    };
 
    // Update the materials array
    setItemForm((prevState) => {
      const updatedMaterials = [...prevState.materials];
      updatedMaterials[index] = selectedMaterial;
      return { ...prevState, materials: updatedMaterials };
    });
  
    setShowDropdown(null); // Close dropdown after selection
  };
  
  
 
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setRoofModelData(response.categories || []); // Ensure correct data structure
      console.log("Fetched categories:", response.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
 
  fetchCategories();
}, []);
     
 
     const handleCategoryChange = (e) => {
       const { name, value } = e.target;
      setCategoryForm((prevForm) => ({
         ...prevForm,
         [name]: value,
       }));
     };
 
 

const handleCategorytSubmit = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append("roofType", categoryForm.roofType);
    formData.append("roofModel", categoryForm.roofModel);
    if (categoryForm.roofModelImage) {
      formData.append("roofModelImage", categoryForm.roofModelImage);
    }

    const response = await createCategory( formData);

    if (response.success) {
      alert("Category added successfully!");
      setCategoryForm({
        roofType: "",
        roofModel: "",
        roofModelImage: null,
      });
    } else {
      alert(response.data.message || "An error occurred while adding the category.");
    }
  } catch (error) {
    alert(error.response?.data?.message || "An error occurred while adding the category.");
  }
};

 
 
const handleFindClick = () => {
  // Ensure the selected data is stored before navigating
  const selectedRoofData = {
    roofType: itemForm.roofType,
    roofModel: itemForm.roofModel,
    roofPreference: itemForm.roofPreference,
  };
 
  // Navigate and pass the selected values
  navigate("/admin/findproductview", { state: selectedRoofData });
};
 
  const navigate = useNavigate();
 
  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
 
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
 
        {/* Dashboard Content */}
        <div className="p-6 space-y-8 bg-gray-100 overflow-auto">
          {/* Dashboard Header */}
 
          {/* Action Cards */}
       
          <div className="bg-white p-6 rounded-md shadow-md mb-6 ">
          <form onSubmit={handleCategorytSubmit}>
 
          <h2 className="text-2xl font-medium mb-4 text-[#2A2493]">
             Add Category
            </h2>
           
            <div className="flex gap-4">
  {/* Project Type */}
  <div className="flex flex-col gap-2 w-1/2">
    <label className="text-sm font-medium text-[#15164A]">Project Type</label>
    <select
      name="roofType"
      value={categoryForm.roofType}
      onChange={handleCategoryChange}
      className="p-2 border border-gray-300 rounded-md"
    >
      <option value="">Select</option>
      {projectTypeData?.map((category) => (
        <option key={category._id} value={category._id}>
          {category.projectType}
        </option>
      ))}
    </select>
  </div>

  {/* Roof Model */}
  <div className="flex flex-col gap-2 w-1/2">
    <label className="text-sm font-medium text-[#15164A]">Roof Model</label>
    <input
      type="text"
      name="roofModel"
      value={categoryForm.roofModel}
      onChange={(e) =>
        setCategoryForm({ ...categoryForm, roofModel: e.target.value })
      }
      placeholder="Enter Roof Model"
      className="p-2 border border-gray-300 rounded-md"
    />
  </div>
</div>

  <div className="flex flex-col gap-2 pt-3">
  <label className="text-sm font-medium text-[#15164A]">Upload Image</label>
  <input type="file" className="p-2 border border-gray-300 rounded-md" onChange={handleImageChange} />
</div>
 
               
             <br />
               
                <div className="flex justify-center gap-6">
              {/* <button
                className=" px-5 py-3 bg-red-500 text-white rounded-md"
           
              >
                Cancel
              </button> */}
              <button className=" px-5 py-3 bg-blue-600 text-white rounded-md cursor-pointer"
             
             >
               Add
              </button>
            </div><br />
            </form>
 
            <h2 className="text-2xl font-medium mb-4 text-[#2A2493]">
              Product Adding
            </h2>
            <form className="space-y-6" onSubmit={handleProductSubmit} >
              {/* Row 1 - 3 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
  <label className="text-sm font-medium text-[#15164A]">Project Type</label>
  <select
  className="p-2 border border-gray-300 rounded-md"
  onChange={(e) => setItemForm({ ...itemForm, roofType: e.target.value })}
>
  <option value="">Select</option>
  {projectTypeData?.map((category) => (
    <option key={category._id} value={category._id}>
      {category.projectType}
    </option>
  ))}
</select>
 
</div>
 
<div className="flex flex-col gap-2">
  <label className="text-sm font-medium text-[#15164A]">Roof Model</label>
  <select
        className="p-2 border border-gray-300 rounded-md"
        onChange={(e) => setItemForm({ ...itemForm, roofModel: e.target.value })}
      >
        <option value="">Select Category</option>
        {roofModelData.map((roofModel) => (
          <option key={roofModel._id} value={roofModel._id}>
            {roofModel.roofModel}
          </option>
        ))}
      </select>
</div>
 
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">
                    Roof Preference
                  </label>
                  <select
        className="p-2 border border-gray-300 rounded-md"
        name="roofPreference"
        value={itemForm.roofPreference}
        onChange={(e) => setItemForm({ ...itemForm, roofPreference: e.target.value })}
      >
        <option value="">Select</option>
        <option value="Single Car Parking">Single Car Parking</option>
        <option value="Double Car Parking">Double Car Parking</option>
     
      </select>
                </div>
              </div>
 
              {/* Row 2 - 2 Columns */}
             
           
 
      {/* Dynamic Rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {materials.map((item, index) => (
  <div key={index} className="grid grid-cols-2 gap-4 col-span-2 relative">
    {/* Material Input with Clickable Dropdown */}
    <div className="flex flex-col gap-2 relative">
      <label className="text-sm font-medium text-[#15164A]">Material</label>
     
      <input
        type="text"
        className="p-2 border border-gray-300 rounded-md w-full"
        placeholder="Select Material"
        value={itemForm.materials[index]?.itemName || ""} // Show itemName instead of ID
        readOnly
        onClick={() => setShowDropdown(showDropdown === index ? null : index)}
      />
 
      {/* Dropdown List */}
      {showDropdown === index && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-auto z-10">
          {allMaterials.map((mat) => (
            <div
              key={mat._id}
              className="p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => selectMaterial(index, mat)}
            >
              {mat.item}
            </div>
          ))}
        </div>
      )}
    </div>
 
    {/* Quantity Input */}
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[#15164A]">Quantity</label>
      <input
        type="number"
        className="p-2 border border-gray-300 rounded-md"
        placeholder="Meter"
        value={item.quantity}
        onChange={(e) => handleMaterialChange(index, "quantity", e.target.value)}
      />
    </div>
  </div>
))}
 
 
 
 
    </div>
 
      {/* Button to Add More Rows */}
      <div className="flex flex-col items-end gap-2 mt-5">
        <h1
          className="text-lg font-medium underline cursor-pointer text-black-600"
          onClick={addNewMaterial}
        >
          Add New Material
        </h1>
      </div>
 
 
     
 
             
           
             
 
           
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">
                    Span
                  </label>
                  <input
                    type="number"
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="200m"
                    value={itemForm.span}
                    onChange={(e) => setItemForm({ ...itemForm, span: e.target.value })}/>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">
                    Length
                  </label>
                  <input
                    type="number"
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="250m"
                    value={itemForm.length}
                    onChange={(e) => setItemForm({ ...itemForm, length: e.target.value })}/>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">
                    Height
                  </label>
                  <input
                    type="number"
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="300m"
                    value={itemForm.height}
                    onChange={(e) => setItemForm({ ...itemForm, height: e.target.value })}/>
                </div>
              </div>
             
 
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">
                    Type of Panel
                  </label>
                  <input
                    type="number"
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="00"
                    value={itemForm.typeOfPanel}
                    onChange={(e) => setItemForm({ ...itemForm, typeOfPanel: e.target.value })}/>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">
                   Sheet Thickness
                  </label>
                  <input
                    type="number"
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="00"
                    value={itemForm.sheetThickness}
                    onChange={(e) => setItemForm({ ...itemForm, sheetThickness: e.target.value })}/>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">
                   No of Panel
                  </label>
                  <input
                    type="number"
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="00"
                    value={itemForm. numberOfPanels}
                    onChange={(e) => setItemForm({ ...itemForm, numberOfPanels: e.target.value })}/>
                </div>
              </div>
 
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">
                   New Length
                  </label>
                  <input
                    type="number"
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="00"
                    value={itemForm.newLength}
                    onChange={(e) => setItemForm({ ...itemForm, newLength: e.target.value })}/>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">
                Center Height
                  </label>
                  <input
                    type="number"
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="00"
                    value={itemForm.centerHeight}
                    onChange={(e) => setItemForm({ ...itemForm, centerHeight: e.target.value })}/>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">
                   Final Cutting Length
                  </label>
                  <input
                    type="number"
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="300m"
                    value={itemForm.finalCuttingLength}
                    onChange={(e) => setItemForm({ ...itemForm, finalCuttingLength: e.target.value })}/>
                </div>
              </div>
 
 
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">
                    Total Area
                  </label>
                  <input
                    type="number"
                    className="p-2 border border-gray-300 rounded-md bg-[#EEEEEE]"
                    placeholder="00"
                    value={itemForm.totalArea}
                    onChange={(e) => setItemForm({ ...itemForm, totalArea: e.target.value })}/></div>
 
                  <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]  ">
                    Sheet Rate
                  </label>
                  <input
                    type="number"
                    className="p-2 border border-gray-300 rounded-md bg-[#EEEEEE]"
                    placeholder="00"
                    value={itemForm.sheetRate}
                    onChange={(e) => setItemForm({ ...itemForm, sheetRate: e.target.value })}/></div>
                  </div>
 
 
              <div className="flex justify-center gap-5 px-10 md:py-20">
                <button className="bg-blue-600 p-2 rounded-md text-white px-5"
                 
                >
                  Add
                </button>
                <button className="bg-red-600 p-2 rounded-md text-white">
                  {" "}
                  Cancel
                </button>
              </div>
</form>
              <div className="flex flex-col items-end gap-2 mt-5">
        <h1
          className="text-lg font-medium underline cursor-pointer text-black-600"
          onClick={handleFindClick}
        >
         Find Existing Product
        </h1>
      </div>
           
         
          </div>
 
          {/* Tables */}
        </div>
      </div>
   
     
    </div>
  );
}
 
export default ProductsAdding;