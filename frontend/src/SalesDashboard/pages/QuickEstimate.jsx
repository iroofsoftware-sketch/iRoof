// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Header from "../../AdminDasboard/components/Header";
// import Sidebar from "../../SalesDashboard/components/Sidebar"
// import { getSitevisitor } from "../../api/admin/employee/sitevistor";
// import {
//   fetchAllProjectType,
//   getAllCategories,
// } from "../../api/admin/product/getAllCategories";
// import { getFilteredProducts } from "../../api/admin/product/updateProduct";
// import { getClient } from "../../api/admin/client/getClient";
// import { finalEstimate } from "../../api/admin/estimate/createEstimate";
// import { message } from "antd";

// const QuickEstimate = () => {
//   const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

//   // Form data state
//   const [formData, setFormData] = useState({
//     clientId: "",
//     clientName: "",
//     siteVisitorId: "",
//     areas: [
//       {
//         id: 1,
//         name: "Area 1",
//         projectType: "",
//         roofModel: "",
//         roofPreference: "",
//         span: "",
//         length: "",
//         height: "",
//         typeOfPanel: 0.305,
//         offset: 0,
//         sheetThickness: 0.6,
//         noOfBay: 1,
//         noOfWorkingDays: 5,
//         extraPanel: 2,
//         materialItems: [],
//         totalArea: "",
//         sheetRate: "",
//       },
//     ],
//     totalSqFt: 0,
//     totalCost: 0,
//   });

//   // State for live calculation preview
//   const [calculationPreview, setCalculationPreview] = useState({
//     totalAreaSqFt: 0,
//     totalBudget: 0,
//     isCalculating: false
//   });

//   // Reference data
//   const [projectTypes, setProjectTypes] = useState([]);
//   const [roofModels, setRoofModels] = useState([]);
//   const [siteVisitors, setSiteVisitors] = useState([]);
//   const [areaProductData, setAreaProductData] = useState({});

//   // Client search
//   const [clientList, setClientList] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredClients, setFilteredClients] = useState([]);

//   // Fetch initial data
//   useEffect(() => {
//     fetchProjectTypes();
//     fetchRoofModels();
//     fetchSiteVisitors();
//     fetchClients();
//   }, []);

//   // Calculate totals whenever area data changes
//   useEffect(() => {
//     calculateTotals();
//     calculateAreaPreview();
//   }, [formData.areas]);

//   // Update filtered clients when search term changes
//   useEffect(() => {
//     if (!searchTerm) {
//       setFilteredClients([]);
//       return;
//     }

//     if (Array.isArray(clientList)) {
//       const filtered = clientList.filter((client) =>
//         client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       setFilteredClients(filtered);
//     } else {
//       setFilteredClients([]);
//     }
//   }, [searchTerm, clientList]);

//   // API fetch functions
//   const fetchProjectTypes = async () => {
//     try {
//       const response = await fetchAllProjectType();
//       setProjectTypes(response.projectTypes || []);
//     } catch (error) {
//       console.error("Error fetching project types:", error);
//     }
//   };

//   const fetchRoofModels = async () => {
//     try {
//       const response = await getAllCategories();
//       setRoofModels(response.categories || []);
//     } catch (error) {
//       console.error("Error fetching roof models:", error);
//     }
//   };

//   const fetchSiteVisitors = async () => {
//     try {
//       const response = await getSitevisitor();
//       setSiteVisitors(response.data || []);
//     } catch (error) {
//       console.error("Error fetching site visitors:", error);
//     }
//   };

//   const fetchClients = async () => {
//     try {
//       const response = await getClient();
//       if (Array.isArray(response?.data)) {
//         setClientList(response.data);
//       } else if (
//         response?.data?.clients &&
//         Array.isArray(response.data.clients)
//       ) {
//         setClientList(response.data.clients);
//       } else {
//         setClientList([]);
//       }
//     } catch (error) {
//       console.error("Error fetching clients:", error);
//       setClientList([]);
//     }
//   };

//   const fetchProductForArea = async (areaId, filters) => {
//     try {
//       const response = await getFilteredProducts(filters);

//       if (response?.products?.length > 0) {
//         const productData = response.products[0];
//         console.log("Product data received:", productData);

//         // Update the specific area with product data
//         updateAreaWithProductData(areaId, productData);

//         // Store in separate state for reference
//         setAreaProductData((prevData) => ({
//           ...prevData,
//           [areaId]: productData,
//         }));
//       }
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };

//   // Form manipulation functions
//   const updateAreaWithProductData = (areaId, productData) => {
//     setFormData((prevData) => {
//       const updatedAreas = prevData.areas.map((area) => {
//         if (area.id === areaId) {
//           return {
//             ...area,
//             span: productData.span || area.span,
//             length: productData.length || area.length,
//             height: productData.height || area.height,
//             typeOfPanel: productData.typeOfPanel || area.typeOfPanel,
//             sheetThickness: productData.sheetThickness || area.sheetThickness,
//             materials: productData.materials || area.materials,
//             totalArea: productData.totalArea || area.totalArea,
//             sheetRate: productData.sheetRate || area.sheetRate,
//           };
//         }
//         return area;
//       });

//       return {
//         ...prevData,
//         areas: updatedAreas,
//       };
//     });
//   };

//   // Modify addNewArea to match the new structure
//   const addNewArea = () => {
//     const newAreaId = formData.areas.length + 1;
//     const newArea = {
//       id: newAreaId,
//       name: `Area ${newAreaId}`,
//       projectType: "",
//       roofModel: "",
//       roofPreference: "",
//       span: "",
//       length: "",
//       height: "",
//       typeOfPanel: 0.305,
//       offset: 0,
//       sheetThickness: 0.6,
//       noOfBay: 1,
//       noOfWorkingDays: 5,
//       extraPanel: 2,
//       materialItems: [],
//       totalArea: "",
//       sheetRate: "",
//     };

//     setFormData((prevData) => ({
//       ...prevData,
//       areas: [...prevData.areas, newArea],
//     }));
//   };

//   const removeArea = (areaId) => {
//     if (formData.areas.length <= 1) {
//       alert("You must have at least one area.");
//       return;
//     }

//     setFormData((prevData) => ({
//       ...prevData,
//       areas: prevData.areas.filter((area) => area.id !== areaId),
//     }));

//     // Also remove from areaProductData
//     setAreaProductData((prevData) => {
//       const newData = { ...prevData };
//       delete newData[areaId];
//       return newData;
//     });
//   };

//   // Calculate area and budget preview based on current dimensions
//   const calculateAreaPreview = () => {
//     setCalculationPreview(prev => ({...prev, isCalculating: true}));
    
//     // Calculate area total across all areas
//     let totalArea = 0;
//     formData.areas.forEach(area => {
//       const span = parseFloat(area.span) || 0;
//       const length = parseFloat(area.length) || 0;
      
//       if (span > 0 && length > 0) {
//         // Simple rectangular area calculation
//         const areaSize = span * length;
//         totalArea += areaSize;
//       }
//     });
    
//     // Calculate approximate budget based on area and average rate
//     // Using 121 as the base rate per square foot from the sample response
//     const basePricePerSqFt = 121;
//     const marginPercentage = 15; // From sample response
    
//     const basePrice = totalArea * basePricePerSqFt;
//     const marginAmount = (basePrice * marginPercentage) / 100;
//     const estimatedBudget = basePrice + marginAmount;
    
//     setCalculationPreview({
//       totalAreaSqFt: totalArea.toFixed(2),
//       totalBudget: estimatedBudget.toFixed(2),
//       isCalculating: false
//     });
//   };

//   // Modify the existing handleAreaChange to update projectType
//   const handleAreaChange = async (areaId, field, value) => {
//     // Update form data
//     setFormData((prevData) => {
//       const updatedAreas = prevData.areas.map((area) =>
//         area.id === areaId ? { ...area, [field]: value } : area
//       );

//       return {
//         ...prevData,
//         areas: updatedAreas,
//       };
//     });

//     // Check if we need to fetch product data
//     const area = formData.areas.find((a) => a.id === areaId);

//     // Create updated area with new field value
//     const updatedArea = { ...area, [field]: value };

//     if (
//       (field === "projectType" ||
//         field === "roofModel" ||
//         field === "roofPreference") &&
//       updatedArea.projectType &&
//       updatedArea.roofModel &&
//       updatedArea.roofPreference
//     ) {
//       const filters = {
//         roofType: updatedArea.projectType,
//         roofModel: updatedArea.roofModel,
//         roofPreference: updatedArea.roofPreference,
//       };

//       await fetchProductForArea(areaId, filters);
//     }
//   };

//   const handleMaterialChange = (areaId, materialIndex, value) => {
//     setFormData((prevData) => {
//       const updatedAreas = prevData.areas.map((area) => {
//         if (area.id === areaId) {
//           const updatedMaterials = [...area.materials];
//           updatedMaterials[materialIndex].unit = value;

//           return {
//             ...area,
//             materials: updatedMaterials,
//           };
//         }
//         return area;
//       });

//       return {
//         ...prevData,
//         areas: updatedAreas,
//       };
//     });
//   };

//   const handleClientSelect = (client) => {
//     setSearchTerm(client.name);
//     setFilteredClients([]);

//     setFormData((prevData) => ({
//       ...prevData,
//       clientId: client._id,
//       clientName: client.name,
//     }));
//   };

//   const handleSiteVisitorChange = (visitorId) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       siteVisitorId: visitorId,
//     }));
//   };

