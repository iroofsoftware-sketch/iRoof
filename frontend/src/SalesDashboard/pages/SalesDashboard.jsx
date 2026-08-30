import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Import components
import Header from "../components/Header";
import SideNav from "../components/Sidebar";

// Import icons
import addnew from "../../AdminDasboard/assets/icons/adduser.png";
import addestimate from "../../AdminDasboard/assets/icons/addestimate.png";

// Import API functions
import { deleteEstimate } from "../../api/admin/employee/getEmployee";
import { getProjectStatus } from "../../api/admin/projects/projectstatus";
import { getEmployee } from "../../api/admin/employee/getEmployee";

const SalesDashboard = () => {
  // State management hooks
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filteredCompletedProjects, setFilteredCompletedProjects] = useState([]);
  
  // Search and pagination states
  const [searchOngoing, setSearchOngoing] = useState("");
  const [searchCompleted, setSearchCompleted] = useState("");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Data and loading states
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Expansion states
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpanded2, setIsExpanded2] = useState(false);
  const [isExpanded3, setIsExpanded3] = useState(false);

  const navigate = useNavigate();
  const itemsPerPage = 8;

  // Sidebar toggle function
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Fetch project status
  const fetchProjectStatus = async () => {
    try {
      setLoading(true);
      const response = await getProjectStatus();
      
      // Log the actual response to see its structure
      console.log("Project status response:", response);
      
      // Handle various response formats more gracefully
      let projects = [];
      
      if (response?.data) {
        // Standard format with data property
        projects = response.data;
      } else if (Array.isArray(response)) {
        // Direct array response
        projects = response;
      } else if (response && typeof response === 'object') {
        // Some other object format - try to extract data
        projects = response.projects || response.results || [];
      }
      
      // Ensure projects is always an array
      projects = Array.isArray(projects) ? projects : [];
      
      setOngoingProjects(projects.filter((p) => p.status !== "Finished"));
      setCompletedProjects(projects.filter((p) => p.status === "Finished"));
      setFilteredProjects(projects.filter((p) => p.status !== "Finished"));
      setFilteredCompletedProjects(projects.filter((p) => p.status === "Finished"));
      
      setError(null);
    } catch (err) {
      console.error("Error fetching project data:", err);
      setError(err.response?.data?.message || "Failed to fetch project data");
      
      // Initialize with empty arrays to prevent UI errors
      setOngoingProjects([]);
      setCompletedProjects([]);
      setFilteredProjects([]);
      setFilteredCompletedProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getEmployee();
      console.log("Employee data:", response.data);
      
      
      if (response && response.data) {
        setEmployeeData(response.data);
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

  // Search and filter handlers
  const handleSearchOngoing = (e) => {
    const searchTerm = e.target.value;
    setSearchOngoing(searchTerm);

    const filtered = ongoingProjects.filter((p) =>
      p.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProjects(filtered);
  };

  const handleSearchCompleted = (e) => {
    const searchTerm = e.target.value;
    setSearchCompleted(searchTerm);

    const filtered = completedProjects.filter((p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredCompletedProjects(filtered);
  };

  const handleSearchEmployee = (e) => {
    setSearchEmployee(e.target.value);
  };

  // Project selection and deletion
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
      await deleteEstimate({ ids: selectedProjects });
      alert("Deleted successfully!");
      window.location.reload();
      setSelectedProjects([]);
    } catch (error) {
      console.error("Error deleting projects:", error);
      alert("Failed to delete projects.");
    }
  };

  // Expansion toggles
  // const handleToggleExpand = () => setIsExpanded(!isExpanded);
  // const handleToggleExpand2 = () => setIsExpanded2(!isExpanded2);
  const handleToggleExpand3 = () => setIsExpanded3(!isExpanded3);

  // Pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Pagination for employee data
  const filteredEmployeeData = employeeData.filter((employee) =>
    employee.name?.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  const totalPages3 = Math.ceil(filteredEmployeeData.length / itemsPerPage);
  const paginatedData3 = filteredEmployeeData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch data on component mount
  useEffect(() => {
    fetchProjectStatus();
    fetchEmployees();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 ">
      {/* Sidebar */}
      <SideNav isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 ">
        <Header toggleSidebar={toggleSidebar} />

        {/* Dashboard Content */}
        <div className="p-5 space-y-8 overflow-auto bg-gray-100 ">
          {/* Dashboard Header */}
          <h1 className="text-3xl font-bold text-[#4c48a5]">Dashboard</h1>

          {/* Action Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 ">
            <div className="flex items-center p-4 py-5 space-x-4 bg-white shadow-md rounded-2xl">
              <div className="text-3xl text-blue-500">
                <img src={addnew} alt="" />
              </div>
              <div
                onClick={() => navigate("/sales/salescustomers")}
                className="cursor-pointer"
              >
                <h2 className="text-lg font-normal">Add New Clients</h2>
                <p className="text-gray-600">To register new clients</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 py-5 space-x-4 bg-white shadow-md rounded-2xl">
              <div className="text-3xl text-orange-500">
                <img src={addestimate} alt="" />
              </div>
              <div
                onClick={() => navigate("/sales/quickestimate")}
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
            <div className="p-4 mb-6 bg-white shadow-md rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#4c48a5]">Ongoing Projects</h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchOngoing}
                    onChange={handleSearchOngoing}
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                  <button onClick={handleDelete} className="px-3 py-1 text-white bg-red-500 rounded">
                    Delete
                  </button>
                </div>
              </div>

              <table className="w-full text-left border border-collapse">
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
                        <td className="p-2 border">{p.clientId?.name || "N/A"}</td>
                        <td className="p-2 border">{p.clientId?.phoneNo || "N/A"}</td>
                        <td className="p-2 border">{p.clientId?.district || "N/A"}</td>
                        <td className={`p-2 border ${p.status === "Pending" ? "text-yellow-500" : "text-green-500"}`}>
                          {p.status || "Pending"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-2 text-center">No projects found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Completed Projects */}
            <div className="p-4 mb-6 bg-white shadow-md rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#4c48a5]">Completed Projects</h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchCompleted}
                    onChange={handleSearchCompleted}
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                  <button onClick={handleDelete} className="px-3 py-1 text-white bg-red-500 rounded">
                    Delete
                  </button>
                </div>
              </div>

              <table className="w-full text-left border border-collapse">
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
                        <td className="p-2 border">{p.clientId?.name || "N/A"}</td>
                        <td className="p-2 border">{p.clientId?.phoneNo || "N/A"}</td>
                        <td className="p-2 border">{p.clientId?.district || "N/A"}</td>
                        <td className={`p-2 border ${p.status === "Pending" ? "text-yellow-500" : "text-green-500"}`}>
                          {p.status || "Pending"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-2 text-center">No projects found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Employee Details */}
            <div className="p-4 bg-white shadow-md rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#4c48a5]">Employee Details</h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchEmployee}
                    onChange={handleSearchEmployee}
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                
                </div>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <>
                  <table className="w-full text-left border-t border-b border-collapse border-gray-300">
                    <thead>
                      <tr>
                        <th className="p-2 border-b border-gray-300"></th>
                        <th className="p-2 border-b border-gray-300">SL No</th>
                        <th className="p-2 border-b border-gray-300">Employee ID</th>
                        <th className="p-2 border-b border-gray-300">Name</th>
                        <th className="p-2 border-b border-gray-300">Phone No</th>
                        <th className="p-2 border-b border-gray-300">Role</th>
                       
                      </tr>
                    </thead>
                    <tbody>
                      {(isExpanded3 ? paginatedData3 : paginatedData3.slice(0, 2)).map((item, index) => (
                        <tr key={item.id || `row-${index}`} className="border-b border-gray-300">
                          <td className="p-2">
                            <input type="checkbox" />
                          </td>
                          <td className="p-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="p-2">{item.mailId}</td>
                          <td className="p-2">{item.name}</td>
                          <td className="p-2">{item.mobileNumber}</td>
                          <td className="p-2">
                            {Array.isArray(item.designations) ? item.designations.join(", ") : item.designations || "N/A"}
                          </td>
                        
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

                  <div className="flex items-center justify-between mt-4">
                    <div>Page {currentPage} of {totalPages3}</div>
                    <div className="flex space-x-2">
                      {[...Array(totalPages3)].map((_, pageIndex) => (
                        <button
                          key={pageIndex}
                          onClick={() => handlePageChange(pageIndex + 1)}
                          className={`px-3 py-1 rounded ${pageIndex + 1 === currentPage
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;