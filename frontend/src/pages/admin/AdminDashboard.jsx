import React from 'react';
import { Card, Typography, Row, Col, Statistic } from 'antd';
import {
  UserOutlined,
  CalculatorOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const { Title, Paragraph } = Typography;

const AdminDashboard = () => {
  const { user } = useAuthStore();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Administration Dashboard</Title>
        <Paragraph type="secondary">
          Welcome back, {user?.name || 'Admin'}. Manage users, rate configurations, and system health.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Active Role"
              value="System Administrator"
              valueStyle={{ fontSize: 18, color: '#1677ff' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="User Management"
              value="Manage Staff & Roles"
              valueStyle={{ fontSize: 18, color: '#52c41a' }}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Rate Masters"
              value="Materials & Sections"
              valueStyle={{ fontSize: 18, color: '#faad14' }}
              prefix={<CalculatorOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
