import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Empty } from 'antd';
import {
  EnvironmentOutlined,
  CalendarOutlined,
  FileOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const SiteVisitorDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ scheduled: 0, inProgress: 0, completed: 0 });
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Visitor';
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    const fetchSiteData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/site-visits/mine?limit=5');
        if (res.data) {
          if (res.data.stats) setStats(res.data.stats);
          if (res.data.data) setVisits(res.data.data);
        }
      } catch (e) {
        console.error('Error loading site visitor dashboard:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteData();
  }, []);

  const columns = [
    {
      title: 'REF',
      dataIndex: 'refCode',
      key: 'refCode',
      width: 140,
      render: (t) => <span className="ref-badge">{t || 'SV-VISIT'}</span>
    },
    {
      title: 'CLIENT / SITE',
      key: 'client',
      render: (_, r) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.workOrderId?.clientName || 'General Client'}</span>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            {r.workOrderId?.siteAddress || 'Site Location'}
          </div>
        </div>
      )
    },
    {
      title: 'ASSIGNED',
      key: 'assigned',
      render: (_, r) => (
        <span style={{ color: '#475569', fontWeight: 500 }}>
          {r.assignedTo?.name || user?.name || 'Field Officer'}
        </span>
      )
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (st) => (
        <span className={`status-dot status-${st || 'new'}`}>
          <span style={{ textTransform: 'capitalize' }}>{(st || 'scheduled').replace('_', ' ')}</span>
        </span>
      )
    },
    {
      title: 'SCHEDULED DATE',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      width: 140,
      render: (d) => (
        <span style={{ color: '#64748b', fontSize: 12.5 }} className="tabular-nums">
          {d ? dayjs(d).format('DD/MM/YYYY') : '—'}
        </span>
      )
    }
  ];

  return (
    <div>
      {/* ── WELCOME ROW ── */}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">
            Good {greetingTime}, {firstName}
          </h1>
          <p className="page-subtitle">
            Site Inspection & Field Measurement Console · {formattedDate}
          </p>
        </div>
      </div>

      {/* ── KPI ROW (4 Cards) ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Assigned Sites</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <EnvironmentOutlined />
              </div>
            </div>
            <div className="stat-card__value">{(stats.scheduled || 0) + (stats.inProgress || 0)}</div>
            <div className="stat-card__meta">Field locations requiring visit</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Scheduled Visits</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <CalendarOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.scheduled || 0}</div>
            <div className="stat-card__meta">Upcoming kickoff inspections</div>
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
            <div className="stat-card__value">{stats.completed || 0}</div>
            <div className="stat-card__meta">Inspection sign-offs recorded</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">In Progress Inspections</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <ClockCircleOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.inProgress || 0}</div>
            <div className="stat-card__meta">Ongoing field measurements</div>
          </div>
        </Col>
      </Row>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <Button
          type="default"
          icon={<EnvironmentOutlined />}
          onClick={() => navigate('/sitevisitor/visits')}
          style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}
        >
          View Field Schedule
        </Button>
      </div>

      {/* ── RECENT ACTIVITY TABLE ── */}
      <div className="content-card" style={{ marginTop: 20 }}>
        <div className="content-card__header">
          <span className="content-card__title">Recent Site Visits</span>
          <Button
            type="link"
            onClick={() => navigate('/sitevisitor/visits')}
            style={{ color: '#0b315d', fontSize: 13, padding: 0 }}
          >
            View all →
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={visits}
          rowKey="_id"
          loading={loading}
          pagination={false}
          size="small"
          locale={{ emptyText: <Empty description="No recent site visits" /> }}
          onRow={() => ({
            onClick: () => navigate('/sitevisitor/visits'),
            style: { cursor: 'pointer' }
          })}
        />
      </div>
    </div>
  );
};

export default SiteVisitorDashboard;
