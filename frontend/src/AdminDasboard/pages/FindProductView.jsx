// import Header from "../components/Header";
// import Sidebar from "../components/SideNav";
// import { useEffect, useState } from "react";
// import { fetchAllProjectType, getAllCategories, getAllMaterialItem } from "../../api/admin/product/getAllCategories";
// import { getFilteredProducts, updateProduct } from "../../api/admin/product/updateProduct";

// function FindProductView() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [productData, setProductData] = useState(null);
//   const [allMaterials, setAllMaterials] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(null);
  
//   const toggleSidebar = () => {
//     setIsSidebarOpen((prev) => !prev);
//   };
  
//   // State for filter form
//   const [filters, setFilters] = useState({
//     roofType: "",
//     roofModel: "",
//     roofPreference: ""
//   });
  
//   // State for data options
//   const [projectTypeData, setProjectTypeData] = useState([]);
//   const [roofModelData, setRoofModelData] = useState([]);
//   const [isAddingMaterial, setIsAddingMaterial] = useState(false);
//   const [newMaterial, setNewMaterial] = useState({ itemId: "", unit: 1 });

//   // Fetch project types and materials on component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch project types
//         const categoriesData = await fetchAllProjectType();
//         setProjectTypeData(categoriesData.projectTypes || []);
        
//         // Fetch roof models
//         const response = await getAllCategories();
//         setRoofModelData(response.categories || []);
        
//         // Fetch material items
//         const materialsResponse = await getAllMaterialItem();
//         setAllMaterials(materialsResponse.items || []);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   // Handler for filter form changes
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Fetch products based on filters
//   const fetchProducts = async () => {
//     // Validate filters have values
//     if (!filters.roofType || !filters.roofModel || !filters.roofPreference) {
//       alert("Please select all filter options");
//       return;
//     }
    
//     try {
//       const response = await getFilteredProducts(filters);
//       console.log("Fetched Products:", response);

//       if (response?.products?.length > 0) {
//         setProductData(response.products[0]);
//       } else {
//         alert("No products found with the selected criteria");
//         setProductData(null);
//       }
//     } catch (error) {
//       console.error("Error fetching Products:", error);
//       alert("Error fetching products: " + error.message);
//     }
//   };

//   // Handle product field changes
//   const handleProductChange = (field, value) => {
//     if (!productData) return;
    
//     setProductData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   // Handle material quantity change
//   const handleMaterialChange = (index, value) => {
//     if (!productData) return;
    
//     const updatedMaterials = [...productData.materials];
//     updatedMaterials[index] = {
//       ...updatedMaterials[index],
//       unit: value
//     };
    
//     setProductData(prev => ({
//       ...prev,
//       materials: updatedMaterials
//     }));
//   };

//   // Select material from dropdown
//   const selectMaterial = (material) => {
//     setNewMaterial({
//       itemId: material._id,
//       itemName: material.item,
//       unit: 1
//     });
    
//     setShowDropdown(null);
//   };

//   // Add a new material to the product
//   const addNewMaterial = () => {
//     if (!productData) return;
    
//     if (isAddingMaterial && newMaterial.itemId) {
//       // Find the selected material from allMaterials
//       const materialToAdd = allMaterials.find(mat => mat._id === newMaterial.itemId);
      
//       if (materialToAdd) {
//         // Format the new material object to match the API structure
//         const formattedMaterial = {
//           itemId: materialToAdd,
//           unit: newMaterial.unit
//         };
        
//         // Add the new material to the product
//         setProductData(prev => ({
//           ...prev,
//           materials: [...prev.materials, formattedMaterial]
//         }));
        
//         // Reset the new material form
//         setNewMaterial({ itemId: "", unit: 1 });
//         setIsAddingMaterial(false);
//       }
//     } else {
//       // Show the add material form
//       setIsAddingMaterial(true);
//     }
//   };

