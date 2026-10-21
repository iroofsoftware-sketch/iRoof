import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, message, Tag } from 'antd';
import { MailOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { Title, Text, Paragraph } = Typography;

export const roleHomePaths = {
  admin: '/admin/users',
  sales: '/sales/enquiries',
  accounts: '/accounts/dashboard',
  design: '/design/dashboard',
  projectmanager: '/projectmanager/dashboard',
  purchase: '/purchase/dashboard',
  workshop: '/workshop/dashboard',
  sitevisitor: '/sitevisitor/dashboard'
};

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

        message.success(`Welcome back, ${user.name}!`);

        const destination = roleHomePaths[user.role] || '/';
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      padding: '24px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(30, 41, 59, 0.85)',
          backdropFilter: 'blur(16px)'
        }}
        bodyStyle={{ padding: '36px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#fff',
            fontSize: 28,
            marginBottom: 12,
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.35)'
          }}>
            <SafetyCertificateOutlined />
          </div>
          <Title level={2} style={{ color: '#f8fafc', margin: 0, fontWeight: 700 }}>
            iRoof <span style={{ color: '#38bdf8' }}>v2</span>
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: 13, display: 'block', marginTop: 4 }}>
            I Roofing Enterprises Management System
          </Text>
          <Paragraph style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
            Built by Auxzon Solutions Pvt. Ltd.
          </Paragraph>
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

        <Form
          name="loginForm"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            label={<span style={{ color: '#e2e8f0', fontWeight: 500 }}>Email Address</span>}
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
              placeholder="e.g. admin@iroof.com"
              style={{
                borderRadius: 8,
                background: 'rgba(15, 23, 42, 0.6)',
                borderColor: '#334155',
                color: '#f8fafc'
              }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: '#e2e8f0', fontWeight: 500 }}>Password</span>}
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Enter your password"
              style={{
                borderRadius: 8,
                background: 'rgba(15, 23, 42, 0.6)',
                borderColor: '#334155',
                color: '#f8fafc'
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 46,
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                borderColor: '#2563eb',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #334155', textAlign: 'center' }}>
          <Text style={{ color: '#64748b', fontSize: 11, display: 'block', marginBottom: 6 }}>
            Authorized System Access Only
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {['Admin', 'Sales', 'Accounts', 'Design', 'PM', 'Purchase', 'Workshop'].map((r) => (
              <Tag key={r} color="default" style={{ fontSize: 10, margin: 0, background: '#1e293b', borderColor: '#334155', color: '#94a3b8' }}>
                {r}
              </Tag>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
