import { useState, useEffect } from "react";

import Header from "../../SalesDashboard/components/Header";
import Sidebar from "../../SalesDashboard/components/Sidebar";

import { getClient } from "../../api/admin/client/getClient";
import { deleteClient } from "../../api/admin/employee/getEmployee";
import { addNewclient } from "../../api/admin/client/addClient";

import { message } from 'antd';
import ClientDetailsModal from "../components/ClientDetailsModal";

const SalesCustomers = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClient, setNewClient] = useState({
    name: "",
    phoneNo: "",
    place: "",
    district: "",
    comments: ""
  });

  const itemsPerPage = 8;

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const response = await getClient();
      console.log(response);
      setData(response.data.clients);
      setError(null);
    } catch (err) {
      setError("Failed to fetch client data");
      console.error("Error fetching client data:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedItems.length === 0) {
      alert("No clients selected.");
      return;
    }

    try {
      const response = await deleteClient({ clientIds: selectedItems });
      message.success(response.message);
      fetchClientData();
      setSelectedItems([]);
    } catch (error) {
      message.error(error.response?.data?.message || "Error deleting clients.");
    }
  };

  const openCreateClientModal = () => {
    setIsModalOpen(true);
  };

  const closeCreateClientModal = () => {
    setIsModalOpen(false);
    // Reset form
    setNewClient({
      name: "",
      phoneNo: "",
      place: "",
      district: "",
      comments: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const response = await addNewclient(newClient);
      message.success(response.data.message)
      fetchClientData();
      closeCreateClientModal();
    } catch (error) {
      message.error(error.response?.data?.message || "Error creating client");
    }
  };

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);


  const handleViewClient = (client) => {
    setSelectedClient(client);
  };

  const closeClientDetailsModal = () => {
    setSelectedClient(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 ">
        <Header toggleSidebar={toggleSidebar} />

        <div className="p-6 space-y-8">
          <div className="p-6 bg-white shadow-md rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-indigo-700">Customer Records</h2>
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={search}
                  onChange={handleSearch}
                  className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={openCreateClientModal}
                  className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-green-500 rounded-md hover:bg-green-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Create New Client</span>
                </button>
                {selectedItems.length > 0 && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
                  >
                    Delete Selected
                  </button>
                )}
              </div>
            </div>

            {/* Client Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="w-10 p-3"></th>
                    <th className="p-3">SL No</th>
                    <th className="p-3">Client Name</th>
                    <th className="p-3">Phone Number</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-8 h-8 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
                          <span className="ml-2">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-red-500">
                        {error}
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-gray-500">
                        No clients found
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, index) => (
                      <tr key={item._id} className="transition-colors border-b hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item._id)}
                            onChange={() => handleCheckboxChange(item._id)}
                            className="w-5 h-5 text-indigo-600 form-checkbox"
                          />
                        </td>
                        <td className="p-3">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.phoneNo}</td>
                        <td className="p-3">{item.place}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleViewClient(item)}
                            className="px-3 py-1 text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
                          >
                            See Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Add the Client Details Modal at the end of the component */}
            {selectedClient && (
              <ClientDetailsModal
                client={selectedClient}
                onClose={closeClientDetailsModal}
              />
            )}

            {/* Pagination */}
            {!loading && paginatedData.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-md transition-colors ${currentPage === i + 1
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-xl">
            <h2 className="mb-6 text-2xl font-bold text-indigo-700">Create New Client</h2>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newClient.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="phoneNo" className="block mb-1 text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNo"
                  name="phoneNo"
                  value={newClient.phoneNo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="place" className="block mb-1 text-sm font-medium text-gray-700">
                  Place
                </label>
                <input
                  type="text"
                  id="place"
                  name="place"
                  value={newClient.place}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="district" className="block mb-1 text-sm font-medium text-gray-700">
                  District
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={newClient.district}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="comments" className="block mb-1 text-sm font-medium text-gray-700">
                  Comments
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  value={newClient.comments}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end pt-4 space-x-4">
                <button
                  type="button"
                  onClick={closeCreateClientModal}
                  className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white transition-colors bg-green-500 rounded-md hover:bg-green-600"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesCustomers;