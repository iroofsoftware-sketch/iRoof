/* eslint-disable react/prop-types */
import logo from "../../RatesDashboard/assets/images/logo.png";
import square from "../../RatesDashboard/assets/icons/square.png";
import profile from "../../RatesDashboard/assets/icons/profile.png";
import file from "../../RatesDashboard/assets/icons/file.png";
import { Link } from "react-router-dom";
import { useState } from "react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  // Function to toggle the active menu
  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };
  
  return (
    <div
      className={`fixed top-0 left-0 bg-[#2a2291] text-white min-h-screen w-64 px-4 py-6 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 md:translate-x-0 md:relative md:min-h-screen`}
    >
      <div className="flex justify-center items-center">
        <img src={logo} className="w-40" alt="Logo" />

        {/* Close button for mobile view */}
        <button className="text-white md:hidden" onClick={toggleSidebar}>
          ✕
        </button>
      </div>
      <div className="flex justify-center items-center">
        <ul className="space-y-4 py-6 flex flex-col items-start">
          {/* Menu Items */}
          <li className="group">
            <div
              className={`flex items-center cursor-pointer p-2 hover:bg-gray-700 rounded w-full ${
                activeMenu === "dashboard" ? "bg-gray-700" : ""
              }`}
              onClick={() => toggleMenu("dashboard")}
            >
              <div className="w-8 flex justify-center">
                <img src={square} alt="Dashboard Icon" className="w-6 h-6" />
              </div>
              <Link to="/rates/materials">
                <span>Materials</span>
              </Link>
            </div>
          </li>
          <li className="group">
            <div
              className={`flex items-center cursor-pointer p-2 hover:bg-gray-700 rounded w-full ${
                activeMenu === "thicknessrate" ? "bg-gray-700" : ""
              }`}
              onClick={() => toggleMenu("thicknessrate")}
            >
              <div className="w-8 flex justify-center">
                <img src={profile} alt="thicknessrate" className="w-6 h-6" />
              </div>
              <Link to="/rates/thicknessrate">Thickness Rate</Link>
            </div>
          </li>
          <li className="group">
            <div
              className={`flex items-center cursor-pointer p-2 hover:bg-gray-700 rounded w-full ${
                activeMenu === "transportation" ? "bg-gray-700" : ""
              }`}
              onClick={() => toggleMenu("transportation")}
            >
              <div className="w-8 flex justify-center">
                <img src={file} alt="Employees Icon" className="w-6 h-6" />
              </div>
              <Link to="/rates/transportation">
                <span>Transportation</span>
              </Link>
            </div>
          </li>
          <li className="group">
            <div
              className={`flex items-center cursor-pointer p-2 hover:bg-gray-700 rounded w-full ${
                activeMenu === "ratesettings" ? "bg-gray-700" : ""
              }`}
              onClick={() => toggleMenu("ratesettings")}
            >
              <div className="w-8 flex justify-center">
                <img src={square} alt="Projects Icon" className="w-6 h-6" />
              </div>
              <Link to="/rates/ratesettings">
                <span>Settings</span>
              </Link>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;