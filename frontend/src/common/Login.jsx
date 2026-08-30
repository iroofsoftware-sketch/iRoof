import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/images/logo.png";
import { message } from "antd";
import { setUserInfo } from "../redux/slices/authSlice";
import { login } from "../api/admin/auth/auth";

const Login = () => {
  const [formData, setFormData] = useState({
    mailId: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData);

      if (response?.data) {
        dispatch(setUserInfo(response.data));
        message.success("Logged in successfully");
        const userType = response.data.userType;
        switch (userType) {
          case "admin":
            navigate("/admin");
            break;
          case "sales":
            navigate("/Sales");
            break;
          case "rates":
            navigate("/rates/materials");
            break;
          case "Site Visitor":
            navigate("/");
            break;
          default:
            navigate("/");
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#2a2291]">
      <div className="mb-8">
        <img src={logo} alt="Logo" className="max-w-[200px]" />
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-blue-900">Login</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Please login to your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="mailId" className="block font-medium text-gray-700">
              Email Id
            </label>
            <input
              id="mailId"
              name="mailId"
              type="email"
              placeholder="Enter your email"
              value={formData.mailId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              className="absolute text-gray-500 top-10 right-3"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-semibold text-white transition duration-300 bg-blue-900 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center flex justify-center items-center">
          <span className="text-gray-400">|</span>
          <Link
            to="/forgot-password"
            className="text-blue-500 hover:underline pr-3 pl-3"
          >
            Forgot Password?
          </Link>
          <span className="text-gray-400">|</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
