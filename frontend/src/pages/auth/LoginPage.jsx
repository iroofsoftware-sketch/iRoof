import React, { useState } from 'react';
import { Form, Input, Button, Alert, message, Select } from 'antd';
import { UserOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export const roleHomePaths = {
  admin: '/admin',
  sales: '/sales',
  accounts: '/accounts',
  design: '/design',
  projectmanager: '/projectmanager',
  purchase: '/purchase',
  workshop: '/workshop',
  sitevisitor: '/sitevisitor'
};

const DEMO_ROLES = [
  { value: 'admin@iroofing.com', label: 'Admin (System Admin)', pass: 'Admin@123' },
  { value: 'sales@iroofing.com', label: 'Sales (Estimations & Leads)', pass: 'Sales@123' },
  { value: 'accounts@iroofing.com', label: 'Accounts (Finance & Invoicing)', pass: 'Accounts@123' },
  { value: 'design@iroofing.com', label: 'Design (Structural CAD)', pass: 'Design@123' },
  { value: 'pm@iroofing.com', label: 'Project Manager (BOM & Operations)', pass: 'Pm@123' },
  { value: 'purchase@iroofing.com', label: 'Purchase (Procurement & POs)', pass: 'Purchase@123' },
  { value: 'workshop@iroofing.com', label: 'Workshop (Fabrication Lead)', pass: 'Workshop@123' },
  { value: 'sitevisitor@iroofing.com', label: 'Site Inspector (Site Operations)', pass: 'Site@123' }
];

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.post('/auth/login', {
        email: values.email.trim(),
        password: values.password
      });

      if (response.data && response.data.token) {
        const { user, token } = response.data;
        login(user, token);
        message.success(`Signed in as ${user.name}`);
        const destination = roleHomePaths[user.role] || `/${user.role}`;
        navigate(destination, { replace: true });
      } else {
        setErrorMessage('Unexpected response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        'Authentication server unavailable. Please check backend connection.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (email) => {
    const roleItem = DEMO_ROLES.find((r) => r.value === email);
    if (roleItem) {
      form.setFieldsValue({
        email: roleItem.value,
        password: roleItem.pass
      });
      setErrorMessage(null);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        background: '#f8fafc',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* ── LEFT ARCHITECTURAL SHOWCASE ── */}
      <div
        className="login-left-brand"
        style={{
          width: 460,
          minWidth: 460,
          background: '#081a36',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 48px',
          color: '#ffffff',
          position: 'relative'
        }}
      >
        {/* Brand Area */}
        <div>
          <img
            src="/logos/iroofing_wordmark_white.png"
            alt="iRoofing Enterprises"
            style={{ maxHeight: 42, width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />

          <div
            style={{
              width: 36,
              height: 2,
              background: '#c9940a',
              margin: '32px 0 20px 0',
              borderRadius: 2
            }}
          />

          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.35,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: 0
            }}
          >
            Truss-Less Self-Supported Arch Roofing Systems
          </h1>

          <p
            style={{
              fontSize: 13.5,
              color: 'rgba(255, 255, 255, 0.65)',
              lineHeight: 1.6,
              marginTop: 12,
              marginRight: 20
            }}
          >
            Enterprise console for commercial estimations, project execution, procurement, and fabrication workflows.
          </p>
        </div>

        {/* Minimal Curved Arch Architectural Line Art */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
          <svg
            width="220"
            height="110"
            viewBox="0 0 220 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.25 }}
          >
            {/* Arch Curve */}
            <path
              d="M 15 80 Q 110 15 205 80"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
            />
            {/* Horizontal Tie Chord */}
            <line x1="15" y1="80" x2="205" y2="80" stroke="#c9940a" strokeWidth="1" />
            {/* Base Columns */}
            <line x1="25" y1="80" x2="25" y2="105" stroke="#ffffff" strokeWidth="2" />
            <line x1="195" y1="80" x2="195" y2="105" stroke="#ffffff" strokeWidth="2" />
            {/* Foundation Plates */}
            <line x1="15" y1="105" x2="35" y2="105" stroke="#c9940a" strokeWidth="2" />
            <line x1="185" y1="105" x2="205" y2="105" stroke="#c9940a" strokeWidth="2" />
          </svg>
        </div>

        {/* Brand Bottom */}
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.45)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>I Roofing Enterprises</span>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255, 255, 255, 0.6)' }}>
            v2.0 PRO
          </span>
        </div>
      </div>

      {/* ── RIGHT CLEAN LOGIN PANEL ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 24px',
          background: '#f8fafc'
        }}
      >
        {/* Mobile Header Bar */}
        <div
          className="login-mobile-bar"
          style={{
            display: 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            background: '#081a36',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <img
            src="/logos/iroofing_wordmark_white_small.png"
            alt="iRoofing"
            style={{ maxHeight: 28, objectFit: 'contain' }}
          />
        </div>

        {/* Clean Login Card */}
        <div
          style={{
            width: '100%',
            maxWidth: 400,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '36px 32px',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)'
          }}
        >
          <div style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Sign In
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 6, margin: 0 }}>
              Access the operations console with your credentials.
            </p>
          </div>

          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage(null)}
              style={{ marginBottom: 20, borderRadius: 6, fontSize: 13 }}
            />
          )}

          <Form
            form={form}
            name="enterpriseLogin"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
              style={{ marginBottom: 18 }}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#94a3b8', marginRight: 6 }} />}
                placeholder="Work email"
                style={{ height: 42, borderRadius: 6, fontSize: 13.5 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
              style={{ marginBottom: 22 }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94a3b8', marginRight: 6 }} />}
                placeholder="Password"
                style={{ height: 42, borderRadius: 6, fontSize: 13.5 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: 42,
                  background: '#0b2e59',
                  borderColor: '#0b2e59',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: '0 1px 2px rgba(11, 46, 89, 0.15)'
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          {/* Clean Quick Role Selector Dropdown */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
              Quick switch account:
            </div>
            <Select
              placeholder="Select account..."
              style={{ width: '100%' }}
              size="small"
              onChange={handleSelectRole}
              options={DEMO_ROLES}
              allowClear
            />
          </div>
        </div>

        {/* Minimal Footer */}
        <div style={{ marginTop: 24, fontSize: 11.5, color: '#94a3b8' }}>
          Protected Enterprise System · iRoofing © 2026
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .login-left-brand {
            display: none !important;
          }
          .login-mobile-bar {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
