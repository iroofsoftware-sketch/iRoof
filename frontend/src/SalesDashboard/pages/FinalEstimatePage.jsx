// import { useState } from 'react';
// import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';
// import { getClientByPhone } from '../../api/sales/client/getClientByPhone';
// import { submitFinalEstimate } from '../../api/sales/client/submitFinalEstimate';
// import EstimatePdfGenerator from '../components/EstimatePdfGenerator';
// import { message } from 'antd';

// const FinalEstimatePage = () => {
//   // State for search functionality
//   const [searchParams, setSearchParams] = useState({
//     clientName: '',
//     clientPhone: ''
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [clients, setClients] = useState([]);
//   const [formModified, setFormModified] = useState(false);

//   // Client and project data state
//   const [selectedClient, setSelectedClient] = useState(null);

//   // Estimate data state
//   const [estimateData, setEstimateData] = useState({
//     areas: [],
//     transportations: [],
//     labourData: {
//       sheetingLabour: { localWorkers: 0, siteWorkers: 0 },
//       weldingLabour: { localWorkers: 0, siteWorkers: 0 },
//       transportationLabour: 0,
//       enquiryExpense: 0,
//       foodAndAccommodation: 0
//     },
//     cranePrice: 0,
//     otherExpenses: 0,
//     sellingRate: 0,
//     percentageOfMargin: 0,
//     totalProjectCost: 0
//   });

//   // PDF preview state
//   const [showPdfPreview, setShowPdfPreview] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Input change handlers
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setSearchParams(prev => ({ ...prev, [name]: value }));
//   };

//   // Search and client selection
//   const searchClients = async () => {
//     setIsLoading(true);
//     try {
//       const response = await getClientByPhone(searchParams.clientName, searchParams.clientPhone);
//       setClients(response.data || []);
//     } catch (error) {
//       message.info("There is no client with this name or phone number.");
//       console.error("Error fetching clients:", error);
//       setClients([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const selectClient = (client) => {
//     setSelectedClient(client);

//     // Use backend data directly instead of recalculating
//     setEstimateData({
//       clientId: client.clientId._id,
//       siteVisitorId: client.siteVisitorId._id,
//       status: client.status || "Quotation Provided",

//       // Use existing transportation data if available
//       transportations: client.transportations && client.transportations[0]?.transportationslist?.map(transport => ({
//         vehicleType: transport.vehicleType || "Trailer",
//         totalKilometer: transport.totalKilometer || 0,
//         numberOfTrips: transport.numberOfTrips || 0
//       })) || [],

//       // Use existing labor data
//       labourData: {
//         sheetingLabour: {
//           localWorkers: client.labourCharge?.sheetingLabour?.localWork || 0,
//           siteWorkers: client.labourCharge?.sheetingLabour?.siteWork || 0
//         },
//         weldingLabour: {
//           localWorkers: client.labourCharge?.weldingLabour?.localWork || 0,
//           siteWorkers: client.labourCharge?.weldingLabour?.siteWork || 0
//         },
//         transportationLabour: client.labourCharge?.transportationLabour || 0,
//         enquiryExpense: client.labourCharge?.enquiryExpense || 0,
//         foodAndAccommodation: client.labourCharge?.foodAndAccommodation || 0
//       },

//       // Use direct values from backend
//       cranePrice: client.transportations && client.transportations[0]?.cranePrice || 0,
//       otherExpenses: client.transportations && client.transportations[0]?.otherExpenses || 0,
//       sellingRate: client.sellingRate || 0,
//       percentageOfMargin: client.marginPercentage || 0,
//       totalProjectCost: client.totalProjectExpense || 0
//     });

//     setClients([]);
//   };

//   // Submit final estimate
//   const handleSubmitEstimate = async () => {
//     if (!selectedClient) {
//       message.info("Please select a client first.");
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       // Create submission object with all necessary fields
//       const submissionData = {
//         _id: selectedClient._id, // Include the estimate ID for updates
//         clientId: selectedClient.clientId._id,
//         siteVisitorId: selectedClient.siteVisitorId._id,
//         status: "Finished",

//         // Transportation data
//         transportations: estimateData.transportations.map(transport => ({
//           vehicleType: transport.vehicleType,
//           totalKilometer: transport.totalKilometer,
//           numberOfTrips: transport.numberOfTrips
//         })),

//         // Labor data
//         labourData: {
//           sheetingLabour: {
//             localWork: estimateData.labourData.sheetingLabour.localWorkers,
//             siteWork: estimateData.labourData.sheetingLabour.siteWorkers
//           },
//           weldingLabour: {
//             localWork: estimateData.labourData.weldingLabour.localWorkers,
//             siteWork: estimateData.labourData.weldingLabour.siteWorkers
//           },
//           transportationLabour: estimateData.labourData.transportationLabour,
//           enquiryExpense: estimateData.labourData.enquiryExpense,
//           foodAndAccommodation: estimateData.labourData.foodAndAccommodation
//         },

//         // Pricing fields
//         cranePrice: estimateData.cranePrice,
//         otherExpenses: estimateData.otherExpenses,
//         sellingRate: estimateData.sellingRate,
//         percentageOfMargin: estimateData.percentageOfMargin
//       };

//       console.log("Submitting final estimate:", submissionData);
//       const response = await submitFinalEstimate(submissionData);
//       console.log("Final estimate response:", response);

//       // Update local state with response data
//       if (response.data && response.data.estimate) {
//         const updatedEstimate = response.data.estimate;

//         // Create an updated client object with the new data
//         // IMPORTANT: Maintain the original structure and only update specific fields
//         const updatedClient = {
//           ...selectedClient,
//           // Preserve the original sheetingPrice array which contains project details
//           sheetingPrice: selectedClient.sheetingPrice,
//           // Update fields from the response
//           totalProjectExpense: updatedEstimate.totalProjectExpense,
//           marginPercentage: updatedEstimate.marginPercentage,
//           marginAmount: updatedEstimate.marginAmount,
//           newProjectValue: updatedEstimate.newProjectValue,
//           ratePerSqFt: updatedEstimate.ratePerSqFt,
//           taxAmount: updatedEstimate.taxAmount,
//           totalBudget: updatedEstimate.totalBudget || updatedEstimate.newProjectValue,
//           // Preserve transportation data with updated values
//           transportations: updatedEstimate.transportations ?
//             updatedEstimate.transportations :
//             selectedClient.transportations,
//           // Preserve labor charge with updated values
//           labourCharge: updatedEstimate.labourCharge ?
//             updatedEstimate.labourCharge :
//             selectedClient.labourCharge
//         };

//         // Update the selected client state
//         setSelectedClient(updatedClient);

//         // Update estimate data state with new values
//         setEstimateData({
//           ...estimateData,
//           percentageOfMargin: updatedEstimate.marginPercentage || estimateData.percentageOfMargin,
//           sellingRate: updatedEstimate.sellingRate || estimateData.sellingRate,
//           totalProjectCost: updatedEstimate.totalProjectExpense || estimateData.totalProjectCost
//         });

//         // Reset form modified flag
//         setFormModified(false);
//       }

//       message.success("Final estimate submitted successfully!");
//     } catch (error) {
//       console.error("Error submitting estimate:", error);
//       message.error("Error submitting estimate. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // PDF preview handlers
//   const handleShowPdfPreview = () => {
//     setShowPdfPreview(true);
//   };

//   const handleClosePdfPreview = (wasDownloaded = false) => {
//     setShowPdfPreview(false);
//     if (wasDownloaded) {
//       console.log('PDF was downloaded successfully');
//     }
//   };

//   // Add this function to your component
//   const resetForm = () => {
//     setSelectedClient(null);
//     setEstimateData({
//       areas: [],
//       transportations: [],
//       labourData: {
//         sheetingLabour: { localWorkers: 0, siteWorkers: 0 },
//         weldingLabour: { localWorkers: 0, siteWorkers: 0 },
//         transportationLabour: 0,
//         enquiryExpense: 0,
//         foodAndAccommodation: 0
//       },
//       cranePrice: 0,
//       otherExpenses: 0,
//       sellingRate: 0,
//       percentageOfMargin: 0,
//       totalProjectCost: 0
//     });
//     setSearchParams({
//       clientName: '',
//       clientPhone: ''
//     });
//   };

//   // Add this function to calculate total transportation cost
//   // const calculateTotalTransportation = () => {
//   //   let total = 0;

//   //   // Add up costs from transportation entries
//   //   // You would need to define how to calculate this based on your business logic
//   //   // For example, you might have a rate per kilometer for each vehicle type

//   //   // Add crane price and other expenses
//   //   total += estimateData.cranePrice || 0;
//   //   total += estimateData.otherExpenses || 0;

//   //   return total;
//   // };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <div className="flex-1 overflow-y-auto">
//         <Header />
//         <div className="p-6">
//           {/* Client Search Section */}
//           <div className="p-4 mb-6 bg-white rounded shadow-sm">
//             <h3 className="mb-4 font-medium">Find Client</h3>
//             <div className="grid grid-cols-3 gap-4">
//               <div>
//                 <label className="block mb-1 text-sm">Client Name</label>
//                 <input
//                   type="text"
//                   className="w-full p-2 border rounded"
//                   placeholder="Enter client name"
//                   name="clientName"
//                   value={searchParams.clientName}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div>
//                 <label className="block mb-1 text-sm">Client Phone</label>
//                 <input
//                   type="text"
//                   className="w-full p-2 border rounded"
//                   placeholder="+91 *********"
//                   name="clientPhone"
//                   value={searchParams.clientPhone}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="flex items-end">
//                 <button
//                   className="px-4 py-2 text-white transition duration-200 bg-blue-600 rounded hover:bg-blue-700"
//                   onClick={searchClients}
//                   disabled={isLoading}
//                 >
//                   {isLoading ? "Searching..." : "Find Client"}
//                 </button>
//                 {selectedClient && (
//                   <button
//                     className="px-4 py-2 ml-2 text-white transition duration-200 bg-gray-500 rounded hover:bg-gray-600"
//                     onClick={resetForm}
//                   >
//                     Clear Selection
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Selected Client Info */}
//             {selectedClient && (
//               <div className="p-3 mt-4 border border-blue-200 rounded bg-blue-50">
//                 <h4 className="font-medium text-blue-700">Selected Client</h4>
//                 <div className="grid grid-cols-2 gap-2 mt-2">
//                   <div>
//                     <span className="text-sm text-gray-600">Name:</span>
//                     <span className="ml-2 font-medium">{selectedClient.clientId?.name}</span>
//                   </div>
//                   <div>
//                     <span className="text-sm text-gray-600">Phone:</span>
//                     <span className="ml-2 font-medium">{selectedClient.clientId?.phoneNo}</span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Client Search Results */}
//             {clients.length > 0 && (
//               <div className="mt-4">
//                 <h4 className="mb-2 text-sm font-medium">Search Results</h4>
//                 <div className="overflow-y-auto bg-white border rounded max-h-60">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
//                         <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Phone</th>
//                         <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Project</th>
//                         <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {clients.map((client, index) => (
//                         <tr key={index}>
//                           <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{client.clientId?.name || '-'}</td>
//                           <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{client.clientId?.phoneNo || '-'}</td>
//                           <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
//                             {client.sheetingPrice?.[0]?.projectType?.projectType || '-'}
//                           </td>
//                           <td className="px-6 py-4 text-sm text-blue-600 whitespace-nowrap">
//                             <button
//                               className="text-blue-600 hover:text-blue-800"
//                               onClick={() => selectClient(client)}
//                             >
//                               Select
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Form Content - Only show when client is selected */}
//           {selectedClient && (
//             <>

//               {/* Project Details */}
//               <div className="p-4 mb-6 bg-white rounded shadow-sm">
//                 <h2 className="mb-4 text-lg font-medium">Project Details</h2>
//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <label className="block mb-1 text-sm">Client Name</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 border rounded"
//                       value={selectedClient?.clientId?.name || ""}
//                       readOnly
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm">Client Address</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 border rounded"
//                       value={selectedClient ? `${selectedClient.clientId?.place || ""}, ${selectedClient.clientId?.district || ""}` : ""}
//                       readOnly
//                     />
//                   </div>
//                 </div>

//                 {/* Areas Section */}
//                 <div className="p-4 mt-4 rounded bg-gray-50">
//                   <h3 className="mb-4 font-medium">Project Areas</h3>
//                   {selectedClient?.sheetingPrice?.map((area, index) => (
//                     <div key={index} className="p-3 mb-3 bg-white border rounded">
//                       <div className="grid grid-cols-3 gap-4">

//                         <div>
//                           <label className="block mb-1 text-sm">Span</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={`${area.span || 0} m`}
//                             readOnly
//                           />
//                         </div>
//                         <div>
//                           <label className="block mb-1 text-sm">Length</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={`${area.length || 0} m`}

//                             readOnly
//                           />
//                         </div>
//                         <div>
//                           <label className="block mb-1 text-sm">Height</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={`${area.height || 0} m`}
//                             readOnly
//                           />
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-3 gap-4 mt-3">
//                         <div>
//                           <label className="block mb-1 text-sm">Project Type</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={area.projectType?.projectType || "-"}
//                             readOnly
//                           />
//                         </div>
//                         <div>
//                           <label className="block mb-1 text-sm">Roof Model</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={area.roofModel?.roofModel || "-"}
//                             readOnly
//                           />
//                         </div>
//                         <div>
//                           <label className="block mb-1 text-sm">Sheet Thickness</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={`${area.sheetThickness || 0} mm`}
//                             readOnly
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   ))}

//                   <div className="grid grid-cols-3 gap-4 p-3 mt-3 bg-gray-200 rounded">
//                     <div>
//                       <label className="block mb-1 text-sm font-medium">Total Area (sqft)</label>
//                       <input
//                         type="text"
//                         className="w-full p-2 bg-white border rounded"
//                         value={selectedClient?.totalAreaSqFt || "0"}
//                         readOnly
//                       />
//                     </div>
//                     <div>
//                       <label className="block mb-1 text-sm font-medium">Sheeting Cost</label>
//                       <input
//                         type="text"
//                         className="w-full p-2 bg-white border rounded"
//                         value={`₹${(selectedClient?.totalSheetingCost || 0).toFixed(2)}`}
//                         readOnly
//                       />
//                     </div>
//                     <div>
//                       <label className="block mb-1 text-sm font-medium">Material Cost</label>
//                       <input
//                         type="text"
//                         className="w-full p-2 bg-white border rounded"
//                         value={`₹${(selectedClient?.totalmaterialCharge || selectedClient?.sheetingPrice?.[0]?.materialCharge?.totalCharge || 0).toFixed(2)}`}
//                         readOnly
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Transportation Details */}
//               <div className="p-4 mb-6 bg-white rounded shadow-sm">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="font-medium">Transportation Details</h3>
//                   <button
//                     type="button"
//                     className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center"
//                     onClick={() => {
//                       // Add new transportation entry
//                       const newTransportations = [...estimateData.transportations, {
//                         vehicleType: "Trailer", // Default value
//                         totalKilometer: 0,
//                         numberOfTrips: 0
//                       }];
//                       setEstimateData({ ...estimateData, transportations: newTransportations });
//                     }}
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                     </svg>
//                     Add Transportation
//                   </button>
//                 </div>

//                 {estimateData.transportations.length === 0 && (
//                   <div className="p-4 text-center text-gray-500 bg-gray-50 rounded border border-dashed">
//                     No transportation details added. Click &quot;Add Transportation&quot; to add.
//                   </div>
//                 )}

