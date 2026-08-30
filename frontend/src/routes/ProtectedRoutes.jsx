import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUserRole } from "../redux/slices/authSlice";

// eslint-disable-next-line react/prop-types
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const location = useLocation();

  // Not authenticated - Redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/" 
        state={{ from: location.pathname, message: "Please log in to access this page" }} 
        replace 
      />
    );
  }

  // Role not authorized - Redirect to appropriate dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    const roleRedirectMap = {
      admin: "/admin/",
      sales: "/sales/",
      rates: "/rates/materials",
    };

    const fallbackPath = roleRedirectMap[userRole] || "/";

    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname, message: "You don't have permission to access this page" }} 
        replace 
      />
    );
  }

  return children;
};
