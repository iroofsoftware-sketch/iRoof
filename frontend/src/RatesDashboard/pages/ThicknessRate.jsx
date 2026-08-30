import { useState,useEffect } from "react";
import Header from "../../RatesDashboard/components/Header";
import Sidebar from "../../RatesDashboard/components/Sidebar";
import { Link } from "react-router-dom";
import { addThickness, deleteThickness } from "../../api/rates/thicknessrate";
import {getAllThicknessPricing} from "../../api/rates/thicknessrate"
 
 
const ThicknessRate = () => {
  const [activeTab, setActiveTab] = useState("Materials");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 
    // State variables for the form
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
    const [thicknessData, setThicknessData] = useState([]); // State to store thickness pricing data
    // Function to handle form submission
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
      } catch (error) {
        setResponseMessage(error.message || "An error occurred.");
      }
     
    };
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
 
 
 
 
 
 
 
 
 
    // -----------------------------------------
 
 
 
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
 
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="px-5 mt-3">
          <h1 className="text-3xl font-normal text-[#4c48a5] mb-6">
            Thickness rate
          </h1>
        </div>
        {/* Tabs */}
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
       
 
               
              </div>
         
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default ThicknessRate;
 