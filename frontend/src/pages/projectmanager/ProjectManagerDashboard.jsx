import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Empty } from 'antd';
import {
  ProfileOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CheckSquareOutlined,
  PlusOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const ProjectManagerDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total: 0, active: 0, on_hold: 0, completed: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Manager';
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, listRes] = await Promise.all([
          api.get('/workorders/stats').catch(() => ({ data: { data: {} } })),
          api.get('/workorders?limit=5').catch(() => ({ data: { data: [] } }))
        ]);

        if (statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
        if (listRes.data?.data) {
          setRecentOrders(listRes.data.data);
        }
      } catch (e) {
        console.error('Error loading PM dashboard:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const columns = [
    {
      title: 'REF',
      dataIndex: 'refCode',
      key: 'refCode',
      render: (t) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0b315d' }}>
          {t || 'WO-REF'}
        </span>
      )
    },
    {
      title: 'CLIENT / MODEL',
      key: 'client',
      render: (_, r) => (
        <div>
          <span style={{ fontWeight: 500, color: '#111827' }}>{r.clientName}</span>
          <div style={{ fontSize: 11, color: '#6b7280' }}>{r.roofModel}</div>
        </div>
      )
    },
    {
      title: 'ASSIGNED PM',
      key: 'assigned',
      render: (_, r) => (
        <span style={{ color: '#6b7280' }}>
          {r.assignedPM?.name || user?.name || 'Project Manager'}
        </span>
      )
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (st) => (
        <span className={`status-dot status-${st || 'new'}`}>
          <span style={{ textTransform: 'capitalize' }}>{(st || 'active').replace('_', ' ')}</span>
        </span>
      )
    },
    {
      title: 'TARGET DATE',
      dataIndex: 'targetDate',
      key: 'targetDate',
      render: (d) => (
        <span style={{ color: '#6b7280', fontSize: 12 }}>
          {d ? dayjs(d).format('DD/MM/YYYY') : '—'}
        </span>
      )
    }
  ];

  return (
    <div>
      {/* ── WELCOME ROW ── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
          Good {greetingTime}, {firstName}
        </h1>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Project Management & Site Operations · {formattedDate}
        </div>
      </div>

      {/* ── KPI ROW (4 Cards) ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Active Work Orders</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <ProfileOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.active || 0}</div>
            <div className="stat-card__meta">Active fabrication & site projects</div>
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
            <div className="stat-card__value">{stats.active || 0}</div>
            <div className="stat-card__meta">Progressing according to schedule</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">On Hold / Delayed</span>
              <div className="stat-card__icon" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                <WarningOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.on_hold || 0}</div>
            <div className="stat-card__meta">Site clearance or supply pending</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Completed Projects</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <CheckSquareOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.completed || 0}</div>
            <div className="stat-card__meta">Successfully handed over</div>
          </div>
        </Col>
      </Row>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button
          type="default"
          icon={<PlusOutlined />}
          onClick={() => navigate('/projectmanager/workorders')}
          style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}
        >
          Manage Work Orders
        </Button>
        <Button
          type="default"
          icon={<CalendarOutlined />}
          onClick={() => navigate('/sitevisitor/visits')}
          style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}
        >
          Site Schedules
        </Button>
      </div>

      {/* ── RECENT ACTIVITY TABLE ── */}
      <div className="content-card" style={{ marginTop: 20 }}>
        <div className="content-card__header">
          <span className="content-card__title">Recent Work Orders</span>
          <Button
            type="link"
            onClick={() => navigate('/projectmanager/workorders')}
            style={{ color: '#0b315d', fontSize: 13, padding: 0 }}
          >
            View all →
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={recentOrders}
          rowKey="_id"
          loading={loading}
          pagination={false}
          size="small"
          locale={{ emptyText: <Empty description="No recent work orders" /> }}
          onRow={(r) => ({
            onClick: () => navigate(`/projectmanager/workorders/${r._id}`),
            style: { cursor: 'pointer' }
          })}
        />
      </div>
    </div>
  );
};

export default ProjectManagerDashboard;
