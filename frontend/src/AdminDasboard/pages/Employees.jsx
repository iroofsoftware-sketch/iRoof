import { useState, useEffect } from "react";
import Sidebar from "../components/SideNav";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import newemployee from "../assets/icons/newemploye.png";
import {
  deleteEmploye,
  getEmployee,
} from "../../api/admin/employee/getEmployee";

function Employees() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getEmployee();
      console.log(response);
      if (response && response.data) {
        setData(response.data);
      }
    } catch (err) {
      setError("Failed to fetch employees");
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (id) => {
    setData(data.filter((item) => item._id !== id));
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCheckboxChange = (employeeId) => {
    setSelectedEmployees((prevSelected) =>
      prevSelected.includes(employeeId)
        ? prevSelected.filter((id) => id !== employeeId)
        : [...prevSelected, employeeId]
    );
  };

  const handleDeleteMultiple = async () => {
    if (selectedEmployees.length === 0) {
      alert("Please select at least one employee to delete.");
      return;
    }

    try {
      console.log(selectedEmployees);

      const response = await deleteEmploye({ employeIds: selectedEmployees });
      console.log(response);

      alert(response.message);
      setSelectedEmployees([]); // Clear selection
      fetchEmployees(); // Refresh list
    } catch (error) {
      console.error("Error deleting employees:", error);
      alert("Failed to delete employees.");
    }
  };

  const handleSearchEmployee = (e) => {
    setSearch(e.target.value);
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 text-xl">{error}</p>
          <button
            onClick={fetchEmployees}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />

        <div className="p-6 space-y-8 bg-gray-100 overflow-auto">
          <div className="flex justify-end items-end">
            <button
              className="font-bold text-white bg-[#0D99FF] rounded-md p-2 cursor-pointer flex justify-center items-center gap-2"
              onClick={() => navigate("/admin/addnewemployee")}
            >
              <img src={newemployee} alt="" />
              Add New Employee
            </button>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#3e37bc]">
                  Employee Details
                </h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={handleSearchEmployee}
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                  {selectedEmployees.length > 0 && (
                    <button
                      onClick={handleDeleteMultiple}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete Selected
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border-t border-b border-gray-300 text-left">
                      <thead>
                        <tr>
                          <th className="p-2 border-b border-gray-300"></th>
                          <th className="p-2 border-b border-gray-300">
                            SL No
                          </th>
                          <th className="p-2 border-b border-gray-300">Name</th>
                          <th className="p-2 border-b border-gray-300">
                            Email
                          </th>
                          <th className="p-2 border-b border-gray-300">
                            Phone
                          </th>
                          <th className="p-2 border-b border-gray-300">
                            Location
                          </th>
                          <th className="p-2 border-b border-gray-300">Role</th>

                          <th className="p-2 border-b border-gray-300">
                            Last Updated
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((item, index) => (
                          <tr
                            key={item._id}
                            className="border-b border-gray-300"
                          >
                            <td className="p-2">
                              <input
                                type="checkbox"
                                checked={selectedEmployees.includes(item._id)}
                                onChange={() => handleCheckboxChange(item._id)}
                              />
                            </td>
                            <td className="p-2">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="p-2">{item.name}</td>
                            <td className="p-2">{item.mailId}</td>
                            <td className="p-2">{item.mobileNumber}</td>
                            <td className="p-2">{item.location}</td>
                            <td className="p-2">
                              {Array.isArray(item.designations)
                                ? item.designations.join(", ")
                                : item.designations || "N/A"}
                            </td>
                            {/* <td className={`p-2 ${item.isActive ? "text-green-500" : "text-yellow-500"}`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </td> */}
                            <td className="p-2">
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Employees;