//   // Handle product update
//  // Fix for editProduct function in FindProductView.js
// const editProduct = async (e) => {
//   e.preventDefault();
  
//   if (!productData) {
//     alert("No product data to update");
//     return;
//   }
  
//   try {
//     // Create a formatted product object to send to the API
//     const formattedProduct = {
//       ...productData,
//       // Keep only the material IDs and quantities
//       materials: productData.materials.map(material => ({
//         itemId: material.itemId._id, // Send only the ID, not the entire object
//         unit: Number(material.unit)
//       }))
//     };
    
//     const response = await updateProduct(productData._id, formattedProduct);
    
//     if (response.success) {
//       alert("Product updated successfully!");
//       // Refresh the product data
//       fetchProducts();
//     } else {
//       alert(response.message || "Failed to update product");
//     }
//   } catch (error) {
//     console.error("Error updating product:", error);
//     alert("Error updating product: " + error.message);
//   }
// };

//   return (
//     <div className="h-screen flex bg-gray-100">
//       {/* Sidebar */}
//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         <Header toggleSidebar={toggleSidebar} />

//         {/* Dashboard Content */}
//         <div className="p-6 space-y-8 bg-gray-100 overflow-auto">
//           <div className="bg-white p-6 rounded-md shadow-md mb-6">
//             <h2 className="text-2xl font-medium mb-4 text-[#2A2493]">
//               Product Editing
//             </h2>
            
//             {/* Filter Form */}
//             <form className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {/* Project Type Filter */}
//                 <div className="flex flex-col gap-2">
//                   <label className="text-sm font-medium text-[#15164A]">Project Type</label>
//                   <select
//                     className="p-2 border border-gray-300 rounded-md"
//                     name="roofType"
//                     value={filters.roofType}
//                     onChange={handleFilterChange}
//                   >
//                     <option value="">Select</option>
//                     {projectTypeData?.map((category) => (
//                       <option key={category._id} value={category._id}>
//                         {category.projectType}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Roof Model Filter */}
//                 <div className="flex flex-col gap-2">
//                   <label className="text-sm font-medium text-[#15164A]">Roof Model</label>
//                   <select
//                     className="p-2 border border-gray-300 rounded-md"
//                     name="roofModel"
//                     value={filters.roofModel}
//                     onChange={handleFilterChange}
//                   >
//                     <option value="">Select Category</option>
//                     {roofModelData.map((roofModel) => (
//                       <option key={roofModel._id} value={roofModel._id}>
//                         {roofModel.roofModel}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Roof Preference Filter */}
//                 <div className="flex flex-col gap-2">
//                   <label className="text-sm font-medium text-[#15164A]">Roof Preference</label>
//                   <select
//                     className="p-2 border border-gray-300 rounded-md"
//                     name="roofPreference"
//                     value={filters.roofPreference}
//                     onChange={handleFilterChange}
//                   >
//                     <option value="">Select</option>
//                     <option value="Single Car Parking">Single Car Parking</option>
//                     <option value="Double Car Parking">Double Car Parking</option>
//                   </select>
//                 </div>
//               </div>
              
//               {/* Search Button */}
//               <div className="flex justify-center">
//                 <button 
//                   type="button" 
//                   className="bg-blue-600 p-2 rounded-md text-white px-5"
//                   onClick={fetchProducts}
//                 >
//                   Search Products
//                 </button>
//               </div>
//             </form>
            
