import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { message } from "antd";
import Header from "../../SalesDashboard/components/Header";
import Sidebar from "../../SalesDashboard/components/Sidebar";
import { getUserById, editUserById } from "../../api/admin/employee/getEmployee";
import { selectUserId, setUserInfo } from "../../redux/slices/authSlice"

function SalesSettings() {
  const dispatch = useDispatch();
  const userId = useSelector(selectUserId);
  const authState = useSelector(state => state.auth);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    phoneNumber: "",
    location: "",
    address: ""
  });
 
  // Use useCallback to prevent function recreation on each render
  const fetchUser = useCallback(async () => {
    if (!userId) {
      message.error("User ID not found");
      return;
    }

    try {
      const userData = await getUserById(userId);
      setUser(userData);
 
      // Pre-fill form with user data
      setFormData({
        fullName: userData?.name || "",
        userName: userData?.mailId || "",
        phoneNumber: userData?.mobileNumber || "",
        location: userData?.location || "",
        address: userData?.address || "",
        designations: userData?.designations || "",
      });
    } catch (error) {
      message.error("Error fetching user profile");
      console.error("Error fetching user:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
 
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
 
  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    // Validation
    if (!formData.fullName || !formData.phoneNumber) {
      message.error("Full Name and Phone Number are required!");
      return;
    }
  
    const updatedData = {
      name: formData.fullName,          
      mailId: formData.userName,        
      mobileNumber: formData.phoneNumber,
      location: formData.location,
      address: formData.address
    };
  
    try {
      setIsSubmitting(true);
      // Close the modal first
      setIsModalOpen(false);
      
      // Make API call to update user
      const response = await editUserById(user._id, updatedData);
      
      // Make sure response contains _id property
      // If it's not in the response, add it from the original user object
      if (!response._id && user._id) {
        response._id = user._id;
      }
      
      // Structure it exactly how the reducer expects it
      const updatedUserInfo = {
        user: response,
        userType: authState.role // Keep existing role
      };
      
      // Update Redux store
      dispatch(setUserInfo(updatedUserInfo));
      
      // Update local state
      setUser(response);
      
      message.success("Profile updated successfully!");
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      message.error(
        error.response?.data?.message || "Update failed. Please try again."
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
 
      <div className="flex flex-col flex-1 bg-gray-100">
        <Header toggleSidebar={toggleSidebar} />
 
        <div className="p-6 space-y-8 overflow-auto bg-gray-100">
          <h1 className="text-3xl font-normal text-[#4c48a5]">Profile Settings</h1>
 
          <div className="p-6 mb-6 bg-white rounded-md shadow-md">
            <div className="px-6 space-y-6">
              {/* Input fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-normal text-[#15164A]">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ""}
                    readOnly={true}
                    className="p-2 border border-gray-300 rounded-md w-[600px]"
                  />
                </div>
 
                <div className="flex items-center justify-between">
                  <label className="text-sm font-normal text-[#15164A]">User Name</label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName || ""}
                    readOnly={true}
                    className="p-2 border border-gray-300 rounded-md w-[600px]"
                  />
                </div>
 
                <div className="flex items-center justify-between">
                  <label className="text-sm font-normal text-[#15164A]">Phone No</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    readOnly={true}
                    className="p-2 border border-gray-300 rounded-md w-[600px]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-normal text-[#15164A]">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ""}
                    readOnly={true}
                    className="p-2 border border-gray-300 rounded-md w-[600px]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-normal text-[#15164A]">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ""}
                    readOnly={true}
                    className="p-2 border border-gray-300 rounded-md w-[600px]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-normal text-[#15164A]">Designations</label>
                  <input
                    type="text"
                    name="designations"
                    value={formData.designations || ""}
                    readOnly={true}
                    className="p-2 border border-gray-300 rounded-md w-[600px]"
                  />
                </div>
              </div>
 
              <div className="flex justify-center gap-5 px-10">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="p-2 px-5 text-white bg-blue-600 rounded-md"
                  disabled={isSubmitting}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Modal - Only render when isModalOpen is true */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md shadow-md w-[800px]" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm font-normal text-[#15164A]">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName || ""}
                  onChange={handleChange}
                  required
                  className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-normal text-[#15164A]">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleChange}
                  required
                  className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>
 
              <div className="flex flex-col">
                <label className="text-sm font-normal text-[#15164A]">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-normal text-[#15164A]">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>
 
              <div className="flex justify-end mt-4 space-x-4">
                <button 
                  type="button"
                  onClick={toggleModal}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-[#3C3EC3] text-white px-4 py-2 rounded-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
 
export default SalesSettings;