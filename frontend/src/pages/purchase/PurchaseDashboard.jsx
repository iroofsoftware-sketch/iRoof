import React from 'react';
import { Card, Typography, Row, Col, Statistic } from 'antd';
import { ShoppingCartOutlined, ShopOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const { Title, Paragraph } = Typography;

const PurchaseDashboard = () => {
  const { user } = useAuthStore();
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Purchase & Procurement</Title>
        <Paragraph type="secondary">Welcome, {user?.name}. Manage purchase orders, supplier pricing, and raw material procurement.</Paragraph>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Purchase Orders" value="Open POs" prefix={<ShoppingCartOutlined style={{ color: '#1677ff' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Registered Suppliers" value="Verified Vendors" prefix={<ShopOutlined style={{ color: '#52c41a' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Material Lists" value="Procurement Requisitions" prefix={<DatabaseOutlined style={{ color: '#faad14' }} />} valueStyle={{ fontSize: 18 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PurchaseDashboard;
