import { useState } from "react";
import men from "../assets/icons/men.png";
import logoutIcon from "../assets/icons/logout.png"; // Add your logout icon here
import { logout } from "../../api/admin/auth/auth";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };
 
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
 
 
  const handleLogout = async () => {
    try {
      const response =await logout()
      console.log(response);
 
     
      localStorage.clear();
      sessionStorage.clear();
 
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
 
  return (
    <div className="relative top-0 left-0 right-0 z-50 flex items-center justify-between h-20 px-8 bg-white ">
      {/* Hamburger menu button */}
      <div>
        <button className="text-5xl text-black md:hidden" onClick={toggleMenu}>
          ☰
        </button>
      </div>
 
      {/*----------------------------- Links for mobile view ------------------------------*/}
      {isMenuOpen && (
        <div className="absolute left-0 flex flex-col items-center w-full py-4 space-y-4 bg-gray-100 shadow-lg top-24 md:hidden">
          <a href="/salesdashboard" className="text-lg text-black">
            Dashboard
          </a>
          <a href="/salescustomers" className="text-lg text-black">
            Customers
          </a>
          <a href="/quickestimate" className="text-lg text-black">
            Quick Estimate
          </a>
          <a href="/finalestimate" className="text-lg text-black">
            Final Estimate
          </a>
          <a href="/salessettings" className="text-lg text-black">
            Settings
          </a>
        </div>
      )}
 
      {/*------------------------------ Profile icon------------------------------- */}
  <div className="relative">
        <img
          src={men}
          alt="Profile"
          className="w-6 cursor-pointer"
          onClick={toggleDropdown}
        />
 
        {isDropdownOpen && (
          <div className="absolute right-0 w-40 mt-2 bg-white rounded-lg shadow-md">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-left text-black hover:bg-gray-200"
            >
              <img src={logoutIcon} alt="Logout" className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default Header;