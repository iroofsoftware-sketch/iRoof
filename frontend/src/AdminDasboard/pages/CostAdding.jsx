// import Header from "../components/Header";
// import Sidebar from "../components/SideNav";
// import { useState } from "react";
// import { sheeting } from "../../api/admin/labour/sheeting";
// import { welding } from "../../api/admin/labour/welding";
// import { addGst } from "../../api/admin/labour/gst";

// function CostAdding() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const [sheetingData, setSheetingData] = useState({
//     localWork: "",
//     siteWork: "",
//   });

//   const [weldingData, setWeldingData] = useState({
//     localWork: "",
//     siteWork: "",
//   });

//   const [gstPercentage, setGstPercentage] = useState("");

//   const [loading, setLoading] = useState(false);

//   const toggleSidebar = () => {
//     setIsSidebarOpen((prev) => !prev);
//   };

//   const handleSheetingChange = (e) => {
//     const { name, value } = e.target;
//     setSheetingData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleWeldingChange = (e) => {
//     const { name, value } = e.target;
//     setWeldingData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmitSheeting = async () => {
//     setLoading(true);
//     try {
//       console.log("Submitting Sheeting Data:", sheetingData);
//       const response = await sheeting(sheetingData);
//       console.log("Sheeting Response:", response);
//       alert("Sheeting cost added successfully");
//     } catch (error) {
//       console.error("Error adding sheeting cost:", error);
//       alert("Failed to add sheeting cost");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmitWelding = async () => {
//     setLoading(true);
//     try {
//       console.log("Submitting Welding Data:", weldingData);
//       const response = await welding(weldingData);
//       console.log("Welding Response:", response);
//       alert("Welding cost added successfully");
//     } catch (error) {
//       console.error("Error adding welding cost:", error);
//       alert("Failed to add welding cost");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // /-------------------------------gst
//   const handleGst = async () => {
//     if (!gstPercentage || isNaN(gstPercentage) || gstPercentage <= 0) {
//       alert("Please enter a valid GST percentage.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await addGst({ gstPercentage });
//       console.log("GST Added:", response);
//       alert("GST added successfully!");
//       setGstPercentage("");
//     } catch (error) {
//       console.error("Error adding GST:", error);
//       alert("Failed to add GST. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="h-screen flex bg-gray-100">
//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//       <div className="flex-1 flex flex-col">
//         <Header toggleSidebar={toggleSidebar} />

//         <div className="p-6 space-y-8 bg-gray-100 overflow-auto">
//           <h1 className="text-3xl font-normal text-[#4c48a5]">Cost Adding</h1>
//           <h1 className="text-3xl font-normal text-[#4c48a5]">Labour Cost</h1>

//           {/* Sheeting Form */}
//           <div className="bg-white p-6 rounded-md shadow-md mb-6">
//             <h2 className="text-2xl font-normal mb-4 text-[#2A2493]">
//               Sheeting
//             </h2>
//             <div className="md:flex gap-10 px-5">
//               <div className="flex flex-col">
//                 <label className="text-sm font-medium text-[#15164A]">
//                   Local Work
//                 </label>
//                 <input
//                   type="number"
//                   name="localWork"
//                   value={sheetingData.localWork}
//                   onChange={handleSheetingChange}
//                   className="p-2 border border-gray-300 rounded-md w-64"
//                   placeholder="₹500/-"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label className="text-sm font-medium text-[#15164A]">
//                   Site Work
//                 </label>
//                 <input
//                   type="number"
//                   name="siteWork"
//                   value={sheetingData.siteWork}
//                   onChange={handleSheetingChange}
//                   className="p-2 border border-gray-300 rounded-md w-64"
//                   placeholder="₹800/-"
//                 />
//               </div>
//             </div>
//             <div className="flex justify-center gap-5 px-10 mt-4">
//               <button
//                 onClick={handleSubmitSheeting}
//                 className="bg-blue-600 p-2 rounded-md text-white px-5"
//                 disabled={loading}
//               >
//                 {loading ? "Adding..." : "Add"}
//               </button>
//               <button
//                 onClick={() => setSheetingData({ localWork: "", siteWork: "" })}
//                 className="bg-red-600 p-2 rounded-md text-white"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>

