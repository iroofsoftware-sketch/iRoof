import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Empty } from 'antd';
import {
  TeamOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  ControlOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    usersCount: 0,
    enquiriesCount: 0,
    estimatesCount: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Administrator';
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
        const [usersRes, enqRes, estRes] = await Promise.all([
          api.get('/admin/users').catch(() => ({ data: { users: [] } })),
          api.get('/enquiries').catch(() => ({ data: { enquiries: [] } })),
          api.get('/estimates').catch(() => ({ data: { estimates: [] } }))
        ]);

        const users = usersRes.data?.users || [];
        const enquiries = enqRes.data?.enquiries || [];
        const estimates = estRes.data?.estimates || [];

        setStats({
          usersCount: users.length,
          enquiriesCount: enquiries.length,
          estimatesCount: estimates.length
        });

        // Combined activity feed
        const activities = [
          ...enquiries.slice(0, 3).map((e) => ({
            key: e._id,
            ref: `ENQ-${e._id.slice(-4).toUpperCase()}`,
            type: 'Enquiry',
            detail: `${e.clientName} (${e.roofType || 'Standard'})`,
            status: e.status || 'new',
            date: e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-IN') : '—'
          })),
          ...estimates.slice(0, 3).map((est) => ({
            key: est._id,
            ref: `EST-${est._id.slice(-4).toUpperCase()}`,
            type: 'Estimate',
            detail: `${est.model} · ₹${(est.results?.costs?.grandTotal || 0).toLocaleString('en-IN')}`,
            status: est.status || 'estimated',
            date: est.createdAt ? new Date(est.createdAt).toLocaleDateString('en-IN') : '—'
          }))
        ].slice(0, 5);

        setRecentActivities(activities);
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const columns = [
    {
      title: 'REF',
      dataIndex: 'ref',
      key: 'ref',
      render: (text) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0b315d' }}>{text}</span>
    },
    {
      title: 'TYPE',
      dataIndex: 'type',
      key: 'type',
      render: (t) => <span style={{ fontWeight: 500 }}>{t}</span>
    },
    {
      title: 'DETAIL',
      dataIndex: 'detail',
      key: 'detail',
      render: (d) => <span style={{ color: '#374151' }}>{d}</span>
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

  return (
    <div>
      {/* A) WELCOME ROW */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
          Good {greetingTime}, {firstName}
        </h1>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          System Administration · {formattedDate}
        </div>
      </div>

      {/* B) KPI ROW */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Total Users</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <TeamOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.usersCount}</div>
            <div className="stat-card__meta">Across 8 system roles</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Active Enquiries</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <FileTextOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.enquiriesCount}</div>
            <div className="stat-card__meta">Client leads in pipeline</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Estimates Created</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <CalculatorOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.estimatesCount}</div>
            <div className="stat-card__meta">Engineering valuations</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">System Health</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <CheckCircleOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#15803d', fontSize: 24 }}>OK</div>
            <div className="stat-card__meta">MongoDB Atlas online</div>
          </div>
        </Col>
      </Row>

      {/* C) QUICK ACTIONS */}
      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/users')}
          style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}
        >
          Add User
        </Button>
        <Button
          icon={<FileTextOutlined />}
          onClick={() => navigate('/admin/enquiries')}
          style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}
        >
          View All Enquiries
        </Button>
        <Button
          icon={<ControlOutlined />}
          onClick={() => navigate('/admin/rate-masters')}
          style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}
        >
          Rate Masters
        </Button>
      </div>

      {/* D) RECENT ACTIVITY TABLE */}
      <div className="content-card" style={{ marginTop: 20 }}>
        <div className="content-card__header">
          <div className="content-card__title">Recent Activity</div>
          <Button
            type="link"
            onClick={() => navigate('/admin/enquiries')}
            style={{ color: '#0b315d', padding: 0, fontSize: 13 }}
          >
            View all →
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={recentActivities}
          size="small"
          pagination={false}
          loading={loading}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No recent activity" /> }}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