//                 {estimateData.transportations.map((transport, index) => (
//                   <div key={index} className="p-3 mb-3 border rounded bg-gray-50 relative">
//                     <button
//                       type="button"
//                       className="absolute top-2 right-2 text-red-500 hover:text-red-700"
//                       onClick={() => {
//                         // Remove this transportation entry
//                         const newTransportations = [...estimateData.transportations];
//                         newTransportations.splice(index, 1);
//                         setEstimateData({ ...estimateData, transportations: newTransportations });
//                       }}
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                     </button>

//                     <div className="grid grid-cols-3 gap-4">
//                       <div>
//                         <label className="block mb-1 text-sm">Vehicle Type</label>
//                         <select
//                           className="w-full p-2 border rounded"
//                           value={transport.vehicleType}
//                           onChange={(e) => {
//                             const newTransportations = [...estimateData.transportations];
//                             newTransportations[index].vehicleType = e.target.value;
//                             setEstimateData({ ...estimateData, transportations: newTransportations });
//                             setFormModified(true);
//                           }}
//                         >
//                           <option value="Trailer">Trailer</option>
//                           <option value="Ace">Ace</option>
//                           <option value="Eicher">Eicher</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block mb-1 text-sm">Total Kilometer</label>
//                         <input
//                           type="number"
//                           className="w-full p-2 border rounded"
//                           value={transport.totalKilometer}
//                           onChange={(e) => {
//                             const newTransportations = [...estimateData.transportations];
//                             newTransportations[index].totalKilometer = parseFloat(e.target.value);
//                             setEstimateData({ ...estimateData, transportations: newTransportations });
//                             setFormModified(true);
//                           }}
//                         />
//                       </div>
//                       <div>
//                         <label className="block mb-1 text-sm">Number of Trips</label>
//                         <input
//                           type="number"
//                           className="w-full p-2 border rounded"
//                           value={transport.numberOfTrips}
//                           onChange={(e) => {
//                             const newTransportations = [...estimateData.transportations];
//                             newTransportations[index].numberOfTrips = parseInt(e.target.value);
//                             setEstimateData({ ...estimateData, transportations: newTransportations });
//                             setFormModified(true);
//                           }}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 ))}

//                 {/* <div className="grid grid-cols-3 gap-4 p-3 rounded bg-green-50">
//                   <div>
//                     <label className="block mb-1 text-sm font-medium">Crane Price</label>
//                     <input
//                       type="number"
//                       className="w-full p-2 bg-white border rounded"
//                       value={estimateData.cranePrice}
//                       onChange={(e) => setEstimateData({ ...estimateData, cranePrice: parseFloat(e.target.value) })}
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm font-medium">Other Expenses</label>
//                     <input
//                       type="number"
//                       className="w-full p-2 bg-white border rounded"
//                       value={estimateData.otherExpenses}
//                       onChange={(e) => setEstimateData({ ...estimateData, otherExpenses: parseFloat(e.target.value) })}
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm font-medium">Total Transportation</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 bg-gray-100 border rounded"
//                       value={`₹${calculateTotalTransportation().toFixed(2)}`}
//                       readOnly
//                     />
//                   </div>
//                 </div> */}
//               </div>

//               {/* Labour Details */}
//               <div className="p-4 mb-6 bg-white rounded shadow-sm">
//                 <h3 className="mb-4 font-medium">Labour Details</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="p-3 rounded bg-gray-50">
//                     <h4 className="mb-3 text-sm font-medium">Sheeting Labour</h4>
//                     <div className="grid grid-cols-2 gap-3">
//                       <div>
//                         <label className="block mb-1 text-sm">Local Workers</label>
//                         <input
//                           type="number"
//                           className="w-full p-2 border rounded"
//                           value={estimateData.labourData.sheetingLabour.localWorkers}
//                           onChange={(e) => {
//                             const value = parseInt(e.target.value) || 0;
//                             setEstimateData({
//                               ...estimateData,
//                               labourData: {
//                                 ...estimateData.labourData,
//                                 sheetingLabour: {
//                                   ...estimateData.labourData.sheetingLabour,
//                                   localWorkers: value
//                                 }
//                               }
//                             });
//                             setFormModified(true);
//                           }}
//                         />
//                       </div>
//                       <div>
//                         <label className="block mb-1 text-sm">Site Workers</label>
//                         <input
//                           type="number"
//                           className="w-full p-2 border rounded"
//                           value={estimateData.labourData.sheetingLabour.siteWorkers}
//                           onChange={(e) => {
//                             const value = parseInt(e.target.value) || 0;
//                             setEstimateData({
//                               ...estimateData,
//                               labourData: {
//                                 ...estimateData.labourData,
//                                 sheetingLabour: {
//                                   ...estimateData.labourData.sheetingLabour,
//                                   siteWorkers: value
//                                 }
//                               }
//                             });
//                             setFormModified(true);
//                           }}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="p-3 rounded bg-gray-50">
//                     <h4 className="mb-3 text-sm font-medium">Welding Labour</h4>
//                     <div className="grid grid-cols-2 gap-3">
//                       <div>
//                         <label className="block mb-1 text-sm">Local Workers</label>
//                         <input
//                           type="number"
//                           className="w-full p-2 border rounded"
//                           value={estimateData.labourData.weldingLabour.localWorkers}
//                           onChange={(e) => {
//                             const value = parseInt(e.target.value) || 0;
//                             setEstimateData({
//                               ...estimateData,
//                               labourData: {
//                                 ...estimateData.labourData,
//                                 weldingLabour: {
//                                   ...estimateData.labourData.weldingLabour,
//                                   localWorkers: value
//                                 }
//                               }
//                             });
//                             setFormModified(true);
//                           }}
//                         />
//                       </div>
//                       <div>
//                         <label className="block mb-1 text-sm">Site Workers</label>
//                         <input
//                           type="number"
//                           className="w-full p-2 border rounded"
//                           value={estimateData.labourData.weldingLabour.siteWorkers}
//                           onChange={(e) => {
//                             const value = parseInt(e.target.value) || 0;
//                             setEstimateData({
//                               ...estimateData,
//                               labourData: {
//                                 ...estimateData.labourData,
//                                 weldingLabour: {
//                                   ...estimateData.labourData.weldingLabour,
//                                   siteWorkers: value
//                                 }
//                               }
//                             });
//                             setFormModified(true);
//                           }}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4 p-3 mt-4 rounded bg-green-50">
//                   <div>
//                     <label className="block mb-1 text-sm font-medium">Transportation Labour</label>
//                     <input
//                       type="number"
//                       className="w-full p-2 border rounded"
//                       value={estimateData.labourData.transportationLabour}
//                       onChange={(e) => {
//                         const value = parseFloat(e.target.value) || 0;
//                         setEstimateData({
//                           ...estimateData,
//                           labourData: {
//                             ...estimateData.labourData,
//                             transportationLabour: value
//                           }
//                         });
//                         setFormModified(true);
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm font-medium">Enquiry Expense</label>
//                     <input
//                       type="number"
//                       className="w-full p-2 border rounded"
//                       value={estimateData.labourData.enquiryExpense}
//                       onChange={(e) => {
//                         const value = parseFloat(e.target.value) || 0;
//                         setEstimateData({
//                           ...estimateData,
//                           labourData: {
//                             ...estimateData.labourData,
//                             enquiryExpense: value
//                           }
//                         });
//                         setFormModified(true);
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm font-medium">Food & Accommodation</label>
//                     <input
//                       type="number"
//                       className="w-full p-2 border rounded"
//                       value={estimateData.labourData.foodAndAccommodation}
//                       onChange={(e) => {
//                         const value = parseFloat(e.target.value) || 0;
//                         setEstimateData({
//                           ...estimateData,
//                           labourData: {
//                             ...estimateData.labourData,
//                             foodAndAccommodation: value
//                           }
//                         });
//                         setFormModified(true);
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>


//               {/* Other Expenses Section */}
//               <div className="p-4 mb-6 bg-white rounded shadow-sm">
//                 <h3 className="mb-4 font-medium">Project Pricing</h3>

//                 <div className="grid grid-cols-3 gap-4 p-3 rounded bg-gray-50">
//                   <div>
//                     <label className="block mb-1 text-sm font-medium">Crane Price</label>
//                     <input
//                       type="number"
//                       className="w-full p-2 bg-white border rounded"
//                       value={estimateData.cranePrice}
//                       onChange={(e) => {
//                         setEstimateData({ ...estimateData, cranePrice: parseFloat(e.target.value) || 0 });
//                         setFormModified(true); // Mark form as modified
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm font-medium">Other Expenses</label>
//                     <input
//                       type="number"
//                       className="w-full p-2 bg-white border rounded"
//                       value={estimateData.otherExpenses}
//                       onChange={(e) => setEstimateData({ ...estimateData, otherExpenses: parseFloat(e.target.value) || 0 })}
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm font-medium">Selling Rate (per sq.ft)</label>
//                     <input
//                       type="number"
//                       className="w-full p-2 bg-white border rounded"
//                       value={estimateData.sellingRate}
//                       onChange={(e) => {
//                         setEstimateData({ ...estimateData, sellingRate: parseFloat(e.target.value) || 0 });
//                         setFormModified(true);
//                       }}
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 p-3 mt-3 rounded bg-blue-50">
//                   <div>
//                     <label className="block mb-1 text-sm font-medium">Percentage of Margin (%)</label>
//                     <input
//                       type="number"
//                       className="w-full p-2 bg-white border rounded"
//                       value={estimateData.percentageOfMargin}
//                       onChange={(e) => {
//                         setEstimateData({ ...estimateData, percentageOfMargin: parseFloat(e.target.value) || 0 });
//                         setFormModified(true);
//                       }}
//                     />
//                     <p className="mt-1 text-xs text-gray-500">Current margin: {selectedClient?.marginPercentage || 0}%</p>
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm font-medium">Base Project Cost</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 bg-gray-100 border rounded"
//                       value={`₹${(selectedClient?.totalProjectExpense || 0).toFixed(2)}`}
//                       readOnly
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Final Summary */}
//               <div className="p-4 mb-6 bg-white rounded shadow-sm">
//                 <h3 className="mb-4 font-medium">Final Summary</h3>

//                 {/* First row - 2 columns */}
//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   <div className="p-3 border rounded bg-gray-50">
//                     <div className="flex items-center justify-between">
//                       <label className="text-sm">Material Cost</label>
//                       <span className="font-medium">{`₹${(selectedClient?.totalmaterialCharge || selectedClient?.sheetingPrice?.[0]?.materialCharge?.totalCharge || 0).toFixed(2)}`}</span>
//                     </div>
//                   </div>
//                   <div className="p-3 border rounded bg-gray-50">
//                     <div className="flex items-center justify-between">
//                       <label className="text-sm">Sheeting Cost</label>
//                       <span className="font-medium">₹{(selectedClient?.totalSheetingCost || 0).toFixed(2)}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Second row - 2 columns */}
//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   <div className="p-3 border rounded bg-gray-50">
//                     <div className="flex items-center justify-between">
//                       <label className="text-sm">Total Labour Charge</label>
//                       <span className="font-medium">₹{(selectedClient?.labourCharge?.totalLabourCharge || 0).toFixed(2)}</span>
//                     </div>
//                   </div>
//                   <div className="p-3 border rounded bg-gray-50">
//                     <div className="flex items-center justify-between">
//                       <label className="text-sm">Transportation Cost</label>
//                       <span className="font-medium">₹{(selectedClient?.finalTransportationCost|| 0).toFixed(2)}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Third row - Make full width with 2 columns */}
//                {/* First row - 2 columns */}
// <div className="grid grid-cols-2 gap-4 mb-4">
//   <div className="p-3 border rounded bg-gray-50">
//     <div className="flex items-center justify-between">
//       <label className="text-sm">Total Project Expense</label>
//       <span className="font-medium">₹{(selectedClient?.totalProjectExpense || 0).toFixed(2)}</span>
//     </div>
//   </div>
//   <div className="p-3 border rounded bg-gray-50">
//     <div className="flex items-center justify-between">
//       <label className="text-sm">Margin ({selectedClient?.marginPercentage || 0}%)</label>
//       <span className="font-medium">₹{(selectedClient?.marginAmount || 0).toFixed(2)}</span>
//     </div>
//   </div>
// </div>

// {/* Second row - 1 column */}
// <div className="grid grid-cols-1 gap-4 mb-4">
//   <div className="p-3 border rounded bg-gray-50">
//     <div className="flex items-center justify-between">
//       <label className="text-sm">New Project Value</label>
//       <span className="font-medium">₹{(selectedClient?.newProjectValue || 0).toFixed(2)}</span>
//     </div>
//   </div>
// </div>

// {/* Third row - 3 columns */}
// <div className="grid grid-cols-3 gap-4 mb-4">
//   <div className="p-3 border rounded bg-gray-50">
//     <div className="flex items-center justify-between">
//       <label className="text-sm">Rate Per Sq.Ft.</label>
//       <span className="font-medium">₹{(selectedClient?.ratePerSqFt || 0).toFixed(2)}</span>
//     </div>
//   </div>
//   <div className="p-3 border rounded bg-gray-50">
//     <div className="flex items-center justify-between">
//       <label className="text-sm">finalRate</label>
//       <span className="font-medium">₹{(selectedClient?.finalRate || 0).toFixed(2)}</span>
//     </div>
//   </div>
//   <div className="p-3 border rounded bg-gray-50">
//     <div className="flex items-center justify-between">
//       <label className="text-sm">Tax Amount</label>
//       <span className="font-medium">₹{(selectedClient?.taxAmount || 0).toFixed(2)}</span>
//     </div>
//   </div>
// </div>

//                 {/* Total estimate - full width */}
//                 <div className="p-4 mt-4 border border-yellow-300 rounded bg-yellow-50">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-base font-bold text-yellow-800">Total Estimate</h3>
//                     <span className="text-xl font-bold text-yellow-800">
//                       ₹{(selectedClient?.totalBudget  || 0).toFixed(2)}
//                     </span>
//                   </div>
//                 </div>
//               </div>

    //           {/* Action Buttons */}
    //           <div className="flex justify-end gap-3 mb-6">
    //             <button
    //               className="px-5 py-2 text-white transition duration-200 bg-blue-600 rounded hover:bg-blue-700"
    //               onClick={handleShowPdfPreview}
    //             >
    //               Generate PDF
    //             </button>
    //             <button
    //               className="px-5 py-2 text-white transition duration-200 bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
    //               onClick={handleSubmitEstimate}
    //               disabled={isSubmitting || !formModified}
    //             >
    //               {isSubmitting ? "Submitting..." : "Submit Final Estimate"}
    //             </button>
    //           </div>
    //         </>
    //       )}
    //     </div>
    //   </div>

    //   {/* PDF Preview Modal */}
    //   {showPdfPreview && selectedClient && (
    //     <EstimatePdfGenerator
    //       client={selectedClient}
    //       onClose={handleClosePdfPreview}
    //     />
    //   )}
    // </div>
//   );
// };

// export default FinalEstimatePage;













// import { useState, useEffect } from 'react';
// import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';
// import { getClientByPhone } from '../../api/sales/client/getClientByPhone';
// import { submitFinalEstimate } from '../../api/sales/client/submitFinalEstimate';
// import EstimatePdfGenerator from '../components/EstimatePdfGenerator';
// import { message } from 'antd';

// const FinalEstimatePage = () => {
//   // State for search functionality
//   const [searchParams, setSearchParams] = useState({
//     clientName: '',
//     clientPhone: ''
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [clients, setClients] = useState([]);
//   const [formModified, setFormModified] = useState(false);

