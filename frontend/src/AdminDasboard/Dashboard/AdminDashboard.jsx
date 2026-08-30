import { useState, useEffect } from "react";
import Header from "../components/Header";
import addnew from "../assets/icons/adduser.png";
import addclients from "../assets/icons/addclients.png";
import addestimate from "../assets/icons/addestimate.png";
import SideNav from "../components/SideNav";
import { useNavigate } from "react-router-dom";
import {
  deleteEstimate,
  getEmployee,
} from "../../api/admin/employee/getEmployee";
import { getProjectStatus } from "../../api/admin/projects/projectstatus";

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const [selectedStatus, setSelectedStatus] = useState("Filter");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState([]); // ✅ Store filtered projects
  const [filteredData, setFilteredData] = useState([]); // ✅ Store filtered data

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

  const [ongoingProjects, setongoingProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);

  console.log("ongoingProjects", ongoingProjects);
  console.log("completedProjects", completedProjects);

  const [selectedProjects, setSelectedProjects] = useState([]);

  const handleCheckboxChange = (projectId) => {
    setSelectedProjects((prevSelected) =>
      prevSelected.includes(projectId)
        ? prevSelected.filter((id) => id !== projectId)
        : [...prevSelected, projectId]
    );
  };

  const handleDelete = async () => {
    if (selectedProjects.length === 0) {
      alert("Please select at least one project to delete.");
      return;
    }

    try {
      const response = await deleteEstimate({ ids: selectedProjects });
      console.log(response);

      alert("Deleted successfully!");
      window.location.reload();
      setSelectedProjects([]);
    } catch (error) {
      console.error("Error deleting projects:", error);
      alert("Failed to delete projects.");
    }
  };

  // --------------------------------------------------

  useEffect(() => {
    fetchProjectStatus();
  }, []);

  useEffect(() => {
    console.log("Updated Ongoing Projects:", ongoingProjects);
  }, [ongoingProjects]);

  const fetchProjectStatus = async () => {
    try {
      setLoading(true);
      const response = await getProjectStatus();
      if (!response || !response.data)
        throw new Error("Invalid response format");

      console.log("Project Data:", response.data);
      const projects = response.data || [];
      setongoingProjects(projects.filter((p) => p.status !== "Finished"));
      setCompletedProjects(projects.filter((p) => p.status === "Finished"));
      setError(null);
    } catch (err) {
      console.error("Error fetching project data:", err);
      setError(err.response?.data?.message || "Failed to fetch project data");
    } finally {
      setLoading(false);
    }
  };

  // Filtered Projects
  const filteredOngoing = ongoingProjects.filter((p) =>
    p.name?.toLowerCase().includes(searchOngoing.toLowerCase())
  );
  const filteredCompleted = completedProjects.filter((p) =>
    p.name?.toLowerCase().includes(searchCompleted.toLowerCase())
  );

  const [isExpanded, setIsExpanded] = useState(false);
  // Limit displayed projects if not expanded
  const displayedProjects = isExpanded
    ? filteredOngoing
    : filteredOngoing.slice(0, 2);

  // ------------------------------------------------------

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getEmployee();
      console.log("API Response:", response);
      if (response && response.data) {
        setData3(response.data);
      } else {
        setError("Invalid data received from API");
      }
    } catch (err) {
      setError("Failed to fetch employees");
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };
  // ----------------------

  const [isExpanded2, setIsExpanded2] = useState(false);
  const [isExpanded3, setIsExpanded3] = useState(false);
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchOngoing, setSearchOngoing] = useState("");

  const [searchEmployee, setSearchEmployee] = useState("");
  // const [search3, setSearch3] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  // --------------------------

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------------
  const filteredData2 = data2.filter((item) =>
    item.name.toLowerCase().includes(searchCompleted.toLowerCase())
  );
  const paginatedData2 = filteredData2.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // ----------------------------
  const filteredData3 = data3.filter((item) =>
    item.name.toLowerCase().includes(searchEmployee.toLowerCase())
  );
  const paginatedData3 = filteredData3.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchEmployees();
  }, []);

  const navigate = useNavigate();

  const handleDelete2 = (id) => {
    setData2(data.filter((item) => item.id !== id));
  };
  const handleDelete3 = () => {
    setData3(data3.filter((item) => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const totalPages2 = Math.ceil(filteredData2.length / itemsPerPage);
  const totalPages3 = Math.ceil(filteredData3.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchEmployee = (e) => {
    setSearchEmployee(e.target.value);
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleToggleExpand2 = () => {
    setIsExpanded2(!isExpanded2);
  };
  const handleToggleExpand3 = () => {
    setIsExpanded3(!isExpanded3);
  };

  useEffect(() => {
    // Initially, show all projects
    setFilteredProjects(ongoingProjects);
  }, [ongoingProjects]);

  const handleSearchOngoing = (e) => {
    const searchTerm = e.target.value;
    setSearchOngoing(searchTerm);

    const filtered = ongoingProjects.filter((p) =>
      p.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProjects(filtered);
  };

  const [searchCompleted, setSearchCompleted] = useState("");
  const [filteredCompletedProjects, setFilteredCompletedProjects] = useState(
    []
  );

  useEffect(() => {
    setFilteredCompletedProjects(completedProjects);
  }, [completedProjects]);

  const handleSearchCompleted = (e) => {
    const searchTerm = e.target.value;
    setSearchCompleted(searchTerm);

    // ✅ Filter completedProjects using clientId.name
    const filtered = completedProjects.filter(
      (p) =>
        p.clientId &&
        p.clientId.name &&
        p.clientId.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredCompletedProjects(filtered);
  };

  const handleSelectStatus = (status) => {
    setSelectedStatus(status.label);
    setDropdownOpen(false);

    // ✅ Filter ongoingProjects based on selected status
    const filtered = ongoingProjects.filter(
      (item) =>
        item.status?.toLowerCase().replace(/\s+/g, "") ===
        status.label.toLowerCase().replace(/\s+/g, "")
    );

    setFilteredProjects(filtered); // ✅ Set filtered projects
  };

  return (
    <div className="h-screen flex bg-gray-100  ">
      {/* Sidebar */}
      <SideNav isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col  ">
        <Header toggleSidebar={toggleSidebar} />

        {/* Dashboard Content */}
        <div className=" space-y-8 bg-gray-100 p-5 overflow-auto">
          {/* Dashboard Header */}
          <h1 className="text-3xl font-bold text-[#4c48a5]">Dashboard</h1>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
            <div className="p-4 bg-white rounded-2xl shadow-md flex items-center space-x-4 py-5">
              <div className="text-blue-500 text-3xl">
                <img src={addnew} alt="" />
              </div>
              <div
                onClick={() => navigate("/admin/addnewclient")}
                className="cursor-pointer"
              >
                <h2 className="text-lg font-normal">Add New Clients</h2>
                <p className="text-gray-600">To register new clients</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-md flex items-center space-x-4 py-5">
              <div className="text-green-500 text-3xl">
                <img src={addclients} alt="" />
              </div>
              <div onClick={() => navigate("/admin/customers")}>
                <h2 className="text-lg font-normal">Existing Clients</h2>
                <p className="text-gray-600">View existing clients</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-md flex items-center space-x-4 py-5">
              <div className="text-orange-500 text-3xl">
                <img src={addestimate} alt="" />
              </div>
              <div
                onClick={() => navigate("/admin/estimate")}
                className="cursor-pointer"
              >
                <h2 className="text-lg font-normal">Create an Estimate</h2>
                <p className="text-gray-600">Generate client estimates</p>
              </div>
            </div>
          </div>

          {/* Tables */}
          <div className="space-y-8">
            {/* Ongoing Projects */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#4c48a5]">
                  Ongoing Projects
                </h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchOngoing}
                    onChange={handleSearchOngoing}
                    className="border border-gray-300 rounded px-2 py-1"
                  />

                  <button
                    className="bg-gray-200 text-gray-700 px-3 me-1 py-1 rounded relative"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {selectedStatus || "Filter by Status"}
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
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <table className="w-full border-collapse border text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border"></th> {/* Checkbox header */}
                    <th className="p-2 border">SL No</th>
                    <th className="p-2 border">Client Name</th>
                    <th className="p-2 border">Phone</th>
                    <th className="p-2 border">Location</th>
                    <th className="p-2 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((p, index) => (
                      <tr key={p._id} className="border hover:bg-gray-50">
                        <td className="p-2 border">
                          <input
                            type="checkbox"
                            checked={selectedProjects.includes(p._id)}
                            onChange={() => handleCheckboxChange(p._id)}
                          />
                        </td>
                        <td className="p-2 border">{index + 1}</td>
                        <td className="p-2 border">
                          {p.clientId?.name || "N/A"}
                        </td>
                        <td className="p-2 border">
                          {p.clientId?.phoneNo || "N/A"}
                        </td>
                        <td className="p-2 border">
                          {p.clientId?.district || "N/A"}
                        </td>
                        <td
                          className={`p-2 border ${
                            p.status === "Pending"
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {p.status || "Pending"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-2 text-center">
                        No projects found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#4c48a5]">
                  Completed Projects
                </h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchCompleted}
                    onChange={handleSearchCompleted}
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <table className="w-full border-collapse border text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border"></th> {/* Checkbox header */}
                    <th className="p-2 border">SL No</th>
                    <th className="p-2 border">Client Name</th>
                    <th className="p-2 border">Phone</th>
                    <th className="p-2 border">Location</th>
                    <th className="p-2 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompletedProjects.length > 0 ? (
                    filteredCompletedProjects.map((p, index) => (
                      <tr key={p._id} className="border hover:bg-gray-50">
                        <td className="p-2 border">
                          <input
                            type="checkbox"
                            checked={selectedProjects.includes(p._id)}
                            onChange={() => handleCheckboxChange(p._id)}
                          />
                        </td>
                        <td className="p-2 border">{index + 1}</td>
                        <td className="p-2 border">
                          {p.clientId?.name || "N/A"}
                        </td>
                        <td className="p-2 border">
                          {p.clientId?.phoneNo || "N/A"}
                        </td>
                        <td className="p-2 border">
                          {p.clientId?.district || "N/A"}
                        </td>

                        <td
                          className={`p-2 border ${
                            p.status === "Pending"
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {p.status || "Pending"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-2 text-center">
                        No projects found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ---------------------------Employee Details------------------------------- */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#4c48a5]">
                  Employee Details
                </h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchEmployee}
                    onChange={handleSearchEmployee}
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <>
                  <table className="w-full border-collapse border-t border-b border-gray-300 text-left">
                    <thead>
                      <tr>
                        <th className="p-2 border-b border-gray-300"></th>
                        <th className="p-2 border-b border-gray-300">SL No</th>
                        <th className="p-2 border-b border-gray-300">
                          Employee ID
                        </th>
                        <th className="p-2 border-b border-gray-300">Name</th>
                        <th className="p-2 border-b border-gray-300">
                          Phone No
                        </th>
                        <th className="p-2 border-b border-gray-300">Role</th>

                        {/* <th className="p-2 border-b border-gray-300">Actions</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {(isExpanded3
                        ? paginatedData3
                        : paginatedData3.slice(0, 2)
                      ).map((item, index) => (
                        <tr
                          key={item.id || `row-${index}`}
                          className="border-b border-gray-300"
                        >
                          <td className="p-2">
                            <input type="checkbox" />
                          </td>

                          <td className="p-2">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="p-2">{item.mailId}</td>
                          <td className="p-2">{item.name}</td>
                          <td className="p-2">{item.mobileNumber}</td>
                          <td className="p-2">
                            {Array.isArray(item.designations)
                              ? item.designations.join(", ")
                              : item.designations || "N/A"}
                          </td>

                          {/* <td className="p-2">
        <button className="bg-blue-500 text-white px-3 py-1 rounded-full">See Details</button>
      </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    onClick={handleToggleExpand3}
                    className="mt-2 text-blue-500 underline"
                  >
                    {isExpanded3 ? "Show Less" : "Show More"}
                  </button>

                  <div className="flex justify-between items-center mt-4">
                    <div>
                      Page {currentPage} of {totalPages3}
                    </div>
                    <div className="flex space-x-2">
                      {[...Array(totalPages3)].map((_, pageIndex) => (
                        <button
                          key={pageIndex}
                          onClick={() => handlePageChange(pageIndex + 1)}
                          className={`px-3 py-1 rounded ${
                            pageIndex + 1 === currentPage
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {pageIndex + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* ---------------- */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
