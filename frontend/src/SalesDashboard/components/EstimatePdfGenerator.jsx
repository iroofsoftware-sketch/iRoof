// import React, { useRef, useState, useEffect } from 'react';
// // Import html2pdf - add this to your dependencies
// // npm install html2pdf.js
// import logo from "../assets/images/logo.png"

// const EstimatePdfGenerator = ({ client, estimateData, onClose }) => {
//   const pdfRef = useRef(null);
//   const [isGenerating, setIsGenerating] = useState(false);

//   // Calculate total spans, lengths, and square feet across all areas
//   const totals = {
//     span: 0,
//     length: 0,
//     sqft: 0
//   };

//   if (client?.sheetingPrice) {
//     client.sheetingPrice.forEach(area => {
//       totals.span += parseFloat(area.span || 0);
//       totals.length += parseFloat(area.length || 0);
//       totals.sqft += parseFloat(area.areaSqFt || 0);
//     });
//   }

//   // Generate a list of materials used (unique items only)
//   const materials = [];
//   if (client?.sheetingPrice) {
//     client.sheetingPrice.forEach(area => {
//       if (area.materialCharge?.materials) {
//         area.materialCharge.materials.forEach(material => {
//           // Check if material already exists in our list
//           const existingMaterial = materials.find(m => 
//             m.itemId === (material.itemId._id || material.itemId)
//           );
          
//           if (!existingMaterial) {
//             materials.push({
//               itemId: material.itemId._id || material.itemId,
//               name: material.itemId.name || "Material Item",
//               unit: material.unit || 0
//             });
//           }
//         });
//       }
//     });
//   }

//   // Format date for the PDF
//   const currentDate = new Date().toLocaleDateString('en-IN', {
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric'
//   });

//   // Load html2pdf dynamically
//   useEffect(() => {
//     const loadHtml2Pdf = async () => {
//       if (!window.html2pdf) {
//         const script = document.createElement('script');
//         script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
//         script.async = true;
//         document.body.appendChild(script);
//       }
//     };
    
//     loadHtml2Pdf();
//   }, []);

//   // Handle PDF generation
//   const generatePdf = async () => {
//     if (!pdfRef.current) {
//       console.error("PDF reference is not available");
//       alert("PDF reference is not available. Please try again.");
//       return;
//     }
    
//     if (!window.html2pdf) {
//       alert("PDF generation library is still loading. Please try again in a moment.");
//       return;
//     }
    
//     setIsGenerating(true);
    
//     try {
//       const element = pdfRef.current;
//       const opt = {
//         margin: 10,
//         filename: `IROOF_Estimate_${client?.clientId?.name || 'Client'}_${new Date().toISOString().split('T')[0]}.pdf`,
//         image: { type: 'jpeg', quality: 0.98 },
//         html2canvas: { scale: 2, useCORS: true, logging: true },
//         jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
//       };
      
//       await window.html2pdf().from(element).set(opt).save();
//       onClose(true);
//     } catch (error) {
//       console.error("PDF generation error:", error);
//       alert("Failed to generate PDF. Please try again.");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   // Debug function that can be called directly for testing
//   const debugPdf = () => {
//     console.log("Attempting to generate PDF with ref:", pdfRef.current);
//     generatePdf();
//   };

//   // Watermark style
//   const watermarkStyle = {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%) rotate(-45deg)',
//     fontSize: '80px',
//     fontWeight: 'bold',
//     color: 'rgba(200, 200, 200, 0.45)', // increased opacity
//     whiteSpace: 'nowrap',
//     pointerEvents: 'none',
//     zIndex: 0,
//     width: '100%',
//     height: '100%',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center'
//   };
  

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
//         <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
//           <h2 className="text-xl font-bold text-gray-800">Estimate Preview</h2>
//           <div className="flex gap-2">
//             <button
//               onClick={debugPdf}
//               disabled={isGenerating}
//               className={`px-4 py-2 rounded transition duration-200 ${isGenerating 
//                 ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
//                 : 'bg-blue-600 text-white hover:bg-blue-700'}`}
//             >
//               {isGenerating ? 'Generating...' : 'Download PDF'}
//             </button>
//             <button
//               onClick={() => onClose(false)}
//               disabled={isGenerating}
//               className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-200"
//             >
//               Close
//             </button>
//           </div>
//         </div>
        