//   const calculateTotals = () => {
//     let totalSqFtSum = 0;
//     let totalCostSum = 0;

//     formData.areas.forEach((area) => {
//       const areaSqFt = parseFloat(area.totalArea) || 0;
//       const areaRate = parseFloat(area.sheetRate) || 0;

//       totalSqFtSum += areaSqFt;
//       totalCostSum += areaRate;
//     });

//     setFormData((prevData) => ({
//       ...prevData,
//       totalSqFt: totalSqFtSum.toFixed(2),
//       totalCost: totalCostSum.toFixed(2),
//     }));
//   };

//   const handleAreaInputChange = (areaId, field, value) => {
//     setFormData((prevData) => {
//       const updatedAreas = prevData.areas.map((area) =>
//         area.id === areaId ? { ...area, [field]: value } : area
//       );

//       return {
//         ...prevData,
//         areas: updatedAreas,
//       };
//     });
    
//     // Trigger area preview calculation after a short delay
//     setTimeout(() => calculateAreaPreview(), 300);
//   };

//   const handleSubmit = async () => {
//     // Validate form data
//     if (!formData.clientId) {
//       alert("Please select a client");
//       return;
//     }
  
//     if (!formData.siteVisitorId) {
//       alert("Please select a site visitor");
//       return;
//     }
  
//     // Prepare data for submission
//     const submitData = {
//       clientId: formData.clientId,
//       siteVisitorId: formData.siteVisitorId,
//       status: "Site Visit",
//       areas: formData.areas.map((area) => ({
//         span: parseFloat(area.span) || 0,
//         length: parseFloat(area.length) || 0,
//         height: parseFloat(area.height) || 0,
//         projectType: area.projectType,
//         roofModel: area.roofModel,
//         roofPreference: area.roofPreference,
//         typeOfPanel: parseFloat(area.typeOfPanel) || 0.305,
//         offset: parseFloat(area.offset) || 0,
//         sheetThickness: parseFloat(area.sheetThickness) || 0.6,
//         noOfBay: parseInt(area.noOfBay) || 1,
//         noOfWorkingDays: parseInt(area.noOfWorkingDays) || 5,
//         extraPanel: parseInt(area.extraPanel) || 2,
//         materialItems: [
//           ...(area.materials ? 
//             area.materials.map((material) => ({
//               itemId: material.itemId?._id || material.itemId,
//               unit: parseFloat(material.unit) || 0,
//             })) : 
//             []),
//           ...(area.materialItems || [])
//         ],
//       })),
//     };
  
//     try {
//       setCalculationPreview(prev => ({...prev, isCalculating: true}));
//       const response = await finalEstimate(submitData);
//       console.log("API Response:", response);
  
//       if (response.status === 201 || response.status === 200) {
//         // Update the calculation preview with the actual values from the response
//         if (response.data && response.data.estimate) {
//           setCalculationPreview({
//             totalAreaSqFt: response.data.estimate.totalAreaSqFt || 0,
//             totalBudget: response.data.estimate.totalBudget || 0,
//             isCalculating: false
//           });
//         }
        
//         if (response.data && response.data.estimate) {
//           // Update area sqft values from the response if available
//           if (response.data.estimate.sheetingPrice && Array.isArray(response.data.estimate.sheetingPrice)) {
//             // Update form data with actual area calculations returned from the server
//             setFormData(prevData => ({
//               ...prevData,
//               areas: prevData.areas.map((area, index) => {
//                 // Get corresponding area from response if it exists
//                 const responseArea = response.data.estimate.sheetingPrice[index];
//                 if (responseArea) {
//                   return {
//                     ...area,
//                     totalArea: responseArea.areaSqFt,
//                     sheetRate: responseArea.totalSheetingPrice + responseArea.materialCharge.totalCharge
//                     // Update any other area-specific properties returned from the API
//                   };
//                 }
//                 return area;
//               })
//             }));
//           }
//         }
//         message.success("Estimate created successfully!");
//         // navigate("/estimates");
//       } else {
//         const errorMsg =
//           response.data?.message ||
//           "Failed to create estimate. Please try again.";
//         message.error(errorMsg);
//         setCalculationPreview(prev => ({...prev, isCalculating: false}));
//       }
//     } catch (error) {
//       console.error("Error creating estimate:", error);
//       const errorMessage =
//         error.message ||
//         (typeof error === "object" ? JSON.stringify(error) : error) ||
//         "Unknown error";
//       message.error(`Failed to create estimate: ${errorMessage}`);
//       setCalculationPreview(prev => ({...prev, isCalculating: false}));
//     }
//   };

//   // For debugging purposes - show typeOfPanel and sheetThickness in UI
//   const getAreaRoofDetails = (area) => {
//     const projectType = projectTypes.find(t => t._id === area.projectType)?.projectType || "";
//     const roofModel = roofModels.find(m => m._id === area.roofModel)?.roofModel || "";
//     return `${projectType} - ${roofModel} - ${area.roofPreference}`;
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

//       {/* Main Content */}
//       <div className="flex-1 overflow-y-auto">
//         <Header toggleSidebar={toggleSidebar} />

//         <div className="p-6">
//           <div className="overflow-hidden bg-white rounded-lg shadow-lg">
//             {/* Client Selection Section */}
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center justify-between">
//                 <h1 className="text-2xl font-bold text-gray-800">
//                   Create Estimate
//                 </h1>
//                 <p
//                   className="text-blue-500 cursor-pointer"
//                   onClick={() => navigate("/admin/custommeasurement")}
//                 >
//                   Custom Measurements
//                 </p>
//               </div>
//               <div className="relative">
//                 <label className="block mb-2 text-sm font-medium text-gray-700">
//                   Client Name
//                 </label>
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Search for client"
//                   className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                 />

//                 {filteredClients.length > 0 && (
//                   <ul className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-60">
//                     {filteredClients.map((client) => (
//                       <li
//                         key={client._id}
//                         onClick={() => handleClientSelect(client)}
//                         className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-100 last:border-b-0"
//                       >
//                         {client.name}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>

//               {formData.clientId && (
//                 <div className="mt-2 text-sm text-green-600">
//                   Client selected: {formData.clientName}
//                 </div>
//               )}
//             </div>

//             {/* Areas Section */}
//             {formData.areas.map((area) => (
//               <div key={area.id} className="p-6 border-b border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-xl font-semibold text-indigo-900">
//                     {area.name}
//                   </h2>
//                   <div>
//                     {formData.areas.length > 1 && (
//                       <button
//                         onClick={() => removeArea(area.id)}
//                         className="px-4 py-2 text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
//                       >
//                         Remove Area
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 {/* Roof Selection Row */}
//                 <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Project Type
//                     </label>
//                     <select
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={area.projectType}
//                       onChange={(e) =>
//                         handleAreaChange(area.id, "projectType", e.target.value)
//                       }
//                     >
//                       <option value="">Select Project Type</option>
//                       {projectTypes.map((type) => (
//                         <option key={type._id} value={type._id}>
//                           {type.projectType}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Roof Model
//                     </label>
//                     <select
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={area.roofModel}
//                       onChange={(e) =>
//                         handleAreaChange(area.id, "roofModel", e.target.value)
//                       }
//                     >
//                       <option value="">Select Roof Model</option>
//                       {roofModels.map((model) => (
//                         <option key={model._id} value={model._id}>
//                           {model.roofModel}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Roof Preference
//                     </label>
//                     <select
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={area.roofPreference}
//                       onChange={(e) =>
//                         handleAreaChange(
//                           area.id,
//                           "roofPreference",
//                           e.target.value
//                         )
//                       }
//                     >
//                       <option value="">Select Preference</option>
//                       <option value="Single Car Parking">
//                         Single Car Parking
//                       </option>
//                       <option value="Double Car Parking">
//                         Double Car Parking
//                       </option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Technical Details Row - Display typeOfPanel and sheetThickness */}
//                 {area.projectType && area.roofModel && area.roofPreference && (
//                   <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
//                     <div>
//                       <label className="block mb-2 text-sm font-medium text-gray-700">
//                         Type of Panel
//                       </label>
//                       <input
//                         type="text"
//                         className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                         placeholder="Type of Panel"
//                         value={area.typeOfPanel}
//                         onChange={(e) =>
//                           handleAreaInputChange(area.id, "typeOfPanel", e.target.value)
//                         }
//                       />
//                       <p className="mt-1 text-xs text-gray-500">
//                         Auto-filled from selection: {getAreaRoofDetails(area)}
//                       </p>
//                     </div>

//                     <div>
//                       <label className="block mb-2 text-sm font-medium text-gray-700">
//                         Sheet Thickness
//                       </label>
//                       <input
//                         type="text"
//                         className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                         placeholder="Sheet Thickness"
//                         value={area.sheetThickness}
//                         onChange={(e) =>
//                           handleAreaInputChange(area.id, "sheetThickness", e.target.value)
//                         }
//                       />
//                       <p className="mt-1 text-xs text-gray-500">
//                         Auto-filled from selection
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {/* Measurements Row */}
//                 <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Span
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Enter span"
//                       value={area.span}
//                       onChange={(e) =>
//                         handleAreaInputChange(area.id, "span", e.target.value)
//                       }
//                     />
//                   </div>

//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Length
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Enter length"
//                       value={area.length}
//                       onChange={(e) =>
//                         handleAreaInputChange(area.id, "length", e.target.value)
//                       }
//                     />
//                   </div>