//             {/* Product Edit Form - Only show if productData exists */}
//             {productData && (
//               <form className="space-y-6 mt-8" onSubmit={editProduct}>
//                 {/* Materials Section */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   {productData?.materials?.map((item, index) => (
//                     <div key={index} className="grid grid-cols-2 gap-4 col-span-2">
//                       <div className="flex flex-col gap-2">
//                         <label className="text-sm font-medium text-[#15164A]">Material</label>
//                         <input
//                           type="text"
//                           className="p-2 border border-gray-300 rounded-md"
//                           placeholder="Material"
//                           value={item.itemId?.item || ""}
//                           readOnly
//                         />
//                       </div>
//                       <div className="flex flex-col gap-2">
//                         <label className="text-sm font-medium text-[#15164A]">Quantity</label>
//                         <input
//                           type="number"
//                           className="p-2 border border-gray-300 rounded-md"
//                           placeholder="Quantity"
//                           value={item.unit || ""}
//                           onChange={(e) => handleMaterialChange(index, e.target.value)}
//                         />
//                       </div>
//                     </div>
//                   ))}
                  
//                   {/* Add new material form */}
//                   {isAddingMaterial && (
//                     <div className="grid grid-cols-2 gap-4 col-span-2">
//                       <div className="flex flex-col gap-2 relative">
//                         <label className="text-sm font-medium text-[#15164A]">Material</label>
//                         <input
//                           type="text"
//                           className="p-2 border border-gray-300 rounded-md"
//                           placeholder="Select Material"
//                           value={newMaterial.itemName || ""}
//                           readOnly
//                           onClick={() => setShowDropdown("newMaterial")}
//                         />
                        
//                         {/* Dropdown for material selection */}
//                         {showDropdown === "newMaterial" && (
//                           <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-auto z-10">
//                             {allMaterials.map((mat) => (
//                               <div
//                                 key={mat._id}
//                                 className="p-2 cursor-pointer hover:bg-gray-100"
//                                 onClick={() => selectMaterial(mat)}
//                               >
//                                 {mat.item}
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex flex-col gap-2">
//                         <label className="text-sm font-medium text-[#15164A]">Quantity</label>
//                         <input
//                           type="number"
//                           className="p-2 border border-gray-300 rounded-md"
//                           placeholder="Quantity"
//                           value={newMaterial.unit}
//                           onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
//                         />
//                       </div>
//                     </div>
//                   )}
                  
//                   {/* Add Material Button */}
//                   <div className="flex flex-col items-end gap-2 mt-5 col-span-3">
//                     <h1
//                       className="text-lg font-medium underline cursor-pointer text-black-600"
//                       onClick={addNewMaterial}
//                     >
//                       {isAddingMaterial ? "Save New Material" : "Add New Material"}
//                     </h1>
//                   </div>
//                 </div>

//                 {/* Upload Image */}
//                 <div className="flex flex-col gap-2">
//                   <label className="text-sm font-medium text-[#15164A]">Upload Image</label>
//                   <input
//                     type="file"
//                     className="border border-gray-300 rounded-md p-2 w-[300px] cursor-pointer"
//                   />
//                 </div>

//                 {/* Dimensions */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   {/* Span */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-medium text-[#15164A]">Span</label>
//                     <input
//                       type="number"
//                       className="p-2 border border-gray-300 rounded-md"
//                       placeholder="200m"
//                       value={productData?.span || ""}
//                       onChange={(e) => handleProductChange("span", e.target.value)}
//                     />
//                   </div>
                  
//                   {/* Length */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-medium text-[#15164A]">Length</label>
//                     <input
//                       type="number"
//                       className="p-2 border border-gray-300 rounded-md"
//                       placeholder="250m"
//                       value={productData?.length || ""}
//                       onChange={(e) => handleProductChange("length", e.target.value)}
//                     />
//                   </div>
                  
//                   {/* Height */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-medium text-[#15164A]">Height</label>
//                     <input
//                       type="number"
//                       className="p-2 border border-gray-300 rounded-md"
//                       placeholder="300m"
//                       value={productData?.height || ""}
//                       onChange={(e) => handleProductChange("height", e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 {/* Panel Info */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   {/* Type of Panel */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-medium text-[#15164A]">Type of Panel</label>
//                     <input
//                       type="number"
//                       className="p-2 border border-gray-300 rounded-md"
//                       placeholder="00"
//                       value={productData?.typeOfPanel || ""}
//                       onChange={(e) => handleProductChange("typeOfPanel", e.target.value)}
//                     />
//                   </div>
                  