//         <div className="overflow-y-auto p-4 flex-grow">
//           {/* PDF Content to be printed */}
//           <div 
//             id="pdf-content"
//             ref={pdfRef} 
//             className="bg-white p-8 min-h-[29.7cm] w-full max-w-[21cm] mx-auto shadow-md relative"
//           >
//             {/* Watermark */}
//             <div style={watermarkStyle}>
//               IROOF ENTERPRISES
//             </div>
            
//             {/* Header */}
         
// <div className="text-center border-b-2 border-blue-700 pb-4 relative z-10">
//   {/* Main header content with logo */}
//   <div className="flex items-center justify-center mb-2">
//     <img 
//       src={logo}
//       alt="IROOFING ENTERPRISES Logo" 
//       className="w-12 h-12 object-contain mr-3"
//     />
//     <h1 className="text-3xl font-bold text-blue-800">IROOFING ENTERPRISES</h1>
//   </div>
  
//   <p className="text-sm text-gray-600 mb-2">A Roof without Truss</p>
  
//   {/* GST and Location row - smaller and under heading */}
//   <div className="flex justify-between items-center text-xs text-gray-500">
//     <div className="text-left">
//       <span>GST: 32AAEFI5566M1Z3</span>
//     </div>
//     <div className="text-right">
//       <span>NH 17, Kochal, Koonammavu, Ernakulam, Kerala, Kochi</span>
//     </div>
//   </div>
// </div>
  
 

            
//             {/* Quote Number & Date */}
//             <div className="flex justify-between mt-6 relative z-10">
//               <div>
//                 <p className="font-bold">Quote #: {client?.clientId?._id?.substring(0, 8) || 'QT-12345'}</p>
//                 <p className="text-gray-700">Date: {currentDate}</p>
//               </div>
//               {/* <div className="text-right">
//                 <p className="font-bold">Project Status</p>
//                 <p className="text-blue-700">{client?.status || 'Quotation Provided'}</p>
//               </div> */}
//             </div>
            
//             {/* Client Information */}
//             <div className="mt-8 bg-gray-50 border p-4 rounded relative z-10">
//               <h2 className="text-lg font-bold mb-2 text-gray-800">Client Information</h2>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p><span className="font-medium">Name:</span> {client?.clientId?.name || 'N/A'}</p>
//                   <p><span className="font-medium">Phone:</span> {client?.clientId?.phoneNo || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p><span className="font-medium">Address:</span> {client?.clientId?.place || 'N/A'}{client?.clientId?.district ? `, ${client.clientId.district}` : ''}</p>
//                   <p><span className="font-medium">Email:</span> {client?.clientId?.email || 'N/A'}</p>
//                 </div>
//               </div>
//             </div>
            
//             {/* Thank You Note */}
//             <div className="mt-6 italic text-gray-700 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 relative z-10">
//               <p>Dear {client?.clientId?.name || 'Valued Customer'},</p>
//               <p className="mt-1">Thank you for choosing IROOF Enterprises for your construction needs. We're pleased to present this detailed estimate for your project. Our team is committed to delivering exceptional quality and service.</p>
//             </div>
            
//             {/* Project Details */}
//             <div className="mt-8 relative z-10">
//               <h2 className="text-lg font-bold mb-3 text-gray-800 border-b pb-1">Project Dimensions</h2>
//               <div className="d-flex align-middle gap-4 mb-4">
//                 {/* <div className="bg-blue-50 p-3 rounded border border-blue-200 text-center">
//                   <p className="font-medium text-blue-800">Total Span</p>
//                   <p className="text-xl font-bold mt-1">{totals.span.toFixed(2)} m</p>
//                 </div> */}
//                 {/* <div className="bg-blue-50 p-3 rounded border border-blue-200 text-center">
//                   <p className="font-medium text-blue-800">Total Length</p>
//                   <p className="text-xl font-bold mt-1">{totals.length.toFixed(2)} m</p>
//                 </div> */}
//                 <div className="bg-blue-50 p-3 rounded border border-blue-200 text-center">
//                   <p className="font-medium text-blue-800">Total Area</p>
//                   <p className="text-xl font-bold mt-1">{totals.sqft.toFixed(2)} sqft</p>
//                 </div>
//               </div>
              
//               {/* Areas Breakdown */}
//               <h3 className="font-medium mb-2 text-gray-700">Areas Breakdown</h3>
//               <table className="min-w-full border border-gray-200 mb-6">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="py-2 px-3 text-left border text-sm">Project Type</th>
//                     <th className="py-2 px-3 text-left border text-sm">Roof Model</th>
//                     <th className="py-2 px-3 text-center border text-sm">Span</th>
//                     <th className="py-2 px-3 text-center border text-sm">Length</th>
//                     <th className="py-2 px-3 text-center border text-sm">Height</th>
//                     <th className="py-2 px-3 text-center border text-sm">Sheet Profile</th>
//                     <th className="py-2 px-3 text-center border text-sm">Area (sqft)</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {client?.sheetingPrice?.map((area, index) => (
//                     <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                       <td className="py-2 px-3 border text-sm">{area.projectType?.projectType || 'N/A'}</td>
//                       <td className="py-2 px-3 border text-sm">{area.roofModel?.roofModel || 'N/A'}</td>
//                       <td className="py-2 px-3 border text-center text-sm">{area.span || '0'} m</td>
//                       <td className="py-2 px-3 border text-center text-sm">{area.length || '0'} m</td>
//                       <td className="py-2 px-3 border text-center text-sm">{area.height || '0'} m</td>
//                       <td className="py-2 px-3 border text-center text-sm">{area.typeOfPanel || '0'} </td>
//                       <td className="py-2 px-3 border text-center text-sm">{area.areaSqFt || '0'} sqft</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
            
//             {/* Materials */}
//             {/* <div className="mt-6 relative z-10">
//   <h2 className="text-lg font-bold mb-3 text-gray-800 border-b pb-1">Materials Specification</h2>

//   {client?.sheetingPrice?.length > 0 ? (
//     <table className="min-w-full border border-gray-200 mb-6">
//       <thead>
//         <tr className="bg-gray-100">
//           <th className="py-2 px-3 text-left border text-sm">Material Name</th>
//           <th className="py-2 px-3 text-center border text-sm">Specification</th>
//         </tr>
//       </thead>
//       <tbody>
//         {client.sheetingPrice.map((area, areaIndex) => (
//           <React.Fragment key={areaIndex}>
//             {area.materialCharge?.materials?.map((material, matIndex) => (
//               <tr key={`material-${areaIndex}-${matIndex}`} className={(areaIndex + matIndex) % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                 <td className="py-2 px-3 border text-sm">{material.itemId?.item || 'N/A'}</td>
//                 <td className="py-2 px-3 border text-center text-sm">{material.unit} units</td>
//               </tr>
//             ))}
//             <tr className="bg-blue-50">
//               <td className="py-2 px-3 border text-sm font-medium">Sheet Thickness</td>
//               <td className="py-2 px-3 border text-center text-sm font-medium">
//                 {area?.sheetThickness || '0'} mm
//               </td>
//             </tr>
//             <tr className="bg-blue-50">
//               <td className="py-2 px-3 border text-sm font-medium">Roof Preference</td>
//               <td className="py-2 px-3 border text-center text-sm font-medium">
//                 {area?.roofPreference || 'Standard'}
//               </td>
//             </tr>
//           </React.Fragment>
//         ))}
//       </tbody>
//     </table>
//   ) : (
//     <p className="text-gray-500 italic">No material specifications available.</p>
//   )}
// </div> */}


            
//             {/* Pricing Details */}
//             <div className="mt-6 relative z-10">
//               <h2 className="text-lg font-bold mb-3 text-gray-800 border-b pb-1">Price </h2>
              
//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 {/* <div className="bg-gray-50 p-3 rounded border">
//                   <p className="font-medium text-gray-700">Sheeting Cost</p>
//                   <p className="text-lg font-medium mt-1">₹{parseFloat(client?.totalSheetingCost || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded border">
//                   <p className="font-medium text-gray-700">Material Cost</p>
//                   <p className="text-lg font-medium mt-1">₹{parseFloat(client?.totalmaterialCharge || client?.sheetingPrice?.[0]?.materialCharge?.totalCharge || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
//                 </div> */}
//                 {/* <div className="bg-gray-50 p-3 rounded border">
//                   <p className="font-medium text-gray-700">Selling Rate</p>
//                   <p className="text-lg font-medium mt-1">₹{parseFloat(client?.sellingRate || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
//                 </div> */}
//               </div>
              
//               {/* Final Pricing */}
//               <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   {/* <div>
//                     <p className="font-medium text-blue-800">Total Project Expense</p>
//                     <p className="text-lg font-medium mt-1">₹{parseFloat(client?.totalProjectExpense || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
//                   </div> */}
//                   <div>
//                     <p className="font-medium text-blue-800">Rate per Sq.ft</p>
//                     <p className="text-lg font-medium mt-1">₹{parseFloat(client?.sellingRate || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
//                   </div>
//                 </div>
                
//                 {/* <div className="border-t border-blue-300 pt-3 mt-3">
//                   <div className="grid grid-cols-1">
//                     <div>
//                       <p className="font-medium text-blue-800">Tax Amount ({client?.taxPercentage || 18}% GST)</p>
//                       <p className="text-lg font-medium mt-1">₹{parseFloat(client?.taxAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
//                     </div>
//                   </div>
//                 </div> */}
                
//                 <div className="bg-green-100 p-3 rounded-lg mt-4 border-2 border-green-500">
//                   <p className="font-bold text-green-800">Total Budget (inclusive of taxes)</p>
//                   <p className="text-2xl font-bold mt-1 text-green-800">₹{parseFloat(client?.totalBudget || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
//                 </div>
//               </div>
//             </div>
            
//             {/* Terms and Conditions */}
           
            
//             {/* Signature */}
            
            
//             {/* Footer */}
// <div className="mt-12 pt-4 border-t text-sm text-gray-600 relative z-10"> 
//   <div>
//     <p className="font-medium mb-2">Note:</p>
//     <ul className="space-y-1 text-left">
//       <li>• <em>Civil Work extra. (Earthwork, PCC, RCC)</em></li>
//       <li>• If you need Zinc Dipping for gutter 35/- +18% tax per kg will be additional ( For better corrosion resistance ).</li>
//       <li>• If in case of any decrease in the area, an amount shall be deducted at the rate of 170/- + 18% GST per square foot.</li>
//       <li>• <em>Projects covering an area of more than 1000 sq.ft. will incur additional charges for gutter installation.</em></li>
//     </ul>
//   </div>
  
//   <div className="flex justify-end mt-4">
//     <div className="text-right">
//       <p>Thank you for your business!</p>
//       <p className="font-bold mt-1">Johny Joseph Menachery</p>
//       <p className="text-xs">Managing Partner</p>
//     </div>
//   </div>
// </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EstimatePdfGenerator;




import React, { useRef, useState, useEffect } from 'react';
// Import html2pdf - add this to your dependencies
// npm install html2pdf.js
import logo from "../assets/images/logo1.png"

