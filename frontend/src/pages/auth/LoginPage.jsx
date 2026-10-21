import React, { useState } from 'react';
import { Form, Input, Button, Alert, message, Tooltip } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
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

const DEMO_ACCOUNTS = [
  { role: 'admin', label: 'Admin', email: 'admin@iroofing.com', pass: 'Admin@123', dept: 'System Admin' },
  { role: 'sales', label: 'Sales', email: 'sales@iroofing.com', pass: 'Sales@123', dept: 'Estimations' },
  { role: 'accounts', label: 'Accounts', email: 'accounts@iroofing.com', pass: 'Accounts@123', dept: 'Finance & Invoicing' },
  { role: 'design', label: 'Design', email: 'design@iroofing.com', pass: 'Design@123', dept: 'CAD Drawings' },
  { role: 'projectmanager', label: 'PM', email: 'pm@iroofing.com', pass: 'Pm@123', dept: 'Project Management' },
  { role: 'purchase', label: 'Purchase', email: 'purchase@iroofing.com', pass: 'Purchase@123', dept: 'Procurement' },
  { role: 'workshop', label: 'Workshop', email: 'workshop@iroofing.com', pass: 'Workshop@123', dept: 'Fabrication' },
  { role: 'sitevisitor', label: 'Site', email: 'sitevisitor@iroofing.com', pass: 'Site@123', dept: 'Field Inspection' }
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
        message.success(`Welcome, ${user.name}`);
        const destination = roleHomePaths[user.role] || `/${user.role}`;
        navigate(destination, { replace: true });
      } else {
        setErrorMessage('Invalid authentication token returned by server.');
      }
    } catch (err) {
      console.error('Login failure:', err);
      const msg =
        err.response?.data?.message ||
        'Authentication service unreachable. Please ensure the backend server is running.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (acc) => {
    form.setFieldsValue({
      email: acc.email,
      password: acc.pass
    });
    setErrorMessage(null);
    message.info(`Pre-filled ${acc.label} credentials (${acc.email})`);
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
      {/* ── LEFT SHOWCASE PANEL (Ultra-Premium Architectural Obsidian) ── */}
      <div
        className="login-showcase-panel"
        style={{
          width: '46%',
          minWidth: 480,
          maxWidth: 640,
          background: 'linear-gradient(165deg, #07162c 0%, #0b2246 50%, #05101f 100%)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 52px',
          color: '#ffffff',
          overflow: 'hidden',
          boxShadow: '4px 0 30px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Subtle Architectural Blueprint Grid Background Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(rgba(201, 148, 10, 0.12) 1px, transparent 1px), radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px, 16px 16px',
            backgroundPosition: '0 0, 16px 16px',
            opacity: 0.65,
            pointerEvents: 'none'
          }}
        />

        {/* Ambient Top Radial Glow */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: -120,
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201, 148, 10, 0.22) 0%, rgba(11, 46, 89, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* TOP: Brand Identity */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src="/logos/iroofing_wordmark_white.png"
              alt="iRoofing Enterprises"
              style={{ maxHeight: 44, width: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 22,
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(201, 148, 10, 0.15)',
              border: '1px solid rgba(201, 148, 10, 0.35)',
              color: '#facc15',
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#facc15' }} />
            Enterprise Operations Platform v2.0
          </div>

          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1.3,
              color: '#ffffff',
              letterSpacing: '-0.025em',
              marginTop: 20,
              marginBottom: 12
            }}
          >
            Industrial Arch Roofing & Unified Valuation Console
          </h1>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.65,
              color: 'rgba(255, 255, 255, 0.72)',
              maxWidth: 440,
              margin: 0
            }}
          >
            End-to-end execution infrastructure — from multi-model arch calculation and CAD drawings to stage-gate procurement and commercial invoicing.
          </p>
        </div>

        {/* MIDDLE: Operational Metrics & Feature Cards */}
        <div style={{ position: 'relative', zIndex: 2, margin: '36px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius: 10,
                padding: '16px 18px'
              }}
            >
              <div style={{ fontSize: 11, color: '#facc15', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Engineering Core
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginTop: 4 }}>
                5 Structural Models
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.6)', marginTop: 2 }}>
                Cantilever, Auditorium, PEB, Type 2 & Simply Supported
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius: 10,
                padding: '16px 18px'
              }}
            >
              <div style={{ fontSize: 11, color: '#facc15', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Chain of Custody
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginTop: 4 }}>
                7 Stage-Gate Flow
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.6)', marginTop: 2 }}>
                Sales ➔ Accounts ➔ Design ➔ PM ➔ Purchase ➔ Workshop
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              background: 'rgba(201, 148, 10, 0.08)',
              border: '1px solid rgba(201, 148, 10, 0.22)',
              borderRadius: 10,
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <SafetyCertificateOutlined style={{ fontSize: 20, color: '#facc15' }} />
            <div style={{ fontSize: 12.5, color: 'rgba(255, 255, 255, 0.85)' }}>
              <strong>Standard Compliance:</strong> IS 15965:2012 YS350 High Tensile Steel with zero truss intrusion.
            </div>
          </div>
        </div>

        {/* BOTTOM: Security & Corporate Capsule */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          <span>Auxzon Engineering Solutions</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            Encrypted TLS 1.3
          </span>
        </div>
      </div>

      {/* ── RIGHT LOGIN CONTAINER ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 24px',
          background: 'radial-gradient(ellipse at 80% 20%, #f1f5f9 0%, #f8fafc 55%, #eef2f6 100%)',
          minHeight: '100vh',
          position: 'relative'
        }}
      >
        {/* Mobile Header (Shows when left panel collapses) */}
        <div
          className="login-mobile-bar"
          style={{
            display: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 64,
            background: '#081a36',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            padding: '0 20px',
            zIndex: 10
          }}
        >
          <img
            src="/logos/iroofing_wordmark_white_small.png"
            alt="iRoofing"
            style={{ maxHeight: 32, objectFit: 'contain' }}
          />
        </div>

        {/* Main Form Card */}
        <div
          style={{
            width: '100%',
            maxWidth: 440,
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 45px -10px rgba(11, 46, 89, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
            padding: '42px 40px'
          }}
        >
          {/* Card Header */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #0b2e59 0%, #173c65 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: 15
                }}
              >
                <LockOutlined />
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.02em'
                }}
              >
                Sign in to Console
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Authenticate with your assigned departmental role.
            </p>
          </div>

          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage(null)}
              style={{ marginBottom: 22, borderRadius: 8, fontSize: 13 }}
            />
          )}

          {/* Login Form */}
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
                { required: true, message: 'Please enter your corporate email' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
              style={{ marginBottom: 18 }}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#94a3b8', marginRight: 6 }} />}
                placeholder="Corporate email (e.g. sales@iroofing.com)"
                style={{
                  height: 44,
                  borderRadius: 8,
                  fontSize: 13.5,
                  border: '1px solid #cbd5e1'
                }}
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
                style={{
                  height: 44,
                  borderRadius: 8,
                  fontSize: 13.5,
                  border: '1px solid #cbd5e1'
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: 44,
                  background: '#0b2e59',
                  borderColor: '#0b2e59',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14.5,
                  letterSpacing: '0.01em',
                  boxShadow: '0 4px 12px rgba(11, 46, 89, 0.2)'
                }}
              >
                Sign In to Workspace <ArrowRightOutlined style={{ marginLeft: 4 }} />
              </Button>
            </Form.Item>
          </Form>

          {/* Quick Demo Access Bar */}
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid #f1f5f9' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#64748b'
                }}
              >
                Quick Role Demo Access
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Click to auto-fill</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <Tooltip key={acc.role} title={`${acc.dept} · ${acc.email}`} placement="top">
                  <button
                    type="button"
                    onClick={() => handleQuickFill(acc)}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      padding: '6px 4px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#0b2e59';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = '#0b2e59';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.color = '#334155';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    {acc.label}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        {/* Global Footer */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11.5, color: '#94a3b8' }}>
          iRoof Industrial Operations Platform · Proprietary & Confidential © 2026
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .login-showcase-panel {
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
