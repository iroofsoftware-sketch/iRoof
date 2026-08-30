import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { resetpassword } from "../api/admin/auth/auth";
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      console.log("Reset Request Data:", { newPassword: password });
      const response = await resetpassword({ newPassword: password });

      if (response?.status === 200) {
        alert("Password reset successfully!");
        navigate("/login");
      } else {
        throw new Error(response?.data?.message || "Password reset failed!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#2a2291]">
      <img src={logo} alt="Logo" className="mb-6" />
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-blue-900">Reset Password</h1>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <form onSubmit={handleReset} className="mt-6 space-y-4">
          <div className="relative">
            <label htmlFor="password" className="block text-gray-700 font-medium">New Password</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              className="absolute top-10 right-3 text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium">Confirm Password</label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              className="absolute top-10 right-3 text-gray-500"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300 disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
