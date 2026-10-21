import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Typography,
  Card,
  Popconfirm,
  message,
  Switch,
  Avatar,
  Row,
  Col
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  ReloadOutlined,
  UserOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;
const { Option } = Select;

export const ROLES_CONFIG = [
  { key: 'admin', label: 'Admin (Administration)', color: '#ef4444' },
  { key: 'sales', label: 'Sales (Enquiries & Estimates)', color: '#3b82f6' },
  { key: 'accounts', label: 'Accounts (Approvals & Invoices)', color: '#10b981' },
  { key: 'design', label: 'Design (Drawings & BOQ)', color: '#8b5cf6' },
  { key: 'projectmanager', label: 'Project Manager (Sites & Teams)', color: '#f59e0b' },
  { key: 'purchase', label: 'Purchase (POs & Suppliers)', color: '#06b6d4' },
  { key: 'workshop', label: 'Workshop (Fabrication Jobs)', color: '#ec4899' },
  { key: 'sitevisitor', label: 'Site Visitor (Mobile Field Visits)', color: '#6366f1' }
];

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [form] = Form.useForm();
  const currentAdmin = useAuthStore((state) => state.user);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      if (response.data && response.data.users) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error(error.response?.data?.message || 'Failed to load user directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 'sales', isActive: true });
    setModalVisible(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    form.resetFields();
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    setModalVisible(true);
  };

  const handleModalSubmit = async (values) => {
    try {
      if (editingUser) {
        // Edit user
        const payload = {
          name: values.name,
          email: values.email,
          role: values.role,
          isActive: values.isActive
        };
        if (values.password && values.password.trim()) {
          payload.password = values.password.trim();
        }

        const response = await api.put(`/admin/users/${editingUser._id}`, payload);
        message.success(response.data?.message || 'User updated successfully');
      } else {
        // Create user
        const response = await api.post('/admin/users', {
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
          isActive: values.isActive
        });
        message.success(response.data?.message || 'New user created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('Save user error:', error);
      message.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const response = await api.patch(`/admin/users/${user._id}/toggle`);
      message.success(response.data?.message || 'Status updated');
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (error) {
      console.error('Toggle error:', error);
      message.error(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      title: 'User',
      key: 'name',
      render: (_, record) => {
        const roleCfg = ROLES_CONFIG.find((r) => r.key === record.role);
        return (
          <Space>
            <Avatar
              style={{ backgroundColor: roleCfg?.color || '#1677ff' }}
              icon={<UserOutlined />}
            >
              {record.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <div>
              <Text strong style={{ display: 'block' }}>
                {record.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.email}
              </Text>
            </div>
          </Space>
        );
      }
    },
    {
      title: 'Role / Department',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleCfg = ROLES_CONFIG.find((r) => r.key === role);
        return (
          <Tag color={roleCfg?.color || 'blue'} style={{ borderRadius: 6, fontWeight: 500 }}>
            {roleCfg?.label || role}
          </Tag>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => {
        const isSelf = currentAdmin?._id === record._id;
        return (
          <Space orientation="horizontal" size={8}>
            <Tag
              icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}
              color={isActive ? 'success' : 'default'}
              style={{ borderRadius: 6 }}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Tag>
            <Switch
              size="small"
              checked={isActive}
              disabled={isSelf}
              onChange={() => handleToggleActive(record)}
            />
          </Space>
        );
      }
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) => (val ? new Date(val).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : '—')
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditModal(record)}
          >
            Edit
          </Button>
          {currentAdmin?._id !== record._id && (
            <Popconfirm
              title={`${record.isActive ? 'Deactivate' : 'Activate'} user`}
              description={`Are you sure you want to ${record.isActive ? 'deactivate' : 'activate'} ${record.name}?`}
              onConfirm={() => handleToggleActive(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger={record.isActive}>
                {record.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>User Management</Title>
          <Text type="secondary">
            Manage staff accounts and assign permissions across the 8 iRoof departments.
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleOpenCreateModal}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              borderColor: '#2563eb'
            }}
          >
            Create User
          </Button>
        </Space>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          marginBottom: 24
        }}
        bodyStyle={{ padding: 20 }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12} lg={8}>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Select
              value={roleFilter}
              onChange={(val) => setRoleFilter(val)}
              style={{ width: '100%' }}
            >
              <Option value="all">All Roles (8 Departments)</Option>
              {ROLES_CONFIG.map((r) => (
                <Option key={r.key} value={r.key}>
                  {r.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: 'No staff users found' }}
        />
      </Card>

      {/* Create / Edit User Modal */}
      <Modal
        title={editingUser ? `Edit User: ${editingUser.name}` : 'Create New User Account'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter user full name' }]}
          >
            <Input placeholder="e.g. Rahul Sharma" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter an email' },
              { type: 'email', message: 'Enter a valid email' }
            ]}
          >
            <Input placeholder="e.g. rahul@iroof.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
            rules={
              editingUser
                ? [{ min: 6, message: 'Password must be at least 6 characters' }]
                : [
                    { required: true, message: 'Please set an initial password' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]
            }
          >
            <Input.Password placeholder={editingUser ? 'Leave blank to preserve' : 'Min 6 characters'} />
          </Form.Item>

          <Form.Item
            name="role"
            label="Department / Role"
            rules={[{ required: true, message: 'Please assign a role' }]}
          >
            <Select placeholder="Select department role">
              {ROLES_CONFIG.map((r) => (
                <Option key={r.key} value={r.key}>
                  {r.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Account Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingUser ? 'Update User' : 'Create Account'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
