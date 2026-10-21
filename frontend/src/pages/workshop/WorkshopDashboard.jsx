import React from 'react';
import { Card, Typography, Row, Col, Statistic } from 'antd';
import { ToolOutlined, FireOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const { Title, Paragraph } = Typography;

const WorkshopDashboard = () => {
  const { user } = useAuthStore();
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Workshop & Fabrication</Title>
        <Paragraph type="secondary">Welcome, {user?.name}. Monitor trusses, purlins, gutters, and structural fabrication jobs.</Paragraph>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Fabrication Jobs" value="In Progress" prefix={<FireOutlined style={{ color: '#f5222d' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Cutting & Welding" value="Structural Steel" prefix={<ToolOutlined style={{ color: '#1677ff' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Quality Inspection" value="Ready for Dispatch" prefix={<CheckSquareOutlined style={{ color: '#52c41a' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WorkshopDashboard;