//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Height
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Enter height"
//                       value={area.height}
//                       onChange={(e) =>
//                         handleAreaInputChange(area.id, "height", e.target.value)
//                       }
//                     />
//                   </div>
//                 </div>

//                 {/* Materials Section */}
//                 {area.materials && area.materials.length > 0 && (
//                   <div className="mb-6">
//                     <h3 className="mb-3 text-lg font-medium text-gray-800">
//                       Materials
//                     </h3>

//                     <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                       {area.materials.map((material, index) => (
//                         <div key={index} className="flex space-x-4">
//                           <div className="flex-1">
//                             <label className="block mb-2 text-sm font-medium text-gray-700">
//                               Material
//                             </label>
//                             <input
//                               type="text"
//                               className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md"
//                               value={material.itemId?.item || ""}
//                               readOnly
//                             />
//                           </div>

//                           <div className="flex-1">
//                             <label className="block mb-2 text-sm font-medium text-gray-700">
//                               Quantity
//                             </label>
//                             <input
//                               type="text"
//                               className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                               placeholder="Enter quantity"
//                               value={material.unit || ""}
//                               onChange={(e) =>
//                                 handleMaterialChange(
//                                   area.id,
//                                   index,
//                                   e.target.value
//                                 )
//                               }
//                             />
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Area Calculations */}
//                 <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Area Sq. Ft
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Total area"
//                       value={area.totalArea}
//                       onChange={(e) =>
//                         handleAreaInputChange(
//                           area.id,
//                           "totalArea",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </div>

//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">
//                       Sheet Rate
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Rate per sq ft"
//                       value={area.sheetRate}
//                       onChange={(e) =>
//                         handleAreaInputChange(
//                           area.id,
//                           "sheetRate",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </div>
//                 </div>
//               </div>
//             ))}

//             {/* Add New Area Button */}
//             <div className="p-6 border-b border-gray-200">
//               <button
//                 onClick={addNewArea}
//                 className="px-6 py-2 text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700"
//               >
//                 Add New Area +
//               </button>
//             </div>

//             {/* Site Visitor Assignment */}
//             <div className="p-6 border-b border-gray-200">
//               <label className="block mb-2 text-sm font-medium text-gray-700">
//                 Assign To Site Visitor
//               </label>
//               <select
//                 className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                 value={formData.siteVisitorId}
//                 onChange={(e) => handleSiteVisitorChange(e.target.value)}
//               >
//                 <option value="">Select Site Visitor</option>
//                 {siteVisitors.map((visitor) => (
//                   <option key={visitor._id} value={visitor._id}>
//                     {visitor.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Live Calculation Preview */}
//             {/* <div className="p-4 mb-6 bg-indigo-50 border border-indigo-100 rounded-md mx-6">
//               <h3 className="text-lg font-medium text-indigo-800 mb-3">
//                 Calculation Preview
//               </h3>
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-indigo-700">
//                     Estimated Total Area
//                   </label>
//                   <input
//                     type="text"
//                     value={`${calculationPreview.totalAreaSqFt} sq. ft.`}
//                     readOnly
//                     className="w-full p-3 font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-md"
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-indigo-700">
//                     Estimated Budget
//                   </label>
//                   <input
//                     type="text"
//                     value={`₹${calculationPreview.totalBudget}/-`}
//                     readOnly
//                     className="w-full p-3 font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-md"
//                   />
//                 </div>
//               </div>
//               <p className="text-xs text-indigo-600 mt-2">
//                 These values will update as you change dimensions and after submission
//               </p>
//             </div> */}

//             {/* Totals and Submit Section */}
//             <div className="p-6 bg-gray-50">
//               <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Total Square Feet
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.totalSqFt}
//                     readOnly
//                     className="w-full p-3 font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md"
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Total Cost
//                   </label>
//                   <input
//                     type="text"
//                     value={`₹${formData.totalCost}/-`}
//                     readOnly
//                     className="w-full p-3 font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-center mt-6">
//                 <button
//                   onClick={handleSubmit}
//                   className="px-8 py-3 text-lg font-semibold text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
//                   disabled={!formData.clientId || !formData.siteVisitorId || calculationPreview.isCalculating}
//                 >
//                   {calculationPreview.isCalculating ? 'Calculating...' : 'Create Estimate'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QuickEstimate;




// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Header from "../../AdminDasboard/components/Header";
// import Sidebar from "../../SalesDashboard/components/Sidebar";
// import { getSitevisitor } from "../../api/admin/employee/sitevistor";
// import {
//   fetchAllProjectType,
//   getAllCategories,
// } from "../../api/admin/product/getAllCategories";
// import { getFilteredProducts } from "../../api/admin/product/updateProduct";
// import { getClient } from "../../api/admin/client/getClient";
// import { finalEstimate } from "../../api/admin/estimate/createEstimate";
// import { message } from "antd";

// const QuickEstimate = () => {
//   const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

//   // Form data state
//   const [formData, setFormData] = useState({
//     clientId: "",
//     clientName: "",
//     siteVisitorId: "",
//     areas: [
//       {
//         id: 1,
//         name: "Area 1",
//         projectType: "",
//         roofModel: "",
//         roofPreference: "",
//         span: "",
//         length: "",
//         height: "",
//         typeOfPanel: 0.305,
//         offset: 0,
//         sheetThickness: 0.6,
//         noOfBay: 1,
//         noOfWorkingDays: 5,
//         extraPanel: 2,
//         materialItems: [],
//         totalArea: "",
//         sheetRate: "",
//         // New response fields
//         finalCuttingLength: "",
//         totalnoOfPanels: "",
//         finalNewlength: "",
//         totalNumberofSheet: ""
//       },
//     ],
//     totalSqFt: 0,
//     totalCost: 0,
//   });

//   // State for live calculation preview
//   const [calculationPreview, setCalculationPreview] = useState({
//     totalAreaSqFt: 0,
//     totalBudget: 0,
//     isCalculating: false
//   });

//   // Reference data
//   const [projectTypes, setProjectTypes] = useState([]);
//   const [roofModels, setRoofModels] = useState([]);
//   const [siteVisitors, setSiteVisitors] = useState([]);
//   const [areaProductData, setAreaProductData] = useState({});

//   // Client search
//   const [clientList, setClientList] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredClients, setFilteredClients] = useState([]);

//   // Fetch initial data
//   useEffect(() => {
//     Promise.all([
//       fetchProjectTypes(),
//       fetchRoofModels(),
//       fetchSiteVisitors(),
//       fetchClients()
//     ]);
//   }, []);

//   // Calculate totals whenever area data changes
//   useEffect(() => {
//     calculateTotals();
//     calculateAreaPreview();
//   }, [formData.areas]);

//   // Update filtered clients when search term changes
//   useEffect(() => {
//     if (!searchTerm) {
//       setFilteredClients([]);
//       return;
//     }

//     if (Array.isArray(clientList)) {
//       const filtered = clientList.filter((client) =>
//         client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       setFilteredClients(filtered);
//     } else {
//       setFilteredClients([]);
//     }
//   }, [searchTerm, clientList]);

//   // API fetch functions
//   const fetchProjectTypes = async () => {
//     try {
//       const response = await fetchAllProjectType();
//       setProjectTypes(response.projectTypes || []);
//     } catch (error) {
//       console.error("Error fetching project types:", error);
//     }
//   };

//   const fetchRoofModels = async () => {
//     try {
//       const response = await getAllCategories();
//       setRoofModels(response.categories || []);
//     } catch (error) {
//       console.error("Error fetching roof models:", error);
//     }
//   };

//   const fetchSiteVisitors = async () => {
//     try {
//       const response = await getSitevisitor();
//       setSiteVisitors(response.data || []);
//     } catch (error) {
//       console.error("Error fetching site visitors:", error);
//     }
//   };

//   const fetchClients = async () => {
//     try {
//       const response = await getClient();
//       setClientList(Array.isArray(response?.data) 
//         ? response.data 
//         : (response?.data?.clients && Array.isArray(response.data.clients) 
//             ? response.data.clients 
//             : []));
//     } catch (error) {
//       console.error("Error fetching clients:", error);
//       setClientList([]);
//     }
//   };

//   const fetchProductForArea = async (areaId, filters) => {
//     try {
//       const response = await getFilteredProducts(filters);

//       if (response?.products?.length > 0) {
//         const productData = response.products[0];
//         console.log("Product data received:", productData);

//         // Update the specific area with product data
//         updateAreaWithProductData(areaId, productData);

//         // Store in separate state for reference
//         setAreaProductData((prevData) => ({
//           ...prevData,
//           [areaId]: productData,
//         }));
//       }
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };

//   // Form manipulation functions
//   const updateAreaWithProductData = (areaId, productData) => {
//     setFormData((prevData) => {
//       const updatedAreas = prevData.areas.map((area) => {
//         if (area.id === areaId) {
//           return {
//             ...area,
//             span: productData.span || area.span,
//             length: productData.length || area.length,
//             height: productData.height || area.height,
//             typeOfPanel: productData.typeOfPanel || area.typeOfPanel,
//             sheetThickness: productData.sheetThickness || area.sheetThickness,
//             // Add the dynamic fields from product data
//             offset: productData.offset || area.offset || 0,
//             noOfBay: productData.noOfBay || area.noOfBay || 1,
//             extraPanel: productData.extraPanel || area.extraPanel || 2,
//             materials: productData.materials || area.materials,
//             totalArea: productData.totalArea || area.totalArea,
//             sheetRate: productData.sheetRate || area.sheetRate,
//           };
//         }
//         return area;
//       });

//       return {
//         ...prevData,
//         areas: updatedAreas,
//       };
//     });
//   };

//   const addNewArea = () => {
//     const newAreaId = formData.areas.length + 1;
//     const newArea = {
//       id: newAreaId,
//       name: `Area ${newAreaId}`,
//       projectType: "",
//       roofModel: "",
//       roofPreference: "",
//       span: "",
//       length: "",
//       height: "",
//       typeOfPanel: 0.305,
//       offset: 0,
//       sheetThickness: 0.6,
//       noOfBay: 1,
//       noOfWorkingDays: 5,
//       extraPanel: 0,
//       materialItems: [],
//       totalArea: "",
//       sheetRate: "",
//       finalCuttingLength: "",
//       totalnoOfPanels: "",
//       finalNewlength: "",
//       totalNumberofSheet: ""
//     };

//     setFormData((prevData) => ({
//       ...prevData,
//       areas: [...prevData.areas, newArea],
//     }));
//   };

//   const removeArea = (areaId) => {
//     if (formData.areas.length <= 1) {
//       message.warning("You must have at least one area.");
//       return;
//     }

//     setFormData((prevData) => ({
//       ...prevData,
//       areas: prevData.areas.filter((area) => area.id !== areaId),
//     }));

//     setAreaProductData((prevData) => {
//       const newData = { ...prevData };
//       delete newData[areaId];
//       return newData;
//     });
//   };

//   // Calculate area and budget preview based on current dimensions
//   const calculateAreaPreview = () => {
//     setCalculationPreview(prev => ({...prev, isCalculating: true}));
    
//     // Calculate area total across all areas
//     let totalArea = 0;
//     formData.areas.forEach(area => {
//       const span = parseFloat(area.span) || 0;
//       const length = parseFloat(area.length) || 0;
      
//       if (span > 0 && length > 0) {
//         totalArea += span * length;
//       }
//     });
    
//     // Calculate approximate budget based on area and average rate
//     const basePricePerSqFt = 121;
//     const marginPercentage = 15; 
    
//     const basePrice = totalArea * basePricePerSqFt;
//     const marginAmount = (basePrice * marginPercentage) / 100;
//     const estimatedBudget = basePrice + marginAmount;
    
//     setCalculationPreview({
//       totalAreaSqFt: totalArea.toFixed(2),
//       totalBudget: estimatedBudget.toFixed(2),
//       isCalculating: false
//     });
//   };

//   const handleAreaChange = async (areaId, field, value) => {
//     // Update form data
//     setFormData((prevData) => ({
//       ...prevData,
//       areas: prevData.areas.map((area) =>
//         area.id === areaId ? { ...area, [field]: value } : area
//       )
//     }));

//     // Check if we need to fetch product data
//     const area = formData.areas.find((a) => a.id === areaId);

//     // Create updated area with new field value
//     const updatedArea = { ...area, [field]: value };

//     if (
//       (field === "projectType" ||
//         field === "roofModel" ||
//         field === "roofPreference") &&
//       updatedArea.projectType &&
//       updatedArea.roofModel &&
//       updatedArea.roofPreference
//     ) {
//       const filters = {
//         roofType: updatedArea.projectType,
//         roofModel: updatedArea.roofModel,
//         roofPreference: updatedArea.roofPreference,
//       };

//       await fetchProductForArea(areaId, filters);
//     }
//   };

//   const handleMaterialChange = (areaId, materialIndex, value) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       areas: prevData.areas.map((area) => 
//         area.id === areaId 
//           ? {
//               ...area,
//               materials: area.materials.map((material, idx) => 
//                 idx === materialIndex 
//                   ? { ...material, unit: value } 
//                   : material
//               )
//             } 
//           : area
//       )
//     }));
//   };

//   const handleClientSelect = (client) => {
//     setSearchTerm(client.name);
//     setFilteredClients([]);
//     setFormData((prevData) => ({
//       ...prevData,
//       clientId: client._id,
//       clientName: client.name,
//     }));
//   };

//   const handleSiteVisitorChange = (visitorId) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       siteVisitorId: visitorId,
//     }));
//   };

//   const calculateTotals = () => {
//     let totalSqFtSum = 0;
//     let totalCostSum = 0;

//     formData.areas.forEach((area) => {
//       const areaSqFt = parseFloat(area.totalArea) || 0;
//       const areaRate = parseFloat(area.sheetRate) || 0;

//       totalSqFtSum += areaSqFt;
//       totalCostSum += areaRate;
//     });

//     setFormData((prevData) => ({
//       ...prevData,
//       totalSqFt: totalSqFtSum.toFixed(2),
//       totalCost: totalCostSum.toFixed(2),
//     }));
//   };

//   const handleAreaInputChange = (areaId, field, value) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       areas: prevData.areas.map((area) =>
//         area.id === areaId ? { ...area, [field]: value } : area
//       )
//     }));
    
//     setTimeout(() => calculateAreaPreview(), 300);
//   };

//   const handleSubmit = async () => {
//     // Validate form data
//     if (!formData.clientId) {
//       message.error("Please select a client");
//       return;
//     }
  
//     if (!formData.siteVisitorId) {
//       message.error("Please select a site visitor");
//       return;
//     }
  
//     // Prepare data for submission
//     const submitData = {
//       clientId: formData.clientId,
//       siteVisitorId: formData.siteVisitorId,
//       status: "Site Visit",
//       areas: formData.areas.map((area) => ({
//         span: parseFloat(area.span) || 0,
//         length: parseFloat(area.length) || 0,
//         height: parseFloat(area.height) || 0,
//         projectType: area.projectType,
//         roofModel: area.roofModel,
//         roofPreference: area.roofPreference,
//         typeOfPanel: parseFloat(area.typeOfPanel) || 0.305,
//         offset: parseFloat(area.offset) || 0,
//         sheetThickness: parseFloat(area.sheetThickness) || 0.6,
//         noOfBay: parseInt(area.noOfBay) || 1,
//         noOfWorkingDays: parseInt(area.noOfWorkingDays) || 5,
//         extraPanel: parseInt(area.extraPanel) || 0,
//         materialItems: [
//           ...(area.materials ? 
//             area.materials.map((material) => ({
//               itemId: material.itemId?._id || material.itemId,
//               unit: parseFloat(material.unit) || 0,
//             })) : 
//             []),
//           ...(area.materialItems || [])
//         ],
//       })),
//     };
  
//     try {
//       setCalculationPreview(prev => ({...prev, isCalculating: true}));
//       const response = await finalEstimate(submitData);
//       console.log("API Response:", response);
  
//       if (response.status === 201 || response.status === 200) {
//         // Update calculation preview with response values
//         if (response.data?.estimate) {
//           setCalculationPreview({
//             totalAreaSqFt: response.data.estimate.totalAreaSqFt || 0,
//             totalBudget: response.data.estimate.totalBudget || 0,
//             isCalculating: false
//           });
//         }
        
//         // Update area data with values from the response
//         if (response.data?.estimate?.sheetingPrice && Array.isArray(response.data.estimate.sheetingPrice)) {
//           setFormData(prevData => ({
//             ...prevData,
//             areas: prevData.areas.map((area, index) => {
//               const responseArea = response.data.estimate.sheetingPrice[index];
//               if (responseArea) {
//                 return {
//                   ...area,
//                   totalArea: responseArea.areaSqFt,
//                   sheetRate: responseArea.totalSheetingPrice + (responseArea.materialCharge?.totalCharge || 0),
//                   // Add the new response fields
//                   finalCuttingLength: responseArea.finalCuttingLength || "",
//                   totalnoOfPanels: responseArea.totalnoOfPanels || "",
//                   finalNewlength: responseArea.finalNewlength || "",
//                   totalNumberofSheet: responseArea.totalNumberofSheet || ""
//                 };
//               }
//               return area;
//             })
//           }));
//         }
//         message.success("Estimate created successfully!");
//       } else {
//         const errorMsg = response.data?.message || "Failed to create estimate. Please try again.";
//         message.error(errorMsg);
//         setCalculationPreview(prev => ({...prev, isCalculating: false}));
//       }
//     } catch (error) {
//       console.error("Error creating estimate:", error);
//       const errorMessage = error.message || 
//         (typeof error === "object" ? JSON.stringify(error) : error) || 
//         "Unknown error";
//       message.error(`Failed to create estimate: ${errorMessage}`);
//       setCalculationPreview(prev => ({...prev, isCalculating: false}));
//     }
//   };

//   // For debugging purposes - show typeOfPanel and sheetThickness in UI
//   const getAreaRoofDetails = (area) => {
//     const projectType = projectTypes.find(t => t._id === area.projectType)?.projectType || "";
//     const roofModel = roofModels.find(m => m._id === area.roofModel)?.roofModel || "";
//     return `${projectType} - ${roofModel} - ${area.roofPreference}`;
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

//       {/* Main Content */}
//       <div className="flex-1 overflow-y-auto">
//         <Header toggleSidebar={toggleSidebar} />

//         <div className="p-6">
//           <div className="overflow-hidden bg-white rounded-lg shadow-lg">
//             {/* Client Selection Section */}
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center justify-between">
//                 <h1 className="text-2xl font-bold text-gray-800">Create Estimate</h1>
//                 <p
//                   className="text-blue-500 cursor-pointer"
//                   onClick={() => navigate("/admin/custommeasurement")}
//                 >
//                   Custom Measurements
//                 </p>
//               </div>
//               <div className="relative">
//                 <label className="block mb-2 text-sm font-medium text-gray-700">Client Name</label>
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Search for client"
//                   className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                 />

