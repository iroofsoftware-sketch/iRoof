import React from 'react';
import { Card, Typography, Row, Col, Statistic } from 'antd';
import { ProjectOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const { Title, Paragraph } = Typography;

const ProjectManagerDashboard = () => {
  const { user } = useAuthStore();
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Project Management</Title>
        <Paragraph type="secondary">Welcome, {user?.name}. Manage site visits, team allocations, and roofing erection progress.</Paragraph>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Site Visits" value="Scheduled Visits" prefix={<EnvironmentOutlined style={{ color: '#fa541c' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Active Projects" value="Ongoing Erection" prefix={<ProjectOutlined style={{ color: '#1677ff' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Field Team" value="Site Engineers" prefix={<TeamOutlined style={{ color: '#52c41a' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProjectManagerDashboard;
