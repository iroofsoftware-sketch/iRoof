import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage, { roleHomePaths } from './pages/auth/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleLayout from './layouts/RoleLayout';

// Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import SalesDashboard from './pages/sales/SalesDashboard';
import AccountsDashboard from './pages/accounts/AccountsDashboard';
import DesignDashboard from './pages/design/DesignDashboard';
import ProjectManagerDashboard from './pages/projectmanager/ProjectManagerDashboard';
import PurchaseDashboard from './pages/purchase/PurchaseDashboard';
import WorkshopDashboard from './pages/workshop/WorkshopDashboard';
import SiteVisitorDashboard from './pages/sitevisitor/SiteVisitorDashboard';

import { useAuthStore } from './store/authStore';

const IndexRedirect = () => {
  const { isAuthenticated, role } = useAuthStore();
  if (isAuthenticated && role && roleHomePaths[role]) {
    return <Navigate to={roleHomePaths[role]} replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<IndexRedirect />} />

        {/* Protected System Routes wrapped in RoleLayout */}
        <Route element={<ProtectedRoute><RoleLayout /></ProtectedRoute>}>
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* Step 4 & 5 pages will mount here */}
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/rates" element={<AdminDashboard />} />
          </Route>

          {/* Sales Routes */}
          <Route element={<ProtectedRoute allowedRoles={['sales', 'admin']} />}>
            <Route path="/sales/dashboard" element={<SalesDashboard />} />
            <Route path="/sales/enquiries" element={<SalesDashboard />} />
            <Route path="/sales/estimates" element={<SalesDashboard />} />
            <Route path="/sales/estimates/new" element={<SalesDashboard />} />
          </Route>

          {/* Accounts Routes */}
          <Route element={<ProtectedRoute allowedRoles={['accounts', 'admin']} />}>
            <Route path="/accounts/dashboard" element={<AccountsDashboard />} />
            <Route path="/accounts/approvals" element={<AccountsDashboard />} />
          </Route>

          {/* Design Routes */}
          <Route element={<ProtectedRoute allowedRoles={['design', 'admin']} />}>
            <Route path="/design/dashboard" element={<DesignDashboard />} />
            <Route path="/design/drawings" element={<DesignDashboard />} />
          </Route>

          {/* Project Manager Routes */}
          <Route element={<ProtectedRoute allowedRoles={['projectmanager', 'admin']} />}>
            <Route path="/projectmanager/dashboard" element={<ProjectManagerDashboard />} />
            <Route path="/projectmanager/projects" element={<ProjectManagerDashboard />} />
          </Route>

          {/* Purchase Routes */}
          <Route element={<ProtectedRoute allowedRoles={['purchase', 'admin']} />}>
            <Route path="/purchase/dashboard" element={<PurchaseDashboard />} />
            <Route path="/purchase/orders" element={<PurchaseDashboard />} />
          </Route>

          {/* Workshop Routes */}
          <Route element={<ProtectedRoute allowedRoles={['workshop', 'admin']} />}>
            <Route path="/workshop/dashboard" element={<WorkshopDashboard />} />
            <Route path="/workshop/jobs" element={<WorkshopDashboard />} />
          </Route>

          {/* Site Visitor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['sitevisitor', 'admin']} />}>
            <Route path="/sitevisitor/dashboard" element={<SiteVisitorDashboard />} />
            <Route path="/sitevisitor/visits" element={<SiteVisitorDashboard />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
