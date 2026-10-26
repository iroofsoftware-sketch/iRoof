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
import InvoicesPage from './pages/accounts/InvoicesPage';
import InvoicePrintView from './pages/accounts/InvoicePrintView';
import DesignDashboard from './pages/design/DesignDashboard';
import ProjectManagerDashboard from './pages/projectmanager/ProjectManagerDashboard';
import WorkOrdersPage from './pages/projectmanager/WorkOrdersPage';
import WorkOrderDetailPage from './pages/projectmanager/WorkOrderDetailPage';
import PurchaseDashboard from './pages/purchase/PurchaseDashboard';
import PurchaseRequestsPage from './pages/purchase/PurchaseRequestsPage';
import PurchaseOrdersPage from './pages/purchase/PurchaseOrdersPage';
import PurchaseOrderPrintView from './pages/purchase/PurchaseOrderPrintView';
import SuppliersPage from './pages/admin/SuppliersPage';
import WorkshopDashboard from './pages/workshop/WorkshopDashboard';
import WorkshopJobsPage from './pages/workshop/WorkshopJobsPage';
import SiteVisitorDashboard from './pages/sitevisitor/SiteVisitorDashboard';
import SiteVisitsPage from './pages/sitevisitor/SiteVisitsPage';
import DesignTasksPage from './pages/design/DesignTasksPage';
import CustomersPage from './pages/customers/CustomersPage';
import CustomerQuotationView from './pages/sales/CustomerQuotationView';

import { useAuthStore } from './store/authStore';

const theme = {
  token: {
    colorPrimary: '#0b2e59',
    colorPrimaryHover: '#164278',
    colorSuccess: '#15803d',
    colorError: '#b91c1c',
    colorWarning: '#d97706',
    colorInfo: '#1d4ed8',
    colorBgLayout: '#f8fafc',
    colorBgContainer: '#ffffff',
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorTextDisabled: '#94a3b8',
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 13.5,
    borderRadius: 7,
    borderRadiusSM: 5,
    borderRadiusLG: 10,
    controlHeight: 36,
    controlHeightLG: 42,
    controlHeightSM: 28,
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
    boxShadowSecondary: '0 4px 16px rgba(15, 23, 42, 0.07), 0 2px 4px rgba(15, 23, 42, 0.03)',
    lineWidth: 1,
    motionDurationMid: '0.15s',
    motionDurationSlow: '0.2s',
  },
  components: {
    Layout: {
      siderBg: '#081a36',
      triggerBg: '#051226',
    },
    Menu: {
      darkItemBg: '#081a36',
      darkSubMenuItemBg: '#051226',
      darkItemSelectedBg: 'rgba(201,148,10,0.18)',
      darkItemSelectedColor: '#ffffff',
      darkItemColor: 'rgba(255,255,255,0.72)',
      darkItemHoverBg: 'rgba(255,255,255,0.06)',
      darkItemHoverColor: '#ffffff',
      itemHeight: 38,
      iconSize: 15,
      itemBorderRadius: 6,
    },
    Button: {
      primaryShadow: '0 1px 2px rgba(11, 46, 89, 0.15)',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },
    Card: {
      headerBg: '#ffffff',
      headerFontSize: 14.5,
      headerFontSizeSM: 13,
    },
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#475569',
      headerSortActiveBg: '#f1f5f9',
      rowHoverBg: '#fbfdff',
      borderColor: '#f1f5f9',
    },
    Input: {
      activeShadow: '0 0 0 3px rgba(11,46,89,0.12)',
    },
    Select: {
      optionSelectedBg: '#eff6ff',
      optionSelectedColor: '#0b2e59',
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
              <Route path="/admin/customers" element={<CustomersPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/rate-masters" element={<RateMastersPage defaultTab="rates" />} />
              <Route path="/admin/section-masters" element={<RateMastersPage defaultTab="sections" />} />
              <Route path="/admin/rates" element={<RateMastersPage />} />
              <Route path="/admin/enquiries" element={<EnquiriesPage />} />
              <Route path="/admin/estimates" element={<SavedEstimatesPage />} />
              <Route path="/admin/suppliers" element={<SuppliersPage />} />
            </Route>

            {/* Sales Routes */}
            <Route element={<ProtectedRoute allowedRoles={['sales', 'admin']} />}>
              <Route path="/sales" element={<SalesDashboard />} />
              <Route path="/sales/dashboard" element={<SalesDashboard />} />
              <Route path="/sales/customers" element={<CustomersPage />} />
              <Route path="/sales/enquiries" element={<EnquiriesPage />} />
              <Route path="/sales/estimates" element={<SavedEstimatesPage />} />
              <Route path="/sales/estimates/new" element={<EstimationPage />} />
              <Route path="/sales/estimates/:id" element={<EstimationPage />} />
              <Route path="/sales/estimates/:id/quotation" element={<CustomerQuotationView />} />
            </Route>

            {/* Accounts Routes */}
            <Route element={<ProtectedRoute allowedRoles={['accounts', 'admin']} />}>
              <Route path="/accounts" element={<AccountsDashboard />} />
              <Route path="/accounts/dashboard" element={<AccountsDashboard />} />
              <Route path="/accounts/customers" element={<CustomersPage />} />
              <Route path="/accounts/invoices" element={<InvoicesPage />} />
            </Route>

            {/* Design Routes */}
            <Route element={<ProtectedRoute allowedRoles={['design', 'admin']} />}>
              <Route path="/design" element={<DesignDashboard />} />
              <Route path="/design/dashboard" element={<DesignDashboard />} />
              <Route path="/design/drawings" element={<DesignTasksPage />} />
            </Route>

            {/* Project Manager Routes */}
            <Route element={<ProtectedRoute allowedRoles={['projectmanager', 'admin']} />}>
              <Route path="/projectmanager" element={<ProjectManagerDashboard />} />
              <Route path="/projectmanager/dashboard" element={<ProjectManagerDashboard />} />
              <Route path="/projectmanager/customers" element={<CustomersPage />} />
              <Route path="/projectmanager/workorders" element={<WorkOrdersPage />} />
              <Route path="/projectmanager/workorders/:id" element={<WorkOrderDetailPage />} />
              <Route path="/projectmanager/projects" element={<WorkOrdersPage />} />
            </Route>

            {/* Purchase Routes */}
            <Route element={<ProtectedRoute allowedRoles={['purchase', 'admin']} />}>
              <Route path="/purchase" element={<PurchaseDashboard />} />
              <Route path="/purchase/dashboard" element={<PurchaseDashboard />} />
              <Route path="/purchase/requests" element={<PurchaseRequestsPage />} />
              <Route path="/purchase/orders" element={<PurchaseOrdersPage />} />
              <Route path="/purchase/suppliers" element={<SuppliersPage />} />
            </Route>

            {/* Workshop Routes */}
            <Route element={<ProtectedRoute allowedRoles={['workshop', 'admin']} />}>
              <Route path="/workshop" element={<WorkshopDashboard />} />
              <Route path="/workshop/dashboard" element={<WorkshopDashboard />} />
              <Route path="/workshop/jobs" element={<WorkshopJobsPage />} />
            </Route>

            {/* Site Visitor Routes */}
            <Route element={<ProtectedRoute allowedRoles={['sitevisitor', 'admin']} />}>
              <Route path="/sitevisitor" element={<SiteVisitorDashboard />} />
              <Route path="/sitevisitor/dashboard" element={<SiteVisitorDashboard />} />
              <Route path="/sitevisitor/visits" element={<SiteVisitsPage />} />
              <Route path="/sitevisitor/sites" element={<SiteVisitsPage />} />
            </Route>
          </Route>

          {/* Standalone Printable Invoice View (clean — no sidebar, no nav) */}
          <Route element={<ProtectedRoute allowedRoles={['accounts', 'admin']} />}>
            <Route path="/accounts/invoices/:id/print" element={<InvoicePrintView />} />
          </Route>

          {/* Standalone Printable Purchase Order View (clean — no sidebar, no nav) */}
          <Route element={<ProtectedRoute allowedRoles={['purchase', 'admin']} />}>
            <Route path="/purchase/orders/:id/print" element={<PurchaseOrderPrintView />} />
          </Route>

          {/* Standalone Printable Commercial Estimate Proposal */}
          <Route element={<ProtectedRoute allowedRoles={['sales', 'admin']} />}>
            <Route path="/sales/estimates/:id/print" element={<CustomerQuotationView />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
