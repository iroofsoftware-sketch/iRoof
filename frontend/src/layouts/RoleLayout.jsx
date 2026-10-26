import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Drawer,
  Breadcrumb,
  Badge,
  Input,
  Modal,
  List,
  Tag,
  Empty,
  Spin,
  Select
} from 'antd';
import axios from '../services/api';
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
  ContactsOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  RightOutlined,
  EditOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAuthStore } from '../store/authStore';
import { notificationService } from '../services/notificationService';
import { searchService } from '../services/searchService';
import UserProfileModal from '../components/common/UserProfileModal';

dayjs.extend(relativeTime);

const { Header, Sider, Content, Footer } = Layout;

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
        { key: '/sales/estimates/new', icon: <CalculatorOutlined />, label: 'New Estimate' },
        { key: '/admin/estimates', icon: <FolderOpenOutlined />, label: 'All Estimates' }
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
        { key: '/purchase/suppliers', icon: <ShopOutlined />, label: 'Suppliers' }
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

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Quick Search State
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // User Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuthStore();

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  // Global Ctrl+K / Cmd+K key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced Search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchService.globalSearch(searchQuery);
        if (res && res.data) setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await notificationService.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      setNotificationDrawerOpen(false);
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

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

  // Determine active department section. If user is Admin, dynamically adapt based on current path
  const activeRoleSection = (role === 'admin')
    ? (location.pathname.startsWith('/sales') ? 'sales'
      : location.pathname.startsWith('/accounts') ? 'accounts'
      : location.pathname.startsWith('/design') ? 'design'
      : location.pathname.startsWith('/projectmanager') ? 'projectmanager'
      : location.pathname.startsWith('/purchase') ? 'purchase'
      : location.pathname.startsWith('/workshop') ? 'workshop'
      : location.pathname.startsWith('/sitevisitor') ? 'sitevisitor'
      : 'admin')
    : role;

  const menuItems = getRoleMenuConfig(activeRoleSection || 'admin');

  // Match active item
  const selectedKey =
    menuItems.find((m) => m.key === location.pathname || (m.key !== `/${activeRoleSection}` && location.pathname.startsWith(m.key)))?.key ||
    location.pathname;

  const currentItem = menuItems.find((m) => m.key === selectedKey);
  const pageTitle = currentItem?.label || 'Workspace';
  const sectionName = roleDepartmentTitles[activeRoleSection] || 'Enterprise';

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
        <div style={{ padding: '6px 8px' }}>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13.5 }}>{user?.name || 'Staff User'}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{user?.email}</div>
          {user?.designation && <div style={{ fontSize: 11, color: '#0b2e59', fontWeight: 600, marginTop: 2 }}>{user.designation}</div>}
        </div>
      ),
      disabled: true
    },
    { type: 'divider' },
    {
      key: 'edit-profile',
      icon: <EditOutlined style={{ color: '#0b2e59' }} />,
      label: <span style={{ fontWeight: 600 }}>My Profile & Security</span>,
      onClick: () => setProfileModalOpen(true)
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

      {/* USER BLOCK & FOOTER */}
      <div>
        <div
          style={{
            padding: '12px 14px 12px 16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.18)'
          }}
        >
          <div
            onClick={() => setProfileModalOpen(true)}
            title="Click to edit profile & security"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              overflow: 'hidden',
              cursor: 'pointer',
              flex: 1,
              borderRadius: 6,
              padding: '2px 4px',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Avatar
              size={32}
              style={{
                background: '#c9940a',
                color: '#ffffff',
                fontWeight: 700,
                flexShrink: 0,
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => setProfileModalOpen(true)}
                title="Edit Profile & Security"
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  padding: 4,
                  fontSize: 13
                }}
                className="sidebar-logout-btn"
              />
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
            </div>
          )}
        </div>

        {!collapsed && (
          <div
            style={{
              padding: '6px 16px 10px',
              fontSize: 10.5,
              color: 'rgba(255, 255, 255, 0.35)',
              borderTop: '1px solid rgba(255, 255, 255, 0.04)',
              background: 'rgba(0, 0, 0, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4
            }}
          >
            <span>I Roofing Enterprises</span>
            <span style={{ color: '#c9940a', fontWeight: 600 }}>v2.0</span>
          </div>
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

            {/* Admin Department Switcher */}
            {role === 'admin' && !isMobile && (
              <div style={{ marginLeft: 16, paddingLeft: 16, borderLeft: '1px solid #e2e8f0' }}>
                <Select
                  size="small"
                  value={activeRoleSection}
                  onChange={(dept) => navigate(`/${dept}`)}
                  style={{ width: 180, fontSize: 12 }}
                  options={[
                    { value: 'admin', label: 'Administration Console' },
                    { value: 'sales', label: 'Sales & Estimations' },
                    { value: 'accounts', label: 'Accounts & Finance' },
                    { value: 'projectmanager', label: 'Project Management' },
                    { value: 'design', label: 'Design & Drawings' },
                    { value: 'purchase', label: 'Purchase & Orders' },
                    { value: 'workshop', label: 'Workshop & Jobs' },
                    { value: 'sitevisitor', label: 'Site Operations' }
                  ]}
                />
              </div>
            )}
          </div>

          {/* RIGHT: Actions & User */}
          <Space size={14} align="center" style={{ lineHeight: 1 }}>
            {/* Quick Search Button */}
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => setSearchModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 12.5,
                color: '#64748b',
                height: 32
              }}
            >
              <span className="search-hotkey-label">Quick Search</span>
              <kbd
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 4,
                  padding: '1px 5px',
                  fontSize: 10,
                  color: '#475569',
                  fontWeight: 600
                }}
              >
                Ctrl K
              </kbd>
            </Button>

            {/* Notifications Bell with Badge */}
            <Badge count={unreadCount} size="small" offset={[-2, 6]}>
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => setNotificationDrawerOpen(true)}
                style={{ color: '#64748b', fontSize: 16 }}
                aria-label="Notifications"
              />
            </Badge>

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
            minHeight: 'calc(100vh - 105px)'
          }}
        >
          <div style={{ maxWidth: 1440, margin: '0 auto' }}>
            <Outlet />
          </div>
        </Content>

        {/* FOOTER */}
        <Footer
          style={{
            background: '#f8fafc',
            textAlign: 'center',
            padding: '12px 28px 18px',
            fontSize: 11.5,
            color: '#94a3b8',
            borderTop: '1px solid #edf2f7'
          }}
        >
          <span>I Roofing Enterprises · Architectural Roofing Systems © 2026</span>
        </Footer>
      </Layout>

      {/* ── INTER-DEPARTMENTAL NOTIFICATION DRAWER ── */}
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Notifications ({unreadCount} unread)</span>
            {unreadCount > 0 && (
              <Button type="link" size="small" onClick={handleMarkAllRead} style={{ padding: 0 }}>
                Mark all read
              </Button>
            )}
          </div>
        }
        placement="right"
        width={380}
        onClose={() => setNotificationDrawerOpen(false)}
        open={notificationDrawerOpen}
      >
        {notifications.length === 0 ? (
          <Empty description="No notifications" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 40 }} />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <div
                key={item._id}
                onClick={() => handleNotificationClick(item)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  marginBottom: 8,
                  cursor: 'pointer',
                  background: item.isRead ? '#ffffff' : '#f0fdf4',
                  border: item.isRead ? '1px solid #f1f5f9' : '1px solid #bbf7d0',
                  transition: 'all 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontWeight: item.isRead ? 500 : 700, fontSize: 13, color: '#0f172a' }}>
                      {item.title}
                    </div>
                    {!item.isRead && (
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', flexShrink: 0, marginTop: 5 }} />
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 3 }}>
                    {item.message}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
                    <span>{item.refCode && <Tag color="blue" style={{ fontSize: 10, padding: '0 4px' }}>{item.refCode}</Tag>}</span>
                    <span>{dayjs(item.createdAt).fromNow()}</span>
                  </div>
                </div>
              </div>
            )}
          />
        )}
      </Drawer>

      {/* ── GLOBAL SEARCH COMMAND PALETTE MODAL (CTRL+K) ── */}
      <Modal
        open={searchModalOpen}
        onCancel={() => {
          setSearchModalOpen(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
        footer={null}
        width={560}
        style={{ top: 80 }}
        styles={{ body: { padding: 0 } }}
        destroyOnClose
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8', fontSize: 16, marginRight: 6 }} />}
            placeholder="Search Work Orders (WO-...), Customers, Estimates, Invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bordered={false}
            autoFocus
            style={{ fontSize: 14 }}
            allowClear
          />
        </div>

        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '10px 14px' }}>
          {searching ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <Spin size="small" />
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Searching records...</div>
            </div>
          ) : searchResults.length > 0 ? (
            <List
              dataSource={searchResults}
              renderItem={(item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSearchModalOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    navigate(item.link);
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    marginBottom: 4
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag
                        color={
                          item.type === 'workorder'
                            ? 'blue'
                            : item.type === 'customer'
                            ? 'green'
                            : item.type === 'invoice'
                            ? 'purple'
                            : 'gold'
                        }
                        style={{ fontSize: 10, margin: 0 }}
                      >
                        {item.tag}
                      </Tag>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{item.title}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, paddingLeft: 2 }}>
                      {item.subtitle}
                    </div>
                  </div>
                  <RightOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
                </div>
              )}
            />
          ) : searchQuery.trim().length >= 2 ? (
            <Empty
              description={`No records found matching "${searchQuery}"`}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '20px 0' }}
            />
          ) : (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94a3b8', fontSize: 12.5 }}>
              Type at least 2 characters to search across all operational modules.
            </div>
          )}
        </div>
        <div
          style={{
            padding: '8px 16px',
            background: '#f8fafc',
            borderTop: '1px solid #edf2f7',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#94a3b8',
            borderRadius: '0 0 8px 8px'
          }}
        >
          <span>Quick Navigation</span>
          <span>Press ESC to close</span>
        </div>
      </Modal>

      {/* ── USER PROFILE & SECURITY MODAL ── */}
      <UserProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} />

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