//                 {filteredClients.length > 0 && (
//                   <ul className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-60">
//                     {filteredClients.map((client) => (
//                       <li
//                         key={client._id}
//                         onClick={() => handleClientSelect(client)}
//                         className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-100 last:border-b-0"
//                       >
//                         {client.name}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>

//               {formData.clientId && (
//                 <div className="mt-2 text-sm text-green-600">
//                   Client selected: {formData.clientName}
//                 </div>
//               )}
//             </div>

//             {/* Areas Section */}
//             {formData.areas.map((area) => (
//               <div key={area.id} className="p-6 border-b border-gray-200">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-xl font-semibold text-indigo-900">{area.name}</h2>
//                   <div>
//                     {formData.areas.length > 1 && (
//                       <button
//                         onClick={() => removeArea(area.id)}
//                         className="px-4 py-2 text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
//                       >
//                         Remove Area
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 {/* Roof Selection Row */}
//                 <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">Project Type</label>
//                     <select
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={area.projectType}
//                       onChange={(e) => handleAreaChange(area.id, "projectType", e.target.value)}
//                     >
//                       <option value="">Select Project Type</option>
//                       {projectTypes.map((type) => (
//                         <option key={type._id} value={type._id}>{type.projectType}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">Roof Model</label>
//                     <select
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={area.roofModel}
//                       onChange={(e) => handleAreaChange(area.id, "roofModel", e.target.value)}
//                     >
//                       <option value="">Select Roof Model</option>
//                       {roofModels.map((model) => (
//                         <option key={model._id} value={model._id}>{model.roofModel}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">Roof Preference</label>
//                     <select
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={area.roofPreference}
//                       onChange={(e) => handleAreaChange(area.id, "roofPreference", e.target.value)}
//                     >
//                       <option value="">Select Preference</option>
//                       <option value="Single Car Parking">Single Car Parking</option>
//                       <option value="Double Car Parking">Double Car Parking</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Technical Details Row - Including dynamic fields */}
//                 {area.projectType && area.roofModel && area.roofPreference && (
//                   <div className="grid grid-cols-2 gap-6 mb-6 md:grid-cols-3 lg:grid-cols-5">
//                     <div>
//                       <label className="block mb-2 text-sm font-medium text-gray-700">Type of Panel</label>
//                       <input
//                         type="text"
//                         className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                         placeholder="Type of Panel"
//                         value={area.typeOfPanel}
//                         onChange={(e) => handleAreaInputChange(area.id, "typeOfPanel", e.target.value)}
//                       />
//                     </div>

//                     <div>
//                       <label className="block mb-2 text-sm font-medium text-gray-700">Sheet Thickness</label>
//                       <input
//                         type="text"
//                         className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                         placeholder="Sheet Thickness"
//                         value={area.sheetThickness}
//                         onChange={(e) => handleAreaInputChange(area.id, "sheetThickness", e.target.value)}
//                       />
//                     </div>
                    
//                     {/* Dynamic fields */}
//                     <div>
//                       <label className="block mb-2 text-sm font-medium text-gray-700">Offset</label>
//                       <input
//                         type="number"
//                         className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                         placeholder="Offset"
//                         value={area.offset}
//                         onChange={(e) => handleAreaInputChange(area.id, "offset", e.target.value)}
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block mb-2 text-sm font-medium text-gray-700">No. of Bay</label>
//                       <input
//                         type="number"
//                         className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                         placeholder="No. of Bay"
//                         value={area.noOfBay}
//                         onChange={(e) => handleAreaInputChange(area.id, "noOfBay", e.target.value)}
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block mb-2 text-sm font-medium text-gray-700">Extra Panel</label>
//                       <input
//                         type="number"
//                         className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                         placeholder="Extra Panel"
//                         value={area.extraPanel}
//                         onChange={(e) => handleAreaInputChange(area.id, "extraPanel", e.target.value)}
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {/* Measurements Row */}
//                 <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">Span</label>
//                     <input
//                       type="text"
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Enter span"
//                       value={area.span}
//                       onChange={(e) => handleAreaInputChange(area.id, "span", e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">Length</label>
//                     <input
//                       type="text"
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Enter length"
//                       value={area.length}
//                       onChange={(e) => handleAreaInputChange(area.id, "length", e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">Height</label>
//                     <input
//                       type="text"
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Enter height"
//                       value={area.height}
//                       onChange={(e) => handleAreaInputChange(area.id, "height", e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 {/* Materials Section */}
//                 {area.materials && area.materials.length > 0 && (
//                   <div className="mb-6">
//                     <h3 className="mb-3 text-lg font-medium text-gray-800">Materials</h3>

//                     <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                       {area.materials.map((material, index) => (
//                         <div key={index} className="flex space-x-4">
//                           <div className="flex-1">
//                             <label className="block mb-2 text-sm font-medium text-gray-700">Material</label>
//                             <input
//                               type="text"
//                               className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md"
//                               value={material.itemId?.item || ""}
//                               readOnly
//                             />
//                           </div>

//                           <div className="flex-1">
//                             <label className="block mb-2 text-sm font-medium text-gray-700">Quantity</label>
//                             <input
//                               type="text"
//                               className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                               placeholder="Enter quantity"
//                               value={material.unit || ""}
//                               onChange={(e) => handleMaterialChange(area.id, index, e.target.value)}
//                             />
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Area Calculations */}
//                 <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2 lg:grid-cols-4">
//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">Area Sq. Ft</label>
//                     <input
//                       type="text"
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Total area"
//                       value={area.totalArea}
//                       onChange={(e) => handleAreaInputChange(area.id, "totalArea", e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label className="block mb-2 text-sm font-medium text-gray-700">Sheet Rate</label>
//                     <input
//                       type="text"
//                       className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                       placeholder="Rate per sq ft"
//                       value={area.sheetRate}
//                       onChange={(e) => handleAreaInputChange(area.id, "sheetRate", e.target.value)}
//                     />
//                   </div>
//                 </div>
                
//                 {/* Response values display */}
//                 {(area.finalCuttingLength || area.totalnoOfPanels || area.finalNewlength || area.totalNumberofSheet) && (
//                   <div className="mt-6 p-4 bg-blue-50 rounded-md">
//                     <h3 className="text-lg font-medium text-blue-800 mb-3">Calculation Results</h3>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                       <div>
//                         <label className="block mb-1 text-sm font-medium text-blue-700">Cutting Length</label>
//                         <input
//                           type="text"
//                           className="w-full p-2 bg-white border border-blue-200
//                           rounded-md focus:ring-2 focus:ring-indigo-500"
//                           value={area.finalCuttingLength || ""}
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block mb-1 text-sm font-medium text-blue-700">Total Panels</label>
//                         <input
//                           type="text"
//                           className="w-full p-2 bg-white border border-blue-200 rounded-md focus:ring-2 focus:ring-indigo-500"
//                           value={area.totalnoOfPanels || ""}
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block mb-1 text-sm font-medium text-blue-700">Final Length</label>
//                         <input
//                           type="text"
//                           className="w-full p-2 bg-white border border-blue-200 rounded-md focus:ring-2 focus:ring-indigo-500"
//                           value={area.finalNewlength || ""}
//                           readOnly
//                         />
//                       </div>
//                       <div>
//                         <label className="block mb-1 text-sm font-medium text-blue-700">Total Sheets</label>
//                         <input
//                           type="text"
//                           className="w-full p-2 bg-white border border-blue-200 rounded-md focus:ring-2 focus:ring-indigo-500"
//                           value={area.totalNumberofSheet || ""}
//                           readOnly
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}

//             {/* Add New Area Button */}
//             <div className="p-6 border-b border-gray-200">
//               <button
//                 onClick={addNewArea}
//                 className="px-4 py-2 text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700"
//               >
//                 Add Another Area
//               </button>
//             </div>

//             {/* Site Visitor Selection Section */}
//             <div className="p-6 border-b border-gray-200">
//               <label className="block mb-2 text-sm font-medium text-gray-700">Site Visitor</label>
//               <select
//                 className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                 value={formData.siteVisitorId}
//                 onChange={(e) => handleSiteVisitorChange(e.target.value)}
//               >
//                 <option value="">Select Site Visitor</option>
//                 {siteVisitors.map((visitor) => (
//                   <option key={visitor._id} value={visitor._id}>
//                     {visitor.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Live Calculation Preview */}
//             <div className="p-6 border-b border-gray-200 bg-gray-50">
//               <h3 className="mb-4 text-lg font-medium text-gray-800">Live Calculation Preview</h3>
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">Total Area (Sq. Ft)</label>
//                   <input
//                     type="text"
//                     className="w-full p-3 bg-white border border-gray-300 rounded-md"
//                     value={calculationPreview.totalAreaSqFt}
//                     readOnly
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">Estimated Budget</label>
//                   <input
//                     type="text"
//                     className="w-full p-3 bg-white border border-gray-300 rounded-md"
//                     value={calculationPreview.totalBudget}
//                     readOnly
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Total Section */}
//             <div className="p-6 border-b border-gray-200">
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">Total Area (Sq. Ft)</label>
//                   <input
//                     type="text"
//                     className="w-full p-3 bg-white border border-gray-300 rounded-md"
//                     value={formData.totalSqFt}
//                     readOnly
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">Total Cost</label>
//                   <input
//                     type="text"
//                     className="w-full p-3 bg-white border border-gray-300 rounded-md"
//                     value={formData.totalCost}
//                     readOnly
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div className="p-6">
//               <button
//                 onClick={handleSubmit}
//                 disabled={calculationPreview.isCalculating}
//                 className={`px-6 py-3 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 ${
//                   calculationPreview.isCalculating ? 'opacity-70 cursor-not-allowed' : ''
//                 }`}
//               >
//                 {calculationPreview.isCalculating ? 'Calculating...' : 'Create Estimate'}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QuickEstimate;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../AdminDasboard/components/Header";
import Sidebar from "../../SalesDashboard/components/Sidebar";
import { getSitevisitor } from "../../api/admin/employee/sitevistor";
import {
  fetchAllProjectType,
  getAllCategories,
} from "../../api/admin/product/getAllCategories";
import { getFilteredProducts } from "../../api/admin/product/updateProduct";
import { getClient } from "../../api/admin/client/getClient";
import { finalEstimate } from "../../api/admin/estimate/createEstimate";
import { getAllMaterialItem } from "../../api/admin/product/getAllCategories"; // Import the API function
import { message } from "antd";

