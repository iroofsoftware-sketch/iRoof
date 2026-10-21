import React from 'react';
import { Card, Typography, Row, Col, Statistic, Alert } from 'antd';
import { MobileOutlined, CameraOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const { Title, Paragraph } = Typography;

const SiteVisitorDashboard = () => {
  const { user } = useAuthStore();
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Site Visitor Portal</Title>
        <Paragraph type="secondary">Welcome, {user?.name}. Field site visit operations and progress tracking.</Paragraph>
      </div>

      <Alert
        message="Flutter Mobile App Integration (Phase 3)"
        description="Site visits and real-time photo uploads on the field are optimized for the upcoming iRoof Mobile Flutter application."
        type="info"
        showIcon
        style={{ marginBottom: 24, borderRadius: 8 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Assigned Site Visits" value="Today's Visits" prefix={<EnvironmentOutlined style={{ color: '#1677ff' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Photo Captures" value="Field Measurements" prefix={<CameraOutlined style={{ color: '#52c41a' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Mobile Sync" value="Flutter Engine" prefix={<MobileOutlined style={{ color: '#722ed1' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SiteVisitorDashboard;
