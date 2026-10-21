import React, { useState } from 'react';
import { Form, Input, Button, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
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

const ROLES_LIST = [
  'Admin',
  'Sales',
  'Accounts',
  'Design',
  'Project Manager',
  'Purchase',
  'Workshop',
  'Site Visitor'
];

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.post('/auth/login', {
        email: values.email,
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
      console.error('Login failure:', err);
      const msg =
        err.response?.data?.message ||
        'Unable to connect to authentication server. Please check backend connection.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', width: '100%' }}>
      {/* ── LEFT COLUMN (Enterprise Navy Branding) ── */}
      <div
        style={{
          width: 420,
          minWidth: 420,
          background: '#0b315d',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#ffffff'
        }}
        className="login-left-col"
      >
        {/* TOP: Brand */}
        <div style={{ padding: '40px 40px 0 40px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
            <span style={{ color: '#c9940a' }}>I </span>
            <span style={{ color: '#ffffff' }}>Roofing</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 400, opacity: 0.7, marginTop: 2 }}>
            Enterprises
          </div>
          <div
            style={{
              width: 48,
              height: 1,
              background: 'rgba(255, 255, 255, 0.12)',
              margin: '16px 0 12px 0'
            }}
          />
          <div
            style={{
              fontSize: 12,
              opacity: 0.5,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            Enterprise Management System
          </div>
        </div>

        {/* MIDDLE: Architectural Line Drawing SVG */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <svg
            width="200"
            height="140"
            viewBox="0 0 200 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.14 }}
          >
            {/* Curved Roof Arch */}
            <path
              d="M 20 50 Q 100 15 180 50"
              stroke="#ffffff"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Bottom Tie Chord / Truss */}
            <line x1="20" y1="50" x2="180" y2="50" stroke="#ffffff" strokeWidth="1" />
            {/* Columns */}
            <line x1="35" y1="50" x2="35" y2="130" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="165" y1="50" x2="165" y2="130" stroke="#ffffff" strokeWidth="1.5" />
            {/* Foundation Plates */}
            <line x1="25" y1="130" x2="45" y2="130" stroke="#ffffff" strokeWidth="2" />
            <line x1="155" y1="130" x2="175" y2="130" stroke="#ffffff" strokeWidth="2" />
            {/* Internal Web Truss Lines */}
            <line x1="60" y1="50" x2="60" y2="35" stroke="#ffffff" strokeWidth="0.8" />
            <line x1="100" y1="50" x2="100" y2="28" stroke="#ffffff" strokeWidth="0.8" />
            <line x1="140" y1="50" x2="140" y2="35" stroke="#ffffff" strokeWidth="0.8" />
          </svg>
        </div>

        {/* BOTTOM: Footer */}
        <div style={{ padding: '0 40px 32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, opacity: 0.4 }}>Powered by Auxzon Solutions</span>
          <span
            style={{
              fontSize: 10,
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              borderRadius: 4,
              padding: '2px 8px',
              fontWeight: 500
            }}
          >
            v2.0
          </span>
        </div>
      </div>

      {/* ── RIGHT COLUMN (Clean Enterprise Light Form) ── */}
      <div
        style={{
          flex: 1,
          background: '#f3f6f9',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px'
        }}
      >
        {/* Mobile Navy Header */}
        <div
          className="login-mobile-header"
          style={{
            display: 'none',
            width: '100%',
            height: 56,
            background: '#0b315d',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 10
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            <span style={{ color: '#c9940a' }}>I </span>
            <span style={{ color: '#ffffff' }}>Roofing Enterprises</span>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 380, margin: 'auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', letterSpacing: '-0.01em', margin: 0 }}>
              Sign in to iRoof
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6, margin: 0 }}>
              Enter your credentials to access your workspace.
            </p>
          </div>

          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage(null)}
              style={{ marginBottom: 20, borderRadius: 8 }}
            />
          )}

          {/* Form */}
          <Form
            name="enterpriseLogin"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your username or email' }
              ]}
              style={{ marginBottom: 16 }}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#9ca3af', marginRight: 4 }} />}
                placeholder="Username or email"
                style={{ height: 42, borderRadius: 8, borderColor: '#dde3ea', fontSize: 14 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
              style={{ marginBottom: 20 }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#9ca3af', marginRight: 4 }} />}
                placeholder="Password"
                style={{ height: 42, borderRadius: 8, borderColor: '#dde3ea', fontSize: 14 }}
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
                  background: '#0b315d',
                  borderColor: '#0b315d',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: 'none'
                }}
              >
                Sign in
              </Button>
            </Form.Item>
          </Form>

          {/* Roles section */}
          <div style={{ marginTop: 28 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: 11,
                marginBottom: 12
              }}
            >
              <div style={{ flex: 1, height: 1, background: '#dde3ea' }} />
              <span style={{ padding: '0 10px', color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Access levels
              </span>
              <div style={{ flex: 1, height: 1, background: '#dde3ea' }} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {ROLES_LIST.map((r) => (
                <span
                  key={r}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #dde3ea',
                    borderRadius: 4,
                    padding: '3px 8px',
                    fontSize: 11,
                    color: '#6b7280',
                    fontWeight: 500
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 40, textAlign: 'center', fontSize: 11, color: '#9ca3af' }}>
            © 2025 I Roofing Enterprises
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left-col {
            display: none !important;
          }
          .login-mobile-header {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
