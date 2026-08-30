import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // Import useDispatch
import { message } from "antd"; // Import message if using Ant Design
import logo from "../assets/images/logo.png";
import { Link } from "react-router-dom";
import { forgotpassword } from "../api/admin/auth/auth";
import { setUserInfo } from "../redux/slices/authSlice"; // Import setUserInfo if using Redux

const ForgotPassword = () => {
  const [email, setEmail] = useState(""); // Ensure state is properly used
  const [loading, setLoading] = useState(false); // Define loading state
  const dispatch = useDispatch(); // Get dispatch function from Redux
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await forgotpassword(email);
      console.log(response);
  
      if (response?.data) {
        // Store email in session storage
        sessionStorage.setItem("userEmail", email);
  
        dispatch(setUserInfo(response.data)); // Dispatch user info if needed
        message.success("OTP sent to your email.");
        navigate("/otp-verification"); // Redirect user after sending OTP
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      message.error(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#2a2291]">
      <img src={logo} alt="Logo" className="mb-4" />
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-blue-900">Forgot Password?</h1>
        <p className="text-gray-600 mt-2">Enter your email ID</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium">
              Email ID
            </label>
            <input
              id="email"
              type="email" // Use type="email" for validation
              placeholder="Enter your email"
              value={email} // Fix: Bind value to `email` state
              onChange={(e) => setEmail(e.target.value)} // Fix: Use `setEmail`
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded-lg font-semibold transition duration-300 ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-700"
            }`}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
        <div className="mt-4 text-center flex justify-center items-center">
          <p>Remember Password?</p>
          <Link to="/login" className="text-blue-500 hover:underline px-2">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
