import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Drawer,
  Breadcrumb
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ControlOutlined,
  AppstoreOutlined,
  FileSearchOutlined,
  CalculatorOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  AccountBookOutlined,
  BuildOutlined,
  ProfileOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  ToolOutlined,
  EnvironmentOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  ContactsOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const { Header, Sider, Content } = Layout;

export const roleDepartmentTitles = {
  admin: 'Administration',
  sales: 'Sales & Estimations',
  accounts: 'Accounts & Finance',
  design: 'Design & Engineering',
  projectmanager: 'Project Management',
  purchase: 'Purchase & Procurement',
  workshop: 'Workshop & Fabrication',
  sitevisitor: 'Site Operations'
};

const getRoleMenuConfig = (role) => {
  switch (role) {
    case 'admin':
      return [
        { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/admin/customers', icon: <ContactsOutlined />, label: 'Customers (CRM)' },
        { key: '/admin/users', icon: <TeamOutlined />, label: 'Users' },
        { key: '/admin/rate-masters', icon: <ControlOutlined />, label: 'Rate Masters' },
        { key: '/admin/section-masters', icon: <AppstoreOutlined />, label: 'Section Masters' },
        { key: '/admin/suppliers', icon: <ShopOutlined />, label: 'Suppliers' },
        { key: '/admin/enquiries', icon: <FileSearchOutlined />, label: 'All Enquiries' },
        { key: '/admin/estimates', icon: <CalculatorOutlined />, label: 'All Estimates' }
      ];

    case 'sales':
      return [
        { key: '/sales', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/sales/customers', icon: <ContactsOutlined />, label: 'Customers (CRM)' },
        { key: '/sales/enquiries', icon: <FileTextOutlined />, label: 'Leads & Pipeline' },
        { key: '/sales/estimates/new', icon: <CalculatorOutlined />, label: 'New Estimate' },
        { key: '/sales/estimates', icon: <FolderOpenOutlined />, label: 'Saved Estimates' }
      ];

    case 'accounts':
      return [
        { key: '/accounts', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/accounts/customers', icon: <ContactsOutlined />, label: 'Customers (CRM)' },
        { key: '/accounts/invoices', icon: <AccountBookOutlined />, label: 'Invoices' }
      ];

    case 'design':
      return [
        { key: '/design', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/design/drawings', icon: <BuildOutlined />, label: 'Drawings' }
      ];

    case 'projectmanager':
      return [
        { key: '/projectmanager', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/projectmanager/customers', icon: <ContactsOutlined />, label: 'Customers (CRM)' },
        { key: '/projectmanager/workorders', icon: <ProfileOutlined />, label: 'Work Orders' }
      ];

    case 'purchase':
      return [
        { key: '/purchase', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/purchase/requests', icon: <FileTextOutlined />, label: 'Purchase Requests' },
        { key: '/purchase/orders', icon: <ShoppingCartOutlined />, label: 'Purchase Orders' },
        { key: '/admin/suppliers', icon: <ShopOutlined />, label: 'Suppliers' }
      ];

    case 'workshop':
      return [
        { key: '/workshop', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/workshop/jobs', icon: <ToolOutlined />, label: 'Fabrication' }
      ];

    case 'sitevisitor':
      return [
        { key: '/sitevisitor', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/sitevisitor/visits', icon: <EnvironmentOutlined />, label: 'Site Visits' }
      ];

    default:
      return [{ key: '/', icon: <DashboardOutlined />, label: 'Dashboard' }];
  }
};

const RoleLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuthStore();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileDrawerOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = getRoleMenuConfig(role || 'admin');

  // Match active item
  const selectedKey =
    menuItems.find((m) => m.key === location.pathname || (m.key !== `/${role}` && location.pathname.startsWith(m.key)))?.key ||
    location.pathname;

  const currentItem = menuItems.find((m) => m.key === selectedKey);
  const pageTitle = currentItem?.label || 'Workspace';
  const sectionName = roleDepartmentTitles[role] || 'Enterprise';

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const userDropdownItems = [
    {
      key: 'user-header',
      label: (
        <div style={{ padding: '4px 8px' }}>
          <div style={{ fontWeight: 600, color: '#111827' }}>{user?.name || 'Staff User'}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{user?.email}</div>
        </div>
      ),
      disabled: true
    },
    { type: 'divider' },
    {
      key: 'signout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Sign Out',
      onClick: handleLogout
    }
  ];

  const sidebarContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#081a36' }}>
      <div>
        {/* LOGO AREA */}
        <div
          style={{
            height: 60,
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            cursor: 'pointer',
            background: 'rgba(0, 0, 0, 0.15)'
          }}
          onClick={() => {
            navigate(menuItems[0]?.key || '/');
            if (isMobile) setMobileDrawerOpen(false);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!collapsed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src="/logos/iroofing_wordmark_white_small.png"
                  alt="iRoofing"
                  style={{ height: 26, objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #c9940a 0%, #a17304 100%)',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: '-0.02em',
                  boxShadow: '0 2px 6px rgba(201, 148, 10, 0.25)'
                }}
              >
                I
              </div>
            )}
          </div>
        </div>

        {/* SECTION LABEL */}
        {!collapsed && (
          <div
            style={{
              padding: '16px 20px 6px 20px',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'rgba(255, 255, 255, 0.35)'
            }}
          >
            Workspace Modules
          </div>
        )}

        {/* NAVIGATION */}
        <div style={{ padding: '4px 6px' }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => {
              navigate(key);
              if (isMobile) setMobileDrawerOpen(false);
            }}
            style={{
              background: 'transparent',
              borderRight: 0
            }}
          />
        </div>
      </div>

      {/* USER BLOCK */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <Avatar
            size={32}
            style={{
              background: '#c9940a',
              color: '#ffffff',
              fontWeight: 700,
              flexShrink: 0,
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              fontSize: 12
            }}
          >
            {userInitials}
          </Avatar>
          {!collapsed && (
            <div style={{ overflow: 'hidden', lineHeight: 1.25 }}>
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user?.name || 'Staff User'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.10)',
                    color: 'rgba(255, 255, 255, 0.75)',
                    padding: '1px 5px',
                    borderRadius: 3,
                    fontSize: 9.5,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  {user?.role || role}
                </span>
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            title="Sign Out"
            style={{
              color: 'rgba(255,255,255,0.45)',
              padding: 4,
              fontSize: 14
            }}
            className="sidebar-logout-btn"
          />
        )}
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          collapsedWidth={64}
          style={{
            background: '#081a36',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            zIndex: 100,
            borderRight: '1px solid rgba(255, 255, 255, 0.07)'
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* MOBILE DRAWER */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          styles={{ body: { padding: 0, background: '#081a36' } }}
          width={240}
          closable={false}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Layout style={{ background: '#f8fafc' }}>
        {/* TOP HEADER */}
        <Header
          style={{
            height: 58,
            lineHeight: 'normal',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
        >
          {/* LEFT: Breadcrumb + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileDrawerOpen(true)}
                style={{ fontSize: 16, color: '#374151', padding: '4px 8px' }}
              />
            ) : (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: 16, color: '#64748b', padding: '4px 8px' }}
              />
            )}

            <div style={{ lineHeight: 1.25 }}>
              <Breadcrumb
                items={[
                  { title: <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{sectionName}</span> },
                  { title: <span style={{ fontSize: 11, color: '#0f172a', fontWeight: 600 }}>{pageTitle}</span> }
                ]}
                style={{ fontSize: 11, marginBottom: 2 }}
              />
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {pageTitle}
              </div>
            </div>
          </div>

          {/* RIGHT: Actions & User */}
          <Space size={16} align="center" style={{ lineHeight: 1 }}>
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ color: '#64748b', fontSize: 16 }}
              aria-label="Notifications"
            />

            <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />

            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" arrow>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <Avatar
                  size={32}
                  style={{
                    background: '#0b2e59',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 12,
                    border: '1px solid rgba(11, 46, 89, 0.2)'
                  }}
                >
                  {userInitials}
                </Avatar>
                {!isMobile && (
                  <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                      {user?.name || 'Staff User'}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>
                      {user?.role || role}
                    </div>
                  </div>
                )}
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* CONTENT AREA */}
        <Content
          style={{
            background: '#f8fafc',
            padding: '24px 28px',
            overflowY: 'auto',
            minHeight: 'calc(100vh - 58px)'
          }}
        >
          <div style={{ maxWidth: 1440, margin: '0 auto' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>

      <style>{`
        .sidebar-logout-btn:hover {
          color: #ef4444 !important;
        }
        .ant-menu-dark .ant-menu-item-selected {
          border-left: 3px solid #c9940a !important;
          background: linear-gradient(90deg, rgba(201, 148, 10, 0.2) 0%, rgba(201, 148, 10, 0.04) 100%) !important;
        }
      `}</style>
    </Layout>
  );
};

export default RoleLayout;
