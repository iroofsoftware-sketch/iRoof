import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import LoginPage, { roleHomePaths } from './pages/auth/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleLayout from './layouts/RoleLayout';

// Dashboards & Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import RateMastersPage from './pages/admin/RateMastersPage';
import SalesDashboard from './pages/sales/SalesDashboard';
import EnquiriesPage from './pages/sales/EnquiriesPage';
import EstimationPage from './pages/sales/EstimationPage';
import SavedEstimatesPage from './pages/sales/SavedEstimatesPage';
import AccountsDashboard from './pages/accounts/AccountsDashboard';
import DesignDashboard from './pages/design/DesignDashboard';
import ProjectManagerDashboard from './pages/projectmanager/ProjectManagerDashboard';
import PurchaseDashboard from './pages/purchase/PurchaseDashboard';
import WorkshopDashboard from './pages/workshop/WorkshopDashboard';
import SiteVisitorDashboard from './pages/sitevisitor/SiteVisitorDashboard';

import { useAuthStore } from './store/authStore';

const theme = {
  token: {
    colorPrimary: '#0b315d',
    colorPrimaryHover: '#0d3d73',
    colorSuccess: '#15803d',
    colorError: '#b91c1c',
    colorWarning: '#d97706',
    colorInfo: '#1e40af',
    colorBgLayout: '#f3f6f9',
    colorBgContainer: '#ffffff',
    colorBorder: '#dde3ea',
    colorBorderSecondary: '#dde3ea',
    colorText: '#111827',
    colorTextSecondary: '#6b7280',
    colorTextDisabled: '#9ca3af',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    borderRadius: 8,
    borderRadiusSM: 4,
    borderRadiusLG: 12,
    controlHeight: 36,
    controlHeightLG: 42,
    controlHeightSM: 28,
    boxShadow: '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05)',
    boxShadowSecondary: '0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)',
    lineWidth: 1,
    motionDurationMid: '0.15s',
    motionDurationSlow: '0.2s',
  },
  components: {
    Layout: {
      siderBg: '#0b315d',
      triggerBg: '#0a2a50',
    },
    Menu: {
      darkItemBg: '#0b315d',
      darkSubMenuItemBg: '#0a2a50',
      darkItemSelectedBg: 'rgba(201,148,10,0.15)',
      darkItemSelectedColor: '#ffffff',
      darkItemColor: 'rgba(255,255,255,0.70)',
      darkItemHoverBg: 'rgba(255,255,255,0.07)',
      darkItemHoverColor: '#ffffff',
      itemHeight: 42,
      iconSize: 16,
    },
    Button: {
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },
    Card: {
      headerBg: '#ffffff',
      headerFontSize: 14,
      headerFontSizeSM: 12,
    },
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#374151',
      headerSortActiveBg: '#f1f5f9',
      rowHoverBg: '#f8fafc',
      borderColor: '#dde3ea',
    },
    Input: {
      activeShadow: '0 0 0 3px rgba(11,49,93,0.10)',
    },
    Select: {
      optionSelectedBg: '#eff6ff',
      optionSelectedColor: '#0b315d',
    },
  },
};

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
    <ConfigProvider theme={theme}>
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
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/rate-masters" element={<RateMastersPage defaultTab="rates" />} />
              <Route path="/admin/section-masters" element={<RateMastersPage defaultTab="sections" />} />
              <Route path="/admin/rates" element={<RateMastersPage />} />
              <Route path="/admin/enquiries" element={<EnquiriesPage />} />
              <Route path="/admin/estimates" element={<SavedEstimatesPage />} />
            </Route>

            {/* Sales Routes */}
            <Route element={<ProtectedRoute allowedRoles={['sales', 'admin']} />}>
              <Route path="/sales" element={<SalesDashboard />} />
              <Route path="/sales/dashboard" element={<SalesDashboard />} />
              <Route path="/sales/enquiries" element={<EnquiriesPage />} />
              <Route path="/sales/estimates" element={<SavedEstimatesPage />} />
              <Route path="/sales/estimates/new" element={<EstimationPage />} />
              <Route path="/sales/estimates/:id" element={<EstimationPage />} />
            </Route>

            {/* Accounts Routes */}
            <Route element={<ProtectedRoute allowedRoles={['accounts', 'admin']} />}>
              <Route path="/accounts" element={<AccountsDashboard />} />
              <Route path="/accounts/dashboard" element={<AccountsDashboard />} />
              <Route path="/accounts/invoices" element={<AccountsDashboard />} />
            </Route>

            {/* Design Routes */}
            <Route element={<ProtectedRoute allowedRoles={['design', 'admin']} />}>
              <Route path="/design" element={<DesignDashboard />} />
              <Route path="/design/dashboard" element={<DesignDashboard />} />
              <Route path="/design/drawings" element={<DesignDashboard />} />
            </Route>

            {/* Project Manager Routes */}
            <Route element={<ProtectedRoute allowedRoles={['projectmanager', 'admin']} />}>
              <Route path="/projectmanager" element={<ProjectManagerDashboard />} />
              <Route path="/projectmanager/dashboard" element={<ProjectManagerDashboard />} />
              <Route path="/projectmanager/workorders" element={<ProjectManagerDashboard />} />
              <Route path="/projectmanager/projects" element={<ProjectManagerDashboard />} />
            </Route>

            {/* Purchase Routes */}
            <Route element={<ProtectedRoute allowedRoles={['purchase', 'admin']} />}>
              <Route path="/purchase" element={<PurchaseDashboard />} />
              <Route path="/purchase/dashboard" element={<PurchaseDashboard />} />
              <Route path="/purchase/orders" element={<PurchaseDashboard />} />
              <Route path="/purchase/suppliers" element={<PurchaseDashboard />} />
            </Route>

            {/* Workshop Routes */}
            <Route element={<ProtectedRoute allowedRoles={['workshop', 'admin']} />}>
              <Route path="/workshop" element={<WorkshopDashboard />} />
              <Route path="/workshop/dashboard" element={<WorkshopDashboard />} />
              <Route path="/workshop/jobs" element={<WorkshopDashboard />} />
            </Route>

            {/* Site Visitor Routes */}
            <Route element={<ProtectedRoute allowedRoles={['sitevisitor', 'admin']} />}>
              <Route path="/sitevisitor" element={<SiteVisitorDashboard />} />
              <Route path="/sitevisitor/dashboard" element={<SiteVisitorDashboard />} />
              <Route path="/sitevisitor/sites" element={<SiteVisitorDashboard />} />
              <Route path="/sitevisitor/visits" element={<SiteVisitorDashboard />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