//   // Client and project data state
//   const [selectedClient, setSelectedClient] = useState(null);

//   // Estimate data state
//   const [estimateData, setEstimateData] = useState({
//     areas: [],
//     transportations: [],
//     labourData: {
//       sheetingLabour: { localWorkers: 0, siteWorkers: 0 },
//       weldingLabour: { localWorkers: 0, siteWorkers: 0 },
//       transportationLabour: 0,
//       enquiryExpense: 0,
//       foodAndAccommodation: 0
//     },
//     cranePrice: 0,
//     otherExpenses: 0,
//     sellingRate: 0,
//     percentageOfMargin: 0,
//     totalProjectCost: 0
//   });

//   // PDF preview state
//   const [showPdfPreview, setShowPdfPreview] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Input change handlers
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setSearchParams(prev => ({ ...prev, [name]: value }));
//   };

//   // Search and client selection
//   const searchClients = async () => {
//     if (!searchParams.clientName && !searchParams.clientPhone) {
//       message.info("Please enter a client name or phone number");
//       return;
//     }
    
//     setIsLoading(true);
//     try {
//       const response = await getClientByPhone(searchParams.clientName, searchParams.clientPhone);
//       if (response.data && response.data.length > 0) {
//         setClients(response.data || []);
//       } else {
//         message.info("No clients found with this name or phone number.");
//         setClients([]);
//       }
//     } catch (error) {
//       message.error("Error fetching clients. Please try again.");
//       console.error("Error fetching clients:", error);
//       setClients([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const selectClient = (client) => {
//     setSelectedClient(client);
  
//     // Initialize estimate data with empty worker counts and existing cost data
//     setEstimateData({
//       clientId: client.clientId._id,
//       siteVisitorId: client.siteVisitorId._id,
//       status: client.status || "Quotation Provided",
    
//       // Areas from sheetingPrice
//       areas: (client.sheetingPrice || []).map(area => ({
//         span: area.span,
//         length: area.length,
//         height: area.height,
//         projectType: area.projectType?._id || area.projectType, // handles populated or raw ID
//         roofModel: area.roofModel?._id || area.roofModel,
//         roofPreference: area.roofPreference,
//         typeOfPanel: area.typeOfPanel,
//         offset: area.offset,
//         sheetThickness: area.sheetThickness,
//         noOfBay: area.noOfBay,
//         noOfWorkingDays: area.NoofWorkingDays || 0,
//         extraPanel: area.extraPanel || 0,
//         areaSqFt: area.areaSqFt || 0,
//         totalSheetingPrice: area.totalSheetingPrice || 0,
//         materialItems: (area.materialCharge?.materials || []).map(mat => ({
//           itemId: mat.itemId,
//           unit: mat.unit
//         }))
//       })),
    
//       // Transportation
//       transportations: client.transportations && client.transportations[0]?.transportationslist?.map(transport => ({
//         vehicleType: transport.vehicleType || "Trailer",
//         totalKilometer: parseFloat(transport.totalKilometer) || 0,
//         numberOfTrips: parseInt(transport.numberOfTrips) || 0
//       })) || [],
    
//       // Initialize labour data with empty worker counts
//       labourData: {
//         sheetingLabour: {
//           localWorkers: 0,
//           siteWorkers: 0
//         },
//         weldingLabour: {
//           localWorkers: 0,
//           siteWorkers: 0
//         },
//         transportationLabour: parseFloat(client.labourCharge?.transportationLabour) || 0,
//         enquiryExpense: parseFloat(client.labourCharge?.enquiryExpense) || 0,
//         foodAndAccommodation: parseFloat(client.labourCharge?.foodAndAccommodation) || 0
//       },
    
//       // Pricing
//       cranePrice: parseFloat(client.transportations && client.transportations[0]?.cranePrice) || 0,
//       otherExpenses: parseFloat(client.transportations && client.transportations[0]?.otherExpenses) || 0,
//       sellingRate: parseFloat(client.sellingRate) || 0,
//       percentageOfMargin: parseFloat(client.marginPercentage) || 0,
//       totalProjectCost: parseFloat(client.totalProjectExpense) || 0
//     });
    
//     setClients([]);
//     setFormModified(false); // Reset form modified flag when selecting a new client
//   };

//   // Handle input change for any field
//   const handleDataChange = (field, value) => {
//     setEstimateData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//     setFormModified(true);
//   };

//   // Handle nested input change for labour data
//   const handleLabourDataChange = (category, field, value) => {
//     setEstimateData(prev => ({
//       ...prev,
//       labourData: {
//         ...prev.labourData,
//         [category]: {
//           ...prev.labourData[category],
//           [field]: value
//         }
//       }
//     }));
//     setFormModified(true);
//   };

//   // Handle direct labour field change
//   const handleDirectLabourChange = (field, value) => {
//     setEstimateData(prev => ({
//       ...prev,
//       labourData: {
//         ...prev.labourData,
//         [field]: value
//       }
//     }));
//     setFormModified(true);
//   };

//   // Transportation handlers
//   const addTransportation = () => {
//     setEstimateData(prev => ({
//       ...prev,
//       transportations: [
//         ...prev.transportations,
//         {
//           vehicleType: "Trailer",
//           totalKilometer: 0,
//           numberOfTrips: 0
//         }
//       ]
//     }));
//     setFormModified(true);
//   };

//   const removeTransportation = (index) => {
//     setEstimateData(prev => {
//       const newTransportations = [...prev.transportations];
//       newTransportations.splice(index, 1);
//       return {
//         ...prev,
//         transportations: newTransportations
//       };
//     });
//     setFormModified(true);
//   };

//   const updateTransportation = (index, field, value) => {
//     setEstimateData(prev => {
//       const newTransportations = [...prev.transportations];
//       newTransportations[index] = {
//         ...newTransportations[index],
//         [field]: field === 'totalKilometer' ? parseFloat(value) || 0 : 
//                  field === 'numberOfTrips' ? parseInt(value) || 0 : 
//                  value
//       };
//       return {
//         ...prev,
//         transportations: newTransportations
//       };
//     });
//     setFormModified(true);
//   };

//   // Submit final estimate
//  // Submit final estimate
//  const handleSubmitEstimate = async () => {
//   if (!selectedClient) {
//     message.info("Please select a client first.");
//     return;
//   }

//   setIsSubmitting(true);
//   try {
//     // Create submission object with all necessary fields
//     const submissionData = {
//       // Include the estimate ID for updates
//       clientId: selectedClient.clientId._id,
//       siteVisitorId: selectedClient.siteVisitorId._id,
//       status: "Finished",
//       areas: (estimateData.areas || []).map(area => ({
//         span: area.span,
//         length: area.length,
//         height: area.height,
//         projectType: area.projectType,
//         roofModel: area.roofModel,
//         roofPreference: area.roofPreference,
//         typeOfPanel: area.typeOfPanel,
//         offset: area.offset,
//         sheetThickness: area.sheetThickness,
//         noOfBay: area.noOfBay,
//         noOfWorkingDays: area.noOfWorkingDays,
//         extraPanel: area.extraPanel,
//         areaSqFt: area.areaSqFt,
//         totalSheetingPrice: area.totalSheetingPrice,
      
//         materialItems: (area.materialItems || []).map(item => ({
//           itemId: item.itemId._id || 'defaultItemId', // After population, itemId is an object with full Item details
//           unit: item.unit || 0 // Access cost after population, assuming it's part of your Item schema
//         }))
//       }))
//       ,
      

//       // Transportation data - Make sure to use the current state
//       transportations: estimateData.transportations.map(transport => ({
//         vehicleType: transport.vehicleType,
//         totalKilometer: transport.totalKilometer,
//         numberOfTrips: transport.numberOfTrips
//       })),

//       // Labor data - Use current state values but transform to API expected format
//       labourData: {
//         sheetingLabour: {
//           localWorkers: estimateData.labourData.sheetingLabour.localWorkers,
//           siteWorkers: estimateData.labourData.sheetingLabour.siteWorkers
//         },
//         weldingLabour: {
//           localWorkers: estimateData.labourData.weldingLabour.localWorkers,
//           siteWorkers: estimateData.labourData.weldingLabour.siteWorkers
//         },
//         transportationLabour: estimateData.labourData.transportationLabour,
//         enquiryExpense: estimateData.labourData.enquiryExpense,
//         foodAndAccommodation: estimateData.labourData.foodAndAccommodation
//       },

//       // Pricing fields - Use current state values
//       cranePrice: parseFloat(estimateData.cranePrice),
//       otherExpenses: parseFloat(estimateData.otherExpenses),
//       sellingRate: parseFloat(estimateData.sellingRate),
//       // Fix the field name to match what API expects
//       PercentageOfMargin: parseFloat(estimateData.percentageOfMargin)
//     };

//     console.log("Submitting final estimate:", submissionData);
//     const response = await submitFinalEstimate(submissionData);
//     console.log("Final estimate response:", response);

//     // Update local state with response data
//     if (response.data && response.data.estimate) {
//       const updatedEstimate = response.data.estimate;

//       // Create an updated client object with the new data
//       const updatedClient = {
//         ...selectedClient,
//         // Preserve the original sheetingPrice array which contains project details
//         sheetingPrice: selectedClient.sheetingPrice,
//         // Update fields from the response
//         totalProjectExpense: updatedEstimate.totalProjectExpense,
//         marginPercentage: updatedEstimate.marginPercentage || updatedEstimate.percentageOfMargin, // Handle both field names
//         marginAmount: updatedEstimate.marginAmount,
//         newProjectValue: updatedEstimate.newProjectValue,
//         ratePerSqFt: updatedEstimate.ratePerSqFt,
//         finalRate: updatedEstimate.finalRate, // Update the final rate
//         taxAmount: updatedEstimate.taxAmount,
//         totalBudget: updatedEstimate.totalBudget || updatedEstimate.newProjectValue,
        
//         // Update transportation data and costs
//         transportations: updatedEstimate.transportations || selectedClient.transportations,
//         finalTransportationCost: updatedEstimate.finalTransportationCost || 
//           (updatedEstimate.transportations && updatedEstimate.transportations[0]?.totalTransportationCost) || 
//           selectedClient.finalTransportationCost,
          
//         // Preserve labor charge with updated values
//         labourCharge: updatedEstimate.labourCharge || selectedClient.labourCharge,
        
//         // Preserve selling rate
//         sellingRate: updatedEstimate.sellingRate || estimateData.sellingRate
//       };

//       // Update the selected client state
//       setSelectedClient(updatedClient);

//       // Update estimate data state with new values
//       setEstimateData(prev => ({
//         ...prev,
//         percentageOfMargin: updatedEstimate.marginPercentage || updatedEstimate.percentageOfMargin || prev.percentageOfMargin,
//         sellingRate: updatedEstimate.sellingRate || prev.sellingRate,
//         totalProjectCost: updatedEstimate.totalProjectExpense || prev.totalProjectCost,
//         transportations: updatedEstimate.transportations || prev.transportations
//       }));

//       // Reset form modified flag
//       setFormModified(false);
      
//       message.success("Final estimate submitted successfully!");
//     } else {
//       message.info("Estimate updated but no data returned. Please refresh to see changes.");
//     }
//   } catch (error) {
//     console.error("Error submitting estimate:", error);
//     message.error("Error submitting estimate. Please try again.");
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   // PDF preview handlers
//   const handleShowPdfPreview = () => {
//     setShowPdfPreview(true);
//   };

//   const handleClosePdfPreview = (wasDownloaded = false) => {
//     setShowPdfPreview(false);
//     if (wasDownloaded) {
//       console.log('PDF was downloaded successfully');
//     }
//   };

//   // Reset the form
//   const resetForm = () => {
//     setSelectedClient(null);
//     setEstimateData({
//       areas: [],
//       transportations: [],
//       labourData: {
//         sheetingLabour: { localWorkers: 0, siteWorkers: 0 },
//         weldingLabour: { localWorkers: 0, siteWorkers: 0 },
//         transportationLabour: 0,
//         enquiryExpense: 0,
//         foodAndAccommodation: 0
//       },
//       cranePrice: 0,
//       otherExpenses: 0,
//       sellingRate: 0,
//       percentageOfMargin: 0,
//       totalProjectCost: 0
//     });
//     setSearchParams({
//       clientName: '',
//       clientPhone: ''
//     });
//     setFormModified(false);
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <div className="flex-1 overflow-y-auto">
//         <Header />
//         <div className="p-6">
//           {/* Client Search Section */}
//           <div className="p-4 mb-6 bg-white rounded shadow-sm">
//             <h3 className="mb-4 font-medium">Find Client</h3>
//             <div className="grid grid-cols-3 gap-4">
//               <div>
//                 <label className="block mb-1 text-sm">Client Name</label>
//                 <input
//                   type="text"
//                   className="w-full p-2 border rounded"
//                   placeholder="Enter client name"
//                   name="clientName"
//                   value={searchParams.clientName}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div>
//                 <label className="block mb-1 text-sm">Client Phone</label>
//                 <input
//                   type="text"
//                   className="w-full p-2 border rounded"
//                   placeholder="+91 *********"
//                   name="clientPhone"
//                   value={searchParams.clientPhone}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="flex items-end">
//                 <button
//                   className="px-4 py-2 text-white transition duration-200 bg-blue-600 rounded hover:bg-blue-700"
//                   onClick={searchClients}
//                   disabled={isLoading}
//                 >
//                   {isLoading ? "Searching..." : "Find Client"}
//                 </button>
//                 {selectedClient && (
//                   <button
//                     className="px-4 py-2 ml-2 text-white transition duration-200 bg-gray-500 rounded hover:bg-gray-600"
//                     onClick={resetForm}
//                   >
//                     Clear Selection
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Selected Client Info */}
//             {selectedClient && (
//               <div className="p-3 mt-4 border border-blue-200 rounded bg-blue-50">
//                 <h4 className="font-medium text-blue-700">Selected Client</h4>
//                 <div className="grid grid-cols-2 gap-2 mt-2">
//                   <div>
//                     <span className="text-sm text-gray-600">Name:</span>
//                     <span className="ml-2 font-medium">{selectedClient.clientId?.name}</span>
//                   </div>
//                   <div>
//                     <span className="text-sm text-gray-600">Phone:</span>
//                     <span className="ml-2 font-medium">{selectedClient.clientId?.phoneNo}</span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Client Search Results */}
//             {clients.length > 0 && (
//               <div className="mt-4">
//                 <h4 className="mb-2 text-sm font-medium">Search Results</h4>
//                 <div className="overflow-y-auto bg-white border rounded max-h-60">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
//                         <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Phone</th>
//                         <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Project</th>
//                         <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {clients.map((client, index) => (
//                         <tr key={index}>
//                           <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{client.clientId?.name || '-'}</td>
//                           <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{client.clientId?.phoneNo || '-'}</td>
//                           <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
//                             {client.sheetingPrice?.[0]?.projectType?.projectType || '-'}
//                           </td>
//                           <td className="px-6 py-4 text-sm text-blue-600 whitespace-nowrap">
//                             <button
//                               className="text-blue-600 hover:text-blue-800"
//                               onClick={() => selectClient(client)}
//                             >
//                               Select
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Form Content - Only show when client is selected */}
//           {selectedClient && (
//             <>
//               {/* Project Details */}
//               <div className="p-4 mb-6 bg-white rounded shadow-sm">
//                 <h2 className="mb-4 text-lg font-medium">Project Details</h2>
//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <label className="block mb-1 text-sm">Client Name</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 border rounded"
//                       value={selectedClient?.clientId?.name || ""}
//                       readOnly
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm">Client Address</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 border rounded"
//                       value={selectedClient ? `${selectedClient.clientId?.place || ""}, ${selectedClient.clientId?.district || ""}` : ""}
//                       readOnly
//                     />
//                   </div>
//                 </div>

