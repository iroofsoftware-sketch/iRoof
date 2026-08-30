import React, { useEffect, useState } from "react";
import Header from "../../RatesDashboard/components/Header";
import Sidebar from "../../RatesDashboard/components/Sidebar";
import { addTransportation } from "../../api/rates/transportation";
import { getAllTransportation } from "../../api/rates/transportation";

const Transportation = () => {
  const [activeTab, setActiveTab] = useState("Materials");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  //  Form state
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
  const [showTransportation, setShowTransportation] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
      console.log(response);
      
      setSuccessMessage("Rates added successfully!");
      fetchTransportation()
     
      // Clear the form after submission
      setFormData({
        person: "Trailer",
        minimumCharge: "",
        minimumKm: "",
        perKm: "",
        petrolCharge: "",
      });
    } catch (error) {
      setErrorMessage(
        error || "An error occurred while adding transportation rates."
      );
    } finally {
      setLoading(false);
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
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="px-5 mt-3">
          <h1 className="text-3xl font-normal text-[#4c48a5] mb-6">
            Transportation
          </h1>
        </div>
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md p-4 m-4 ">
          {/* Tab Content */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-4   ">
              {/* Table Section */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2 border border-gray-300">
                        vehicle Type
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        Minimum Charge
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        Minimum Km Covered
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        Per Km
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        Petrol Charge
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {showTransportation.length > 0 ? (
                      showTransportation.map((item, index) => (
                        <React.Fragment key={index}>
                          <tr className="text-center">
                          <td className="px-4 py-2 border border-gray-300">
                              {item.vehicleType}
                            </td>
                            <td className="px-4 py-2 border border-gray-300">
                              {item.minCharge}
                            </td>
                           
                            <td className="px-4 py-2 border border-gray-300">
                              {item.minKmCovered}
                            </td>
                            <td className="px-4 py-2 border border-gray-300">
                              {item.perKmCharge}
                            </td>
                            <td className="px-4 py-2 border border-gray-300">
                              {item.petrolCharge}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-2 border border-gray-300 text-center"
                        >
                          No transportation data available
                        </td>
                      </tr>
                    )}

                    {/* Petrol Charge Row */}
                  </tbody>
                </table>
              </div>

              {/*---Petrol---Charge---section---/}
            

              {/* Edit Rates Section */}
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
                    <label className="text-sm font-medium text-gray-700">
                      Per Km
                    </label>
                    <input
                      type="text"
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
                  <p className="mt-4 text-red-600 font-medium">
                    {errorMessage}
                  </p>
                )}
                {successMessage && (
                  <p className="mt-4 text-green-600 font-medium">
                    {successMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transportation;
