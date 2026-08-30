import { Navigate, Route, Routes } from 'react-router-dom'
import AdminRoutes from './adminRoutes/AdminRoutes'
import SalesRoutes from './salesRoutes/SalesRoutes'
import { ProtectedRoute } from './ProtectedRoutes';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../redux/slices/authSlice';
import RatesRoutes from './rateRoutes/rateRoutes';

import ForgotPassword from '../common/ForgotPassword';
import ResetPassword from '../common/ResetPassword';
import Otp from '../common/Otp';
import Login from '../common/Login';

const MainRoutes = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
  
    return (
      <Routes>
        {/* Public routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/admin" replace />
            ) : (

              <Login />

            )
          } 
        />
  
        {/* Protected Admin routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
  
        {/* Protected Sales routes */}
        <Route
          path="/sales/*"
          element={
            <ProtectedRoute allowedRoles={['sales']}>
              <SalesRoutes />
              
            </ProtectedRoute>
          }
        />
  
        <Route
          path="/rates/*"
          element={
            <ProtectedRoute allowedRoles={['rates']}>
           <RatesRoutes />
            </ProtectedRoute>
          }
        />
  
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/otp-verification" element={<Otp />} />

        

      </Routes>
    );
  };

export default MainRoutes