//                 {/* Areas Section */}
//                 <div className="p-4 mt-4 rounded bg-gray-50">
//                   <h3 className="mb-4 font-medium">Project Areas</h3>
//                   {selectedClient?.sheetingPrice?.map((area, index) => (
//                     <div key={index} className="p-3 mb-3 bg-white border rounded">
//                       <div className="grid grid-cols-3 gap-4">
//                         <div>
//                           <label className="block mb-1 text-sm">Span</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={`${area.span || 0} m`}
//                             readOnly
//                           />
//                         </div>
//                         <div>
//                           <label className="block mb-1 text-sm">Length</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={`${area.length || 0} m`}
//                             readOnly
//                           />
//                         </div>
//                         <div>
//                           <label className="block mb-1 text-sm">Height</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={`${area.height || 0} m`}
//                             readOnly
//                           />
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-3 gap-4 mt-3">
//                         <div>
//                           <label className="block mb-1 text-sm">Project Type</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={area.projectType?.projectType || "-"}
//                             readOnly
//                           />
//                         </div>
//                         <div>
//                           <label className="block mb-1 text-sm">Roof Model</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={area.roofModel?.roofModel || "-"}
//                             readOnly
//                           />
//                         </div>
//                         <div>
//                           <label className="block mb-1 text-sm">Sheet Thickness</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={`${area.sheetThickness || 0} mm`}
//                             readOnly
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   ))}

//                   <div className="grid grid-cols-3 gap-4 p-3 mt-3 bg-gray-200 rounded">
//                     <div>
//                       <label className="block mb-1 text-sm font-medium">Total Area (sqft)</label>
//                       <input
//                         type="text"
//                         className="w-full p-2 bg-white border rounded"
//                         value={selectedClient?.totalAreaSqFt || "0"}
//                         readOnly
//                       />
//                     </div>
//                     <div>
//                       <label className="block mb-1 text-sm font-medium">Sheeting Cost</label>
//                       <input
//                         type="text"
//                         className="w-full p-2 bg-white border rounded"
//                         value={`₹${(selectedClient?.totalSheetingCost || 0).toFixed(2)}`}
//                         readOnly
//                       />
//                     </div>
//                     <div>
//                       <label className="block mb-1 text-sm font-medium">Material Cost</label>
//                       <input
//                         type="text"
//                         className="w-full p-2 bg-white border rounded"
//                         value={`₹${(selectedClient?.totalmaterialCharge || selectedClient?.sheetingPrice?.[0]?.materialCharge?.totalCharge || 0).toFixed(2)}`}
//                         readOnly
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Transportation Details */}
//               <div className="p-4 mb-6 bg-white rounded shadow-sm">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="font-medium">Transportation Details</h3>
//                   <button
//                     type="button"
//                     className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center"
//                     onClick={addTransportation}
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                     </svg>
//                     Add Transportation
//                   </button>
//                 </div>

//                 {estimateData.transportations.length === 0 && (
//                   <div className="p-4 text-center text-gray-500 bg-gray-50 rounded border border-dashed">
//                     No transportation details added. Click &quot;Add Transportation&quot; to add.
//                   </div>
//                 )}

//                 {estimateData.transportations.map((transport, index) => (
//                   <div key={index} className="p-3 mb-3 border rounded bg-gray-50 relative">
//                     <button
//                       type="button"
//                       className="absolute top-2 right-2 text-red-500 hover:text-red-700"
//                       onClick={() => removeTransportation(index)}
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                     </button>

//                     <div className="grid grid-cols-3 gap-4">
//                       <div>
//                         <label className="block mb-1 text-sm">Vehicle Type</label>
//                         <select
//                           className="w-full p-2 border rounded"
//                           value={transport.vehicleType}
//                           onChange={(e) => updateTransportation(index, 'vehicleType', e.target.value)}
//                         >
//                           <option value="Trailer">Trailer</option>
//                           <option value="Ace">Ace</option>
//                           <option value="Eicher">Eicher</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block mb-1 text-sm">Total Kilometer</label>
//                         <input
//                           type="number"
//                           className="w-full p-2 border rounded"
//                           value={transport.totalKilometer}
//                           onChange={(e) => updateTransportation(index, 'totalKilometer', e.target.value)}
//                         />
//                       </div>
//                       <div>
//                         <label className="block mb-1 text-sm">Number of Trips</label>
//                         <input
//                           type="number"
//                           className="w-full p-2 border rounded"
//                           value={transport.numberOfTrips}
//                           onChange={(e) => updateTransportation(index, 'numberOfTrips', e.target.value)}
//                         />
//                       </div>
//                     </div>
                    
            
    
//                   </div>
                  
//                 ))}
//                   {/* Additional Expenses */}
//               <div className="p-4 mb-6 bg-white rounded shadow-sm">
//                 <h3 className="mb-4 font-medium">Additional Expenses</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block mb-1 text-sm">Crane Price</label>
//                     <input
//                       type="number"
//                       className="w-full p-2 border rounded"
//                       value={estimateData.cranePrice}
//                       onChange={(e) => handleDataChange('cranePrice', parseFloat(e.target.value) || 0)}
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm">Other Expenses</label>
//                     <input
//                       type="number"
//                       className="w-full p-2 border rounded"
//                       value={estimateData.otherExpenses}
//                       onChange={(e) => handleDataChange('otherExpenses', parseFloat(e.target.value) || 0)}
//                     />
//                   </div>
//                 </div>
//               </div>
//                                 {selectedClient?.finalTransportationCost && (
//     <div className="mt-4 p-3 rounded bg-yellow-50">
//       <div className="grid grid-cols-2 gap-4">
      
//         <div>
//       <label className="block mb-1 text-sm font-medium text-blue-700">Total Transportation Cost</label>
//       <input
//         type="text"
//         className="w-full p-2 bg-white border border-blue-200 rounded text-blue-800 font-medium"
//         value={`₹${(selectedClient?.finalTransportationCost || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
//         readOnly
//       />
//     </div>
//       </div>
//     </div>
//   )}
//               </div>

//               {/* Labour Details */}
//              {/* Labour Details */}
// {/* Labour Details */}
// <div className="p-4 mb-6 bg-white rounded shadow-sm">
//   <h3 className="mb-4 font-medium">Labour Details</h3>
  
//   {/* Sheeting and Welding Labour Input Fields */}
//   <div className="grid grid-cols-2 gap-4">
//     <div className="p-3 rounded bg-gray-50">
//       <h4 className="mb-3 text-sm font-medium">Sheeting Labour</h4>
//       <div className="grid grid-cols-2 gap-3">
//         <div>
//           <label className="block mb-1 text-sm">Local Workers (Count)</label>
//           <input
//             type="number"
//             className="w-full p-2 border rounded"
//             value={estimateData.labourData.sheetingLabour.localWorkers}
//             onChange={(e) => handleLabourDataChange('sheetingLabour', 'localWorkers', parseInt(e.target.value) || 0)}
//             placeholder="Enter number of workers"
//           />
//         </div>
//         <div>
//           <label className="block mb-1 text-sm">Site Workers (Count)</label>
//           <input
//             type="number"
//             className="w-full p-2 border rounded"
//             value={estimateData.labourData.sheetingLabour.siteWorkers}
//             onChange={(e) => handleLabourDataChange('sheetingLabour', 'siteWorkers', parseInt(e.target.value) || 0)}
//             placeholder="Enter number of workers"
//           />
//         </div>
//       </div>
      
//       {/* Display Sheeting Labour Cost */}
//       {selectedClient?.labourCharge?.sheetingLabourCharge && (
//         <div className="mt-3 p-2 bg-blue-50 rounded">
//           <label className="block mb-1 text-sm font-medium">Sheeting Labour Cost</label>
//           <input
//             type="text"
//             className="w-full p-2 bg-white border rounded"
//             value={`₹${(selectedClient?.labourCharge?.sheetingLabourCharge || 0).toFixed(2)}`}
//             readOnly
//           />
//         </div>
//       )}
//     </div>

//     <div className="p-3 rounded bg-gray-50">
//       <h4 className="mb-3 text-sm font-medium">Welding Labour</h4>
//       <div className="grid grid-cols-2 gap-3">
//         <div>
//           <label className="block mb-1 text-sm">Local Workers (Count)</label>
//           <input
//             type="number"
//             className="w-full p-2 border rounded"
//             value={estimateData.labourData.weldingLabour.localWorkers}
//             onChange={(e) => handleLabourDataChange('weldingLabour', 'localWorkers', parseInt(e.target.value) || 0)}
//             placeholder="Enter number of workers"
//           />
//         </div>
//         <div>
//           <label className="block mb-1 text-sm">Site Workers (Count)</label>
//           <input
//             type="number"
//             className="w-full p-2 border rounded"
//             value={estimateData.labourData.weldingLabour.siteWorkers}
//             onChange={(e) => handleLabourDataChange('weldingLabour', 'siteWorkers', parseInt(e.target.value) || 0)}
//             placeholder="Enter number of workers"
//           />
//         </div>
//       </div>
      
//       {/* Display Welding Labour Cost */}
//       {selectedClient?.labourCharge?.weldingLabourCharge && (
//         <div className="mt-3 p-2 bg-blue-50 rounded">
//           <label className="block mb-1 text-sm font-medium">Welding Labour Cost</label>
//           <input
//             type="text"
//             className="w-full p-2 bg-white border rounded"
//             value={`₹${(selectedClient?.labourCharge?.weldingLabourCharge || 0).toFixed(2)}`}
//             readOnly
//           />
//         </div>
//       )}
//     </div>
//   </div>

//   {/* Additional Labour Costs */}
//   <div className="grid grid-cols-3 gap-4 p-3 mt-4 rounded bg-green-50">
//     <div>
//       <label className="block mb-1 text-sm font-medium">Transportation Labour Cost</label>
//       <input
//         type="number"
//         className="w-full p-2 border rounded"
//         value={estimateData.labourData.transportationLabour}
//         onChange={(e) => handleDirectLabourChange('transportationLabour', parseFloat(e.target.value) || 0)}
//         placeholder="Enter transportation labour cost"
//       />
//     </div>
//     <div>
//       <label className="block mb-1 text-sm font-medium">Enquiry Expense</label>
//       <input
//         type="number"
//         className="w-full p-2 border rounded"
//         value={estimateData.labourData.enquiryExpense}
//         onChange={(e) => handleDirectLabourChange('enquiryExpense', parseFloat(e.target.value) || 0)}
//         placeholder="Enter enquiry expense"
//       />
//     </div>
//     <div>
//       <label className="block mb-1 text-sm font-medium">Food & Accommodation</label>
//       <input
//         type="number"
//         className="w-full p-2 border rounded"
//         value={estimateData.labourData.foodAndAccommodation}
//         onChange={(e) => handleDirectLabourChange('foodAndAccommodation', parseFloat(e.target.value) || 0)}
//         placeholder="Enter food & accommodation cost"
//       />
//     </div>
//   </div>
  
//   {/* Display Total Labour Cost */}
//   {selectedClient?.labourCharge && (
//     <div className="mt-4 p-3 rounded bg-yellow-50">
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block mb-1 text-sm font-medium">Total Labour Cost</label>
//           <input
//             type="text"
//             className="w-full p-2 bg-white border rounded"
//             value={`₹${(selectedClient?.labourCharge?.totalLabourCharge || 0).toFixed(2)}`}
//             readOnly
//           />
//         </div>
//       </div>
//     </div>
//   )}
// </div>


//               {/* Final Pricing */}
  //          <div className="p-5 mb-6 bg-white rounded-lg shadow border border-gray-200">
  // <h3 className="mb-4 text-lg font-semibold text-gray-800 border-b pb-2">Project Pricing</h3>
  // <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  //   <div>
  //     <label className="block mb-1 text-sm font-medium text-gray-600">Total Project Expense</label>
  //     <div className="relative">
  //       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
  //         <span className="text-gray-500">₹</span>
  //       </div>
  //       <input
  //         type="number"
  //         className="w-full pl-8 p-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  //         value={selectedClient?.totalProjectExpense || estimateData.totalProjectCost}
  //         readOnly
  //       />
  //     </div>
  //   </div>
  //   <div>
  //     <label className="block mb-1 text-sm font-medium text-gray-600">Percentage of Margin (%)</label>
  //     <div className="relative">
  //       <input
  //         type="number"
  //         className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  //         value={estimateData.percentageOfMargin}
  //         onChange={(e) => handleDataChange('percentageOfMargin', parseFloat(e.target.value) || 0)}
  //       />
  //       <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
  //         <span className="text-gray-500">%</span>
  //       </div>
  //     </div>
  //   </div>
  //   <div>
  //     <label className="block mb-1 text-sm font-medium text-gray-600">Selling Rate (per sqft)</label>
  //     <div className="relative">
  //       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
  //         <span className="text-gray-500">₹</span>
  //       </div>
  //       <input
  //         type="number"
  //         className="w-full pl-8 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  //         value={estimateData.sellingRate}
  //         onChange={(e) => handleDataChange('sellingRate', parseFloat(e.target.value) || 0)}
  //       />
  //     </div>
  //   </div>
  // </div>

  // <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mt-5 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
  //   <div>
  //     <label className="block mb-1 text-sm font-medium text-blue-700">Margin Amount</label>
  //     <input
  //       type="text"
  //       className="w-full p-2 bg-white border border-blue-200 rounded text-blue-800 font-medium"
  //       value={`₹${(selectedClient?.marginAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
  //       readOnly
  //     />
  //   </div>
  //   <div>
  //     <label className="block mb-1 text-sm font-medium text-blue-700">New Project Value</label>
  //     <input
  //       type="text"
  //       className="w-full p-2 bg-white border border-blue-200 rounded text-blue-800 font-medium"
  //       value={`₹${(selectedClient?.newProjectValue || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
  //       readOnly
  //     />
  //   </div>
  //   <div>
  //     <label className="block mb-1 text-sm font-medium text-blue-700">Rate per sqft</label>
  //     <input
  //       type="text"
  //       className="w-full p-2 bg-white border border-blue-200 rounded text-blue-800 font-medium"
  //       value={`₹${(selectedClient?.ratePerSqFt || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
  //       readOnly
  //     />
  //   </div>
  // </div>

  // <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mt-5 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200">
  //   <div>
  //     <label className="block mb-1 text-sm font-medium text-yellow-700">Final Rate</label>
  //     <input
  //       type="text"
  //       className="w-full p-2 bg-white border border-yellow-200 rounded text-yellow-800 font-medium"
  //       value={`₹${(selectedClient?.finalRate || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
  //       readOnly
  //     />
  //   </div>
  //   <div>
  //     <label className="block mb-1 text-sm font-medium text-yellow-700">Tax Amount ({selectedClient.taxPercentage}% GST)</label>
  //     <input
  //       type="text"
  //       className="w-full p-2 bg-white border border-yellow-200 rounded text-yellow-800 font-medium"
  //       value={`₹${(selectedClient?.taxAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
  //       readOnly
  //     />
  //   </div>
  //   <div>
  //     <label className="block mb-1 text-sm font-medium text-green-700">Total Budget (with tax)</label>
  //     <input
  //       type="text"
  //       className="w-full p-2 bg-white border-2 border-green-500 rounded font-bold text-green-800"
  //       value={`₹${(selectedClient?.totalBudget || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
  //       readOnly
  //     />
  //   </div>
  //   </div>
  //   </div>