const QuickEstimate = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Form data state
  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    siteVisitorId: "",
    areas: [
      {
        id: 1,
        name: "Area 1",
        projectType: "",
        roofModel: "",
        roofPreference: "",
        span: "",
        length: "",
        height: "",
        typeOfPanel: 0.305,
        offset: 0,
        sheetThickness: 0.6,
        noOfBay: 1,
        noOfWorkingDays: 5,
        extraPanel: 0,
        materialItems: [], // For manually added materials
        materials: [], // For auto-fetched materials
        totalArea: "",
        sheetRate: "",
        // New response fields
        finalCuttingLength: "",
        totalnoOfPanels: "",
        finalNewlength: "",
        totalNumberofSheet: ""
      },
    ],
    totalSqFt: 0,
    totalCost: 0,
  });

  // State for live calculation preview
  const [calculationPreview, setCalculationPreview] = useState({
    totalAreaSqFt: 0,
    totalBudget: 0,
    isCalculating: false
  });

  // Reference data
  const [projectTypes, setProjectTypes] = useState([]);
  const [roofModels, setRoofModels] = useState([]);
  const [siteVisitors, setSiteVisitors] = useState([]);
  const [areaProductData, setAreaProductData] = useState({});
  const [allMaterials, setAllMaterials] = useState([]); // Add state for all available materials

  // Client search
  const [clientList, setClientList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);

  // Material selection state
  const [materialSelections, setMaterialSelections] = useState({});
  
  // New state to track which areas have the material input visible
  const [showMaterialInputs, setShowMaterialInputs] = useState({});

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      fetchProjectTypes(),
      fetchRoofModels(),
      fetchSiteVisitors(),
      fetchClients(),
      getAllMaterialItems() // Fetch all available materials
    ]);
  }, []);

  // Calculate totals whenever area data changes
  useEffect(() => {
    calculateTotals();
    calculateAreaPreview();
  }, [formData.areas]);

  // Update filtered clients when search term changes
  useEffect(() => {
    if (!searchTerm) {
      setFilteredClients([]);
      return;
    }

    if (Array.isArray(clientList)) {
      const filtered = clientList.filter((client) =>
        client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients([]);
    }
  }, [searchTerm, clientList]);

  // API fetch functions
  const fetchProjectTypes = async () => {
    try {
      const response = await fetchAllProjectType();
      setProjectTypes(response.projectTypes || []);
    } catch (error) {
      console.error("Error fetching project types:", error);
    }
  };

  const fetchRoofModels = async () => {
    try {
      const response = await getAllCategories();
      setRoofModels(response.categories || []);
    } catch (error) {
      console.error("Error fetching roof models:", error);
    }
  };

  const fetchSiteVisitors = async () => {
    try {
      const response = await getSitevisitor();
      setSiteVisitors(response.data || []);
    } catch (error) {
      console.error("Error fetching site visitors:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await getClient();
      setClientList(Array.isArray(response?.data) 
        ? response.data 
        : (response?.data?.clients && Array.isArray(response.data.clients) 
            ? response.data.clients 
            : []));
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClientList([]);
    }
  };

  // New function to fetch all material items
  const getAllMaterialItems = async () => {
    try {
      const response = await getAllMaterialItem();
      console.log("Fetched material items:", response);
      setAllMaterials(response.items || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const fetchProductForArea = async (areaId, filters) => {
    try {
      const response = await getFilteredProducts(filters);

      if (response?.products?.length > 0) {
        const productData = response.products[0];
        console.log("Product data received:", productData);

        // Update the specific area with product data
        updateAreaWithProductData(areaId, productData);

        // Store in separate state for reference
        setAreaProductData((prevData) => ({
          ...prevData,
          [areaId]: productData,
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Form manipulation functions
  const updateAreaWithProductData = (areaId, productData) => {
    setFormData((prevData) => {
      const updatedAreas = prevData.areas.map((area) => {
        if (area.id === areaId) {
          return {
            ...area,
            span: productData.span || area.span,
            length: productData.length || area.length,
            height: productData.height || area.height,
            typeOfPanel: productData.typeOfPanel || area.typeOfPanel,
            sheetThickness: productData.sheetThickness || area.sheetThickness,
            // Add the dynamic fields from product data
            offset: productData.offset || area.offset || 0,
            noOfBay: productData.noOfBay || area.noOfBay || 1,
            extraPanel: productData.extraPanel || area.extraPanel || 0,
            materials: productData.materials || area.materials,
            totalArea: productData.totalArea || area.totalArea,
            sheetRate: productData.sheetRate || area.sheetRate,
          };
        }
        return area;
      });

      return {
        ...prevData,
        areas: updatedAreas,
      };
    });
  };

  const addNewArea = () => {
    const newAreaId = formData.areas.length + 1;
    const newArea = {
      id: newAreaId,
      name: `Area ${newAreaId}`,
      projectType: "",
      roofModel: "",
      roofPreference: "",
      span: "",
      length: "",
      height: "",
      typeOfPanel: 0.305,
      offset: 0,
      sheetThickness: 0.6,
      noOfBay: 1,
      noOfWorkingDays: 5,
      extraPanel: 0,
      materialItems: [],
      materials: [],
      totalArea: "",
      sheetRate: "",
      finalCuttingLength: "",
      totalnoOfPanels: "",
      finalNewlength: "",
      totalNumberofSheet: ""
    };

    setFormData((prevData) => ({
      ...prevData,
      areas: [...prevData.areas, newArea],
    }));
  };

  const removeArea = (areaId) => {
    if (formData.areas.length <= 1) {
      message.warning("You must have at least one area.");
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      areas: prevData.areas.filter((area) => area.id !== areaId),
    }));

    setAreaProductData((prevData) => {
      const newData = { ...prevData };
      delete newData[areaId];
      return newData;
    });

    // Clean up material selection state for removed area
    setMaterialSelections((prev) => {
      const newSelections = { ...prev };
      delete newSelections[areaId];
      return newSelections;
    });
    
    // Clean up material input visibility state
    setShowMaterialInputs((prev) => {
      const newState = { ...prev };
      delete newState[areaId];
      return newState;
    });
  };

  // Calculate area and budget preview based on current dimensions
  const calculateAreaPreview = () => {
    setCalculationPreview(prev => ({...prev, isCalculating: true}));
    
    // Calculate area total across all areas
    let totalArea = 0;
    formData.areas.forEach(area => {
      const span = parseFloat(area.span) || 0;
      const length = parseFloat(area.length) || 0;
      
      if (span > 0 && length > 0) {
        totalArea += span * length;
      }
    });
    
    // Calculate approximate budget based on area and average rate
    const basePricePerSqFt = 121;
    const marginPercentage = 15; 
    
    const basePrice = totalArea * basePricePerSqFt;
    const marginAmount = (basePrice * marginPercentage) / 100;
    const estimatedBudget = basePrice + marginAmount;
    
    setCalculationPreview({
      totalAreaSqFt: totalArea.toFixed(2),
      totalBudget: estimatedBudget.toFixed(2),
      isCalculating: false
    });
  };

  const handleAreaChange = async (areaId, field, value) => {
    // Update form data
    setFormData((prevData) => ({
      ...prevData,
      areas: prevData.areas.map((area) =>
        area.id === areaId ? { ...area, [field]: value } : area
      )
    }));

    // Check if we need to fetch product data
    const area = formData.areas.find((a) => a.id === areaId);

    // Create updated area with new field value
    const updatedArea = { ...area, [field]: value };

    if (
      (field === "projectType" ||
        field === "roofModel" ||
        field === "roofPreference") &&
      updatedArea.projectType &&
      updatedArea.roofModel &&
      updatedArea.roofPreference
    ) {
      const filters = {
        roofType: updatedArea.projectType,
        roofModel: updatedArea.roofModel,
        roofPreference: updatedArea.roofPreference,
      };

      await fetchProductForArea(areaId, filters);
    }
  };

  const handleMaterialChange = (areaId, materialIndex, value) => {
    setFormData((prevData) => ({
      ...prevData,
      areas: prevData.areas.map((area) => 
        area.id === areaId 
          ? {
              ...area,
              materials: area.materials.map((material, idx) => 
                idx === materialIndex 
                  ? { ...material, unit: value } 
                  : material
              )
            } 
          : area
      )
    }));
  };

  // New functions to handle adding materials to an area
  const handleCustomMaterialChange = (areaId, materialIndex, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      areas: prevData.areas.map((area) => 
        area.id === areaId 
          ? {
              ...area,
              materialItems: area.materialItems.map((material, idx) => 
                idx === materialIndex 
                  ? { ...material, [field]: value } 
                  : material
              )
            } 
          : area
      )
    }));
  };

  // Toggle function to show/hide material inputs
  const toggleMaterialInputs = (areaId) => {
    setShowMaterialInputs(prev => ({
      ...prev,
      [areaId]: !prev[areaId]
    }));
    
    // Initialize material selection state for this area if it doesn't exist
    if (!materialSelections[areaId]) {
      setMaterialSelections(prev => ({
        ...prev,
        [areaId]: { materialId: "", quantity: 1 }
      }));
    }
  };

  const handleAddMaterial = (areaId) => {
    const selectedMaterialId = materialSelections[areaId]?.materialId;
    const selectedQuantity = materialSelections[areaId]?.quantity || 1;
    
    if (!selectedMaterialId) {
      message.warning("Please select a material first");
      return;
    }
    
    const selectedMaterial = allMaterials.find(m => m._id === selectedMaterialId);
    
    if (!selectedMaterial) {
      message.warning("Selected material not found");
      return;
    }
    
    setFormData((prevData) => ({
      ...prevData,
      areas: prevData.areas.map((area) => {
        if (area.id === areaId) {
          // Check if this material is already added
          const existingIndex = area.materialItems.findIndex(
            item => item.itemId === selectedMaterialId
          );
          
          let updatedMaterialItems = [...area.materialItems];
          
          if (existingIndex >= 0) {
            // Update quantity if material already exists
            updatedMaterialItems[existingIndex] = {
              ...updatedMaterialItems[existingIndex],
              unit: parseFloat(updatedMaterialItems[existingIndex].unit || 0) + parseFloat(selectedQuantity)
            };
          } else {
            // Add as new material
            updatedMaterialItems.push({
              itemId: selectedMaterialId,
              unit: selectedQuantity,
              itemName: selectedMaterial.item // Keep name for display
            });
          }
          
          return {
            ...area,
            materialItems: updatedMaterialItems
          };
        }
        return area;
      })
    }));
    
    // Reset material selection for this area
    setMaterialSelections(prev => ({
      ...prev,
      [areaId]: { materialId: "", quantity: 1 }
    }));
    
    message.success("Material added successfully");
  };

  const handleRemoveMaterial = (areaId, materialIndex) => {
    setFormData((prevData) => ({
      ...prevData,
      areas: prevData.areas.map((area) => 
        area.id === areaId 
          ? {
              ...area,
              materialItems: area.materialItems.filter((_, idx) => idx !== materialIndex)
            } 
          : area
      )
    }));
    
    message.success("Material removed successfully");
  };

  const handleMaterialSelectionChange = (areaId, field, value) => {
    setMaterialSelections(prev => ({
      ...prev,
      [areaId]: {
        ...prev[areaId],
        [field]: value
      }
    }));
  };

  const handleClientSelect = (client) => {
    setSearchTerm(client.name);
    setFilteredClients([]);
    setFormData((prevData) => ({
      ...prevData,
      clientId: client._id,
      clientName: client.name,
    }));
  };

  const handleSiteVisitorChange = (visitorId) => {
    setFormData((prevData) => ({
      ...prevData,
      siteVisitorId: visitorId,
    }));
  };

  const calculateTotals = () => {
    let totalSqFtSum = 0;
    let totalCostSum = 0;

    formData.areas.forEach((area) => {
      const areaSqFt = parseFloat(area.totalArea) || 0;
      const areaRate = parseFloat(area.sheetRate) || 0;

      totalSqFtSum += areaSqFt;
      totalCostSum += areaRate;
    });

    setFormData((prevData) => ({
      ...prevData,
      totalSqFt: totalSqFtSum.toFixed(2),
      totalCost: totalCostSum.toFixed(2),
    }));
  };

  const handleAreaInputChange = (areaId, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      areas: prevData.areas.map((area) =>
        area.id === areaId ? { ...area, [field]: value } : area
      )
    }));
    
    setTimeout(() => calculateAreaPreview(), 300);
  };

  const handleSubmit = async () => {
    // Validate form data
    if (!formData.clientId) {
      message.error("Please select a client");
      return;
    }
  
    if (!formData.siteVisitorId) {
      message.error("Please select a site visitor");
      return;
    }
  
    // Prepare data for submission
    const submitData = {
      clientId: formData.clientId,
      siteVisitorId: formData.siteVisitorId,
      status: "Site Visit",
      areas: formData.areas.map((area) => ({
        span: parseFloat(area.span) || 0,
        length: parseFloat(area.length) || 0,
        height: parseFloat(area.height) || 0,
        projectType: area.projectType,
        roofModel: area.roofModel,
        roofPreference: area.roofPreference,
        typeOfPanel: parseFloat(area.typeOfPanel) || 0.305,
        offset: parseFloat(area.offset) || 0,
        sheetThickness: parseFloat(area.sheetThickness) || 0.6,
        noOfBay: parseInt(area.noOfBay) || 1,
        noOfWorkingDays: parseInt(area.noOfWorkingDays) || 5,
        extraPanel: parseInt(area.extraPanel) || 0,
        materialItems: [
          // Include auto-fetched materials from product
          ...(area.materials ? 
            area.materials.map((material) => ({
              itemId: material.itemId?._id || material.itemId,
              unit: parseFloat(material.unit) || 0,
            })) : 
            []),
          // Include manually added materials
          ...(area.materialItems ? 
            area.materialItems.map((material) => ({
              itemId: material.itemId,
              unit: parseFloat(material.unit) || 0,
            })) : 
            [])
        ],
      })),
    };
  
    try {
      setCalculationPreview(prev => ({...prev, isCalculating: true}));
      const response = await finalEstimate(submitData);
      console.log("API Response:", response);
  
      if (response.status === 201 || response.status === 200) {
        // Update calculation preview with response values
        if (response.data?.estimate) {
          setCalculationPreview({
            totalAreaSqFt: response.data.estimate.totalAreaSqFt || 0,
            totalBudget: response.data.estimate.totalBudget || 0,
            isCalculating: false
          });
        }
        
        // Update area data with values from the response
        if (response.data?.estimate?.sheetingPrice && Array.isArray(response.data.estimate.sheetingPrice)) {
          setFormData(prevData => ({
            ...prevData,
            areas: prevData.areas.map((area, index) => {
              const responseArea = response.data.estimate.sheetingPrice[index];
              if (responseArea) {
                return {
                  ...area,
                  totalArea: responseArea.areaSqFt,
                  sheetRate: responseArea.totalSheetingPrice + (responseArea.materialCharge?.totalCharge || 0),
                  // Add the new response fields
                  finalCuttingLength: responseArea.finalCuttingLength || "",
                  totalnoOfPanels: responseArea.totalnoOfPanels || "",
                  finalNewlength: responseArea.finalNewlength || "",
                  totalNumberofSheet: responseArea.totalNumberofSheet || ""
                };
              }
              return area;
            })
          }));
        }
        message.success("Estimate created successfully!");
      } else {
        const errorMsg = response.data?.message || "Failed to create estimate. Please try again.";
        message.error(errorMsg);
        setCalculationPreview(prev => ({...prev, isCalculating: false}));
      }
    } catch (error) {
      console.error("Error creating estimate:", error);
      const errorMessage = error.message || 
        (typeof error === "object" ? JSON.stringify(error) : error) || 
        "Unknown error";
      message.error(`Failed to create estimate: ${errorMessage}`);
      setCalculationPreview(prev => ({...prev, isCalculating: false}));
    }
  };

  // For debugging purposes - show typeOfPanel and sheetThickness in UI
  const getAreaRoofDetails = (area) => {
    const projectType = projectTypes.find(t => t._id === area.projectType)?.projectType || "";
    const roofModel = roofModels.find(m => m._id === area.roofModel)?.roofModel || "";
    return `${projectType} - ${roofModel} - ${area.roofPreference}`;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Header toggleSidebar={toggleSidebar} />

        <div className="p-6">
          <div className="overflow-hidden bg-white rounded-lg shadow-lg">
            {/* Client Selection Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Create Estimate</h1>
                {/* <p
                  className="text-blue-500 cursor-pointer"
                  onClick={() => navigate("/admin/custommeasurement")}
                >
                  Custom Measurements
                </p> */}
              </div>
              <div className="relative">
                <label className="block mb-2 text-sm font-medium text-gray-700">Client Name</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for client"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />

                {filteredClients.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-60">
                    {filteredClients.map((client) => (
                      <li
                        key={client._id}
                        onClick={() => handleClientSelect(client)}
                        className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-100 last:border-b-0"
                      >
                        {client.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {formData.clientId && (
                <div className="mt-2 text-sm text-green-600">
                  Client selected: {formData.clientName}
                </div>
              )}
            </div>

            {/* Areas Section */}
            {formData.areas.map((area) => (
              <div key={area.id} className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-indigo-900">{area.name}</h2>
                  <div>
                    {formData.areas.length > 1 && (
                      <button
                        onClick={() => removeArea(area.id)}
                        className="px-4 py-2 text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
                      >
                        Remove Area
                      </button>
                    )}
                  </div>
                </div>

                {/* Roof Selection Row */}
                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Project Type</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                      value={area.projectType}
                      onChange={(e) => handleAreaChange(area.id, "projectType", e.target.value)}
                    >
                      <option value="">Select Project Type</option>
                      {projectTypes.map((type) => (
                        <option key={type._id} value={type._id}>{type.projectType}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Roof Model</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                      value={area.roofModel}
                      onChange={(e) => handleAreaChange(area.id, "roofModel", e.target.value)}
                    >
                      <option value="">Select Roof Model</option>
                      {roofModels.map((model) => (
                        <option key={model._id} value={model._id}>{model.roofModel}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Roof Preference</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                      value={area.roofPreference}
                      onChange={(e) => handleAreaChange(area.id, "roofPreference", e.target.value)}
                    >
                      <option value="">Select Preference</option>
                      <option value="Single Car Parking">Single Car Parking</option>
                      <option value="Double Car Parking">Double Car Parking</option>
                    </select>
                  </div>
                </div>

                {/* Technical Details Row - Including dynamic fields */}
                {area.projectType && area.roofModel && area.roofPreference && (
                  <div className="grid grid-cols-2 gap-6 mb-6 md:grid-cols-3 lg:grid-cols-5">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Type of Panel</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                        placeholder="Type of Panel"
                        value={area.typeOfPanel}
                        onChange={(e) => handleAreaInputChange(area.id, "typeOfPanel", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Sheet Thickness</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                        placeholder="Sheet Thickness"
                        value={area.sheetThickness}
                        onChange={(e) => handleAreaInputChange(area.id, "sheetThickness", e.target.value)}
                      />
                    </div>
                    
                    {/* Dynamic fields */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Offset</label>
                      <input
                        type="number"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                        placeholder="Offset"
                        value={area.offset}
                        onChange={(e) => handleAreaInputChange(area.id, "offset", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">No. of Bay</label>
                      <input
                        type="number"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                        placeholder="No. of Bay"
                        value={area.noOfBay}
                        onChange={(e) => handleAreaInputChange(area.id, "noOfBay", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Extra Panel</label>
                      <input
                        type="number"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                        placeholder="Extra Panel"
                        value={area.extraPanel}
                        onChange={(e) => handleAreaInputChange(area.id, "extraPanel", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Main Dimensions Row */}
                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Span (m)</label>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                     
                      value={area.span}
                      onChange={(e) => handleAreaInputChange(area.id, "span", e.target.value)}
                    />
                  </div>
                   <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Length (m)</label>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                   
                      value={area.length}
                      onChange={(e) => handleAreaInputChange(area.id, "length", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Height (m)</label>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    
                      value={area.height}
                      onChange={(e) => handleAreaInputChange(area.id, "height", e.target.value)}
                    />
                  </div>
                </div>

                {/* Working Days */}
                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">No. of Working Days</label>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                      placeholder="Working days"
                      value={area.noOfWorkingDays}
                      onChange={(e) => handleAreaInputChange(area.id, "noOfWorkingDays", e.target.value)}
                    />
                  </div>
                </div>

                {/* Material Add Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-800">Materials</h3>
                    <button
                      type="button"
                      onClick={() => toggleMaterialInputs(area.id)}
                      className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      {showMaterialInputs[area.id] ? "Hide Material Input" : "Add Material"}
                    </button>
                  </div>

                  {/* Material input section */}
                  {showMaterialInputs[area.id] && (
                    <div className="p-4 mb-4 bg-gray-50 rounded-md">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Select Material</label>
                          <select
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                            value={materialSelections[area.id]?.materialId || ""}
                            onChange={(e) => handleMaterialSelectionChange(area.id, "materialId", e.target.value)}
                          >
                            <option value="">Select Material</option>
                            {allMaterials.map((material) => (
                              <option key={material._id} value={material._id}>
                                {material.item}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Quantity</label>
                          <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                            placeholder="Quantity"
                            value={materialSelections[area.id]?.quantity || 1}
                            onChange={(e) => handleMaterialSelectionChange(area.id, "quantity", e.target.value)}
                            min="1"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => handleAddMaterial(area.id)}
                            className="w-full p-3 text-white bg-green-500 rounded-md hover:bg-green-600"
                          >
                            Add Material
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Materials table - displaying both auto-fetched and custom materials */}
                  {((area.materials && area.materials.length > 0) || (area.materialItems && area.materialItems.length > 0)) && (
                    <div className="overflow-x-auto">
                      <table className="w-full mt-2 text-sm text-left text-gray-700">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th className="px-6 py-3">Material Name</th>
                            <th className="px-6 py-3">Quantity/Unit</th>
                            <th className="px-6 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Auto-fetched materials */}
                          {area.materials && area.materials.map((material, index) => (
                            <tr key={`auto-${index}`} className="bg-white border-b">
                              <td className="px-6 py-4">
                                {material.itemId?.item || "Unknown Material"}
                                <span className="ml-2 text-xs text-blue-500">(Auto)</span>
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  className="w-24 p-1 border border-gray-300 rounded"
                                  value={material.unit || 0}
                                  onChange={(e) => handleMaterialChange(area.id, index, e.target.value)}
                                  min="0"
                                />
                              </td>
                              <td className="px-6 py-4 text-xs italic text-gray-500">
                                Auto-calculated
                              </td>
                            </tr>
                          ))}
                          
                          {/* Custom added materials */}
                          {area.materialItems && area.materialItems.map((material, index) => (
                            <tr key={`custom-${index}`} className="bg-white border-b">
                              <td className="px-6 py-4">
                                {material.itemName || "Custom Material"}
                                <span className="ml-2 text-xs text-green-500">(Custom)</span>
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  className="w-24 p-1 border border-gray-300 rounded"
                                  value={material.unit || 0}
                                  onChange={(e) => handleCustomMaterialChange(area.id, index, "unit", e.target.value)}
                                  min="0"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleRemoveMaterial(area.id, index)}
                                  className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Calculation Results */}
                {area.totalArea && area.sheetRate && (
                  <div className="p-4 mt-4 bg-blue-50 rounded-md">
                    <h3 className="text-lg font-medium text-blue-800">Calculation Results</h3>
                    <div className="grid grid-cols-1 gap-4 mt-2 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Total Area (sq ft)</label>
                        <div className="p-3 bg-white border border-gray-300 rounded-md">
                          {parseFloat(area.totalArea).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Sheet Rate</label>
                        <div className="p-3 bg-white border border-gray-300 rounded-md">
                          ₹{parseFloat(area.sheetRate).toFixed(2)}
                        </div>
                      </div>
                      {area.finalCuttingLength && (
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">Final Cutting Length</label>
                          <div className="p-3 bg-white border border-gray-300 rounded-md">
                            {area.finalCuttingLength}
                          </div>
                        </div>
                      )}
                      {area.totalnoOfPanels && (
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">Total No. of Panels</label>
                          <div className="p-3 bg-white border border-gray-300 rounded-md">
                            {area.totalnoOfPanels}
                          </div>
                        </div>
                      )}
                      {area.finalNewlength && (
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">Final New Length</label>
                          <div className="p-3 bg-white border border-gray-300 rounded-md">
                            {area.finalNewlength}
                          </div>
                        </div>
                      )}
                      {area.totalNumberofSheet && (
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">Total Number of Sheets</label>
                          <div className="p-3 bg-white border border-gray-300 rounded-md">
                            {area.totalNumberofSheet}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Area Controls */}
            <div className="p-6 border-b border-gray-200">
              <button
                onClick={addNewArea}
                className="px-4 py-2 text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Add Another Area
              </button>
            </div>

            {/* Site Visitor Selection */}
            <div className="p-6 border-b border-gray-200">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Site Visitor
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                value={formData.siteVisitorId}
                onChange={(e) => handleSiteVisitorChange(e.target.value)}
              >
                <option value="">Select Site Visitor</option>
                {siteVisitors.map((visitor) => (
                  <option key={visitor._id} value={visitor._id}>
                    {visitor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Calculation Preview */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h2 className="mb-4 text-xl font-semibold text-indigo-900">Estimate Preview</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="p-4 bg-white rounded-md shadow">
                  <h3 className="mb-2 text-lg font-medium text-gray-800">Total Area</h3>
                  <p className="text-2xl font-bold text-indigo-600">{formData.totalSqFt} sq ft</p>
                </div>
                <div className="p-4 bg-white rounded-md shadow">
                  <h3 className="mb-2 text-lg font-medium text-gray-800">Estimated Budget</h3>
                  <p className="text-2xl font-bold text-indigo-600">₹{formData.totalCost}</p>
                  <p className="text-xs text-gray-500">*Based on preliminary calculations</p>
                </div>
              </div>
            </div>
               {/* Total Section */}
            {/* <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                 <label className="block mb-2 text-sm font-medium text-gray-700">Total Area (Sq. Ft)</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-white border border-gray-300 rounded-md"
                    value={formData.totalSqFt}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Total Cost</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-white border border-gray-300 rounded-md"
                    value={formData.totalCost}
                    readOnly
                  />
                </div>
              </div>
           </div> */}


            {/* Submit Button */}
            <div className="p-6">
              <button
                onClick={handleSubmit}
                disabled={calculationPreview.isCalculating}
                className={`px-6 py-3 text-white transition-colors bg-green-600 rounded-md ${
                  calculationPreview.isCalculating ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
                }`}
              >
                {calculationPreview.isCalculating ? "Calculating..." : "Calculate and Save Estimate"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickEstimate;