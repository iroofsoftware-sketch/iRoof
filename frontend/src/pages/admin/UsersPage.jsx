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
  Avatar,
  Switch,
  Popconfirm,
  message
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { Option } = Select;

const ROLE_CONFIG = {
  admin: { bg: '#dbeafe', color: '#1e40af', label: 'Admin' },
  sales: { bg: '#fce7f3', color: '#9d174d', label: 'Sales' },
  accounts: { bg: '#d1fae5', color: '#065f46', label: 'Accounts' },
  design: { bg: '#ede9fe', color: '#5b21b6', label: 'Design' },
  projectmanager: { bg: '#ffedd5', color: '#c2410c', label: 'Project Manager' },
  purchase: { bg: '#cffafe', color: '#155e75', label: 'Purchase' },
  workshop: { bg: '#fef9c3', color: '#854d0e', label: 'Workshop' },
  sitevisitor: { bg: '#f1f5f9', color: '#475569', label: 'Site Visitor' }
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const handleOpenAddModal = () => {
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
        const payload = {
          name: values.name,
          email: values.email,
          role: values.role,
          isActive: values.isActive
        };
        const response = await api.put(`/admin/users/${editingUser._id}`, payload);
        message.success(response.data?.message || 'User updated successfully');
      } else {
        const response = await api.post('/admin/users', {
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
          isActive: values.isActive !== undefined ? values.isActive : true
        });
        message.success(response.data?.message || 'User created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('Save user error:', error);
      message.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      message.success('User deleted successfully');
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      // If delete fails, attempt toggle inactive
      try {
        await api.patch(`/admin/users/${userId}/toggle`);
        message.info('User deactivated');
        fetchUsers();
      } catch (err) {
        message.error('Failed to remove user');
      }
    }
  };

  // Filter logic
  const isFiltered = searchQuery.trim() !== '' || roleFilter !== 'all' || statusFilter !== 'all';
  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery.trim() ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.isActive) ||
      (statusFilter === 'inactive' && !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns = [
    {
      title: 'USER',
      key: 'user',
      render: (_, record) => {
        const initials = record.name
          ? record.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : 'U';

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar
              size={34}
              style={{
                backgroundColor: '#c9940a',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 12
              }}
            >
              {initials}
            </Avatar>
            <div>
              <div style={{ fontWeight: 500, color: '#111827', fontSize: 13 }}>{record.name}</div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>{record.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      title: 'ROLE',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const cfg = ROLE_CONFIG[role] || { bg: '#f1f5f9', color: '#475569', label: role };
        return (
          <Tag
            bordered={false}
            style={{
              backgroundColor: cfg.bg,
              color: cfg.color,
              fontWeight: 500,
              fontSize: 11,
              borderRadius: 4,
              padding: '2px 8px',
              margin: 0
            }}
          >
            {cfg.label}
          </Tag>
        );
      }
    },
    {
      title: 'STATUS',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: isActive ? '#15803d' : '#9ca3af'
            }}
          />
          <span style={{ color: isActive ? '#15803d' : '#6b7280' }}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </span>
      )
    },
    {
      title: 'CREATED',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) => (
        <span style={{ color: '#6b7280', fontSize: 12 }}>
          {val
            ? new Date(val).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            : '—'}
        </span>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ color: '#0b315d' }} />}
            onClick={() => handleOpenEditModal(record)}
          />
          {currentAdmin?._id !== record._id && (
            <Popconfirm
              title="Delete user account?"
              description={`Permanently remove ${record.name}?`}
              onConfirm={() => handleDeleteUser(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* ── HEADER ROW ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage access and roles for all staff</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddModal}>
            Add User
          </Button>
        </Space>
      </div>

      {/* ── FILTER BAR ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dde3ea',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <Input
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          placeholder="Search by name, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{ width: 260 }}
        />

        <Select
          value={roleFilter}
          onChange={(val) => setRoleFilter(val)}
          style={{ width: 180 }}
        >
          <Option value="all">All Roles</Option>
          {Object.entries(ROLE_CONFIG).map(([key, val]) => (
            <Option key={key} value={key}>
              {val.label}
            </Option>
          ))}
        </Select>

        <Select
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          style={{ width: 140 }}
        >
          <Option value="all">All Status</Option>
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>

        {isFiltered && (
          <Button type="link" onClick={clearFilters} style={{ color: '#6b7280', fontSize: 13, padding: 0 }}>
            Clear filters
          </Button>
        )}
      </div>

      {/* ── TABLE CONTAINER ── */}
      <div className="content-card">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
        />
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        width={480}
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
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="e.g. Rahul Sharma" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Username / Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Enter a valid email address' }
            ]}
          >
            <Input placeholder="e.g. rahul@iroof.com" />
          </Form.Item>

          {/* Password only on Add User */}
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password placeholder="Min 6 characters" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role">
              {Object.entries(ROLE_CONFIG).map(([key, val]) => (
                <Option key={key} value={key}>
                  {val.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid #dde3ea'
            }}
          >
            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
