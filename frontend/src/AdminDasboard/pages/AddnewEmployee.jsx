import { useState } from "react";
import Sidebar from "../components/SideNav";
import Header from "../components/Header";
import { addEmployee } from "../../api/admin/employee/addEmployee";
import { toast } from "react-toastify";

function AddNewEmployee() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mailId: "",
    mobileNumber: "",
    designations: "",
    location: "",
    address: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const designationOptions = [
    { value: "", label: "Select Designation" },
    { value: "Site Visitor", label: "Site Visitor" },
    { value: "Sales", label: "Sales" },
    { value: "Rates", label: "Rates" },
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
      
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Invalid mobile number";
    }
    
    if (!formData.mailId.trim()) {
      newErrors.mailId = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.mailId)) {
      newErrors.mailId = "Invalid email format";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.designations) {
      newErrors.designations = "Designation is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await addEmployee(formData);
      if (response?.data) {
        // Reset form on success
        setFormData({
          name: "",
          mailId: "",
          mobileNumber: "",
          designations: "",
          location: "",
          address: "",
          password: ""
        });
        toast.success("Employee added successfully!");
      }
    } catch (error) {
      toast.error("Failed to add employee. Please try again.");
      console.error("Error adding employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form data and errors
    setFormData({
      name: "",
      mailId: "",
      mobileNumber: "",
      designations: "",
      location: "",
      address: "",
      password: ""
    });
    setErrors({});
  };





  
  const renderInput = (id, label, type = "text") => (
    <div className="relative w-full">
      <input
        type={type}
        id={id}
        value={formData[id]}
        onChange={handleInputChange}
        placeholder=" "
        className={`peer w-full border ${errors[id] ? 'border-red-500' : 'border-gray-300'} 
          rounded-lg p-2 pt-5 focus:outline-none focus:ring 
          ${errors[id] ? 'focus:ring-red-300' : 'focus:ring-blue-300'}`}
      />
      <label
        htmlFor={id}
        className={`absolute left-2 -top-2 ${errors[id] ? 'text-red-600' : 'text-blue-600'} 
          text-sm bg-white px-1 transition-all peer-placeholder-shown:top-2 
          peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base 
          peer-focus:-top-2 peer-focus:text-sm 
          ${errors[id] ? 'peer-focus:text-red-600' : 'peer-focus:text-blue-600'}`}
      >
        {label}
      </label>
      {errors[id] && (
        <span className="text-red-500 text-xs mt-1">{errors[id]}</span>
      )}
    </div>
  );

  const renderSelect = (id, label, options) => (
    <div className="relative w-full">
      <select
        id={id}
        value={formData[id]}
        onChange={handleInputChange}
        className={`w-full border ${errors[id] ? 'border-red-500' : 'border-gray-300'} 
          rounded-lg p-2 focus:outline-none focus:ring 
          ${errors[id] ? 'focus:ring-red-300' : 'focus:ring-blue-300'}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className={`absolute left-2 -top-2 ${errors[id] ? 'text-red-600' : 'text-blue-600'} 
          text-sm bg-white px-1`}
      >
        {label}
      </label>
      {errors[id] && (
        <span className="text-red-500 text-xs mt-1">{errors[id]}</span>
      )}
    </div>
  );

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

        <form onSubmit={handleSubmit} className="p-8 overflow-auto">
          <h1 className="text-3xl font-bold text-[#4c48a5] mb-6">
            Add New Employee
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderInput("name", "Employee Name")}
            {renderInput("mobileNumber", "Mobile Number")}
            {renderInput("mailId", "Email ID", "email")}
            {renderSelect("designations", "Designation", designationOptions)}
            {renderInput("password", "Password", "password")}
            {renderInput("location", "Location")}
            {renderInput("address", "Address")}
          </div>

          <div className="mt-6 flex justify-center items-center gap-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md 
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddNewEmployee;