import React from 'react';
import { Card, Typography, Row, Col, Statistic, Button } from 'antd';
import { FormOutlined, CalculatorOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const { Title, Paragraph } = Typography;

const SalesDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Sales Department</Title>
          <Paragraph type="secondary">
            Welcome, {user?.name}. Process client enquiries and generate engineering estimates.
          </Paragraph>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="primary" icon={<FormOutlined />} onClick={() => navigate('/sales/enquiries')}>
            Manage Enquiries
          </Button>
          <Button icon={<CalculatorOutlined />} onClick={() => navigate('/sales/estimates/new')}>
            New Estimation
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Enquiry Pipeline" value="Active Enquiries" prefix={<FormOutlined style={{ color: '#1677ff' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Engineering Engine" value="5 Structural Models" prefix={<CalculatorOutlined style={{ color: '#faad14' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Estimate Approvals" value="Ready for Accounts" prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SalesDashboard;
