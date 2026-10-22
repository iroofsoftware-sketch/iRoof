import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Empty } from 'antd';
import {
  EditOutlined,
  CheckOutlined,
  SyncOutlined,
  ProjectOutlined,
  PlusOutlined,
  BuildOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const DesignDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ pending: 0, inProgress: 0, approved: 0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Engineer';
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    const fetchDesignData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/design-tasks/mine?limit=5');
        if (res.data) {
          if (res.data.stats) setStats(res.data.stats);
          if (res.data.data) setTasks(res.data.data);
        }
      } catch (e) {
        console.error('Error loading design dashboard:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDesignData();
  }, []);

  const columns = [
    {
      title: 'REF',
      dataIndex: 'refCode',
      key: 'refCode',
      width: 140,
      render: (t) => <span className="ref-badge">{t || 'DT-TASK'}</span>
    },
    {
      title: 'TITLE',
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
          {r.assignedTo?.name || user?.name || 'Design Team'}
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
      title: 'DUE DATE',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 130,
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
            Design & Structural CAD Console · {formattedDate}
          </p>
        </div>
      </div>

      {/* ── KPI ROW (4 Cards) ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Drawings Pending</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <EditOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.pending || 0}</div>
            <div className="stat-card__meta">CAD layouts in queue</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Completed</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <CheckOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.approved || 0}</div>
            <div className="stat-card__meta">Approved for fabrication</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">In Progress</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <SyncOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.inProgress || 0}</div>
            <div className="stat-card__meta">Drafting on CAD table</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Active Projects</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <ProjectOutlined />
              </div>
            </div>
            <div className="stat-card__value">{(stats.pending || 0) + (stats.inProgress || 0)}</div>
            <div className="stat-card__meta">Requiring engineering support</div>
          </div>
        </Col>
      </Row>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <Button
          type="default"
          icon={<BuildOutlined />}
          onClick={() => navigate('/design/drawings')}
          style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}
        >
          View All Drawing Tasks
        </Button>
      </div>

      {/* ── RECENT ACTIVITY TABLE ── */}
      <div className="content-card" style={{ marginTop: 20 }}>
        <div className="content-card__header">
          <span className="content-card__title">Recent Drawing Tasks</span>
          <Button
            type="link"
            onClick={() => navigate('/design/drawings')}
            style={{ color: '#0b315d', fontSize: 13, padding: 0 }}
          >
            View all →
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="_id"
          loading={loading}
          pagination={false}
          size="small"
          locale={{ emptyText: <Empty description="No recent drawing tasks" /> }}
          onRow={() => ({
            onClick: () => navigate('/design/drawings'),
            style: { cursor: 'pointer' }
          })}
        />
      </div>
    </div>
  );
};

export default DesignDashboard;
