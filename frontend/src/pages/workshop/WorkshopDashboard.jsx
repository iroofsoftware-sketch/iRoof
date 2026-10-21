import React from 'react';
import { Row, Col, Table, Button } from 'antd';
import {
  ToolOutlined,
  CheckOutlined,
  InboxOutlined,
  WarningOutlined,
  PlusOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const WorkshopDashboard = () => {
  const { user } = useAuthStore();
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Supervisor';
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
    { key: '1', ref: 'FAB-301', title: 'Cantilever Truss Arc Bending & Welding (Bay 1-6)', assigned: 'Bay A Team', status: 'visited', date: '21/10/2026' },
    { key: '2', ref: 'FAB-300', title: 'MS Base Plates & Gusset 16mm Drilling', assigned: 'Drill Station 2', status: 'approved', date: '20/10/2026' }
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
          Good {greetingTime}, {firstName}
        </h1>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Workshop & Steel Fabrication · {formattedDate}
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Jobs In Progress</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <ToolOutlined />
              </div>
            </div>
            <div className="stat-card__value">4</div>
            <div className="stat-card__meta">Truss cutting & welding lines</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Completed Today</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <CheckOutlined />
              </div>
            </div>
            <div className="stat-card__value">8</div>
            <div className="stat-card__meta">Fabricated components ready</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Material Ready</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <InboxOutlined />
              </div>
            </div>
            <div className="stat-card__value">16 MT</div>
            <div className="stat-card__meta">Allocated steel in yard</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Delayed</span>
              <div className="stat-card__icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                <WarningOutlined />
              </div>
            </div>
            <div className="stat-card__value">0</div>
            <div className="stat-card__meta">All lines on schedule</div>
          </div>
        </Col>
      </Row>

      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button icon={<PlusOutlined />} style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}>
          New Fabrication Job
        </Button>
        <Button icon={<CheckCircleOutlined />} style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}>
          Log Inspection
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

export default WorkshopDashboard;