//                   {/* Sheet Thickness */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-medium text-[#15164A]">Sheet Thickness</label>
//                     <input
//                       type="number"
//                       className="p-2 border border-gray-300 rounded-md"
//                       placeholder="00"
//                       value={productData?.sheetThickness || ""}
//                       onChange={(e) => handleProductChange("sheetThickness", e.target.value)}
//                     />
//                   </div>
                  
//                   {/* No of Panel */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-medium text-[#15164A]">No of Panel</label>
//                     <input
//                       type="number"
//                       className="p-2 border border-gray-300 rounded-md"
//                       placeholder="00"
//                       value={productData?.numberOfPanels || ""}
//                       onChange={(e) => handleProductChange("numberOfPanels", e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 {/* Length Info */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   {/* New Length */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-medium text-[#15164A]">New Length</label>
//                     <input
//                       type="number"
//                       className="p-2 border border-gray-300 rounded-md"
//                       placeholder="00"
//                       value={productData?.newLength || ""}
//                       onChange={(e) => handleProductChange("newLength", e.target.value)}
//                     />
//                   </div>
                  
//                   {/* Center Height */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-medium text-[#15164A]">Center Height</label>
//                     <input
//                       type="number"
//                       className="p-2 border border-gray-300 rounded-md"
//                       placeholder="00"
//                       value={productData?.centerHeight || ""}
//                       onChange={(e) => handleProductChange("centerHeight", e.target.value)}
//                     />
//                   </div>
                  
//                   {/* Final Cutting Length */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-medium text-[#15164A]">Final Cutting Length</label>
//                     <input
//                       type="number"
//                       className="p-2 border border-gray-300 rounded-md"
//                       placeholder="00"
//                       value={productData?.finalCuttingLength || ""}
//                       onChange={(e) => handleProductChange("finalCuttingLength", e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 {/* Area and Rate */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   {/* Total Area */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-medium text-[#15164A]">Total Area</label>
//                     <input
//                       type="number"
//                       className="p-2 border border-gray-300 rounded-md bg-[#EEEEEE]"
//                       placeholder="00"
//                       value={productData?.totalArea || ""}
//                       onChange={(e) => handleProductChange("totalArea", e.target.value)}
//                     />
//                   </div>
                  
//                   {/* Sheet Rate */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-medium text-[#15164A]">Sheet Rate</label>
//                     <input
//                       type="number"
//                       className="p-2 border border-gray-300 rounded-md bg-[#EEEEEE]"
//                       placeholder="00"
//                       value={productData?.sheetRate || ""}
//                       onChange={(e) => handleProductChange("sheetRate", e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex justify-center gap-5 px-10 md:py-10">
//                   <button 
//                     type="button" 
//                     className="bg-red-600 p-2 rounded-md text-white px-5"
//                     onClick={() => {
//                       setProductData(null);
//                       setFilters({
//                         roofType: "",
//                         roofModel: "",
//                         roofPreference: ""
//                       });
//                     }}
//                   >
//                     Cancel
//                   </button>
//                   <button 
//                     type="submit" 
//                     className="bg-blue-600 p-2 rounded-md text-white px-5"
//                   >
//                     Update Product
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default FindProductView;
import Header from "../components/Header";
import Sidebar from "../components/SideNav";
import { useEffect, useState } from "react";
import { fetchAllProjectType, getAllCategories, getAllMaterialItem } from "../../api/admin/product/getAllCategories";
import { getFilteredProducts, updateProduct } from "../../api/admin/product/updateProduct";