//               {/* Action Buttons */}
//              {/* Action Buttons */}
//            {/* Action Buttons */}
//            <div className="flex justify-end gap-3 mb-6">
//                 <button
//                   className="px-5 py-2 text-white transition duration-200 bg-blue-600 rounded hover:bg-blue-700"
//                   onClick={handleShowPdfPreview}
//                 >
//                   Generate PDF
//                 </button>
//                 <button
//                   className="px-5 py-2 text-white transition duration-200 bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                   onClick={handleSubmitEstimate}
//                   disabled={isSubmitting || !formModified}
//                 >
//                   {isSubmitting ? "Submitting..." : "Submit Final Estimate"}
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* PDF Preview Modal */}
//       {showPdfPreview && selectedClient && (
//         <EstimatePdfGenerator
//           client={selectedClient}
//           onClose={handleClosePdfPreview}
//         />
//       )}
//     </div>
//   );
// };

// export default FinalEstimatePage;






// import { useState, useEffect } from 'react';
// import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';
// import { getClientByPhone } from '../../api/sales/client/getClientByPhone';
// import { submitFinalEstimate } from '../../api/sales/client/submitFinalEstimate';
// import EstimatePdfGenerator from '../components/EstimatePdfGenerator';
// import { message } from 'antd';

// const FinalEstimatePage = () => {
//   // State for search functionality
//   const [searchParams, setSearchParams] = useState({
//     clientName: '',
//     clientPhone: ''
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [clients, setClients] = useState([]);
//   const [formModified, setFormModified] = useState(false);

//   // Client and project data state
//   const [selectedClient, setSelectedClient] = useState(null);

//   // Estimate data state
//   const [estimateData, setEstimateData] = useState({
//     areas: [],
//     transportations: [],
//     labourData: {
//       sheetingLabour: { localWorkers: 0, siteWorkers: 0 },
//       weldingLabour: { localWorkers: 0, siteWorkers: 0 },
//       transportationLabour: 0,
//       enquiryExpense: 0,
//       foodAndAccommodation: 0
//     },
//     cranePrice: 0,
//     otherExpenses: 0,
//     sellingRate: 0,
//     percentageOfMargin: 0,
//     totalProjectCost: 0
//   });

//   // Derived state for transportation costs
//   const [calculatedTransportationCost, setCalculatedTransportationCost] = useState(0);

//   // PDF preview state
//   const [showPdfPreview, setShowPdfPreview] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Calculate transportation costs whenever relevant fields change
//   useEffect(() => {
//     // Simple calculation for demonstration - you may need to adjust based on your actual formula
//     let baseTransportCost = 0;
    
//     // Sum up costs from all transportation entries
//     estimateData.transportations.forEach(transport => {
//       const tripCost = transport.totalKilometer * transport.numberOfTrips * 
//         (transport.vehicleType === "Trailer" ? 50 : 
//          transport.vehicleType === "Eicher" ? 40 : 30); // Example rates
//       baseTransportCost += tripCost;
//     });
    
//     // Add additional expenses
//     const totalTransportCost = baseTransportCost + 
//       parseFloat(estimateData.cranePrice || 0) + 
//       parseFloat(estimateData.otherExpenses || 0);
    
//     setCalculatedTransportationCost(totalTransportCost);
    
//     // If we have a selected client, update its finalTransportationCost
//     if (selectedClient) {
//       setSelectedClient(prev => ({
//         ...prev,
//         finalTransportationCost: totalTransportCost
//       }));
//     }
//   }, [estimateData.transportations, estimateData.cranePrice, estimateData.otherExpenses]);

//   // Input change handlers
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setSearchParams(prev => ({ ...prev, [name]: value }));
//   };

//   // Search and client selection
//   const searchClients = async () => {
//     if (!searchParams.clientName && !searchParams.clientPhone) {
//       message.info("Please enter a client name or phone number");
//       return;
//     }
    
//     setIsLoading(true);
//     try {
//       const response = await getClientByPhone(searchParams.clientName, searchParams.clientPhone);
//       if (response.data && response.data.length > 0) {
//         setClients(response.data || []);
//       } else {
//         message.info("No clients found with this name or phone number.");
//         setClients([]);
//       }
//     } catch (error) {
//       message.error("Error fetching clients. Please try again.");
//       console.error("Error fetching clients:", error);
//       setClients([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const selectClient = (client) => {
//     setSelectedClient(client);
  
//     // Initialize estimate data with empty worker counts and existing cost data
//     setEstimateData({
//       clientId: client.clientId._id,
//       siteVisitorId: client.siteVisitorId._id,
//       status: client.status || "Quotation Provided",
    
//       // Areas from sheetingPrice
//       areas: (client.sheetingPrice || []).map(area => ({
//         span: area.span,
//         length: area.length,
//         height: area.height,
//         projectType: area.projectType?._id || area.projectType, // handles populated or raw ID
//         roofModel: area.roofModel?._id || area.roofModel,
//         roofPreference: area.roofPreference,
//         typeOfPanel: area.typeOfPanel,
//         offset: area.offset,
//         sheetThickness: area.sheetThickness,
//         noOfBay: area.noOfBay,
//         noOfWorkingDays: area.NoofWorkingDays || 0,
//         extraPanel: area.extraPanel || 0,
//         areaSqFt: area.areaSqFt || 0,
//         totalSheetingPrice: area.totalSheetingPrice || 0,
//         materialItems: (area.materialCharge?.materials || []).map(mat => ({
//           itemId: mat.itemId,
//           unit: mat.unit
//         }))
//       })),
    
//       // Transportation
//       transportations: client.transportations && client.transportations[0]?.transportationslist?.map(transport => ({
//         vehicleType: transport.vehicleType || "Trailer",
//         totalKilometer: parseFloat(transport.totalKilometer) || 0,
//         numberOfTrips: parseInt(transport.numberOfTrips) || 0
//       })) || [],
    
//       // Initialize labour data with empty worker counts
//       labourData: {
//         sheetingLabour: {
//           localWorkers: 0,
//           siteWorkers: 0
//         },
//         weldingLabour: {
//           localWorkers: 0,
//           siteWorkers: 0
//         },
//         transportationLabour: parseFloat(client.labourCharge?.transportationLabour) || 0,
//         enquiryExpense: parseFloat(client.labourCharge?.enquiryExpense) || 0,
//         foodAndAccommodation: parseFloat(client.labourCharge?.foodAndAccommodation) || 0
//       },
    
//       // Pricing
//       cranePrice: parseFloat(client.transportations && client.transportations[0]?.cranePrice) || 0,
//       otherExpenses: parseFloat(client.transportations && client.transportations[0]?.otherExpenses) || 0,
//       sellingRate: parseFloat(client.sellingRate) || 0,
//       percentageOfMargin: parseFloat(client.marginPercentage) || 0,
//       totalProjectCost: parseFloat(client.totalProjectExpense) || 0
//     });
    
//     setClients([]);
//     setFormModified(false); // Reset form modified flag when selecting a new client
//   };

//   // Handle input change for any field
//   const handleDataChange = (field, value) => {
//     setEstimateData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//     setFormModified(true);
//   };

//   // Handle nested input change for labour data
//   const handleLabourDataChange = (category, field, value) => {
//     setEstimateData(prev => ({
//       ...prev,
//       labourData: {
//         ...prev.labourData,
//         [category]: {
//           ...prev.labourData[category],
//           [field]: value
//         }
//       }
//     }));
//     setFormModified(true);
//   };

//   // Handle direct labour field change
//   const handleDirectLabourChange = (field, value) => {
//     setEstimateData(prev => ({
//       ...prev,
//       labourData: {
//         ...prev.labourData,
//         [field]: value
//       }
//     }));
//     setFormModified(true);
//   };

//   // Transportation handlers
//   const addTransportation = () => {
//     setEstimateData(prev => ({
//       ...prev,
//       transportations: [
//         ...prev.transportations,
//         {
//           vehicleType: "Trailer",
//           totalKilometer: 0,
//           numberOfTrips: 0
//         }
//       ]
//     }));
//     setFormModified(true);
//   };

//   const removeTransportation = (index) => {
//     setEstimateData(prev => {
//       const newTransportations = [...prev.transportations];
//       newTransportations.splice(index, 1);
//       return {
//         ...prev,
//         transportations: newTransportations
//       };
//     });
//     setFormModified(true);
//   };

//   const updateTransportation = (index, field, value) => {
//     setEstimateData(prev => {
//       const newTransportations = [...prev.transportations];
//       newTransportations[index] = {
//         ...newTransportations[index],
//         [field]: field === 'totalKilometer' ? parseFloat(value) || 0 : 
//                  field === 'numberOfTrips' ? parseInt(value) || 0 : 
//                  value
//       };
//       return {
//         ...prev,
//         transportations: newTransportations
//       };
//     });
//     setFormModified(true);
//   };

//   // Submit final estimate
//   const handleSubmitEstimate = async () => {
//     if (!selectedClient) {
//       message.info("Please select a client first.");
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       // Create submission object with all necessary fields
//       const submissionData = {
//         // Include the estimate ID for updates
//         clientId: selectedClient.clientId._id,
//         siteVisitorId: selectedClient.siteVisitorId._id,
//         status: "Finished",
//         areas: (estimateData.areas || []).map(area => ({
//           span: area.span,
//           length: area.length,
//           height: area.height,
//           projectType: area.projectType,
//           roofModel: area.roofModel,
//           roofPreference: area.roofPreference,
//           typeOfPanel: area.typeOfPanel,
//           offset: area.offset,
//           sheetThickness: area.sheetThickness,
//           noOfBay: area.noOfBay,
//           noOfWorkingDays: area.noOfWorkingDays,
//           extraPanel: area.extraPanel,
//           areaSqFt: area.areaSqFt,
//           totalSheetingPrice: area.totalSheetingPrice,
        
//           materialItems: (area.materialItems || []).map(item => ({
//             itemId: item.itemId._id || item.itemId, // After population, itemId is an object with full Item details
//             unit: item.unit || 0 // Access cost after population, assuming it's part of your Item schema
//           }))
//         })),
        
//         // Transportation data - Make sure to use the current state
//         transportations: estimateData.transportations.map(transport => ({
//           vehicleType: transport.vehicleType,
//           totalKilometer: transport.totalKilometer,
//           numberOfTrips: transport.numberOfTrips
//         })),

//         // Labor data - Use current state values but transform to API expected format
//         labourData: {
//           sheetingLabour: {
//             localWorkers: estimateData.labourData.sheetingLabour.localWorkers,
//             siteWorkers: estimateData.labourData.sheetingLabour.siteWorkers
//           },
//           weldingLabour: {
//             localWorkers: estimateData.labourData.weldingLabour.localWorkers,
//             siteWorkers: estimateData.labourData.weldingLabour.siteWorkers
//           },
//           transportationLabour: estimateData.labourData.transportationLabour,
//           enquiryExpense: estimateData.labourData.enquiryExpense,
//           foodAndAccommodation: estimateData.labourData.foodAndAccommodation
//         },

//         // Pricing fields - Use current state values
//         cranePrice: parseFloat(estimateData.cranePrice),
//         otherExpenses: parseFloat(estimateData.otherExpenses),
//         sellingRate: parseFloat(estimateData.sellingRate),
//         // Fix the field name to match what API expects
//         PercentageOfMargin: parseFloat(estimateData.percentageOfMargin),
//         // Include calculated transportation cost
//         finalTransportationCost: calculatedTransportationCost
//       };

//       console.log("Submitting final estimate:", submissionData);
//       const response = await submitFinalEstimate(submissionData);
//       console.log("Final estimate response:", response);

//       // Update local state with response data
//       if (response.data && response.data.estimate) {
//         const updatedEstimate = response.data.estimate;

//         // Create an updated client object with the new data
//         const updatedClient = {
//           ...selectedClient,
//           // Preserve the original sheetingPrice array which contains project details
//           sheetingPrice: selectedClient.sheetingPrice,
//           // Update fields from the response
//           totalProjectExpense: updatedEstimate.totalProjectExpense,
//           marginPercentage: updatedEstimate.marginPercentage || updatedEstimate.percentageOfMargin, // Handle both field names
//           marginAmount: updatedEstimate.marginAmount,
//           newProjectValue: updatedEstimate.newProjectValue,
//           ratePerSqFt: updatedEstimate.ratePerSqFt,
//           finalRate: updatedEstimate.finalRate, 
//           taxAmount: updatedEstimate.taxAmount,
//           totalBudget: updatedEstimate.totalBudget || updatedEstimate.newProjectValue,
//           // Update transportation data with calculated values
//           finalTransportationCost: calculatedTransportationCost,
//           // Preserve transportation data with updated values
//           transportations: updatedEstimate.transportations ?
//             updatedEstimate.transportations :
//             selectedClient.transportations,
//           // Preserve labor charge with updated values
//           labourCharge: updatedEstimate.labourCharge || selectedClient.labourCharge,
//           labourCharge: updatedEstimate.labourCharge ?
//             updatedEstimate.labourCharge :
//             selectedClient.labourCharge,
//           // Preserve selling rate
//           sellingRate: updatedEstimate.sellingRate || estimateData.sellingRate
//         };

//         // Update the selected client state
//         setSelectedClient(updatedClient);

//         // Update estimate data state with new values
//         setEstimateData(prev => ({
//           ...prev,
//           percentageOfMargin: updatedEstimate.marginPercentage || updatedEstimate.percentageOfMargin || prev.percentageOfMargin,
//           sellingRate: updatedEstimate.sellingRate || prev.sellingRate,
//           totalProjectCost: updatedEstimate.totalProjectExpense || prev.totalProjectCost
//         }));

//         // Reset form modified flag
//         setFormModified(false);
        
//         message.success("Final estimate submitted successfully!");
//       } else {
//         message.info("Estimate updated but no data returned. Please refresh to see changes.");
//       }
//     } catch (error) {
//       console.error("Error submitting estimate:", error);
//       message.error("Error submitting estimate. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // PDF preview handlers
//   const handleShowPdfPreview = () => {
//     setShowPdfPreview(true);
//   };

//   const handleClosePdfPreview = (wasDownloaded = false) => {
//     setShowPdfPreview(false);
//     if (wasDownloaded) {
//       console.log('PDF was downloaded successfully');
//     }
//   };

