import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Tabs, Avatar, Tag, Divider, message, Space, Alert } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  IdcardOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  KeyOutlined,
  SaveOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const roleLabels = {
  admin: { title: 'System Administrator', color: 'volcano', desc: 'Full administrative access across all operational modules, masters and finance.' },
  sales: { title: 'Sales & Estimator', color: 'blue', desc: 'Enquiries, customer pipeline, 16-brochure structural estimation and quotations.' },
  accounts: { title: 'Accounts & Finance', color: 'green', desc: 'Commercial quotation approvals, customer ledger, tax invoices, and receivables.' },
  design: { title: 'Design & CAD Engineer', color: 'cyan', desc: 'CAD structural layouts, drawing submissions, and revision management.' },
  projectmanager: { title: 'Project Manager', color: 'purple', desc: 'Work order lifecycle, site surveys, erection monitoring, and gate approvals.' },
  purchase: { title: 'Procurement Officer', color: 'orange', desc: 'Purchase requisitions, supplier PO generation, and delivery tracking.' },
  workshop: { title: 'Workshop Incharge', color: 'magenta', desc: 'Fabrication floor jobs, cutting lists, and production milestone tracking.' },
  sitevisitor: { title: 'Field Site Surveyor', color: 'geekblue', desc: 'Physical site measurements, site GPS coordinates, foundation and anchor checks.' }
};

const UserProfileModal = ({ open, onClose }) => {
  const { user, setUser } = useAuthStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (open && user) {
      profileForm.setFieldsValue({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        designation: user.designation || ''
      });
      passwordForm.resetFields();
    }
  }, [open, user, profileForm, passwordForm]);

  const handleUpdateProfile = async (values) => {
    try {
      setSavingProfile(true);
      const res = await api.put('/auth/profile', values);
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
        message.success('Profile details updated successfully');
        onClose();
      }
    } catch (err) {
      console.error('Update profile failed:', err);
      message.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New password and confirm password do not match');
      return;
    }
    try {
      setSavingPassword(true);
      const res = await api.put('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      if (res.data?.success) {
        message.success('Password updated successfully');
        passwordForm.resetFields();
        onClose();
      }
    } catch (err) {
      console.error('Change password failed:', err);
      message.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const roleMeta = roleLabels[user?.role] || {
    title: user?.role || 'Staff Member',
    color: 'default',
    desc: 'Authorized staff account for I Roofing operational systems.'
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const items = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined /> Personal Details
        </span>
      ),
      children: (
        <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile} style={{ marginTop: 12 }}>
          {/* Header Preview Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '14px 18px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              marginBottom: 20
            }}
          >
            <Avatar
              size={52}
              style={{
                backgroundColor: '#0b2e59',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 18,
                boxShadow: '0 2px 6px rgba(11, 46, 89, 0.25)'
              }}
            >
              {userInitials}
            </Avatar>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{user?.name || 'Staff User'}</span>
                <Tag color={roleMeta.color} style={{ fontWeight: 600, borderRadius: 4 }}>
                  {roleMeta.title}
                </Tag>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {user?.email} · Member since {user?.createdAt ? dayjs(user.createdAt).format('MMMM YYYY') : '2026'}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 16px' }}>
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="e.g. John Doe" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Official Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Enter a valid email address' }
              ]}
            >
              <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="name@iroofing.in" />
            </Form.Item>

            <Form.Item name="phone" label="Contact Mobile / Phone">
              <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="+91 98765 43210" />
            </Form.Item>

            <Form.Item name="designation" label="Designation / Branch Title">
              <Input prefix={<IdcardOutlined style={{ color: '#94a3b8' }} />} placeholder="e.g. Senior Estimation Engineer" />
            </Form.Item>
          </div>

          <div
            style={{
              padding: '10px 14px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 6,
              fontSize: 12,
              color: '#1e40af',
              marginBottom: 20
            }}
          >
            <strong>Role Permissions:</strong> {roleMeta.desc}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={savingProfile}
              style={{ background: '#0b2e59', borderColor: '#0b2e59' }}
            >
              Save Profile Changes
            </Button>
          </div>
        </Form>
      )
    },
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined /> Security & Password
        </span>
      ),
      children: (
        <Form form={passwordForm} layout="vertical" onFinish={handleUpdatePassword} style={{ marginTop: 12 }}>
          <Alert
            message="Password Requirements"
            description="Use at least 6 characters with a combination of letters and numbers for maximum account security."
            type="info"
            showIcon
            style={{ marginBottom: 18 }}
          />

          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter a new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password prefix={<KeyOutlined style={{ color: '#94a3b8' }} />} placeholder="Enter new password (min. 6 characters)" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                }
              })
            ]}
          >
            <Input.Password prefix={<KeyOutlined style={{ color: '#94a3b8' }} />} placeholder="Re-enter new password" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<CheckCircleOutlined />}
              loading={savingPassword}
              style={{ background: '#0b2e59', borderColor: '#0b2e59' }}
            >
              Update Password
            </Button>
          </div>
        </Form>
      )
    },
    {
      key: 'session',
      label: (
        <span>
          <SafetyCertificateOutlined /> System & Session
        </span>
      ),
      children: (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontSize: 13 }}>Enterprise Organization</span>
              <strong style={{ color: '#0f172a', fontSize: 13 }}>I Roofing Enterprises</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontSize: 13 }}>Assigned Role</span>
              <Tag color={roleMeta.color} style={{ fontWeight: 600 }}>{roleMeta.title}</Tag>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontSize: 13 }}>Authentication Status</span>
              <Tag color="success" icon={<CheckCircleOutlined />}>Active JWT Session</Tag>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', fontSize: 13 }}>Account Created</span>
              <span style={{ color: '#0f172a', fontSize: 13, fontWeight: 500 }} className="tabular-nums">
                {user?.createdAt ? dayjs(user.createdAt).format('DD MMMM YYYY, HH:mm') : '—'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <Button type="primary" onClick={onClose} style={{ background: '#0b2e59', borderColor: '#0b2e59' }}>
              Close
            </Button>
          </div>
        </div>
      )
    }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined style={{ color: '#0b2e59' }} />
          <span>My Profile & Account Settings</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={580}
      destroyOnClose
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </Modal>
  );
};

export default UserProfileModal;
