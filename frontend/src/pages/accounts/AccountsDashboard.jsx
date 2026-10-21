import React from 'react';
import { Row, Col, Table, Button, Empty } from 'antd';
import {
  FileOutlined,
  DollarOutlined,
  WarningOutlined,
  CalculatorOutlined,
  PlusOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const AccountsDashboard = () => {
  const { user } = useAuthStore();
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Accounts';
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
    { key: '1', ref: 'INV-1004', title: 'Advance Invoice - Acme Factory Shed', assigned: 'S. Accounts', status: 'approved', date: '21/10/2026' },
    { key: '2', ref: 'INV-1003', title: 'Progress Payment - Cantilever Project', assigned: 'M. Nair', status: 'visited', date: '19/10/2026' }
  ];

  return (
    <div>
      {/* A) WELCOME ROW */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
          Good {greetingTime}, {firstName}
        </h1>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Accounts & Finance · {formattedDate}
        </div>
      </div>

      {/* B) KPI ROW */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Invoices Due</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <FileOutlined />
              </div>
            </div>
            <div className="stat-card__value">4</div>
            <div className="stat-card__meta">₹1,85,000 pending collection</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Received This Month</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <DollarOutlined />
              </div>
            </div>
            <div className="stat-card__value">₹8.4L</div>
            <div className="stat-card__meta">Direct client receipts</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Outstanding Amount</span>
              <div className="stat-card__icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                <WarningOutlined />
              </div>
            </div>
            <div className="stat-card__value">₹3.2L</div>
            <div className="stat-card__meta">Overdue balance accounts</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">GST Payable</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <CalculatorOutlined />
              </div>
            </div>
            <div className="stat-card__value">₹64,200</div>
            <div className="stat-card__meta">18% output tax liability</div>
          </div>
        </Col>
      </Row>

      {/* C) QUICK ACTIONS */}
      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button icon={<PlusOutlined />} style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}>
          New Invoice
        </Button>
        <Button icon={<CheckCircleOutlined />} style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}>
          Record Payment
        </Button>
      </div>

      {/* D) RECENT ACTIVITY TABLE */}
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

export default AccountsDashboard;