function FindProductView() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [productData, setProductData] = useState(null);
  const [allMaterials, setAllMaterials] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);
  
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  
  // State for filter form
  const [filters, setFilters] = useState({
    roofType: "",
    roofModel: "",
    roofPreference: ""
  });
  
  // State for data options
  const [projectTypeData, setProjectTypeData] = useState([]);
  const [roofModelData, setRoofModelData] = useState([]);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ itemId: "", unit: 1 });

  // Fetch project types and materials on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project types
        const categoriesData = await fetchAllProjectType();
        setProjectTypeData(categoriesData.projectTypes || []);
        
        // Fetch roof models
        const response = await getAllCategories();
        setRoofModelData(response.categories || []);
        
        // Fetch material items
        const materialsResponse = await getAllMaterialItem();
        setAllMaterials(materialsResponse.items || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Handler for filter form changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch products based on filters
  const fetchProducts = async () => {
    // Validate filters have values
    if (!filters.roofType || !filters.roofModel || !filters.roofPreference) {
      alert("Please select all filter options");
      return;
    }
    
    try {
      const response = await getFilteredProducts(filters);
      console.log("Fetched Products:", response);

      if (response?.products?.length > 0) {
        setProductData(response.products[0]);
      } else {
        alert("No products found with the selected criteria");
        setProductData(null);
      }
    } catch (error) {
      console.error("Error fetching Products:", error);
      alert("Error fetching products: " + error.message);
    }
  };

  // Handle product field changes
  const handleProductChange = (field, value) => {
    if (!productData) return;
    
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle material quantity change
  const handleMaterialChange = (index, value) => {
    if (!productData) return;
    
    const updatedMaterials = [...productData.materials];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      unit: value
    };
    
    setProductData(prev => ({
      ...prev,
      materials: updatedMaterials
    }));
  };

  // Remove a material from the product
  const removeMaterial = (index) => {
    if (!productData) return;
    
    // Create a copy of materials array without the item at specified index
    const updatedMaterials = productData.materials.filter((_, i) => i !== index);
    
    // Update product data with the new materials array
    setProductData(prev => ({
      ...prev,
      materials: updatedMaterials
    }));
  };

  // Select material from dropdown
  const selectMaterial = (material) => {
    setNewMaterial({
      itemId: material._id,
      itemName: material.item,
      unit: 1
    });
    
    setShowDropdown(null);
  };

  // Add a new material to the product
  const addNewMaterial = () => {
    if (!productData) return;
    
    if (isAddingMaterial && newMaterial.itemId) {
      // Find the selected material from allMaterials
      const materialToAdd = allMaterials.find(mat => mat._id === newMaterial.itemId);
      
      if (materialToAdd) {
        // Format the new material object to match the API structure
        const formattedMaterial = {
          itemId: materialToAdd,
          unit: newMaterial.unit
        };
        
        // Add the new material to the product
        setProductData(prev => ({
          ...prev,
          materials: [...prev.materials, formattedMaterial]
        }));
        
        // Reset the new material form
        setNewMaterial({ itemId: "", unit: 1 });
        setIsAddingMaterial(false);
      }
    } else {
      // Show the add material form
      setIsAddingMaterial(true);
    }
  };

  // Handle product update
  const editProduct = async (e) => {
    e.preventDefault();
    
    if (!productData) {
      alert("No product data to update");
      return;
    }
    
    try {
      // Create a formatted product object to send to the API
      const formattedProduct = {
        ...productData,
        // Keep only the material IDs and quantities
        materials: productData.materials.map(material => ({
          itemId: material.itemId._id, // Send only the ID, not the entire object
          unit: Number(material.unit)
        }))
      };
      
      const response = await updateProduct(productData._id, formattedProduct);
      
      if (response.success) {
        alert("Product updated successfully!");
        // Refresh the product data
        fetchProducts();
      } else {
        alert(response.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product: " + error.message);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />

        {/* Dashboard Content */}
        <div className="p-6 space-y-8 bg-gray-100 overflow-auto">
          <div className="bg-white p-6 rounded-md shadow-md mb-6">
            <h2 className="text-2xl font-medium mb-4 text-[#2A2493]">
              Product Editing
            </h2>
            
            {/* Filter Form */}
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Project Type Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">Project Type</label>
                  <select
                    className="p-2 border border-gray-300 rounded-md"
                    name="roofType"
                    value={filters.roofType}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select</option>
                    {projectTypeData?.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.projectType}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Roof Model Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">Roof Model</label>
                  <select
                    className="p-2 border border-gray-300 rounded-md"
                    name="roofModel"
                    value={filters.roofModel}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select Category</option>
                    {roofModelData.map((roofModel) => (
                      <option key={roofModel._id} value={roofModel._id}>
                        {roofModel.roofModel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Roof Preference Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">Roof Preference</label>
                  <select
                    className="p-2 border border-gray-300 rounded-md"
                    name="roofPreference"
                    value={filters.roofPreference}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select</option>
                    <option value="Single Car Parking">Single Car Parking</option>
                    <option value="Double Car Parking">Double Car Parking</option>
                  </select>
                </div>
              </div>
              
              {/* Search Button */}
              <div className="flex justify-center">
                <button 
                  type="button" 
                  className="bg-blue-600 p-2 rounded-md text-white px-5"
                  onClick={fetchProducts}
                >
                  Search Products
                </button>
              </div>
            </form>
            
            {/* Product Edit Form - Only show if productData exists */}
            {productData && (
              <form className="space-y-6 mt-8" onSubmit={editProduct}>
                {/* Materials Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {productData?.materials?.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 col-span-2 relative">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#15164A]">Material</label>
                        <input
                          type="text"
                          className="p-2 border border-gray-300 rounded-md"
                          placeholder="Material"
                          value={item.itemId?.item || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#15164A]">Quantity</label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            className="p-2 border border-gray-300 rounded-md flex-1"
                            placeholder="Quantity"
                            value={item.unit || ""}
                            onChange={(e) => handleMaterialChange(index, e.target.value)}
                          />
                          <button
                            type="button"
                            className="ml-2 bg-red-500 text-white p-2 rounded-md"
                            title="Remove Material"
                            onClick={() => removeMaterial(index)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add new material form */}
                  {isAddingMaterial && (
                    <div className="grid grid-cols-2 gap-4 col-span-2">
                      <div className="flex flex-col gap-2 relative">
                        <label className="text-sm font-medium text-[#15164A]">Material</label>
                        <input
                          type="text"
                          className="p-2 border border-gray-300 rounded-md"
                          placeholder="Select Material"
                          value={newMaterial.itemName || ""}
                          readOnly
                          onClick={() => setShowDropdown("newMaterial")}
                        />
                        
                        {/* Dropdown for material selection */}
                        {showDropdown === "newMaterial" && (
                          <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-auto z-10">
                            {allMaterials.map((mat) => (
                              <div
                                key={mat._id}
                                className="p-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => selectMaterial(mat)}
                              >
                                {mat.item}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#15164A]">Quantity</label>
                        <input
                          type="number"
                          className="p-2 border border-gray-300 rounded-md"
                          placeholder="Quantity"
                          value={newMaterial.unit}
                          onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Add Material Button */}
                  <div className="flex flex-col items-end gap-2 mt-5 col-span-3">
                    <h1
                      className="text-lg font-medium underline cursor-pointer text-black-600"
                      onClick={addNewMaterial}
                    >
                      {isAddingMaterial ? "Save New Material" : "Add New Material"}
                    </h1>
                  </div>
                </div>

                {/* Upload Image */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#15164A]">Upload Image</label>
                  <input
                    type="file"
                    className="border border-gray-300 rounded-md p-2 w-[300px] cursor-pointer"
                  />
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Span */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#15164A]">Span</label>
                    <input
                      type="number"
                      className="p-2 border border-gray-300 rounded-md"
                      placeholder="200m"
                      value={productData?.span || ""}
                      onChange={(e) => handleProductChange("span", e.target.value)}
                    />
                  </div>
                  
                  {/* Length */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#15164A]">Length</label>
                    <input
                      type="number"
                      className="p-2 border border-gray-300 rounded-md"
                      placeholder="250m"
                      value={productData?.length || ""}
                      onChange={(e) => handleProductChange("length", e.target.value)}
                    />
                  </div>
                  
                  {/* Height */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#15164A]">Height</label>
                    <input
                      type="number"
                      className="p-2 border border-gray-300 rounded-md"
                      placeholder="300m"
                      value={productData?.height || ""}
                      onChange={(e) => handleProductChange("height", e.target.value)}
                    />
                  </div>
                </div>

                {/* Panel Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Type of Panel */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#15164A]">Type of Panel</label>
                    <input
                      type="number"
                      className="p-2 border border-gray-300 rounded-md"
                      placeholder="00"
                      value={productData?.typeOfPanel || ""}
                      onChange={(e) => handleProductChange("typeOfPanel", e.target.value)}
                    />
                  </div>
                  
                  {/* Sheet Thickness */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#15164A]">Sheet Thickness</label>
                    <input
                      type="number"
                      className="p-2 border border-gray-300 rounded-md"
                      placeholder="00"
                      value={productData?.sheetThickness || ""}
                      onChange={(e) => handleProductChange("sheetThickness", e.target.value)}
                    />
                  </div>
                  
                  {/* No of Panel */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#15164A]">No of Panel</label>
                    <input
                      type="number"
                      className="p-2 border border-gray-300 rounded-md"
                      placeholder="00"
                      value={productData?.numberOfPanels || ""}
                      onChange={(e) => handleProductChange("numberOfPanels", e.target.value)}
                    />
                  </div>
                </div>

                {/* Length Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* New Length */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#15164A]">New Length</label>
                    <input
                      type="number"
                      className="p-2 border border-gray-300 rounded-md"
                      placeholder="00"
                      value={productData?.newLength || ""}
                      onChange={(e) => handleProductChange("newLength", e.target.value)}
                    />
                  </div>
                  
                  {/* Center Height */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#15164A]">Center Height</label>
                    <input
                      type="number"
                      className="p-2 border border-gray-300 rounded-md"
                      placeholder="00"
                      value={productData?.centerHeight || ""}
                      onChange={(e) => handleProductChange("centerHeight", e.target.value)}
                    />
                  </div>
                  
                  {/* Final Cutting Length */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#15164A]">Final Cutting Length</label>
                    <input
                      type="number"
                      className="p-2 border border-gray-300 rounded-md"
                      placeholder="00"
                      value={productData?.finalCuttingLength || ""}
                      onChange={(e) => handleProductChange("finalCuttingLength", e.target.value)}
                    />
                  </div>
                </div>

                {/* Area and Rate */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Area */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#15164A]">Total Area</label>
                    <input
                      type="number"
                      className="p-2 border border-gray-300 rounded-md bg-[#EEEEEE]"
                      placeholder="00"
                      value={productData?.totalArea || ""}
                      onChange={(e) => handleProductChange("totalArea", e.target.value)}
                    />
                  </div>
                  
                  {/* Sheet Rate */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#15164A]">Sheet Rate</label>
                    <input
                      type="number"
                      className="p-2 border border-gray-300 rounded-md bg-[#EEEEEE]"
                      placeholder="00"
                      value={productData?.sheetRate || ""}
                      onChange={(e) => handleProductChange("sheetRate", e.target.value)}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-5 px-10 md:py-10">
                  <button 
                    type="button" 
                    className="bg-red-600 p-2 rounded-md text-white px-5"
                    onClick={() => {
                      setProductData(null);
                      setFilters({
                        roofType: "",
                        roofModel: "",
                        roofPreference: ""
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-600 p-2 rounded-md text-white px-5"
                  >
                    Update Product
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindProductView;