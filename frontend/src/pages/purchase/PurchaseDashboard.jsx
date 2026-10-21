import React from 'react';
import { Row, Col, Table, Button } from 'antd';
import {
  ShoppingCartOutlined,
  CheckOutlined,
  ShopOutlined,
  DollarOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const PurchaseDashboard = () => {
  const { user } = useAuthStore();
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Purchase Officer';
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const columns = [
    {
      title: 'REF',
      dataIndex: 'ref',
      key: 'ref',
      render: (t) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0b315d' }}>{t}</span>
    },
    {
      title: 'TITLE',
      dataIndex: 'title',
      key: 'title',
      render: (t) => <span style={{ fontWeight: 500 }}>{t}</span>
    },
    {
      title: 'ASSIGNED',
      dataIndex: 'assigned',
      key: 'assigned',
      render: (a) => <span style={{ color: '#6b7280' }}>{a}</span>
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (st) => (
        <span className={`status-dot status-${st}`}>
          <span style={{ textTransform: 'capitalize' }}>{st}</span>
        </span>
      )
    },
    {
      title: 'DATE',
      dataIndex: 'date',
      key: 'date',
      render: (d) => <span style={{ color: '#6b7280', fontSize: 12 }}>{d}</span>
    }
  ];

  const dummyData = [
    { key: '1', ref: 'PO-501', title: 'Tata Structura 100x50x2mm Hollow Sections (14 MT)', assigned: 'Apollo Steels', status: 'approved', date: '21/10/2026' },
    { key: '2', ref: 'PO-500', title: 'Color Coated Profile Sheet 0.50mm Azul Blue', assigned: 'JSW Steel', status: 'visited', date: '19/10/2026' }
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
          Good {greetingTime}, {firstName}
        </h1>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Purchase & Procurement · {formattedDate}
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Pending POs</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <ShoppingCartOutlined />
              </div>
            </div>
            <div className="stat-card__value">3</div>
            <div className="stat-card__meta">Requisitions awaiting approval</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Approved POs</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <CheckOutlined />
              </div>
            </div>
            <div className="stat-card__value">14</div>
            <div className="stat-card__meta">Dispatched or in transit</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Active Suppliers</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <ShopOutlined />
              </div>
            </div>
            <div className="stat-card__value">8</div>
            <div className="stat-card__meta">Verified steel & sheet vendors</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Spend This Month</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <DollarOutlined />
              </div>
            </div>
            <div className="stat-card__value">₹14.2L</div>
            <div className="stat-card__meta">Raw material purchases</div>
          </div>
        </Col>
      </Row>

      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button icon={<PlusOutlined />} style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}>
          Create Purchase Order
        </Button>
        <Button icon={<ShopOutlined />} style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}>
          Add Supplier
        </Button>
      </div>

      <div className="content-card" style={{ marginTop: 20 }}>
        <div className="content-card__header">
          <div className="content-card__title">Recent Activity</div>
          <span style={{ color: '#0b315d', fontSize: 13, cursor: 'pointer' }}>View all →</span>
        </div>
        <Table columns={columns} dataSource={dummyData} size="small" pagination={false} />
      </div>
    </div>
  );
};

export default PurchaseDashboard;
