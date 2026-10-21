import React from 'react';
import { Card, Typography, Row, Col, Statistic } from 'antd';
import { FileImageOutlined, ProfileOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const { Title, Paragraph } = Typography;

const DesignDashboard = () => {
  const { user } = useAuthStore();
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Design & Engineering</Title>
        <Paragraph type="secondary">Welcome, {user?.name}. Upload architectural drawings and generate structural BOQs.</Paragraph>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="CAD Drawings" value="Active Drawings" prefix={<FileImageOutlined style={{ color: '#1677ff' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="BOQ Generation" value="Bill of Quantities" prefix={<ProfileOutlined style={{ color: '#52c41a' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Uploads" value="Cloud Storage" prefix={<CloudUploadOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DesignDashboard;