//   // Reset the form
//   const resetForm = () => {
//     setSelectedClient(null);
//     setEstimateData({
//       areas: [],
//       transportations: [],
//       labourData: {
//         sheetingLabour: { localWorkers: 0, siteWorkers: 0 },
//         weldingLabour: { localWorkers: 0, siteWorkers: 0 },
//         transportationLabour: 0,
//         enquiryExpense: 0,
//         foodAndAccommodation: 0
//       },
//       cranePrice: 0,
//       otherExpenses: 0,
//       sellingRate: 0,
//       percentageOfMargin: 0,
//       totalProjectCost: 0
//     });
//     setSearchParams({
//       clientName: '',
//       clientPhone: ''
//     });
//     setFormModified(false);
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <div className="flex-1 overflow-y-auto">
//         <Header />
//         <div className="p-6">
//           {/* Client Search Section */}
//           <div className="p-4 mb-6 bg-white rounded shadow-sm">
//             <h3 className="mb-4 font-medium">Find Client</h3>
//             <div className="grid grid-cols-3 gap-4">
//               <div>
//                 <label className="block mb-1 text-sm">Client Name</label>
//                 <input
//                   type="text"
//                   className="w-full p-2 border rounded"
//                   placeholder="Enter client name"
//                   name="clientName"
//                   value={searchParams.clientName}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div>
//                 <label className="block mb-1 text-sm">Client Phone</label>
//                 <input
//                   type="text"
//                   className="w-full p-2 border rounded"
//                   placeholder="+91 *********"
//                   name="clientPhone"
//                   value={searchParams.clientPhone}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="flex items-end">
//                 <button
//                   className="px-4 py-2 text-white transition duration-200 bg-blue-600 rounded hover:bg-blue-700"
//                   onClick={searchClients}
//                   disabled={isLoading}
//                 >
//                   {isLoading ? "Searching..." : "Find Client"}
//                 </button>
//                 {selectedClient && (
//                   <button
//                     className="px-4 py-2 ml-2 text-white transition duration-200 bg-gray-500 rounded hover:bg-gray-600"
//                     onClick={resetForm}
//                   >
//                     Clear Selection
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Selected Client Info */}
//             {selectedClient && (
//               <div className="p-3 mt-4 border border-blue-200 rounded bg-blue-50">
//                 <h4 className="font-medium text-blue-700">Selected Client</h4>
//                 <div className="grid grid-cols-2 gap-2 mt-2">
//                   <div>
//                     <span className="text-sm text-gray-600">Name:</span>
//                     <span className="ml-2 font-medium">{selectedClient.clientId?.name}</span>
//                   </div>
//                   <div>
//                     <span className="text-sm text-gray-600">Phone:</span>
//                     <span className="ml-2 font-medium">{selectedClient.clientId?.phoneNo}</span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Client Search Results */}
//             {clients.length > 0 && (
//               <div className="mt-4">
//                 <h4 className="mb-2 text-sm font-medium">Search Results</h4>
//                 <div className="overflow-y-auto bg-white border rounded max-h-60">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
//                         <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Phone</th>
//                         <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Project</th>
//                         <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {clients.map((client, index) => (
//                         <tr key={index}>
//                           <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{client.clientId?.name || '-'}</td>
//                           <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{client.clientId?.phoneNo || '-'}</td>
//                           <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
//                             {client.sheetingPrice?.[0]?.projectType?.projectType || '-'}
//                           </td>
//                           <td className="px-6 py-4 text-sm text-blue-600 whitespace-nowrap">
//                             <button
//                               className="text-blue-600 hover:text-blue-800"
//                               onClick={() => selectClient(client)}
//                             >
//                               Select
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Form Content - Only show when client is selected */}
//           {selectedClient && (
//             <>
//               {/* Project Details */}
//               <div className="p-4 mb-6 bg-white rounded shadow-sm">
//                 <h2 className="mb-4 text-lg font-medium">Project Details</h2>
//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <label className="block mb-1 text-sm">Client Name</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 border rounded"
//                       value={selectedClient?.clientId?.name || ""}
//                       readOnly
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm">Client Address</label>
//                     <input
//                       type="text"
//                       className="w-full p-2 border rounded"
//                       value={selectedClient ? `${selectedClient.clientId?.place || ""}, ${selectedClient.clientId?.district || ""}` : ""}
//                       readOnly
//                     />
//                   </div>
//                 </div>

//                 {/* Areas Section */}
//                 <div className="p-4 mt-4 rounded bg-gray-50">
//                   <h3 className="mb-4 font-medium">Project Areas</h3>
//                   {selectedClient?.sheetingPrice?.map((area, index) => (
//                     <div key={index} className="p-3 mb-3 bg-white border rounded">
//                       <div className="grid grid-cols-3 gap-4">
//                         <div>
//                           <label className="block mb-1 text-sm">Span</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={`${area.span || 0} m`}
//                             readOnly
//                           />
//                         </div>
//                         <div>
//                           <label className="block mb-1 text-sm">Length</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={`${area.length || 0} m`}
//                             readOnly
//                           />
//                         </div>
//                         <div>
//                           <label className="block mb-1 text-sm">Height</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={`${area.height || 0} m`}
//                             readOnly
//                           />
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-3 gap-4 mt-3">
//                         <div>
//                           <label className="block mb-1 text-sm">Project Type</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={area.projectType?.projectType || "-"}
//                             readOnly
//                           />
//                         </div>
//                         <div>
//                           <label className="block mb-1 text-sm">Roof Model</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={area.roofModel?.roofModel || "-"}
//                             readOnly
//                           />
//                         </div>
//                         <div>
//                           <label className="block mb-1 text-sm">Sheet Thickness</label>
//                           <input
//                             type="text"
//                             className="w-full p-2 bg-gray-100 border rounded"
//                             value={`${area.sheetThickness || 0} mm`}
//                             readOnly
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   ))}

//                   <div className="grid grid-cols-3 gap-4 p-3 mt-3 bg-gray-200 rounded">
//                     <div>
//                       <label className="block mb-1 text-sm font-medium">Total Area (sqft)</label>
//                       <input
//                         type="text"
//                         className="w-full p-2 bg-white border rounded"
//                         value={selectedClient?.totalAreaSqFt || "0"}
//                         readOnly
//                       />
//                     </div>
//                     <div>
//                       <label className="block mb-1 text-sm font-medium">Sheeting Cost</label>
//                       <input
//                         type="text"
//                         className="w-full p-2 bg-white border rounded"
//                         value={`₹${(selectedClient?.totalSheetingCost || 0).toFixed(2)}`}
//                         readOnly
//                       />
//                     </div>
//                     <div>
//                       <label className="block mb-1 text-sm font-medium">Material Cost</label>
//                       <input
//                         type="text"
//                         className="w-full p-2 bg-white border rounded"
//                         value={`₹${(selectedClient?.totalmaterialCharge || selectedClient?.sheetingPrice?.[0]?.materialCharge?.totalCharge || 0).toFixed(2)}`}
//                         readOnly
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Transportation & Additional Expenses Section - COMBINED */}
//               <div className="p-4 mb-6 bg-white rounded shadow-sm">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="font-medium">Transportation & Additional Expenses</h3>
//                   <button
//                     type="button"
//                     className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center"
//                     onClick={addTransportation}
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                     </svg>
//                     Add Transportation
//                   </button>
//                 </div>

//                 {/* Transportation Details */}
//                 <div className="mb-6">
//                   <h4 className="mb-3 text-sm font-medium text-gray-700">Transportation Details</h4>
                  
//                   {estimateData.transportations.length === 0 && (
//                     <div className="p-4 text-center text-gray-500 bg-gray-50 rounded border border-dashed">
//                       No transportation details added. Click &quot;Add Transportation&quot; to add.
//                     </div>
//                   )}

//                   {estimateData.transportations.map((transport, index) => (
//                     <div key={index} className="p-3 mb-3 border rounded bg-gray-50 relative">
//                       <button
//                         type="button"
//                         className="absolute top-2 right-2 text-red-500 hover:text-red-700"
//                         onClick={() => removeTransportation(index)}
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                       </button>

//                       <div className="grid grid-cols-3 gap-4">
//                         <div>
//                           <label className="block mb-1 text-sm">Vehicle Type</label>
//                           <select
//                             className="w-full p-2 border rounded"
//                             value={transport.vehicleType}
//                             onChange={(e) => updateTransportation(index, 'vehicleType', e.target.value)}
//                           >
//                             <option value="Trailer">Trailer</option>
//                             <option value="Ace">Ace</option>
//                             <option value="Eicher">Eicher</option>
//                           </select>
//                         </div>
//                         <div>
//                           <label className="block mb-1 text-sm">Total Kilometer</label>
//                           <input
//                             type="number"
//                             className="w-full p-2 border rounded"
//                             value={transport.totalKilometer}
//                             onChange={(e) => updateTransportation(index, 'totalKilometer', e.target.value)}
//                           />
//                         </div>
//                         <div>
//                           <label className="block mb-1 text-sm">Number of Trips</label>
//                           <input
//                             type="number"
//                             className="w-full p-2 border rounded"
//                             value={transport.numberOfTrips}
//                             onChange={(e) => updateTransportation(index, 'numberOfTrips', e.target.value)}
//                           />
//                         </div>
//                         </div>
//                     </div>
//                   ))}

//                   {/* Additional Expenses */}
//                   <div className="grid grid-cols-3 gap-4 mt-4">
//                     <div>
//                       <label className="block mb-1 text-sm">Crane Price (₹)</label>
//                       <input
//                         type="number"
//                         className="w-full p-2 border rounded"
//                         value={estimateData.cranePrice}
//                         onChange={(e) => handleDataChange('cranePrice', parseFloat(e.target.value) || 0)}
//                       />
//                     </div>
//                     <div>
//                       <label className="block mb-1 text-sm">Other Expenses (₹)</label>
//                       <input
//                         type="number"
//                         className="w-full p-2 border rounded"
//                         value={estimateData.otherExpenses}
//                         onChange={(e) => handleDataChange('otherExpenses', parseFloat(e.target.value) || 0)}
//                       />
//                     </div>
//                     <div>
//                       <label className="block mb-1 text-sm font-medium">Total Transportation Cost (₹)</label>
//                       <input
//                         type="text"
//                         className="w-full p-2 bg-gray-100 border rounded"
//                         value={calculatedTransportationCost.toFixed(2)}
//                         readOnly
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Labour Charges Section */}
//               <div className="p-4 mb-6 bg-white rounded shadow-sm">
//                 <h3 className="mb-4 font-medium">Labour Charges</h3>
                
//                 {/* Sheeting Labour */}
//                 <div className="p-3 mb-4 rounded bg-gray-50">
//                   <h4 className="mb-3 text-sm font-medium">Sheeting Labour</h4>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block mb-1 text-sm">Local Workers</label>
//                       <input
//                         type="number"
//                         className="w-full p-2 border rounded"
//                         value={estimateData.labourData.sheetingLabour.localWorkers}
//                         onChange={(e) => handleLabourDataChange('sheetingLabour', 'localWorkers', parseInt(e.target.value) || 0)}
//                       />
//                     </div>
//                     <div>
//                       <label className="block mb-1 text-sm">Site Workers</label>
//                       <input
//                         type="number"
//                         className="w-full p-2 border rounded"
//                         value={estimateData.labourData.sheetingLabour.siteWorkers}
//                         onChange={(e) => handleLabourDataChange('sheetingLabour', 'siteWorkers', parseInt(e.target.value) || 0)}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Welding Labour */}
//                 <div className="p-3 mb-4 rounded bg-gray-50">
//                   <h4 className="mb-3 text-sm font-medium">Welding Labour</h4>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block mb-1 text-sm">Local Workers</label>
//                       <input
//                         type="number"
//                         className="w-full p-2 border rounded"
//                         value={estimateData.labourData.weldingLabour.localWorkers}
//                         onChange={(e) => handleLabourDataChange('weldingLabour', 'localWorkers', parseInt(e.target.value) || 0)}
//                       />
//                     </div>
//                     <div>
//                       <label className="block mb-1 text-sm">Site Workers</label>
//                       <input
//                         type="number"
//                         className="w-full p-2 border rounded"
//                         value={estimateData.labourData.weldingLabour.siteWorkers}
//                         onChange={(e) => handleLabourDataChange('weldingLabour', 'siteWorkers', parseInt(e.target.value) || 0)}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Additional Labour Expenses */}
//                 <div className="grid grid-cols-3 gap-4">
//                   <div>
//                     <label className="block mb-1 text-sm">Transportation Labour (₹)</label>
//                     <input
//                       type="number"
//                       className="w-full p-2 border rounded"
//                       value={estimateData.labourData.transportationLabour}
//                       onChange={(e) => handleDirectLabourChange('transportationLabour', parseFloat(e.target.value) || 0)}
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm">Enquiry Expense (₹)</label>
//                     <input
//                       type="number"
//                       className="w-full p-2 border rounded"
//                       value={estimateData.labourData.enquiryExpense}
//                       onChange={(e) => handleDirectLabourChange('enquiryExpense', parseFloat(e.target.value) || 0)}
//                     />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-sm">Food & Accommodation (₹)</label>
//                     <input
//                       type="number"
//                       className="w-full p-2 border rounded"
//                       value={estimateData.labourData.foodAndAccommodation}
//                       onChange={(e) => handleDirectLabourChange('foodAndAccommodation', parseFloat(e.target.value) || 0)}
//                     />
//                   </div>
//                 </div>
//                 {selectedClient?.labourCharge && (
//     <div className="mt-4 p-3 rounded bg-yellow-50">
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block mb-1 text-sm font-medium">Total Labour Cost</label>
//           <input
//             type="text"
//             className="w-full p-2 bg-white border rounded"
//             value={`₹${(selectedClient?.labourCharge?.totalLabourCharge || 0).toFixed(2)}`}
//             readOnly
//           />
//         </div>
//       </div>
//     </div>)}
//     </div>

           

//               {/* Final Pricing Section */}
//               <div className="p-5 mb-6 bg-white rounded-lg shadow border border-gray-200">
//   <h3 className="mb-4 text-lg font-semibold text-gray-800 border-b pb-2">Project Pricing</h3>
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//     <div>
//       <label className="block mb-1 text-sm font-medium text-gray-600">Total Project Expense</label>
//       <div className="relative">
//         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//           <span className="text-gray-500">₹</span>
//         </div>
//         <input
//           type="number"
//           className="w-full pl-8 p-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           value={selectedClient?.totalProjectExpense || estimateData.totalProjectCost}
//           readOnly
//         />
//       </div>
//     </div>
//     <div>
//       <label className="block mb-1 text-sm font-medium text-gray-600">Percentage of Margin (%)</label>
//       <div className="relative">
//         <input
//           type="number"
//           className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           value={estimateData.percentageOfMargin}
//           onChange={(e) => handleDataChange('percentageOfMargin', parseFloat(e.target.value) || 0)}
//         />
//         <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//           <span className="text-gray-500">%</span>
//         </div>
//       </div>
//     </div>
//     <div>
//       <label className="block mb-1 text-sm font-medium text-gray-600">Selling Rate (per sqft)</label>
//       <div className="relative">
//         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//           <span className="text-gray-500">₹</span>
//         </div>
//         <input
//           type="number"
//           className="w-full pl-8 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           value={estimateData.sellingRate}
//           onChange={(e) => handleDataChange('sellingRate', parseFloat(e.target.value) || 0)}
//         />
//       </div>
//     </div>
//   </div>

//   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mt-5 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
//     <div>
//       <label className="block mb-1 text-sm font-medium text-blue-700">Margin Amount</label>
//       <input
//         type="text"
//         className="w-full p-2 bg-white border border-blue-200 rounded text-blue-800 font-medium"
//         value={`₹${(selectedClient?.marginAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
//         readOnly
//       />
//     </div>
//     <div>
//       <label className="block mb-1 text-sm font-medium text-blue-700">New Project Value</label>
//       <input
//         type="text"
//         className="w-full p-2 bg-white border border-blue-200 rounded text-blue-800 font-medium"
//         value={`₹${(selectedClient?.newProjectValue || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
//         readOnly
//       />
//     </div>
//     <div>
//       <label className="block mb-1 text-sm font-medium text-blue-700">Rate per sqft</label>
//       <input
//         type="text"
//         className="w-full p-2 bg-white border border-blue-200 rounded text-blue-800 font-medium"
//         value={`₹${(selectedClient?.ratePerSqFt || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
//         readOnly
//       />
//     </div>
//   </div>

//   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mt-5 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200">
//     <div>
//       <label className="block mb-1 text-sm font-medium text-yellow-700">Final Rate</label>
//       <input
//         type="text"
//         className="w-full p-2 bg-white border border-yellow-200 rounded text-yellow-800 font-medium"
//         value={`₹${(selectedClient?.finalRate || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
//         readOnly
//       />
//     </div>
//     <div>
//       <label className="block mb-1 text-sm font-medium text-yellow-700">Tax Amount ({selectedClient.taxPercentage}% GST)</label>
//       <input
//         type="text"
//         className="w-full p-2 bg-white border border-yellow-200 rounded text-yellow-800 font-medium"
//         value={`₹${(selectedClient?.taxAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
//         readOnly
//       />
//     </div>
//     <div>
//       <label className="block mb-1 text-sm font-medium text-green-700">Total Budget (with tax)</label>
//       <input
//         type="text"
//         className="w-full p-2 bg-white border-2 border-green-500 rounded font-bold text-green-800"
//         value={`₹${(selectedClient?.totalBudget || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
//         readOnly
//       />
//     </div>
//     </div>
//     </div>

//               {/* Action Buttons */}
//               <div className="flex justify-end gap-4 mb-8">
//                 <button
//                   type="button"
//                   className="px-6 py-2 text-blue-600 transition duration-200 bg-white border border-blue-600 rounded hover:bg-blue-50"
//                   onClick={handleShowPdfPreview}
//                 >
//                   Preview Final Estimate
//                 </button>
//                 <button
//                   type="button"
//                   className={`px-6 py-2 text-white rounded transition duration-200 ${
//                     formModified ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
//                   }`}
//                   onClick={handleSubmitEstimate}
//                   disabled={!formModified || isSubmitting}
//                 >
//                   {isSubmitting ? "Submitting..." : formModified ? "Submit Final Estimate" : "No Changes to Submit"}
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* PDF Preview Modal */}
//       {showPdfPreview && selectedClient && (
//         <EstimatePdfGenerator
//           client={selectedClient}
//           estimateData={estimateData}
//           onClose={handleClosePdfPreview}
//         />
//       )}
//     </div>
//   );
// };

// export default FinalEstimatePage;




import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getClientByPhone } from '../../api/sales/client/getClientByPhone';
import { submitFinalEstimate } from '../../api/sales/client/submitFinalEstimate';
import EstimatePdfGenerator from '../components/EstimatePdfGenerator';
import { message } from 'antd';

const FinalEstimatePage = () => {
  // State for search functionality
  const [searchParams, setSearchParams] = useState({
    clientName: '',
    clientPhone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [formModified, setFormModified] = useState(false);

  // Client and project data state
  const [selectedClient, setSelectedClient] = useState(null);

  // Estimate data state
  const [estimateData, setEstimateData] = useState({
    areas: [],
    transportations: [],
    labourData: {
      sheetingLabour: { localWorkers: 0, siteWorkers: 0 },
      weldingLabour: { localWorkers: 0, siteWorkers: 0 },
      transportationLabour: 0,
      enquiryExpense: 0,
      foodAndAccommodation: 0
    },
    cranePrice: 0,
    otherExpenses: 0,
    sellingRate: 0,
    percentageOfMargin: 0,
    totalProjectCost: 0
  });

  // Input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  // Search and client selection
  const searchClients = async () => {
    if (!searchParams.clientName && !searchParams.clientPhone) {
      message.info("Please enter a client name or phone number");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await getClientByPhone(searchParams.clientName, searchParams.clientPhone);
      if (response.data && response.data.length > 0) {
        setClients(response.data || []);
      } else {
        message.info("No clients found with this name or phone number.");
        setClients([]);
      }
    } catch (error) {
      message.error("Error fetching clients. Please try again.");
      console.error("Error fetching clients:", error);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectClient = (client) => {
    setSelectedClient(client);
  
    // Initialize estimate data with empty worker counts and existing cost data
    setEstimateData({
      clientId: client.clientId._id,
      siteVisitorId: client.siteVisitorId._id,
      status: client.status || "Quotation Provided",
    
      // Areas from sheetingPrice
      areas: (client.sheetingPrice || []).map(area => ({
        span: area.span,
        length: area.length,
        height: area.height,
        projectType: area.projectType?._id || area.projectType, // handles populated or raw ID
        roofModel: area.roofModel?._id || area.roofModel,
        roofPreference: area.roofPreference,
        typeOfPanel: area.typeOfPanel,
        offset: area.offset,
        sheetThickness: area.sheetThickness,
        noOfBay: area.noOfBay,
        noOfWorkingDays: area.NoofWorkingDays || 0,
        extraPanel: area.extraPanel || 0,
        areaSqFt: area.areaSqFt || 0,
        totalSheetingPrice: area.totalSheetingPrice || 0,
        materialItems: (area.materialCharge?.materials || []).map(mat => ({
          itemId: mat.itemId,
          unit: mat.unit
        }))
      })),
    
      // Transportation
      transportations: client.transportations && client.transportations[0]?.transportationslist?.map(transport => ({
        vehicleType: transport.vehicleType || "Trailer",
        totalKilometer: parseFloat(transport.totalKilometer) || 0,
        numberOfTrips: parseInt(transport.numberOfTrips) || 0
      })) || [],
    
      // Initialize labour data with empty worker counts
      labourData: {
        sheetingLabour: {
          localWorkers: 0,
          siteWorkers: 0
        },
        weldingLabour: {
          localWorkers: 0,
          siteWorkers: 0
        },
        transportationLabour: parseFloat(client.labourCharge?.transportationLabour) || 0,
        enquiryExpense: parseFloat(client.labourCharge?.enquiryExpense) || 0,
        foodAndAccommodation: parseFloat(client.labourCharge?.foodAndAccommodation) || 0
      },
    
      // Pricing
      cranePrice: parseFloat(client.transportations && client.transportations[0]?.cranePrice) || 0,
      otherExpenses: parseFloat(client.transportations && client.transportations[0]?.otherExpenses) || 0,
      sellingRate: parseFloat(client.sellingRate) || 0,
      percentageOfMargin: parseFloat(client.marginPercentage) || 0,
      totalProjectCost: parseFloat(client.totalProjectExpense) || 0
    });
    
    setClients([]);
    setFormModified(false); // Reset form modified flag when selecting a new client
  };

  // Handle input change for any field
  const handleDataChange = (field, value) => {
    setEstimateData(prev => ({
      ...prev,
      [field]: value
    }));
    setFormModified(true);
  };

  // Handle nested input change for labour data
  const handleLabourDataChange = (category, field, value) => {
    setEstimateData(prev => ({
      ...prev,
      labourData: {
        ...prev.labourData,
        [category]: {
          ...prev.labourData[category],
          [field]: value
        }
      }
    }));
    setFormModified(true);
  };

  // Handle direct labour field change
  const handleDirectLabourChange = (field, value) => {
    setEstimateData(prev => ({
      ...prev,
      labourData: {
        ...prev.labourData,
        [field]: value
      }
    }));
    setFormModified(true);
  };

  // Transportation handlers
  const addTransportation = () => {
    setEstimateData(prev => ({
      ...prev,
      transportations: [
        ...prev.transportations,
        {
          vehicleType: "Trailer",
          totalKilometer: 0,
          numberOfTrips: 0
        }
      ]
    }));
    setFormModified(true);
  };

  const removeTransportation = (index) => {
    setEstimateData(prev => {
      const newTransportations = [...prev.transportations];
      newTransportations.splice(index, 1);
      return {
        ...prev,
        transportations: newTransportations
      };
    });
    setFormModified(true);
  };

  const updateTransportation = (index, field, value) => {
    setEstimateData(prev => {
      const newTransportations = [...prev.transportations];
      newTransportations[index] = {
        ...newTransportations[index],
        [field]: field === 'totalKilometer' ? parseFloat(value) || 0 : 
                 field === 'numberOfTrips' ? parseInt(value) || 0 : 
                 value
      };
      return {
        ...prev,
        transportations: newTransportations
      };
    });
    setFormModified(true);
  };

  // Submit final estimate
  // const handleSubmitEstimate = async () => {
  //   if (!selectedClient) {
  //     message.info("Please select a client first.");
  //     return;
  //   }

  //   setIsSubmitting(true);
  //   try {
  //     // Create submission object with all necessary fields
  //     const submissionData = {
  //       // Include the estimate ID for updates
  //       clientId: selectedClient.clientId._id,
  //       siteVisitorId: selectedClient.siteVisitorId._id,
  //       status: "Finished",
  //       areas: (estimateData.areas || []).map(area => ({
  //         span: area.span,
  //         length: area.length,
  //         height: area.height,
  //         projectType: area.projectType,
  //         roofModel: area.roofModel,
  //         roofPreference: area.roofPreference,
  //         typeOfPanel: area.typeOfPanel,
  //         offset: area.offset,
  //         sheetThickness: area.sheetThickness,
  //         noOfBay: area.noOfBay,
  //         noOfWorkingDays: area.noOfWorkingDays,
  //         extraPanel: area.extraPanel,
  //         areaSqFt: area.areaSqFt,
  //         totalSheetingPrice: area.totalSheetingPrice,
        
  //         materialItems: (area.materialItems || []).map(item => ({
  //           itemId: item.itemId._id || item.itemId, // After population, itemId is an object with full Item details
  //           unit: item.unit || 0 // Access cost after population, assuming it's part of your Item schema
  //         }))
  //       })),
        
  //       // Transportation data - Make sure to use the current state
  //       transportations: estimateData.transportations.map(transport => ({
  //         vehicleType: transport.vehicleType,
  //         totalKilometer: transport.totalKilometer,
  //         numberOfTrips: transport.numberOfTrips
  //       })),

  //       // Labor data - Use current state values but transform to API expected format
  //       labourData: {
  //         sheetingLabour: {
  //           localWorkers: estimateData.labourData.sheetingLabour.localWorkers,
  //           siteWorkers: estimateData.labourData.sheetingLabour.siteWorkers
  //         },
  //         weldingLabour: {
  //           localWorkers: estimateData.labourData.weldingLabour.localWorkers,
  //           siteWorkers: estimateData.labourData.weldingLabour.siteWorkers
  //         },
  //         transportationLabour: estimateData.labourData.transportationLabour,
  //         enquiryExpense: estimateData.labourData.enquiryExpense,
  //         foodAndAccommodation: estimateData.labourData.foodAndAccommodation
  //       },

  //       // Pricing fields - Use current state values
  //       cranePrice: parseFloat(estimateData.cranePrice),
  //       otherExpenses: parseFloat(estimateData.otherExpenses),
  //       sellingRate: parseFloat(estimateData.sellingRate),
  //       // Fix the field name to match what API expects
  //       PercentageOfMargin: parseFloat(estimateData.percentageOfMargin)
  //     };

  //     console.log("Submitting final estimate:", submissionData);
  //     const response = await submitFinalEstimate(submissionData);
  //     console.log("Final estimate response:", response);

  //     // Update local state with response data
  //     if (response.data && response.data.estimate) {
  //       const updatedEstimate = response.data.estimate;

  //       // Create an updated client object with the new data
  //       const updatedClient = {
  //         ...selectedClient,
  //         // Preserve the original sheetingPrice array which contains project details
  //         sheetingPrice: selectedClient.sheetingPrice,
  //         // Update fields from the response
  //         totalProjectExpense: updatedEstimate.totalProjectExpense,
  //         marginPercentage: updatedEstimate.marginPercentage || updatedEstimate.percentageOfMargin, // Handle both field names
  //         marginAmount: updatedEstimate.marginAmount,
  //         newProjectValue: updatedEstimate.newProjectValue,
  //         ratePerSqFt: updatedEstimate.ratePerSqFt,
  //         finalRate: updatedEstimate.finalRate, 
  //         taxAmount: updatedEstimate.taxAmount,
  //         totalBudget: updatedEstimate.totalBudget || updatedEstimate.newProjectValue,
  //         // Get finalTransportationCost directly from the response
  //         finalTransportationCost: updatedEstimate.finalTransportationCost,
  //         // Preserve transportation data with updated values
  //         transportations: updatedEstimate.transportations ?
  //           updatedEstimate.transportations :
  //           selectedClient.transportations,
  //         // Preserve labor charge with updated values
  //         labourCharge: updatedEstimate.labourCharge || selectedClient.labourCharge,
  //         // Preserve selling rate
  //         sellingRate: updatedEstimate.sellingRate || estimateData.sellingRate
  //       };

  //       // Update the selected client state
  //       setSelectedClient(updatedClient);

  //       // Update estimate data state with new values
  //       setEstimateData(prev => ({
  //         ...prev,
  //         percentageOfMargin: updatedEstimate.marginPercentage || updatedEstimate.percentageOfMargin || prev.percentageOfMargin,
  //         sellingRate: updatedEstimate.sellingRate || prev.sellingRate,
  //         totalProjectCost: updatedEstimate.totalProjectExpense || prev.totalProjectCost
  //       }));

  //       // Reset form modified flag
  //       setFormModified(false);
        
  //       message.success("Final estimate submitted successfully!");
  //     } else {
  //       message.info("Estimate updated but no data returned. Please refresh to see changes.");
  //     }
  //   } catch (error) {
  //     console.error("Error submitting estimate:", error);
  //     message.error("Error submitting estimate. Please try again.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
// Submit final estimate
const handleSubmitEstimate = async () => {
  if (!selectedClient) {
    message.info("Please select a client first.");
    return;
  }

  setIsSubmitting(true);
  try {
    // Create submission object with all necessary fields
    const submissionData = {
      // Include the estimate ID for updates
      clientId: selectedClient.clientId._id,
      siteVisitorId: selectedClient.siteVisitorId._id,
      status: "Finished",
      areas: (estimateData.areas || []).map(area => ({
        span: area.span,
        length: area.length,
        height: area.height,
        projectType: area.projectType,
        roofModel: area.roofModel,
        roofPreference: area.roofPreference,
        typeOfPanel: area.typeOfPanel,
        offset: area.offset,
        sheetThickness: area.sheetThickness,
        noOfBay: area.noOfBay,
        noOfWorkingDays: area.noOfWorkingDays,
        extraPanel: area.extraPanel,
        areaSqFt: area.areaSqFt,
        totalSheetingPrice: area.totalSheetingPrice,
      
        materialItems: (area.materialItems || []).map(item => ({
          itemId: item.itemId._id || item.itemId, // After population, itemId is an object with full Item details
          unit: item.unit || 0 // Access cost after population, assuming it's part of your Item schema
        }))
      })),
      
      // Transportation data - Make sure to use the current state
      // Only include transportations that haven't been removed
      transportations: estimateData.transportations.map(transport => ({
        vehicleType: transport.vehicleType,
        totalKilometer: transport.totalKilometer,
        numberOfTrips: transport.numberOfTrips
      })),

      // Labor data - Use current state values but transform to API expected format
      labourData: {
        sheetingLabour: {
          localWorkers: estimateData.labourData.sheetingLabour.localWorkers,
          siteWorkers: estimateData.labourData.sheetingLabour.siteWorkers
        },
        weldingLabour: {
          localWorkers: estimateData.labourData.weldingLabour.localWorkers,
          siteWorkers: estimateData.labourData.weldingLabour.siteWorkers
        },
        transportationLabour: estimateData.labourData.transportationLabour,
        enquiryExpense: estimateData.labourData.enquiryExpense,
        foodAndAccommodation: estimateData.labourData.foodAndAccommodation
      },

      // Pricing fields - Use current state values
      cranePrice: parseFloat(estimateData.cranePrice),
      otherExpenses: parseFloat(estimateData.otherExpenses),
      sellingRate: parseFloat(estimateData.sellingRate),
      // Fix the field name to match what API expects
      PercentageOfMargin: parseFloat(estimateData.percentageOfMargin)
    };

    console.log("Submitting final estimate:", submissionData);
    const response = await submitFinalEstimate(submissionData);
    console.log("Final estimate response:", response);

    // Update local state with response data
    if (response.data && response.data.estimate) {
      const updatedEstimate = response.data.estimate;

      // Create an updated client object with the new data
      const updatedClient = {
        ...selectedClient,
        // Preserve the original sheetingPrice array which contains project details
        sheetingPrice: selectedClient.sheetingPrice,
        // Update fields from the response
        totalProjectExpense: updatedEstimate.totalProjectExpense,
        marginPercentage: updatedEstimate.marginPercentage || updatedEstimate.percentageOfMargin, // Handle both field names
        marginAmount: updatedEstimate.marginAmount,
        newProjectValue: updatedEstimate.newProjectValue,
        ratePerSqFt: updatedEstimate.ratePerSqFt,
        finalRate: updatedEstimate.finalRate, 
        taxAmount: updatedEstimate.taxAmount,
        totalBudget: updatedEstimate.totalBudget || updatedEstimate.newProjectValue,
        // Get finalTransportationCost directly from the response
        finalTransportationCost: updatedEstimate.finalTransportationCost,
        // Update transportation data with the current state (reflecting any removals)
        transportations: updatedEstimate.transportations ?
          updatedEstimate.transportations :
          estimateData.transportations,
        // Preserve labor charge with updated values
        labourCharge: updatedEstimate.labourCharge || selectedClient.labourCharge,
        // Preserve selling rate
        sellingRate: updatedEstimate.sellingRate || estimateData.sellingRate
      };

      // Update the selected client state
      setSelectedClient(updatedClient);

      // Update estimate data state with new values
      setEstimateData(prev => ({
        ...prev,
        percentageOfMargin: updatedEstimate.marginPercentage || updatedEstimate.percentageOfMargin || prev.percentageOfMargin,
        sellingRate: updatedEstimate.sellingRate || prev.sellingRate,
        totalProjectCost: updatedEstimate.totalProjectExpense || prev.totalProjectCost
      }));

      // Reset form modified flag
      setFormModified(false);
      
      message.success("Final estimate submitted successfully!");
    } else {
      message.info("Estimate updated but no data returned. Please refresh to see changes.");
    }
  } catch (error) {
    console.error("Error submitting estimate:", error);
    message.error("Error submitting estimate. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};
  // PDF preview handlers
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleShowPdfPreview = () => {
    setShowPdfPreview(true);
  };

  const handleClosePdfPreview = (wasDownloaded = false) => {
    setShowPdfPreview(false);
    if (wasDownloaded) {
      console.log('PDF was downloaded successfully');
    }
  };

  // Reset the form
  const resetForm = () => {
    setSelectedClient(null);
    setEstimateData({
      areas: [],
      transportations: [],
      labourData: {
        sheetingLabour: { localWorkers: 0, siteWorkers: 0 },
        weldingLabour: { localWorkers: 0, siteWorkers: 0 },
        transportationLabour: 0,
        enquiryExpense: 0,
        foodAndAccommodation: 0
      },
      cranePrice: 0,
      otherExpenses: 0,
      sellingRate: 0,
      percentageOfMargin: 0,
      totalProjectCost: 0
    });
    setSearchParams({
      clientName: '',
      clientPhone: ''
    });
    setFormModified(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Header />
        <div className="p-6">
          {/* Client Search Section */}
          <div className="p-4 mb-6 bg-white rounded shadow-sm">
            <h3 className="mb-4 font-medium">Find Client</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 text-sm">Client Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Enter client name"
                  name="clientName"
                  value={searchParams.clientName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Client Phone</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="+91 *********"
                  name="clientPhone"
                  value={searchParams.clientPhone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-end">
                <button
                  className="px-4 py-2 text-white transition duration-200 bg-blue-600 rounded hover:bg-blue-700"
                  onClick={searchClients}
                  disabled={isLoading}
                >
                  {isLoading ? "Searching..." : "Find Client"}
                </button>
                {selectedClient && (
                  <button
                    className="px-4 py-2 ml-2 text-white transition duration-200 bg-gray-500 rounded hover:bg-gray-600"
                    onClick={resetForm}
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>

            {/* Selected Client Info */}
            {selectedClient && (
              <div className="p-3 mt-4 border border-blue-200 rounded bg-blue-50">
                <h4 className="font-medium text-blue-700">Selected Client</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedClient.clientId?.name}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{selectedClient.clientId?.phoneNo}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Client Search Results */}
            {clients.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium">Search Results</h4>
                <div className="overflow-y-auto bg-white border rounded max-h-60">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Phone</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Project</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clients.map((client, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{client.clientId?.name || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{client.clientId?.phoneNo || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {client.sheetingPrice?.[0]?.projectType?.projectType || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-blue-600 whitespace-nowrap">
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => selectClient(client)}
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Form Content - Only show when client is selected */}
          {selectedClient && (
            <>
              {/* Project Details */}
              <div className="p-4 mb-6 bg-white rounded shadow-sm">
                <h2 className="mb-4 text-lg font-medium">Project Details</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-1 text-sm">Client Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={selectedClient?.clientId?.name || ""}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">Client Address</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={selectedClient ? `${selectedClient.clientId?.place || ""}, ${selectedClient.clientId?.district || ""}` : ""}
                      readOnly
                    />
                  </div>
                </div>

                {/* Areas Section */}
                <div className="p-4 mt-4 rounded bg-gray-50">
                  <h3 className="mb-4 font-medium">Project Areas</h3>
                  {selectedClient?.sheetingPrice?.map((area, index) => (
                    <div key={index} className="p-3 mb-3 bg-white border rounded">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block mb-1 text-sm">Span</label>
                          <input
                            type="text"
                            className="w-full p-2 bg-gray-100 border rounded"
                            value={`${area.span || 0} m`}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm">Length</label>
                          <input
                            type="text"
                            className="w-full p-2 bg-gray-100 border rounded"
                            value={`${area.length || 0} m`}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm">Height</label>
                          <input
                            type="text"
                            className="w-full p-2 bg-gray-100 border rounded"
                            value={`${area.height || 0} m`}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <label className="block mb-1 text-sm">Project Type</label>
                          <input
                            type="text"
                            className="w-full p-2 bg-gray-100 border rounded"
                            value={area.projectType?.projectType || "-"}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm">Roof Model</label>
                          <input
                            type="text"
                            className="w-full p-2 bg-gray-100 border rounded"
                            value={area.roofModel?.roofModel || "-"}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm">Sheet Thickness</label>
                          <input
                            type="text"
                            className="w-full p-2 bg-gray-100 border rounded"
                            value={`${area.sheetThickness || 0} mm`}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-3 gap-4 p-3 mt-3 bg-gray-200 rounded">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Total Area (sqft)</label>
                      <input
                        type="text"
                        className="w-full p-2 bg-white border rounded"
                        value={selectedClient?.totalAreaSqFt || "0"}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Sheeting Cost</label>
                      <input
                        type="text"
                        className="w-full p-2 bg-white border rounded"
                        value={`₹${(selectedClient?.totalSheetingCost || 0).toFixed(2)}`}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Material Cost</label>
                      <input
                        type="text"
                        className="w-full p-2 bg-white border rounded"
                        value={`₹${(selectedClient?.totalmaterialCharge || selectedClient?.sheetingPrice?.[0]?.materialCharge?.totalCharge || 0).toFixed(2)}`}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Transportation & Additional Expenses Section - COMBINED */}
              <div className="p-4 mb-6 bg-white rounded shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Transportation & Additional Expenses</h3>
                  <button
                    type="button"
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center"
                    onClick={addTransportation}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Transportation
                  </button>
                </div>

                {/* Transportation Details */}
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-700">Transportation Details</h4>
                  
                  {estimateData.transportations.length === 0 && (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 rounded border border-dashed">
                      No transportation details added. Click &quot;Add Transportation&quot; to add.
                    </div>
                  )}

                  {estimateData.transportations.map((transport, index) => (
                    <div key={index} className="p-3 mb-3 border rounded bg-gray-50 relative">
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        onClick={() => removeTransportation(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block mb-1 text-sm">Vehicle Type</label>
                          <select
                            className="w-full p-2 border rounded"
                            value={transport.vehicleType}
                            onChange={(e) => updateTransportation(index, 'vehicleType', e.target.value)}
                          >
                            <option value="Trailer">Trailer</option>
                            <option value="Ace">Ace</option>
                            <option value="Eicher">Eicher</option>
                          </select>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm">Total Kilometer</label>
                          <input
                            type="number"
                            className="w-full p-2 border rounded"
                            value={transport.totalKilometer}
                            onChange={(e) => updateTransportation(index, 'totalKilometer', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm">Number of Trips</label>
                          <input
                            type="number"
                            className="w-full p-2 border rounded"
                            value={transport.numberOfTrips}
                            onChange={(e) => updateTransportation(index, 'numberOfTrips', e.target.value)}
                          />
                        </div>
                        </div>
                    </div>
                  ))}

                  {/* Additional Expenses */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block mb-1 text-sm">Crane Price (₹)</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={estimateData.cranePrice}
                        onChange={(e) => handleDataChange('cranePrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Other Expenses (₹)</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={estimateData.otherExpenses}
                        onChange={(e) => handleDataChange('otherExpenses', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
  <label className="block mb-1 text-sm font-medium">Total Transportation Cost (₹)</label>
  <input
    type="text"
    className="w-full p-2 bg-gray-100 border rounded"
    value={(selectedClient?.finalTransportationCost || 0).toFixed(2)}
    readOnly
  />
</div>
                  </div>
                </div>
              </div>

                        {/* Labour Charges Section */}
              <div className="p-4 mb-6 bg-white rounded shadow-sm">
                <h3 className="mb-4 font-medium">Labour Charges</h3>
                
                {/* Sheeting Labour */}
                <div className="p-3 mb-4 rounded bg-gray-50">
                  <h4 className="mb-3 text-sm font-medium">Sheeting Labour</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm">Local Workers</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={estimateData.labourData.sheetingLabour.localWorkers}
                        onChange={(e) => handleLabourDataChange('sheetingLabour', 'localWorkers', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Site Workers</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={estimateData.labourData.sheetingLabour.siteWorkers}
                        onChange={(e) => handleLabourDataChange('sheetingLabour', 'siteWorkers', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Welding Labour */}
                <div className="p-3 mb-4 rounded bg-gray-50">
                  <h4 className="mb-3 text-sm font-medium">Welding Labour</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm">Local Workers</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={estimateData.labourData.weldingLabour.localWorkers}
                        onChange={(e) => handleLabourDataChange('weldingLabour', 'localWorkers', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Site Workers</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={estimateData.labourData.weldingLabour.siteWorkers}
                        onChange={(e) => handleLabourDataChange('weldingLabour', 'siteWorkers', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Labour Expenses */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 text-sm">Transportation Labour (₹)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={estimateData.labourData.transportationLabour}
                      onChange={(e) => handleDirectLabourChange('transportationLabour', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">Enquiry Expense (₹)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={estimateData.labourData.enquiryExpense}
                      onChange={(e) => handleDirectLabourChange('enquiryExpense', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">Food & Accommodation (₹)</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={estimateData.labourData.foodAndAccommodation}
                      onChange={(e) => handleDirectLabourChange('foodAndAccommodation', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                {selectedClient?.labourCharge && (
    <div className="mt-4 p-3 rounded bg-yellow-50">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Total Labour Cost</label>
          <input
            type="text"
            className="w-full p-2 bg-white border rounded"
            value={`₹${(selectedClient?.labourCharge?.totalLabourCharge || 0).toFixed(2)}`}
            readOnly
          />
        </div>
      </div>
    </div>)}
    </div>

           

              {/* Final Pricing Section */}
              <div className="p-5 mb-6 bg-white rounded-lg shadow border border-gray-200">
  <h3 className="mb-4 text-lg font-semibold text-gray-800 border-b pb-2">Project Pricing</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-600">Total Project Expense</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500">₹</span>
        </div>
        <input
          type="number"
          className="w-full pl-8 p-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedClient?.totalProjectExpense || estimateData.totalProjectCost}
          readOnly
        />
      </div>
    </div>
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-600">Percentage of Margin (%)</label>
      <div className="relative">
        <input
          type="number"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={estimateData.percentageOfMargin}
          onChange={(e) => handleDataChange('percentageOfMargin', parseFloat(e.target.value) || 0)}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-500">%</span>
        </div>
      </div>
    </div>
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-600">Selling Rate (per sqft)</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500">₹</span>
        </div>
        <input
          type="number"
          className="w-full pl-8 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={estimateData.sellingRate}
          onChange={(e) => handleDataChange('sellingRate', parseFloat(e.target.value) || 0)}
        />
      </div>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mt-5 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
    <div>
      <label className="block mb-1 text-sm font-medium text-blue-700">Margin Amount</label>
      <input
        type="text"
        className="w-full p-2 bg-white border border-blue-200 rounded text-blue-800 font-medium"
        value={`₹${(selectedClient?.marginAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
        readOnly
      />
    </div>
    <div>
      <label className="block mb-1 text-sm font-medium text-blue-700">New Project Value</label>
      <input
        type="text"
        className="w-full p-2 bg-white border border-blue-200 rounded text-blue-800 font-medium"
        value={`₹${(selectedClient?.newProjectValue || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
        readOnly
      />
    </div>
    <div>
      <label className="block mb-1 text-sm font-medium text-blue-700">Rate per sqft</label>
      <input
        type="text"
        className="w-full p-2 bg-white border border-blue-200 rounded text-blue-800 font-medium"
        value={`₹${(selectedClient?.ratePerSqFt || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
        readOnly
      />
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mt-5 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200">
    <div>
      <label className="block mb-1 text-sm font-medium text-yellow-700">Final Rate</label>
      <input
        type="text"
        className="w-full p-2 bg-white border border-yellow-200 rounded text-yellow-800 font-medium"
        value={`₹${(selectedClient?.finalRate || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
        readOnly
      />
    </div>
    <div>
      <label className="block mb-1 text-sm font-medium text-yellow-700">Tax Amount ({selectedClient.taxPercentage}% GST)</label>
      <input
        type="text"
        className="w-full p-2 bg-white border border-yellow-200 rounded text-yellow-800 font-medium"
        value={`₹${(selectedClient?.taxAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
        readOnly
      />
    </div>
    <div>
      <label className="block mb-1 text-sm font-medium text-green-700">Total Budget (with tax)</label>
      <input
        type="text"
        className="w-full p-2 bg-white border-2 border-green-500 rounded font-bold text-green-800"
        value={`₹${(selectedClient?.totalBudget || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
        readOnly
      />
    </div>
    </div>
    </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mb-8">
                <button
                  type="button"
                  className="px-6 py-2 text-blue-600 transition duration-200 bg-white border border-blue-600 rounded hover:bg-blue-50"
                  onClick={handleShowPdfPreview}
                >
                  Preview Final Estimate
                </button>
                <button
                  type="button"
                  className={`px-6 py-2 text-white rounded transition duration-200 ${
                    formModified ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  onClick={handleSubmitEstimate}
                  disabled={!formModified || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : formModified ? "Submit Final Estimate" : "No Changes to Submit"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPdfPreview && selectedClient && (
        <EstimatePdfGenerator
          client={selectedClient}
          estimateData={estimateData}
          onClose={handleClosePdfPreview}
        />
      )}
    </div>
  );
};

export default FinalEstimatePage;