import Header from "../components/Header";
import Sidebar from "../components/SideNav";
import { useState } from "react";
import plussquare from "../assets/icons/plussquare.png";


function CustomerDetailpage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [areas, setAreas] = useState([1]);
  const [formData, setFormData] = useState({
    clientInfo: {
      name: "",
      phoneNo: "",
      place: "",
      district: "",
      comments: ""
    },
    areas: [{
      workType: "",
      workModel: "",
      roofPreference: "",
      uploadedFile: null,
      materials: [{
        materialType: "",
        span: "",
        length: "",
        height: ""
      }],
      comments: "",
      attachments: null
    }],
    estimate: {
      totalSqFt: "",
      totalCost: "",
      sqFtRate: "",
      comments: ""
    },
    siteVisit: {
      date: "",
      time: "",
      status: "",
      comments: "",
      assignTo: ""
    }
  });

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      clientInfo: {
        ...prev.clientInfo,
        [name]: value
      }
    }));
  };

  const handleAreaChange = (areaIndex, field, value, materialIndex = null) => {
    setFormData(prev => {
      const newAreas = [...prev.areas];
      if (materialIndex !== null) {
        // Handle material fields
        newAreas[areaIndex].materials[materialIndex] = {
          ...newAreas[areaIndex].materials[materialIndex],
          [field]: value
        };
      } else {
        // Handle other area fields
        newAreas[areaIndex] = {
          ...newAreas[areaIndex],
          [field]: value
        };
      }
      return { ...prev, areas: newAreas };
    });
  };

  const handleEstimateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      estimate: {
        ...prev.estimate,
        [name]: value
      }
    }));
  };

  const handleSiteVisitChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      siteVisit: {
        ...prev.siteVisit,
        [name]: value
      }
    }));
  };

  const handleFileUpload = (areaIndex, e) => {
    const file = e.target.files[0];
    handleAreaChange(areaIndex, 'uploadedFile', file);
  };

  const addNewArea = () => {
    setAreas(prev => [...prev, prev.length + 1]);
    setFormData(prev => ({
      ...prev,
      areas: [...prev.areas, {
        workType: "",
        workModel: "",
        roofPreference: "",
        uploadedFile: null,
        materials: [{
          materialType: "",
          span: "",
          length: "",
          height: ""
        }],
        comments: "",
        attachments: null
      }]
    }));
  };



  const renderAreaForm = (areaNumber) => (
    <div className="md:py-6" key={areaNumber}>
      <h2 className="text-xl font-medium mb-4">Area {areaNumber}</h2>
      <form className="grid grid-cols-1 md:grid-cols-3 gap-4 md:px-5">
        <div className="flex justify-center items-center gap-5">
          <label className="block text-sm font-medium text-[#15164A]">
            Work Type
          </label>
          <select className="mt-1 block w-52 p-2 border border-gray-300 rounded-md">
            <option>Select Type</option>
            <option>Car Porch</option>
            <option>Auditorium</option>
          </select>
        </div>
        <div className="flex justify-center items-center gap-5">
          <label className="block text-sm font-medium text-[#15164A]">
            Work Model
          </label>
          <select className="mt-1 block w-52 p-2 border border-gray-300 rounded-md">
            <option>Select Model</option>
            <option>Normal Cantilver without column</option>
            <option>Normal Cantilver with column</option>
          </select>
        </div>
        <div className="flex justify-center items-center gap-4">
          <input
            type="file"
            className="mt-1 block w-52 p-2 border border-gray-300 rounded-md"
          />
        </div>
      </form>
      <div className="p-10">
        <label className="block text-sm font-medium text-[#15164A]">
          Roof Preference
        </label>
        <select className="mt-1 block w-52 p-2 border border-gray-300 rounded-md">
          <option>Select preference</option>
          <option>Single Car Parking</option>
          <option>Double Car Parking</option>
          <option>Custom Measurements</option>
        </select>
      </div>
      <div className="space-y-2">
        {/* Material Sections */}
        {[1, 2, 3].map((index) => (
          <div key={index} className="space-y-2">
            <div>
              <select className="p-2 border border-gray-300 rounded-md md:mt-4">
                <option>Material</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:px-5">
              <div className="flex justify-center items-center gap-3">
                <label className="block text-sm font-medium text-[#15164A]">
                  Span
                </label>
                <input
                  className="mt-1 block w-52 p-2 border border-gray-300 rounded-md"
                  placeholder="meter"
                />
              </div>
              <div className="flex justify-center items-center gap-5">
                <label className="block text-sm font-medium text-[#15164A]">
                  Length
                </label>
                <input
                  className="mt-1 block w-52 p-2 border border-gray-300 rounded-md"
                  placeholder="meter"
                />
              </div>
              <div className="flex justify-center items-center gap-4">
                <label className="block text-sm font-medium text-[#15164A]">
                  Height
                </label>
                <input
                  className="mt-1 block w-52 p-2 border border-gray-300 rounded-md"
                  placeholder="meter"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex md:py-3 items-center justify-between gap-5">
          <label className="block text-sm font-medium text-[#15164A]">
            Comments
          </label>
          <textarea
            className="border border-gray-300 rounded-md w-full md:w-[90%]"
          />
        </div>

        <div className="flex items-center justify-between w-full md:px-10">
          <div className="flex items-center">
            <label className="flex flex-col items-center max-w-sm p-2 bg-gray-100 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 mb-1 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 16l4-4m0 0l4 4m-4-4v12m12 0h-4m4 0a4 4 0 01-4-4m0-4l-4 4m0 0l4-4m0 0v12"
                />
              </svg>
              <span className="text-sm text-gray-500">Choose File</span>
              <input type="file" className="hidden" />
            </label>
            <span className="ml-4 text-sm text-gray-500">
              No file chosen
            </span>
          </div>

          {areaNumber === areas.length && (
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={addNewArea}
            >
              <h1 className="text-lg font-semibold underline">
                Add New Area
              </h1>
              <img src={plussquare} alt="" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="h-screen flex bg-gray-100">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="flex-1 flex flex-col">
          <Header toggleSidebar={toggleSidebar} />

          <div className="p-6 space-y-8 bg-gray-100 overflow-auto">
            <h1 className="text-3xl font-bold text-[#2A2493]">Dashboard</h1>

            <div className="bg-white p-6 rounded-md shadow-md mb-6">
              <h2 className="text-xl font-medium mb-4 text-[#15164A]">
                Add New Client
              </h2>

              <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Row 1 */}
                <div className="flex justify-center items-center">
                  <label className="w-1/3 text-sm font-medium text-[#15164A]">
                    Name
                  </label>
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    placeholder="Name"
                  />
                </div>
                <div className="flex justify-center items-center">
                  <label className="w-1/3 text-sm font-medium text-[#15164A]">
                    Phone No
                  </label>
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    placeholder="Phone No"
                  />
                </div>
                <div className="flex justify-center items-center">
                  <label className="w-1/3 text-sm font-medium text-[#15164A]">
                    Place
                  </label>
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    placeholder="Place"
                  />
                </div>

                {/* Row 2 */}
                <div className="flex justify-center items-center">
                  <label className="w-1/3 text-sm font-medium text-[#15164A]">
                    District
                  </label>
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    placeholder="District"
                  />
                </div>

                <div className="flex justify-center items-center">
                  <label className="w-1/4 text-sm font-medium text-[#15164A]">
                    Comments
                  </label>
                  <textarea
                    className="flex-1 p-2 md:w-96 border border-gray-300 rounded-md"
                    placeholder="Comments"
                  />
                </div>
              </form>

              {/* Render Area Forms */}
              {areas.map((areaNumber) => renderAreaForm(areaNumber))}

              {/* Estimate Section */}
              <h2 className="text-xl font-medium mb-4">Create Estimate</h2>
              <form className="col md:flex gap-6">
                <div className="flex justify-center items-center gap-5">
                  <label className="block text-sm font-medium text-[#15164A]">
                    Total sq. ft
                  </label>
                  <input
                    className="mt-1 block w-52 p-2 border border-gray-300 rounded-md"
                    placeholder="1023.54"
                  />
                </div>
                <div className="flex justify-center items-center gap-5">
                  <label className="block text-sm font-medium text-[#15164A]">
                    Total Cost
                  </label>
                  <input
                    className="mt-1 block w-52 p-2 border border-gray-300 rounded-md"
                    placeholder="₹57800/-"
                  />
                </div>
                <div className="flex justify-center items-center gap-5">
                  <label className="block text-sm font-medium text-[#15164A]">
                    Sq.ft Rate
                  </label>
                  <input
                    className="mt-1 block w-52 p-2 border border-gray-300 rounded-md"
                    placeholder="₹57800/-"
                  />
                </div>
              </form>

              <div className="flex md:pt-6 gap-12">
                <div className="flex justify-center items-center">
                  <label className="w-1/4 text-sm font-medium text-[#15164A]">
                    Comments
                  </label>
                  <textarea
                    className="flex-1 p-2 md:w-96 border border-gray-300 rounded-md w-96"
                    placeholder="Comments"
                  />
                </div>
              </div>

              {/* Site Visit Section */}
              <h2 className="text-xl font-medium mb-4 md:mt-6">
                Schedule Site Visit
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:px-5 md:pt-6">
                <div className="flex justify-center items-center gap-3">
                  <label className="block text-sm font-medium text-[#15164A]">
                    Select date
                  </label>
                  <input
                    type="date"
                    className="mt-1 block w-52 p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex justify-center items-center gap-5">
                  <label className="block text-sm font-medium text-[#15164A]">
                    Time
                  </label>
                  <input
                    type="time"
                    className="mt-1 block w-52 p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex justify-center items-center gap-4">
                  <label className="block text-sm font-medium text-[#15164A]">
                    Status
                  </label>
                  <select className="p-2 border border-gray-300 rounded-md">
                    <option className="text-[#15164A]">Site Visit</option>
                  </select>
                </div>
              </div>

              <div className="flex md:pt-6 gap-12">
                <div className="flex justify-center items-center">
                  <label className="w-1/4 text-sm font-medium text-[#15164A]">
                    Comments
                  </label>
                  <textarea
                    className="flex-1 p-2 md:w-96 border border-gray-300 rounded-md w-96"
                    placeholder="Comments"
                  />
                </div>
                <div className="flex justify-center items-center gap-2">
                  <label className="w-1/3 text-sm font-medium text-[#15164A]">
                    Assign To
                  </label>
                  <select className="p-2 border border-gray-300 rounded-md">
                    <option className="text-[#15164A]">Select Name</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center items-center gap-4 md:pt-10">
                <button
                  type="button"
                  className="bg-white px-5 text-red-600 border-red-600 hover:bg-red-600 hover:text-white py-2 rounded-md"
                  onClick={() => {
                    // Reset form or handle cancellation
                    setFormData({
                      clientInfo: { name: "", phoneNo: "", place: "", district: "", comments: "" },
                      areas: [{ workType: "", workModel: "", roofPreference: "", uploadedFile: null, materials: [{ materialType: "", span: "", length: "", height: "" }], comments: "", attachments: null }],
                      estimate: { totalSqFt: "", totalCost: "", sqFtRate: "", comments: "" },
                      siteVisit: { date: "", time: "", status: "", comments: "", assignTo: "" }
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-blue-600 px-5 text-white py-2 rounded-md"
                 
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CustomerDetailpage;

