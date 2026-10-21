import React from 'react';
import { Row, Col, Table, Button } from 'antd';
import {
  EnvironmentOutlined,
  CalendarOutlined,
  FileOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  CameraOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const SiteVisitorDashboard = () => {
  const { user } = useAuthStore();
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Visitor';
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
    { key: '1', ref: 'SV-102', title: 'Ernakulam Commercial Roof Measurement', assigned: 'Site Officer A', status: 'completed', date: '21/10/2026' },
    { key: '2', ref: 'SV-101', title: 'Thrissur Auditorium Foundation Inspection', assigned: 'Site Officer B', status: 'visited', date: '19/10/2026' }
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
          Good {greetingTime}, {firstName}
        </h1>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Field Site Operations · {formattedDate}
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Assigned Sites</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <EnvironmentOutlined />
              </div>
            </div>
            <div className="stat-card__value">3</div>
            <div className="stat-card__meta">Field locations this week</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Visits This Week</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <CalendarOutlined />
              </div>
            </div>
            <div className="stat-card__value">5</div>
            <div className="stat-card__meta">Completed field surveys</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Reports Submitted</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <FileOutlined />
              </div>
            </div>
            <div className="stat-card__value">11</div>
            <div className="stat-card__meta">Measurement logs synced</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Pending Reports</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <ClockCircleOutlined />
              </div>
            </div>
            <div className="stat-card__value">1</div>
            <div className="stat-card__meta">Draft awaiting photo upload</div>
          </div>
        </Col>
      </Row>

      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button icon={<PlusOutlined />} style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}>
          Log Site Visit
        </Button>
        <Button icon={<CameraOutlined />} style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}>
          Upload Photos
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

export default SiteVisitorDashboard;
