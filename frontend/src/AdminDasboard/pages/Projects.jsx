import React, { useEffect, useState } from "react";
import Sidebar from "../components/SideNav";
import Header from "../components/Header";
import plussquare from "../assets/icons/plussquare.png";
import { getProjectStatus } from "../../api/admin/projects/projectstatus";
import { deleteEstimate } from "../../api/admin/employee/getEmployee";

const Projects = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Finished"); // Default tab
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Filter");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  const statusOptions = [
    { label: "Site Visit", textColor: "text-blue-700" },
    { label: "Start to Build", textColor: "text-green-500" },
    { label: "Project Evaluation in Progress", textColor: "text-green-500" },
    { label: "Quotation Provided", textColor: "text-green-500" },
    { label: "Awaiting Client Response", textColor: "text-orange-500" },
    { label: "Call Back", textColor: "text-orange-500" },
    { label: "No Response from Client", textColor: "text-orange-500" },
    { label: "Project Rejected by Client", textColor: "text-red-500" },
  ];

  const itemsPerPage = 8;

  useEffect(() => {
    fetchProjectStatus(); // ✅ Re-fetch when active tab changes
  }, [activeTab]);

  const fetchProjectStatus = async () => {
    try {
      setLoading(true);
      const response = await getProjectStatus();

      if (!response || !response.data) {
        throw new Error("Invalid response format");
      }

      console.log("Client Response:", response.data);
      const clients = response.data || [];

      // ✅ Filter data based on the active tab
      const filteredData =
        activeTab === "Completed"
          ? clients.filter((project) => project.status === "Finished")
          : clients.filter((project) => project.status !== "Finished");

      setData(filteredData);
      setFilteredData(filteredData); // ✅ Show all rows initially
      setError(null);
    } catch (err) {
      console.error("Error fetching client data:", err.message || err);
      setError(err.response?.data?.message || "Failed to fetch client data");
    } finally {
      setLoading(false);
    }
  };

  console.log("Full Data:", data);
  console.log("Selected Status:", selectedStatus);

  // const filteredData = data.filter((itemss) =>
  //   itemss.clientId && itemss.clientId.name &&
  //   itemss.clientId.name.toLowerCase().includes(search.toLowerCase())
  // );

  // const filteredData = data.filter((item) =>
  //   item.clientId &&
  //   item.clientId.name &&
  //   item.clientId.name.toLowerCase().includes(search.toLowerCase())
  // );

  // Paginate after filtering
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const [selectedIds, setSelectedIds] = useState([]);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  // Handle delete function
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert("Please select projects to delete.");
      return;
    }

    try {
      const response = await deleteEstimate({ ids: selectedIds });
      alert(response.message);
      console.log(response);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting projects", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSelectStatus = (status) => {
    console.log("Selected Status:", status.label);
    setSelectedStatus(status.label);
    setDropdownOpen(false);

    // ✅ Show all data if "Filter" is selected
    if (status.label === "Filter") {
      setFilteredData(data);
      return;
    }

    // ✅ Correct Filtering Logic
    const filtered = data.filter((item) => {
      if (!item.status) return false;
      const itemStatus = item.status.trim().toLowerCase();
      const selectedStatus = status.label.trim().toLowerCase();
      return itemStatus === selectedStatus;
    });

    console.log("Filtered Data:", filtered);
    setFilteredData(filtered);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);

    // ✅ Filter search based on `data` to retain selected status
    const searchFiltered = data.filter(
      (item) =>
        item.clientId &&
        item.clientId.name &&
        item.clientId.name
          .toLowerCase()
          .includes(event.target.value.toLowerCase())
    );

    setFilteredData(searchFiltered);
  };

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="p-6 space-y-8 bg-gray-100 overflow-auto">
          <h1 className="text-3xl font-bold text-[#4c48a5]">Projects</h1>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-4">
            <button
              className={`text-lg font-semibold ${
                activeTab === "Completed"
                  ? "text-[#4c48a5] border-b-2 border-[#4c48a5]"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("Completed")}
            >
              Completed Projects
            </button>
            <button
              className={`text-lg font-semibold ${
                activeTab === "Ongoing"
                  ? "text-[#4c48a5] border-b-2 border-[#4c48a5]"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("Ongoing")}
            >
              Ongoing Projects
            </button>
          </div>

          {/* Search and Actions */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-end space-x-2 py-3 ">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={handleSearch}
                className="border border-gray-300 rounded px-2 py-1"
              />
              {/* <button
                className="bg-gray-200 text-gray-700 px-3 me-1 py-1 rounded relative"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selectedStatus || "Filter by Status"}
              </button> */}
              <button
                className="bg-gray-200 text-gray-700 px-3 me-1 py-1 rounded relative"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selectedStatus === "Filter"
                  ? "Filter by Status"
                  : selectedStatus}
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute w-48 mt-1 bg-white shadow-md rounded-lg z-50 border border-gray-200">
                  {statusOptions.map((status, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectStatus(status)}
                      className={`w-full text-left px-2 m-1 hover:bg-gray-100 rounded-md focus:outline-none ${status.textColor}`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              )}

              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={handleDeleteSelected}
              >
                Delete
              </button>
            </div>

            {/* Table */}
            {paginatedData.length === 0 ? (
              <p className="text-center text-gray-500">No projects found</p>
            ) : (
              <table className="w-full border-collapse border-t border-b border-gray-300 text-left">
                <thead>
                  <tr>
                    <th className="p-2 border-b border-gray-300">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          setSelectedIds(
                            e.target.checked
                              ? paginatedData.map((p) => p._id)
                              : []
                          );
                        }}
                        checked={selectedIds.length === paginatedData.length}
                      />
                    </th>
                    <th className="p-2 border-b border-gray-300">SL No</th>
                    <th className="p-2 border-b border-gray-300">
                      Client Name
                    </th>
                    {activeTab === "Completed" ? (
                      <>
                        <th className="p-2 border-b border-gray-300">Date</th>
                        <th className="p-2 border-b border-gray-300">
                          Work Type
                        </th>
                        <th className="p-2 border-b border-gray-300">
                          Location
                        </th>

                        {/* <th className="p-2 border-b border-gray-300">
                          Work Type
                        </th> */}
                        <th className="p-2 border-b border-gray-300">Amount</th>
                        <th className="p-2 border-b border-gray-300">Status</th>
                      </>
                    ) : (
                      <>
                        <th className="p-2 border-b border-gray-300">Phone</th>
                        <th className="p-2 border-b border-gray-300">
                          Location
                        </th>
                        {/* <th className="p-2 border-b border-gray-300">
                          Work Type
                        </th> */}
                        <th className="p-2 border-b border-gray-300">
                          Assign To
                        </th>
                        <th className="p-2 border-b border-gray-300">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-2 text-center text-red-500">
                        No records found for the selected status.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, index) => (
                      <tr key={item._id} className="border-b border-gray-300">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item._id)}
                            onChange={() => handleCheckboxChange(item._id)}
                          />
                        </td>
                        <td className="p-2">
                          {index + 1 + (currentPage - 1) * itemsPerPage}
                        </td>
                        <td className="p-2">{item.clientId.name}</td>
                        {activeTab === "Completed" ? (
                          <>
                            <td className="p-2">
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </td>
                            <td className="p-2">
                              {item.sheetingPrice[0].roofModel.roofModel}
                            </td>
                            <td className="p-2">{item.clientId.district}</td>
                            <td className="p-2">{item.finalRate}</td>
                            <td
                              className={`p-2 ${
                                item.status === "Finished"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {item.status}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-2">{item.clientId.phoneNo}</td>
                            <td className="p-2">{item.clientId.district}</td>

                            <td className="p-2">{item.siteVisitorId.name}</td>
                            <td
                              className={`p-2 ${
                                item.status === "Site Visit"
                                  ? "text-blue-500"
                                  : "text-red-500"
                              }`}
                            >
                              {item.status}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                {[...Array(totalPages)].map((_, pageIndex) => (
                  <button
                    key={pageIndex}
                    onClick={() => setCurrentPage(pageIndex + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === pageIndex + 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {pageIndex + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
