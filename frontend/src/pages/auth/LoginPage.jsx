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
    <div style={{ minHeight: '100vh', display: 'flex', width: '100%', background: '#f8fafc' }}>
      {/* ── LEFT COLUMN (Obsidian Executive Branding) ── */}
      <div
        style={{
          width: 440,
          minWidth: 440,
          background: '#081a36',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#ffffff',
          position: 'relative'
        }}
        className="login-left-col"
      >
        {/* TOP: Brand Identity */}
        <div style={{ padding: '48px 44px 0 44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="/logos/iroofing_wordmark_white.png"
              alt="iRoofing Enterprises"
              style={{ maxHeight: 40, objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div
            style={{
              width: 40,
              height: 2,
              background: '#c9940a',
              margin: '28px 0 20px 0',
              borderRadius: 2
            }}
          />

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', lineHeight: 1.35, letterSpacing: '-0.02em', margin: 0 }}>
            Industrial Roofing & Structural Valuation Console
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.65)', marginTop: 10, lineHeight: 1.6 }}>
            Unified operations engine for estimation, project execution, procurement, and commercial invoicing.
          </p>

          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'rgba(255, 255, 255, 0.85)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9940a' }} />
              <span>Multi-Model Engineering Estimation Engine</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'rgba(255, 255, 255, 0.85)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9940a' }} />
              <span>Automated Downstream Work Order Orchestration</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'rgba(255, 255, 255, 0.85)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9940a' }} />
              <span>Procurement Management & GST Commercial Invoicing</span>
            </div>
          </div>
        </div>

        {/* MIDDLE: Architectural Line Drawing SVG */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
          <svg
            width="220"
            height="140"
            viewBox="0 0 200 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.2 }}
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
            <line x1="165" y1="165" y2="130" stroke="#ffffff" strokeWidth="1.5" />
            {/* Foundation Plates */}
            <line x1="25" y1="130" x2="45" y2="130" stroke="#ffffff" strokeWidth="2" />
            <line x1="155" y1="130" x2="175" y2="130" stroke="#ffffff" strokeWidth="2" />
            {/* Internal Web Truss Lines */}
            <line x1="60" y1="50" x2="60" y2="35" stroke="#ffffff" strokeWidth="0.8" />
            <line x1="100" y1="50" x2="100" y2="28" stroke="#ffffff" strokeWidth="0.8" />
            <line x1="140" y1="50" x2="140" y2="35" stroke="#ffffff" strokeWidth="0.8" />
          </svg>
        </div>

        {/* BOTTOM: Security & Version Capsule */}
        <div
          style={{
            padding: '24px 44px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 11.5,
            color: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          <span>Auxzon Engineering Solutions</span>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: 4,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)'
            }}
          >
            v2.0 PRO
          </span>
        </div>
      </div>

      {/* ── RIGHT COLUMN (Clean Luxury White Form Card) ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '32px 24px'
        }}
      >
        {/* Mobile Header */}
        <div
          className="login-mobile-header"
          style={{
            display: 'none',
            width: '100%',
            height: 58,
            background: '#081a36',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 10,
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <img
            src="/logos/iroofing_wordmark_white_small.png"
            alt="iRoofing Enterprises"
            style={{ maxHeight: 28, objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '38px 36px',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)'
          }}
        >
          {/* Form Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Sign in to console
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 6, margin: 0 }}>
              Authenticate with your enterprise credentials.
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
              style={{ marginBottom: 18 }}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#94a3b8', marginRight: 6 }} />}
                placeholder="Username or email address"
                style={{ height: 42, borderRadius: 6, fontSize: 13.5 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
              style={{ marginBottom: 24 }}
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

          {/* Roles section */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#64748b',
                marginBottom: 10,
                textAlign: 'center'
              }}
            >
              Authorized Workspace Roles
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {ROLES_LIST.map((r) => (
                <span
                  key={r}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 4,
                    padding: '2.5px 7px',
                    fontSize: 10.5,
                    color: '#475569',
                    fontWeight: 600
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Global Footer */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11.5, color: '#94a3b8' }}>
          Protected Enterprise System · iRoof Industrial Engineering © 2026
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
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
