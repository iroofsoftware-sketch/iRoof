import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Tag, Dropdown, Space, Typography } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  TeamOutlined,
  CalculatorOutlined,
  FormOutlined,
  DollarOutlined,
  FileImageOutlined,
  ProjectOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const roleBadgeColors = {
  admin: '#ef4444',
  sales: '#3b82f6',
  accounts: '#10b981',
  design: '#8b5cf6',
  projectmanager: '#f59e0b',
  purchase: '#06b6d4',
  workshop: '#ec4899',
  sitevisitor: '#6366f1'
};

const roleDepartmentNames = {
  admin: 'Administration',
  sales: 'Sales & Estimates',
  accounts: 'Accounts & Finance',
  design: 'Design & Engineering',
  projectmanager: 'Project Management',
  purchase: 'Purchase & Procurement',
  workshop: 'Workshop & Fabrication',
  sitevisitor: 'Site Visitor'
};

const getRoleMenuItems = (role) => {
  switch (role) {
    case 'admin':
      return [
        { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/admin/users', icon: <TeamOutlined />, label: 'User Management' },
        { key: '/admin/rates', icon: <CalculatorOutlined />, label: 'Rate & Section Masters' },
        { key: '/sales/enquiries', icon: <FormOutlined />, label: 'Sales Enquiries' },
        { key: '/sales/estimates/new', icon: <CalculatorOutlined />, label: 'Estimation Engine' }
      ];

    case 'sales':
      return [
        { key: '/sales/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/sales/enquiries', icon: <FormOutlined />, label: 'Enquiries' },
        { key: '/sales/estimates/new', icon: <CalculatorOutlined />, label: 'New Estimation' },
        { key: '/sales/estimates', icon: <CalculatorOutlined />, label: 'Saved Estimates' }
      ];

    case 'accounts':
      return [
        { key: '/accounts/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/accounts/approvals', icon: <DollarOutlined />, label: 'Estimate Approvals' }
      ];

    case 'design':
      return [
        { key: '/design/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/design/drawings', icon: <FileImageOutlined />, label: 'Drawings & BOQ' }
      ];

    case 'projectmanager':
      return [
        { key: '/projectmanager/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/projectmanager/projects', icon: <ProjectOutlined />, label: 'Site Visits & Teams' }
      ];

    case 'purchase':
      return [
        { key: '/purchase/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/purchase/orders', icon: <ShoppingCartOutlined />, label: 'Purchase Orders & Suppliers' }
      ];

    case 'workshop':
      return [
        { key: '/workshop/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/workshop/jobs', icon: <ToolOutlined />, label: 'Fabrication Jobs' }
      ];

    case 'sitevisitor':
      return [
        { key: '/sitevisitor/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/sitevisitor/visits', icon: <MobileOutlined />, label: 'Field Site Visits' }
      ];

    default:
      return [{ key: '/', icon: <DashboardOutlined />, label: 'Home' }];
  }
};

const RoleLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = getRoleMenuItems(role || 'admin');

  // Select current path or closest match
  const selectedKey = menuItems.find((m) => location.pathname.startsWith(m.key))?.key || location.pathname;

  const userDropdownItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 8px' }}>
          <div style={{ fontWeight: 600 }}>{user?.name || 'Logged In User'}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{user?.email}</div>
        </div>
      ),
      disabled: true
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Sign Out',
      onClick: handleLogout
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          background: '#0f172a',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
          zIndex: 10
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0 16px' : '0 20px',
            gap: 12,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer'
          }}
          onClick={() => navigate(menuItems[0]?.key || '/')}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
              flexShrink: 0
            }}
          >
            <SafetyCertificateOutlined />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
                iRoof <span style={{ color: '#38bdf8' }}>v2</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 11, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                I Roofing Enterprises
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 12px 8px 12px' }}>
          {!collapsed && (
            <div style={{ padding: '0 8px 12px 8px' }}>
              <Text style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                {roleDepartmentNames[role] || 'Department'}
              </Text>
            </div>
          )}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ background: 'transparent', borderRight: 0 }}
          />
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#ffffff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            height: 64
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
            <div>
              <Text strong style={{ fontSize: 16, color: '#1e293b' }}>
                {roleDepartmentNames[role] || 'iRoof System'}
              </Text>
            </div>
          </div>

          <Space orientation="horizontal" size={16}>
            <Tag
              color={roleBadgeColors[role] || 'blue'}
              style={{
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: 11,
                padding: '2px 10px',
                borderRadius: 12
              }}
            >
              {role || 'Role'}
            </Tag>

            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" arrow>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 8,
                  transition: 'background 0.2s'
                }}
              >
                <Avatar
                  style={{
                    backgroundColor: roleBadgeColors[role] || '#1677ff',
                    verticalAlign: 'middle'
                  }}
                  icon={<UserOutlined />}
                >
                  {user?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                    {user?.name || 'User'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {user?.role}
                  </div>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            padding: '24px',
            background: '#f8fafc',
            minHeight: 280,
            overflowY: 'auto'
          }}
        >
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default RoleLayout;
