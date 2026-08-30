import React, { useState } from "react";
import Header from "../../RatesDashboard/components/Header";
import Sidebar from "../../RatesDashboard/components/Sidebar";
import { Link } from "react-router-dom";

const EditThicknessRate = () => {
  
  const [activeTab, setActiveTab] = useState("Materials");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


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
            Dashboard
          </h1>
        </div>
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md p-4 md:m-5 m-4">
          {/* Tab Content */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-4 md:m-5 m-4">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2 border border-gray-300">
                        Thickness
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        Base Rate Per Weight
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        18% Tax
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        Transportation
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        Loading & Unloading
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        Final Rate Per Kg
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        Rate Per Sq.ft
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        Round Off
                      </th>
                      <th className="px-4 py-2 border border-gray-300">
                        Selling Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(10)].map((_, index) => (
                      <tr key={index} className="text-center">
                        <td className="px-4 py-2 border border-gray-300">
                          <input
                            type="checkbox"
                            value={`0.${index + 5}`}
                            className="mr-2"
                          />
                          0.{index + 5}
                        </td>
                        <td className="px-4 py-2 border border-gray-300">00</td>
                        <td className="px-4 py-2 border border-gray-300">00</td>
                        <td className="px-4 py-2 border border-gray-300">05</td>
                        <td className="px-4 py-2 border border-gray-300">
                          1.5
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          8.5
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          6.29
                        </td>
                        <td className="px-4 py-2 border border-gray-300">07</td>
                        <td className="px-4 py-2 border border-gray-300">07</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Rates Section */}
              <div className="mt-6">
                <h2 className="text-2xl font-normal text-[#2A2493]">
                  Edit Rates
                </h2>
                <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {/* Input Fields */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Thickness
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option>0.5</option>
                      <option>0.6</option>
                      <option>0.7</option>
                    </select>
                  </div>
                  <div className="">
                    <label className="text-sm font-medium text-gray-700 ">
                      18% Tax
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Margin
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Base Rate Per Weight
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Final Rate Per Kg
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="1.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Transportation
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="1.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Loading & Unloading
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="8.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Round Off
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="1.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Selling Price
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="07"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Rate Per Sq.Ft
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="07"
                    />
                  </div>
                </form>
                <div className="flex gap-4 mt-4 justify-center">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
                    Add
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-md">
                    Cancel
                  </button>
                </div>

                <div className="flex justify-start md:pr-36">
                  <p className="text-black">
                    Click Here{" "}
                    <Link to="/thicknessrate">
                      <span className="text-[#0070FF]">To Add</span>{" "}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditThicknessRate;
