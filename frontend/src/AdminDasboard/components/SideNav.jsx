/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";
import square from "../assets/icons/square.png";
import profile from "../assets/icons/profile.png";
import file from "../assets/icons/file.png";
import settings from "../assets/icons/settings.png";

const SideNav = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('');

  // Update active menu when URL changes
  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin') {
      setActiveMenu('dashboard');
    } else {
      // Remove leading slash and convert to lowercase
      setActiveMenu(path.substring(1).toLowerCase());
    }
  }, [location.pathname]);

  const toggleMenu = (menuItem) => {
    setActiveMenu(menuItem);
  };

  return (
    <div
      className={`fixed top-0 left-0 bg-[#2a2291] text-white min-h-screen w-64 px-4 py-6 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 md:translate-x-0 md:relative md:min-h-screen`}
    >
      <div className="flex justify-center items-center">
        <img src={logo} className="w-40" alt="Logo" />
        <button className="text-white md:hidden" onClick={toggleSidebar}>
          ✕
        </button>
      </div>
      <div className="flex justify-center items-center">
        <ul className="space-y-4 py-6 flex flex-col items-start w-full">
          {[
            { name: 'dashboard', icon: square, label: 'Dashboard', path: '/admin' },
            { name: 'customers', icon: profile, label: 'Customers', path: '/admin/customers' },
            { name: 'employees', icon: file, label: 'Employees', path: '/admin/employees' },
            { name: 'projects', icon: square, label: 'Projects', path: '/admin/projects' },
            { name: 'estimate', icon: file, label: 'Estimate', path: '/admin/estimate' },
            { name: 'rates', icon: square, label: 'Rates', path: '/admin/rates' },
            { name: 'productsadding', icon: file, label: 'Products Adding', path: '/admin/productsadding' },
            { name: 'costadding', icon: square, label: 'Cost Adding', path: '/admin/costadding' },
            { name: 'settings', icon: settings, label: 'Settings', path: '/admin/settings' },
          ].map((item) => (
            <li key={item.name} className="w-full">
              <Link to={item.path}>
                <div
                  className={`flex items-center cursor-pointer p-2 hover:bg-gray-400 rounded w-full ${
                    activeMenu === item.name ? 'bg-black' : ''
                  }`}
                  onClick={() => toggleMenu(item.name)}
                >
                  <div className="w-8 flex justify-center">
                    <img src={item.icon} alt={`${item.label} Icon`} className="w-6 h-6" />
                  </div>
                  <span>{item.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SideNav;