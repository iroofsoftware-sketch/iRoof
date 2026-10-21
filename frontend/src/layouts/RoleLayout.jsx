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
  SearchOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined
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
        { key: '/sales/enquiries', icon: <FileTextOutlined />, label: 'Enquiries' },
        { key: '/sales/estimates/new', icon: <CalculatorOutlined />, label: 'New Estimate' },
        { key: '/sales/estimates', icon: <FolderOpenOutlined />, label: 'Saved Estimates' }
      ];

    case 'accounts':
      return [
        { key: '/accounts', icon: <DashboardOutlined />, label: 'Dashboard' },
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* LOGO AREA */}
        <div
          style={{
            height: 56,
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'pointer'
          }}
          onClick={() => {
            navigate(menuItems[0]?.key || '/');
            if (isMobile) setMobileDrawerOpen(false);
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#c9940a' }}>I </span>
            <span>Roof</span>
          </div>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.10)',
              color: 'rgba(255, 255, 255, 0.70)',
              borderRadius: 4,
              padding: '1px 6px',
              fontSize: 10,
              marginLeft: 8,
              fontWeight: 500
            }}
          >
            v2
          </span>
        </div>

        {/* NAVIGATION */}
        <div style={{ padding: '8px 0' }}>
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
              background: '#0b315d',
              borderRight: 0
            }}
          />
        </div>
      </div>

      {/* USER BLOCK */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.10)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <Avatar size={32} style={{ background: '#c9940a', color: '#ffffff', fontWeight: 600, flexShrink: 0 }}>
            {userInitials}
          </Avatar>
          {!collapsed && (
            <div style={{ overflow: 'hidden', lineHeight: 1.3 }}>
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user?.name || 'Staff User'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.50)', fontSize: 11, textTransform: 'capitalize' }}>
                {user?.role || role}
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              color: 'rgba(255,255,255,0.40)',
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
    <Layout style={{ minHeight: '100vh', background: '#f3f6f9' }}>
      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          collapsedWidth={60}
          style={{
            background: '#0b315d',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            zIndex: 100
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
          styles={{ body: { padding: 0, background: '#0b315d' } }}
          width={240}
          closable={false}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Layout style={{ background: '#f3f6f9' }}>
        {/* TOP HEADER */}
        <Header
          style={{
            height: 56,
            background: '#ffffff',
            borderBottom: '1px solid #dde3ea',
            padding: '0 24px',
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
                style={{ fontSize: 16, color: '#6b7280', padding: '4px 8px' }}
              />
            )}

            <div style={{ lineHeight: 1.2 }}>
              <Breadcrumb
                items={[
                  { title: <span style={{ fontSize: 11, color: '#6b7280' }}>{sectionName}</span> },
                  { title: <span style={{ fontSize: 11, color: '#111827', fontWeight: 500 }}>{pageTitle}</span> }
                ]}
                style={{ fontSize: 11, marginBottom: 2 }}
              />
              <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>
                {pageTitle}
              </div>
            </div>
          </div>

          {/* RIGHT: Actions & User */}
          <Space size={14} align="center">
            <Button
              type="text"
              icon={<SearchOutlined />}
              style={{ color: '#6b7280', fontSize: 16 }}
              aria-label="Search"
            />
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ color: '#6b7280', fontSize: 16 }}
              aria-label="Notifications"
            />

            <div style={{ width: 1, height: 20, background: '#dde3ea' }} />

            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" arrow>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <Avatar size={32} style={{ background: '#0b315d', color: '#ffffff', fontWeight: 600 }}>
                  {userInitials}
                </Avatar>
                {!isMobile && (
                  <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                      {user?.name || 'Staff User'}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'capitalize' }}>
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
            background: '#f3f6f9',
            padding: '24px',
            overflowY: 'auto',
            minHeight: 'calc(100vh - 56px)'
          }}
        >
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
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
        }
      `}</style>
    </Layout>
  );
};

export default RoleLayout;
