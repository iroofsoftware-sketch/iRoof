import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Empty } from 'antd';
import {
  ToolOutlined,
  CheckOutlined,
  InboxOutlined,
  WarningOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const WorkshopDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ inProgress: 0, completed: 0, materialReady: 0, pending: 0 });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Supervisor';
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    const fetchWorkshopData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/workshop-jobs/mine?limit=5');
        if (res.data) {
          if (res.data.stats) setStats(res.data.stats);
          if (res.data.data) setJobs(res.data.data);
        }
      } catch (e) {
        console.error('Error loading workshop dashboard:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshopData();
  }, []);

  const columns = [
    {
      title: 'REF',
      dataIndex: 'refCode',
      key: 'refCode',
      width: 140,
      render: (t) => <span className="ref-badge">{t || 'WJ-JOB'}</span>
    },
    {
      title: 'TITLE / CLIENT',
      dataIndex: 'title',
      key: 'title',
      render: (t, r) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{t}</span>
          {r.workOrderId?.clientName && (
            <div style={{ fontSize: 11, color: '#64748b' }}>{r.workOrderId.clientName}</div>
          )}
        </div>
      )
    },
    {
      title: 'ASSIGNED',
      key: 'assigned',
      render: (_, r) => (
        <span style={{ color: '#475569', fontWeight: 500 }}>
          {r.assignedTo?.name || 'Workshop Floor'}
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
          <span style={{ textTransform: 'capitalize' }}>{(st || 'pending').replace('_', ' ')}</span>
        </span>
      )
    },
    {
      title: 'TARGET END',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 130,
      render: (d) => (
        <span style={{ color: '#64748b', fontSize: 12.5 }} className="tabular-nums">
          {d ? dayjs(d).format('DD/MM/YYYY') : 'In line'}
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
            Workshop Fabrication & Production Console · {formattedDate}
          </p>
        </div>
      </div>

      {/* ── KPI ROW (4 Cards) ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Jobs In Progress</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <ToolOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.inProgress || 0}</div>
            <div className="stat-card__meta">Active fabrication on floor</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Completed Jobs</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <CheckOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.completed || 0}</div>
            <div className="stat-card__meta">Ready for dispatch / erection</div>
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
            <div className="stat-card__value">{stats.materialReady || 0}</div>
            <div className="stat-card__meta">BOM received & queued</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Pending Line Setup</span>
              <div className="stat-card__icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                <WarningOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.pending || 0}</div>
            <div className="stat-card__meta">Awaiting drawing clearance</div>
          </div>
        </Col>
      </Row>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <Button
          type="default"
          icon={<ToolOutlined />}
          onClick={() => navigate('/workshop/jobs')}
          style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}
        >
          View Fabrication Line
        </Button>
      </div>

      {/* ── RECENT ACTIVITY TABLE ── */}
      <div className="content-card" style={{ marginTop: 20 }}>
        <div className="content-card__header">
          <span className="content-card__title">Recent Fabrication Jobs</span>
          <Button
            type="link"
            onClick={() => navigate('/workshop/jobs')}
            style={{ color: '#0b315d', fontSize: 13, padding: 0 }}
          >
            View all →
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={jobs}
          rowKey="_id"
          loading={loading}
          pagination={false}
          size="small"
          locale={{ emptyText: <Empty description="No recent fabrication jobs" /> }}
          onRow={() => ({
            onClick: () => navigate('/workshop/jobs'),
            style: { cursor: 'pointer' }
          })}
        />
      </div>
    </div>
  );
};

export default WorkshopDashboard;
