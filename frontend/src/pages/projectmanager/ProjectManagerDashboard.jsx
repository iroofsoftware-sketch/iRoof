import React from 'react';
import { Row, Col, Table, Button } from 'antd';
import {
  ProfileOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CheckSquareOutlined,
  PlusOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const ProjectManagerDashboard = () => {
  const { user } = useAuthStore();
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Manager';
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
    { key: '1', ref: 'WO-204', title: 'Fabrication & Erection of 18m Auditorium Shed', assigned: 'Team North', status: 'approved', date: '21/10/2026' },
    { key: '2', ref: 'WO-203', title: 'Simply Supported Roof - Foundation Anchor Alignment', assigned: 'Team Central', status: 'visited', date: '19/10/2026' }
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
          Good {greetingTime}, {firstName}
        </h1>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Project Management & Site Operations · {formattedDate}
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Active Work Orders</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <ProfileOutlined />
              </div>
            </div>
            <div className="stat-card__value">5</div>
            <div className="stat-card__meta">Active roofing sites</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">On Track</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <CheckCircleOutlined />
              </div>
            </div>
            <div className="stat-card__value">4</div>
            <div className="stat-card__meta">Progress on milestone</div>
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
            <div className="stat-card__value">1</div>
            <div className="stat-card__meta">Material delivery bottleneck</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Completed</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <CheckSquareOutlined />
              </div>
            </div>
            <div className="stat-card__value">12</div>
            <div className="stat-card__meta">Handed over this quarter</div>
          </div>
        </Col>
      </Row>

      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button icon={<PlusOutlined />} style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}>
          New Work Order
        </Button>
        <Button icon={<CalendarOutlined />} style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}>
          Schedule Site Visit
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

export default ProjectManagerDashboard;
