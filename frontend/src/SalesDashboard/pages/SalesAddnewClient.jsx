import React from "react";
import Header from "../../SalesDashboard/components/Header";
import Sidebar from "../../SalesDashboard/components/Sidebar";
import { useState } from "react";
import addnew from "../../SalesDashboard/assets/icons/adduser.png";
import addestimate from "../../SalesDashboard/assets/icons/addestimate.png";
import addclients from "../../SalesDashboard/assets/icons/addclients.png";
import plussquare from "../assets/icons/plussquare.png";
import { useNavigate } from "react-router-dom";
import dropdown from "../../SalesDashboard/assets/icons/dropdown.png";

// import addnew from "../assets/images";

function SalesAddnewClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const OngoingProject = [
    {
      id: 1,
      name: "Kevin",
      phone: "+91 9867 5433 33",
      location: "Kochi",
      roof: "Car Porch",
      status: "site visit",
    },
    {
      id: 2,
      name: "Marley",
      phone: "+91 8990 3444 89",
      location: "Kollam",
      roof: "Warehouse",
      status: "pending",
    },
    {
      id: 3,
      name: "Gustavo",
      phone: "+91 9867 5433 33",
      location: "Thrissur",
      roof: "Car Porch",
      status: "in-progress",
    },
    {
      id: 4,
      name: "Chance",
      phone: "+91 8843 8943 32",
      location: "Palakkad",
      roof: "Car Porch",
      status: "discussion",
    },
    {
      id: 5,
      name: "Marley",
      phone: "+91 9867 5433 33",
      location: "Aluva",
      roof: "Auditorium",
      status: "inprogress",
    },
    {
      id: 6,
      name: "Miracle",
      phone: "+91 7887 6464 55",
      location: "Kochi",
      roof: "Auditorium",
      status: "discussion",
    },

    {
      id: 7,
      name: "Ashlynn",
      phone: "+91 9876 6789 23",
      location: "Kochi",
      roof: "Car Porch",
      status: "sitevisit",
    },
    {
      id: 8,
      name: "James",
      phone: "+91 9867 5433 33",
      location: "Kochi",
      roof: "Auditorium",
      status: "declined",
    },
    {
      id: 9,
      name: "george",
      phone: "+91 9867 5433 33",
      location: "Kochi",
      roof: "Auditorium",
      status: "pending",
    },
    {
      id: 10,
      name: "xavi",
      phone: "+91 9867 5433 33",
      location: "Kochi",
      roof: "Auditorium",
      status: "progress ",
    },
    {
      id: 11,
      name: "pedri",
      phone: "+91 9867 5433 33",
      location: "Kochi",
      roof: "Auditorium",
      status: "declined",
    },
    {
      id: 12,
      name: "rodrigo",
      phone: "+91 9867 5433 33",
      location: "Kochi",
      roof: "Auditorium",
      status: "pending",
    },
  ];
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [data, setData] = useState(OngoingProject);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const itemsPerPage = 8;

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleSearch = (event) => setSearch(event.target.value);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleCheckboxChange = (id) =>
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

  const handleDelete = (id) => setData(data.filter((item) => item.id !== id));

  const handleStatusChange = (id, newStatus) => {
    const updatedData = data.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    setData(updatedData);
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status.toLowerCase().replace(/\s+/g, "")) {
      case "sitevisit":
      case "site visit":
        return "bg-[#CF7933] text-white";
      case "discussion":
        return "bg-[#3C3EC3] text-white";
      case "inprogress":
      case "in-progress":
      case "progress":
        return "bg-green-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "declined":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id); // Toggle dropdown visibility
  };

  const [areas, setAreas] = useState([{}]); // Initial state with one area

  const addArea = () => {
    setAreas([...areas, {}]); // Add a new empty object representing a new area
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />

        {/* Dashboard Content */}
        <div className="p-6 space-y-8 bg-gray-100">
          {/* Dashboard Header */}
          <h1 className="text-3xl font-bold text-[#2A2493]">Dashboard</h1>

          {/* ------------------------------------ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-white rounded-2xl shadow-md flex items-center space-x-4 py-5">
              <img src={addnew} alt="Add New Clients" className="w-12 h-12" />
              <div
                onClick={() => navigate("/salesaddnewclient")}
                className="cursor-pointer"
              >
                <h2 className="text-lg font-normal">Add New Clients</h2>
                <p className="text-gray-600">To register new clients</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-md flex items-center space-x-4 py-5">
              <img
                src={addclients}
                alt="Existing Clients"
                className="w-12 h-12"
              />
              <div>
                <h2 className="text-lg font-normal">Existing Clients</h2>
                <p className="text-gray-600">View existing clients</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-md flex items-center space-x-4 py-5">
              <img
                src={addestimate}
                alt="Create an Estimate"
                className="w-12 h-12"
              />
              <div>
                <h2 className="text-lg font-normal">Create an Estimate</h2>
                <p className="text-gray-600">Generate client estimates</p>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="bg-white p-6 rounded-md shadow-md mb-6">
            <h2 className="text-xl font-medium mb-4 text-[#15164A]">
              Add New Client
            </h2>
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Row 1 */}
              <div className="flex  justify-center items-center">
                <label className="w-1/3 text-sm font-medium text-[#15164A]">
                  Name
                </label>
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  placeholder="Name"
                />
              </div>
              <div className="flex  justify-center items-center">
                <label className="w-1/3 text-sm font-medium text-[#15164A]">
                  Phone No
                </label>
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  placeholder="Phone No"
                />
              </div>
              <div className="flex  justify-center items-center">
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
              <div className="flex  justify-center items-center">
                <label className="w-1/3 text-sm font-medium text-[#15164A]">
                  District
                </label>
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  placeholder="District"
                />
              </div>

              <div className="flex  justify-center items-center">
                <label className="w-1/4 text-sm font-medium text-[#15164A]">
                  Comments
                </label>
                <textarea
                  type="text"
                  className="flex-1 p-2 md:w-96 border border-gray-300 rounded-md"
                  placeholder="Comments"
                />
              </div>

              {/* Row 3 */}
            </form>

            {/* Area Details */}
            {areas.map((_, index) => (
              <div className=" md:py-6 ">
                <h2 className="text-xl font-medium mb-4">Area 1</h2>

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
                    <option>Select Preference</option>

                    <option>Single Car Parking</option>
                    <option>Double Car Parking</option>
                    <option>Custom Measurements</option>
                  </select>
                </div>
                <div className="space-y-2">
                  {/* Material Dropdown */}
                  <div>
                    <select className=" p-2 border border-gray-300 rounded-md md:mt-4">
                      <option>Material</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:px-5 ">
                    <div className="flex justify-center items-center gap-4">
                      <label className="block text-sm font-medium text-[#15164A]">
                        Span
                      </label>
                      <input
                        className="mt-1 block w-52 p-2 border border-gray-300 rounded-md "
                        placeholder="meter"
                      />
                    </div>
                    <div className="flex justify-center items-center gap-5">
                      <label className="block text-sm font-medium text-[#15164A]">
                        Length
                      </label>
                      <input
                        className="mt-1 block w-52 p-2 border border-gray-300 rounded-md "
                        placeholder="meter"
                      />
                    </div>
                    <div className="flex justify-center items-center gap-4">
                      <label className="block text-sm font-medium text-[#15164A]">
                        Height
                      </label>
                      <input
                        className="mt-1 block w-52 p-2 border border-gray-300 rounded-md "
                        placeholder="meter"
                      />
                    </div>
                  </div>
                  {/* Material2 Dropdown */}
                </div>
                <div className="space-y-2">
                  {/* Material Dropdown */}
                  <div>
                    <select className=" p-2 border border-gray-300 rounded-md md:mt-4">
                      <option>Materials</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:px-5 ">
                    <div className="flex justify-center items-center gap-3">
                      <label className="block text-sm font-medium text-[#15164A]">
                        Span
                      </label>
                      <input
                        className="mt-1 block w-52 p-2 border border-gray-300 rounded-md "
                        placeholder="meter"
                      />
                    </div>
                    <div className="flex justify-center items-center gap-5">
                      <label className="block text-sm font-medium text-[#15164A]">
                        Length
                      </label>
                      <input
                        className="mt-1 block w-52 p-2 border border-gray-300 rounded-md "
                        placeholder="meter"
                      />
                    </div>
                    <div className="flex justify-center items-center gap-4">
                      <label className="block text-sm font-medium text-[#15164A]">
                        Height
                      </label>
                      <input
                        className="mt-1 block w-52 p-2 border border-gray-300 rounded-md "
                        placeholder="meter"
                      />
                    </div>
                  </div>
                  {/* Material2 Dropdown */}
                </div>
                <div className="space-y-2">
                  {/* Material Dropdown */}
                  <div>
                    <select className=" p-2 border border-gray-300 rounded-md md:mt-4">
                      <option>Material</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:px-5 ">
                    <div className="flex justify-center items-center gap-3">
                      <label className="block text-sm font-medium text-[#15164A]">
                        Span
                      </label>
                      <input
                        className="mt-1 block w-52 p-2 border border-gray-300 rounded-md "
                        placeholder="meter"
                      />
                    </div>
                    <div className="flex justify-center items-center gap-5">
                      <label className="block text-sm font-medium text-[#15164A]">
                        Length
                      </label>
                      <input
                        className="mt-1 block w-52 p-2 border border-gray-300 rounded-md "
                        placeholder="meter"
                      />
                    </div>
                    <div className="flex justify-center items-center gap-4">
                      <label className="block text-sm font-medium text-[#15164A]">
                        Height
                      </label>
                      <input
                        className="mt-1 block w-52 p-2 border border-gray-300 rounded-md "
                        placeholder="meter"
                      />
                    </div>
                  </div>
                  {/* ----------------------------- */}
                  <div className="flex md:py-3 items-center justify-between  gap-5">
                    <label className="block text-sm font-medium text-[#15164A]">
                      Comments
                    </label>
                    <textarea
                      name=""
                      id=""
                      className="border border-gray-300 rounded-md w-full md:w-[90%]"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-between w-full md:px-10">
                    {/* Upload Field */}
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
                        <span className="text-sm text-gray-500">
                          Choose File
                        </span>
                        <input type="file" className="hidden" />
                      </label>
                      <span className="ml-4 text-sm text-gray-500">
                        No file chosen
                      </span>
                    </div>

                    {/* H1 Element */}
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={addArea}
                    >
                      <h1 className="text-lg font-semibold underline ">
                        Add New Area
                      </h1>
                      <img src={plussquare} alt="" />
                    </div>
                  </div>

                  {/* --------------------------------- */}
                </div>

                {/* ---------------------------------------- */}
              </div>
            ))}
            <h2 className="text-xl font-medium mb-4">Create Estimate</h2>

            <form className="col md:flex gap-6">
              <div className="flex justify-center items-center gap-5">
                <label className="block text-sm font-medium text-[#15164A]">
                  Total sq. ft
                </label>
                <input
                  className="mt-1 block w-52 p-2 border border-gray-300 rounded-md "
                  placeholder="1023.54"
                />
              </div>
              <div className="flex justify-center items-center gap-5">
                <label className="block text-sm font-medium text-[#15164A]">
                  Total Cost
                </label>
                <input
                  className="mt-1 block w-52 p-2 border border-gray-300 rounded-md "
                  placeholder="₹57800/-"
                />
              </div>
              <div className="flex justify-center items-center gap-5">
                <label className="block text-sm font-medium text-[#15164A]">
                  Sq.ft Rate
                </label>
                <input
                  className="mt-1 block w-52 p-2 border border-gray-300 rounded-md "
                  placeholder="₹4800/-"
                />
              </div>
            </form>

            <div className="flex md:pt-6 gap-12">
              <div className="flex  justify-center items-center">
                <label className="w-1/4 text-sm font-medium text-[#15164A]">
                  Comments
                </label>
                <textarea
                  type="text"
                  className="flex-1 p-2 md:w-96 border border-gray-300 rounded-md w-96 "
                  placeholder="Comments"
                />
              </div>
              <div className="flex  justify-center items-center gap-2">
                <label className="w-1/3 text-sm font-medium text-[#15164A]">
                  Status
                </label>
                <select className=" p-2 border border-gray-300 rounded-md ">
                  <option className="text-[#15164A]">Site Visit</option>
                </select>
              </div>
            </div>

            <h2 className="text-xl font-medium mb-4 md:mt-6">
              Schedule Site Visit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:px-5 md:pt-6 ">
              <div className="flex justify-center items-center gap-3">
                <label className="block text-sm font-medium text-[#15164A]">
                  Select date
                </label>
                <input
                  type="date"
                  className="mt-1 block w-52 p-2 border border-gray-300 rounded-md "
                  placeholder="📅"
                />
              </div>
              <div className="flex justify-center items-center gap-5">
                <label className="block text-sm font-medium text-[#15164A]">
                  Time
                </label>
                <input
                  type="time"
                  className="mt-1 block w-52 p-2 border border-gray-300 rounded-md "
                  placeholder="⏱️ time"
                />
              </div>
              <div className="flex justify-center items-center gap-4">
                <label className="block text-sm font-medium text-[#15164A]">
                  Status
                </label>
                <select className=" p-2 border border-gray-300 rounded-md ">
                  <option className="text-[#15164A]">Site Visit</option>
                </select>
              </div>
            </div>
            <div className="flex md:pt-6 gap-12">
              <div className="flex  justify-center items-center">
                <label className="w-1/4 text-sm font-medium text-[#15164A]">
                  Comments
                </label>
                <textarea
                  type="text"
                  className="flex-1 p-2 md:w-96 border border-gray-300 rounded-md w-96 "
                  placeholder="Comments"
                />
              </div>
              <div className="flex  justify-center items-center gap-2">
                <label className="w-1/3 text-sm font-medium text-[#15164A]">
                  Assign To
                </label>
                <select className=" p-2 border border-gray-300 rounded-md ">
                  <option className="text-[#15164A]">Select Name</option>
                </select>
              </div>
            </div>
            <div className="flex justify-center items-center gap-4 md:pt-10">
              <button className="bg-blue-600 px-5  text-white py-2 rounded-md">
                Add
              </button>
              <button className="bg-red-600 px-5 text-white py-2 rounded-md">
                Cancel
              </button>
            </div>
          </div>

          {/* Tables */}
          <div className="space-y-8">
            {/*-----------------------Ongoing Projects----------------------- */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#4c48a5]">
                  Customer Records
                </h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={handleSearch}
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Delete
                  </button>
                  <button className="bg-gray-200 text-[#15164A] px-3 py-1 rounded">
                    Filter
                  </button>

                  <button className="bg-gray-200 text-[#15164A] px-3 py-1 rounded">
                    Export
                  </button>
                </div>
                {/* ---//---//---//---//---//---//---//---//---//---//---//---//---//---//---//---//---//---//------------------ */}
              </div>
              <table className="w-full border-collapse border-t border-b border-gray-300 text-left">
                <thead>
                  <tr>
                    <th className="p-2 border-b border-gray-300"></th>
                    <th className="p-2 border-b border-gray-300">SL No</th>
                    <th className="p-2 border-b border-gray-300">
                      Client Name
                    </th>
                    <th className="p-2 border-b border-gray-300">
                      Phone Number
                    </th>
                    <th className="p-2 border-b border-gray-300">Location</th>
                    <th className="p-2 border-b border-gray-300">Roof Type</th>
                    <th className="p-2 border-b border-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-300">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleCheckboxChange(item.id)}
                        />
                      </td>
                      <td className="p-2">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </td>
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.phone}</td>
                      <td className="p-2">{item.location}</td>
                      <td className="p-2">{item.roof}</td>
                      {/* <td className="p-2">
                        <button
                          className={`px-3 py-1 rounded-full ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status} ⬇︎
                        </button>
                      </td> */}
                      <td className="p-2">
                        <button
                          className={`px-3  py-1 rounded-full ${getStatusColor(
                            item.status
                          )}`}
                          onClick={() => toggleDropdown(item.id)}
                          style={{
                            width: "150px", // Fixed width
                            height: "40px", // Fixed height
                          }} // Toggle dropdown visibility
                        >
                          <div className="flex justify-center items-center gap-2">
                            <div>{item.status}</div>
                            <div>
                              {" "}
                              <img src={dropdown} alt="" />
                            </div>
                          </div>
                        </button>
                        {dropdownOpen === item.id && (
                          <div className="absolute bg-white shadow-md rounded-md mt-2 w-48">
                            <button
                              onClick={() =>
                                handleStatusChange(item.id, "site visit")
                              }
                              className="w-full text-left p-2 hover:bg-gray-100"
                            >
                              Site Visit
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(item.id, "discussion")
                              }
                              className="w-full text-left p-2 hover:bg-gray-100"
                            >
                              Discussion
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(item.id, "pending")
                              }
                              className="w-full text-left p-2 hover:bg-gray-100"
                            >
                              Pending
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(item.id, "in-progress")
                              }
                              className="w-full text-left p-2 hover:bg-gray-100"
                            >
                              In Progress
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(item.id, "declined")
                              }
                              className="w-full text-left p-2 hover:bg-gray-100"
                            >
                              Declined
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="p-2">
                        <button className="bg-blue-500 text-white px-3 py-1 rounded-full">
                          See Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center mt-4">
                <div>
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  {[...Array(totalPages)].map((_, pageIndex) => (
                    <button
                      key={pageIndex}
                      onClick={() => handlePageChange(pageIndex + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === pageIndex + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-[#15164A]"
                      }`}
                    >
                      {pageIndex + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Employee Details--- --- --- --- --- --- ------------------------------- */}

            {/* ---------------- */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesAddnewClient;
