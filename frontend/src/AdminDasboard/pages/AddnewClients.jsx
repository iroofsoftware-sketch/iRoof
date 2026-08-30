import { useState, useEffect } from "react";
import Header from "../../AdminDasboard/components/Header";
import Sidebar from "../../AdminDasboard/components/SideNav";
import { addNewclient } from "../../api/admin/client/addClient";
import { toast } from "react-toastify";

const AddnewClients = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const [name, setName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [place, setPlace] = useState("");
  const [district, setDistrict] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!name || !phoneNo || !place || !district) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const formData = { name, phoneNo, place, district, comments };

    try {
      const response = await addNewclient(formData); // Ensure AddNewclient is imported and defined
      if (response?.data) {
        // Reset all fields after successful submission
        setName("");
        setPhoneNo("");
        setPlace("");
        setDistrict("");
        setComments("");
        toast.success("client added successfully!");
      }
    } catch (error) {
      toast.error("Failed to add client. Please try again.");
      console.error("Error adding client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100 w-full">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        <Header toggleSidebar={toggleSidebar} />
        <div className="space-y-8 bg-gray-100 py-5 px-5 w-full max-w-full">
          <h1 className="text-3xl font-bold text-[#4c48a5]">Client Adding</h1>
          {/* Customer Records Table */}
          <div className="space-y-8 w-full">
            {/* Add New Client Section */}
            <div className="p-6 bg-white shadow-md rounded-lg w-full">
              <h2 className="text-lg font-semibold text-indigo-900 flex items-center justify-between">
                <span className="flex items-center gap-2">Add New Client</span>
              </h2>{" "}
              <br />
              {/* First Row - Three Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 w-24">Name:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-gray-200 text-gray-800 p-2 rounded-md focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 w-24">Phone:</label>
                  <input
                    type="number"
                    value={phoneNo}
                    onChange={(e) => {
                    
                        setPhoneNo(e.target.value);
                      
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 p-2 rounded-md focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 w-24">Place:</label>
                  <input
                    type="text"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="flex-1 border border-gray-300 p-2 rounded-md focus:outline-indigo-500"
                  />
                </div>
              </div>
              {/* Second Row - Two Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 w-24">
                    District:
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="flex-1 border border-gray-300 p-2 rounded-md focus:outline-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 w-24">
                    Comments:
                  </label>
                  <input
                    type="text"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add comments"
                    className="flex-1 border border-gray-300 p-2 rounded-md focus:outline-indigo-500"
                  />
                </div>
              </div>
              {/* Buttons */}
              <div className="flex justify-center py-6 gap-5">
                <button
                  className="bg-red-600 text-white px-6 py-3 text-lg rounded-lg shadow-md hover:bg-red-700 transition"
                  onClick={() => {
                    setName("");
                    setPhoneNo("");
                    setPlace("");
                    setDistrict("");
                    setComments("");
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 text-white px-6 py-3 text-lg rounded-lg shadow-md hover:bg-blue-700 transition ml-4"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddnewClients;