//           {/* Welding Form */}
//           <div className="bg-white p-6 rounded-md shadow-md mb-6">
//             <h2 className="text-2xl font-normal mb-4 text-[#2A2493]">
//               Welding
//             </h2>
//             <div className="md:flex gap-10 px-5">
//               <div className="flex flex-col">
//                 <label className="text-sm font-medium text-[#15164A]">
//                   Local Work
//                 </label>
//                 <input
//                   type="number"
//                   name="localWork"
//                   value={weldingData.localWork}
//                   onChange={handleWeldingChange}
//                   className="p-2 border border-gray-300 rounded-md w-64"
//                   placeholder="₹500/-"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label className="text-sm font-medium text-[#15164A]">
//                   Site Work
//                 </label>
//                 <input
//                   type="number"
//                   name="siteWork"
//                   value={weldingData.siteWork}
//                   onChange={handleWeldingChange}
//                   className="p-2 border border-gray-300 rounded-md w-64"
//                   placeholder="₹800/-"
//                 />
//               </div>
//             </div>
//             <div className="flex justify-center gap-5 px-10 mt-4">
//               <button
//                 onClick={handleSubmitWelding}
//                 className="bg-blue-600 p-2 rounded-md text-white px-5"
//                 disabled={loading}
//               >
//                 {loading ? "Adding..." : "Add"}
//               </button>
//               <button
//                 onClick={() => setWeldingData({ localWork: "", siteWork: "" })}
//                 className="bg-red-600 p-2 rounded-md text-white"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//           {/* -------------------------------------------------------------- */}
//           <div className="bg-white p-6 rounded-md shadow-md mb-6">
//             <h2 className="text-2xl font-normal mb-4 text-[#2A2493]">
//               GST ADDING
//             </h2>
//             <div className="md:flex gap-10 px-5">
//               <div className="flex flex-col">
//                 <label className="text-sm font-medium text-[#15164A]">
//                   GST (%)
//                 </label>
//                 <input
//                   type="number"
//                   value={gstPercentage}
//                   onChange={(e) => setGstPercentage(e.target.value)}
//                   className="p-2 border border-gray-300 rounded-md w-64"
//                 />
//               </div>
//             </div>
//             <div className="flex justify-center gap-5 px-10 mt-4">
//               <button
//                 className="bg-blue-600 p-2 rounded-md text-white px-5"
//                 onClick={handleGst}
//                 disabled={loading}
//               >
//                 {loading ? "Adding..." : "Add"}
//               </button>
//               <button
//                 className="bg-red-600 p-2 rounded-md text-white"
//                 onClick={() => setGstPercentage("")}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//           {/* ------ */}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CostAdding;
import Header from "../components/Header";
import Sidebar from "../components/SideNav";
import { useState } from "react";
import { sheeting } from "../../api/admin/labour/sheeting";
import { welding } from "../../api/admin/labour/welding";
import { addGst } from "../../api/admin/labour/gst";

function CostAdding() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [sheetingData, setSheetingData] = useState({
    localWork: null,
    siteWork: null,
  });

  const [weldingData, setWeldingData] = useState({
    localWork: null,
    siteWork: null,
  });

  const [gstPercentage, setGstPercentage] = useState("");

  // Separate loading states for each section
  const [sheetingLoading, setSheetingLoading] = useState(false);
  const [weldingLoading, setWeldingLoading] = useState(false);
  const [gstLoading, setGstLoading] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleSheetingChange = (e) => {
    const { name, value } = e.target;
    setSheetingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWeldingChange = (e) => {
    const { name, value } = e.target;
    setWeldingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitSheeting = async () => {
    setSheetingLoading(true);
    try {
      console.log("Submitting Sheeting Data:", sheetingData);
      const response = await sheeting(sheetingData);
      console.log("Sheeting Response:", response);
      alert("Sheeting cost added successfully");
    } catch (error) {
      console.error("Error adding sheeting cost:", error);
      alert("Failed to add sheeting cost");
    } finally {
      setSheetingLoading(false);
    }
  };

  const handleSubmitWelding = async () => {
    setWeldingLoading(true);
    try {
      console.log("Submitting Welding Data:", weldingData);
      const response = await welding(weldingData);
      console.log("Welding Response:", response);
      alert("Welding cost added successfully");
    } catch (error) {
      console.error("Error adding welding cost:", error);
      alert("Failed to add welding cost");
    } finally {
      setWeldingLoading(false);
    }
  };

  const handleGst = async () => {
    if (!gstPercentage || isNaN(gstPercentage) || gstPercentage <= 0) {
      alert("Please enter a valid GST percentage.");
      return;
    }

    setGstLoading(true);
    try {
      const response = await addGst({ gstPercentage });
      console.log("GST Added:", response);
      alert("GST added successfully!");
      setGstPercentage("");
    } catch (error) {
      console.error("Error adding GST:", error);
      alert("Failed to add GST. Please try again.");
    } finally {
      setGstLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />

        <div className="p-6 space-y-8 bg-gray-100 overflow-auto">
          <h1 className="text-3xl font-normal text-[#4c48a5]">Cost Adding</h1>
          <h1 className="text-3xl font-normal text-[#4c48a5]">Labour Cost</h1>

          {/* Sheeting Form */}
          <div className="bg-white p-6 rounded-md shadow-md mb-6">
            <h2 className="text-2xl font-normal mb-4 text-[#2A2493]">
              Sheeting
            </h2>
            <div className="md:flex gap-10 px-5">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#15164A]">
                  Local Work
                </label>
                <input
                  type="number"
                  name="localWork"
                  value={sheetingData.localWork}
                  onChange={handleSheetingChange}
                  className="p-2 border border-gray-300 rounded-md w-64"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#15164A]">
                  Site Work
                </label>
                <input
                  type="number"
                  name="siteWork"
                  value={sheetingData.siteWork}
                  onChange={handleSheetingChange}
                  className="p-2 border border-gray-300 rounded-md w-64"
                  required
                />
              </div>
            </div>
            <div className="flex justify-center gap-5 px-10 mt-4">
              <button
                onClick={handleSubmitSheeting}
                className="bg-blue-600 p-2 rounded-md text-white px-5"
                disabled={sheetingLoading}
              >
                {sheetingLoading ? "Adding..." : "Add"}
              </button>
              <button
                onClick={() => setSheetingData({ localWork: "", siteWork: "" })}
                className="bg-red-600 p-2 rounded-md text-white"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Welding Form */}
          <div className="bg-white p-6 rounded-md shadow-md mb-6">
            <h2 className="text-2xl font-normal mb-4 text-[#2A2493]">
              Welding
            </h2>
            <div className="md:flex gap-10 px-5">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#15164A]">
                  Local Work
                </label>
                <input
                  type="number"
                  name="localWork"
                  required
                  value={weldingData.localWork}
                  onChange={handleWeldingChange}
                  className="p-2 border border-gray-300 rounded-md w-64"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#15164A]">
                  Site Work
                </label>
                <input
                  type="number"
                  name="siteWork"
                  value={weldingData.siteWork}
                  required
                  onChange={handleWeldingChange}
                  className="p-2 border border-gray-300 rounded-md w-64"
                  placeholder="₹800/-"
                />
              </div>
            </div>
            <div className="flex justify-center gap-5 px-10 mt-4">
              <button
                onClick={handleSubmitWelding}
                className="bg-blue-600 p-2 rounded-md text-white px-5"
                disabled={weldingLoading}
              >
                {weldingLoading ? "Adding..." : "Add"}
              </button>
              <button
                onClick={() => setWeldingData({ localWork: "", siteWork: "" })}
                className="bg-red-600 p-2 rounded-md text-white"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* GST Form */}
          <div className="bg-white p-6 rounded-md shadow-md mb-6">
            <h2 className="text-2xl font-normal mb-4 text-[#2A2493]">
              GST ADDING
            </h2>
            <div className="md:flex gap-10 px-5">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-[#15164A]">
                  GST (%)
                </label>
                <input
                  type="number"
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md w-64"
                />
              </div>
            </div>
            <div className="flex justify-center gap-5 px-10 mt-4">
              <button
                className="bg-blue-600 p-2 rounded-md text-white px-5"
                onClick={handleGst}
                disabled={gstLoading}
              >
                {gstLoading ? "Adding..." : "Add"}
              </button>
              <button
                className="bg-red-600 p-2 rounded-md text-white"
                onClick={() => setGstPercentage("")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostAdding;