const EstimatePdfGenerator = ({ client, estimateData, onClose }) => {
  const pdfRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate total spans, lengths, and square feet across all areas
  const totals = {
    span: 0,
    length: 0,
    sqft: 0
  };

  if (client?.sheetingPrice) {
    client.sheetingPrice.forEach(area => {
      totals.span += parseFloat(area.span || 0);
      totals.length += parseFloat(area.length || 0);
      totals.sqft += parseFloat(area.areaSqFt || 0);
    });
  }

  // Generate a list of materials used (unique items only)
  const materials = [];
  if (client?.sheetingPrice) {
    client.sheetingPrice.forEach(area => {
      if (area.materialCharge?.materials) {
        area.materialCharge.materials.forEach(material => {
          // Check if material already exists in our list
          const existingMaterial = materials.find(m => 
            m.itemId === (material.itemId._id || material.itemId)
          );
          
          if (!existingMaterial) {
            materials.push({
              itemId: material.itemId._id || material.itemId,
              name: material.itemId.name || "Material Item",
              unit: material.unit || 0
            });
          }
        });
      }
    });
  }

  // Format date for the PDF
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Load html2pdf dynamically
  useEffect(() => {
    const loadHtml2Pdf = async () => {
      if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.async = true;
        document.body.appendChild(script);
      }
    };
    
    loadHtml2Pdf();
  }, []);

  // Handle PDF generation
  const generatePdf = async () => {
    if (!pdfRef.current) {
      console.error("PDF reference is not available");
      alert("PDF reference is not available. Please try again.");
      return;
    }
    
    if (!window.html2pdf) {
      alert("PDF generation library is still loading. Please try again in a moment.");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const element = pdfRef.current;
      const opt = {
        margin: 10,
        filename: `IROOF_Estimate_${client?.clientId?.name || 'Client'}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await window.html2pdf().from(element).set(opt).save();
      onClose(true);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Debug function that can be called directly for testing
  const debugPdf = () => {
    console.log("Attempting to generate PDF with ref:", pdfRef.current);
    generatePdf();
  };

  // Watermark style
  const watermarkStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: '80px',
    fontWeight: 'bold',
    color: 'rgba(200, 200, 200, 0.45)', // increased opacity
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">Estimate Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={debugPdf}
              disabled={isGenerating}
              className={`px-4 py-2 rounded transition duration-200 ${isGenerating 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={() => onClose(false)}
              disabled={isGenerating}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto p-4 flex-grow">
          {/* PDF Content to be printed */}
          <div 
            id="pdf-content"
            ref={pdfRef} 
            className="bg-white p-8 min-h-[29.7cm] w-full max-w-[21cm] mx-auto shadow-md relative"
          >
            {/* Add CSS styles for PDF generation */}
            <style>{`
              @media print {
                .pricing-section {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                .pricing-final-block {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                .footer-section {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                .areas-table {
                  page-break-after: auto;
                }
              }
              
              .pricing-section {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              .pricing-final-block {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              .footer-section {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            `}</style>

            {/* Watermark */}
            <div style={watermarkStyle}>
              IROOF ENTERPRISES
            </div>
            
            {/* Header */}
            <div className="text-center border-b-2 border-blue-700 pb-4 relative z-10">
              {/* Main header content with logo */}
              <div className="flex items-center justify-center mb-2">
                <img 
                  src={logo}
                  alt="IROOFING ENTERPRISES Logo" 
                  className="w-12 h-12 object-contain mr-3"
                />
                <h1 className="text-3xl font-bold text-blue-800">IROOFING ENTERPRISES</h1>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">A Roof without Truss</p>
              
              {/* GST and Location row - smaller and under heading */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="text-left">
                  <span>GST: 32AAEFI5566M1Z3</span>
                </div>
                <div className="text-right">
                  <span>NH 17, Kochal, Koonammavu, Ernakulam, Kerala, Kochi</span>
                </div>
              </div>
            </div>
            
            {/* Quote Number & Date */}
            <div className="flex justify-between mt-6 relative z-10">
              <div>
                <p className="font-bold">Quote #: {client?.clientId?._id?.substring(0, 8) || 'QT-12345'}</p>
                <p className="text-gray-700">Date: {currentDate}</p>
              </div>
            </div>
            
            {/* Client Information */}
            <div className="mt-8 bg-gray-50 border p-4 rounded relative z-10">
              <h2 className="text-lg font-bold mb-2 text-gray-800">Client Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Name:</span> {client?.clientId?.name || 'N/A'}</p>
                  <p><span className="font-medium">Phone:</span> {client?.clientId?.phoneNo || 'N/A'}</p>
                </div>
                <div>
                  <p><span className="font-medium">Address:</span> {client?.clientId?.place || 'N/A'}{client?.clientId?.district ? `, ${client.clientId.district}` : ''}</p>
                  <p><span className="font-medium">Email:</span> {client?.clientId?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Thank You Note */}
            <div className="mt-6 italic text-gray-700 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 relative z-10">
              <p>Dear {client?.clientId?.name || 'Valued Customer'},</p>
              <p className="mt-1">Thank you for choosing IROOF Enterprises for your construction needs. We're pleased to present this detailed estimate for your project. Our team is committed to delivering exceptional quality and service.</p>
            </div>
            
            {/* Project Details */}
            <div className="mt-8 relative z-10">
              <h2 className="text-lg font-bold mb-3 text-gray-800 border-b pb-1">Project Dimensions</h2>
              <div className="d-flex align-middle gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded border border-blue-200 text-center">
                  <p className="font-medium text-blue-800">Total Area</p>
                  <p className="text-xl font-bold mt-1">{totals.sqft.toFixed(2)} sqft</p>
                </div>
              </div>
              
              {/* Areas Breakdown */}
              <h3 className="font-medium mb-2 text-gray-700">Areas Breakdown</h3>
              <table className="min-w-full border border-gray-200 mb-6 areas-table">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-3 text-left border text-sm">Project Type</th>
                    <th className="py-2 px-3 text-left border text-sm">Roof Model</th>
                    <th className="py-2 px-3 text-center border text-sm">Span</th>
                    <th className="py-2 px-3 text-center border text-sm">Length</th>
                    <th className="py-2 px-3 text-center border text-sm">Height</th>
                    <th className="py-2 px-3 text-center border text-sm">Sheet Profile</th>
                    <th className="py-2 px-3 text-center border text-sm">Area (sqft)</th>
                  </tr>
                </thead>
                <tbody>
                  {client?.sheetingPrice?.map((area, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-3 border text-sm">{area.projectType?.projectType || 'N/A'}</td>
                      <td className="py-2 px-3 border text-sm">{area.roofModel?.roofModel || 'N/A'}</td>
                      <td className="py-2 px-3 border text-center text-sm">{area.span || '0'} m</td>
                      <td className="py-2 px-3 border text-center text-sm">{area.length || '0'} m</td>
                      <td className="py-2 px-3 border text-center text-sm">{area.height || '0'} m</td>
                      <td className="py-2 px-3 border text-center text-sm">{area.typeOfPanel || '0'} </td>
                      <td className="py-2 px-3 border text-center text-sm">{area.areaSqFt || '0'} sqft</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pricing Details - Now with page-break protection */}
            <div className="mt-6 relative z-10 pricing-section">
              <h2 className="text-lg font-bold mb-3 text-gray-800 border-b pb-1">Price</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Keep empty for consistency */}
              </div>
              
              {/* Final Pricing - Protected from page breaks */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 pricing-final-block">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-medium text-blue-800">Rate per Sq.ft</p>
                    <p className="text-lg font-medium mt-1">₹{parseFloat(client?.sellingRate || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                  </div>
                </div>
                
                <div className="bg-green-100 p-3 rounded-lg mt-4 border-2 border-green-500">
                  <p className="font-bold text-green-800">Total Budget (inclusive of taxes)</p>
                  <p className="text-2xl font-bold mt-1 text-green-800">₹{parseFloat(client?.totalBudget || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                </div>
              </div>
            </div>
            
            {/* Footer - Also protected from page breaks */}
            <div className="mt-12 pt-4 border-t text-sm text-gray-600 relative z-10 footer-section"> 
              <div>
                <p className="font-medium mb-2">Note:</p>
                <ul className="space-y-1 text-left">
                  <li>• <em>Civil Work extra. (Earthwork, PCC, RCC)</em></li>
                  <li>• If you need Zinc Dipping for gutter 35/- +18% tax per kg will be additional ( For better corrosion resistance ).</li>
                  <li>• If in case of any decrease in the area, an amount shall be deducted at the rate of 170/- + 18% GST per square foot.</li>
                  <li>• <em>Projects covering an area of more than 1000 sq.ft. will incur additional charges for gutter installation.</em></li>
                </ul>
              </div>
              
              <div className="flex justify-end mt-4">
                <div className="text-right">
                  <p>Thank you for your business!</p>
                  <p className="font-bold mt-1">Johny Joseph Menachery</p>
                  <p className="text-xs">Managing Partner</p>
                </div>
              </div>
            </div>
            {/* Bank Details Section */}
<div className="mt-8 border border-gray-300 rounded-lg p-4 flex justify-between items-center footer-section relative z-10">
  {/* Left side - Bank details */}
  <div>
    <h3 className="text-base font-bold text-blue-800 mb-2">Our Bank Details: I Roofing Enterprises</h3>
    <p className="text-sm text-gray-700">
      <span className="font-medium">A/c No:</span> 856830150000004 &nbsp;&nbsp;
      <span className="font-medium">IFSC Code:</span> BKID0008568
    </p>
    <p className="text-sm text-gray-700">
      <span className="font-medium">GSTIN:</span> 32AAEFI5566M1Z3
    </p>
    <p className="text-sm text-gray-700">BANK OF INDIA, UDYOGAMANDAL</p>
    <p className="text-sm text-gray-700">
      <span className="font-medium">Mob No:</span> 9633508932, 9037635433, 0484 2512696
    </p>
  </div>

  {/* Right side - Logo */}
  <div className="flex-shrink-0">
    <img
      src={logo}
      alt="I Roofing Logo"
      className="w-28 h-auto object-contain"
    />
  </div>
</div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimatePdfGenerator;