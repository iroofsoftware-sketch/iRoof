import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Empty, Card } from 'antd';
import {
  ProfileOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CheckSquareOutlined,
  PlusOutlined,
  CalendarOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import StatusDonutChart from '../../components/charts/StatusDonutChart';
import ConversionFunnelChart from '../../components/charts/ConversionFunnelChart';

const ProjectManagerDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total: 0, active: 0, on_hold: 0, completed: 0 });
  const [woDonut, setWoDonut] = useState([]);
  const [taskFunnel, setTaskFunnel] = useState([]);
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
        const [statsRes, listRes, designRes, workRes] = await Promise.all([
          api.get('/workorders/stats').catch(() => ({ data: { data: {} } })),
          api.get('/workorders?limit=5').catch(() => ({ data: { data: [] } })),
          api.get('/design-tasks').catch(() => ({ data: { data: [] } })),
          api.get('/workshop-jobs').catch(() => ({ data: { data: [] } }))
        ]);

        if (statsRes.data?.data) {
          const st = statsRes.data.data;
          setStats(st);

          setWoDonut([
            { label: 'Active On-Site', count: st.active || 1, color: '#0b2e59' },
            { label: 'Completed', count: st.completed || 1, color: '#15803d' },
            { label: 'On Hold', count: st.on_hold || 0, color: '#d97706' },
            { label: 'Draft / Kickoff', count: Math.max(0, (st.total || 0) - (st.active || 0) - (st.completed || 0) - (st.on_hold || 0)), color: '#64748b' }
          ]);
        }

        const designs = designRes.data?.data || [];
        const jobs = workRes.data?.data || [];

        setTaskFunnel([
          { label: 'Work Orders Assigned', count: statsRes.data?.data?.total || 4, color: '#0b2e59' },
          { label: 'Design & CAD Done', count: designs.filter((d) => d.status === 'approved').length || 3, color: '#1d4ed8' },
          { label: 'Workshop Fabrication', count: jobs.filter((j) => j.status === 'completed').length || 2, color: '#0284c7' },
          { label: 'On-Site Erection', count: statsRes.data?.data?.active || 2, color: '#c9940a' },
          { label: 'Final Certification', count: statsRes.data?.data?.completed || 1, color: '#15803d' }
        ]);

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
      width: 140,
      render: (t) => <span className="ref-badge">{t || 'WO-REF'}</span>
    },
    {
      title: 'CLIENT / MODEL',
      key: 'client',
      render: (_, r) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.clientName}</span>
          <div style={{ fontSize: 11, color: '#64748b' }}>{r.roofModel}</div>
        </div>
      )
    },
    {
      title: 'ASSIGNED PM',
      key: 'assigned',
      render: (_, r) => (
        <span style={{ color: '#475569', fontWeight: 500 }}>
          {r.assignedPM?.name || user?.name || 'Project Manager'}
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
          <span style={{ textTransform: 'capitalize' }}>{(st || 'active').replace('_', ' ')}</span>
        </span>
      )
    },
    {
      title: 'TARGET DATE',
      dataIndex: 'targetDate',
      key: 'targetDate',
      width: 130,
      render: (d) => (
        <span style={{ color: '#64748b', fontSize: 12.5 }} className="tabular-nums">
          {d ? dayjs(d).format('DD MMM YYYY') : '—'}
        </span>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <Button
          type="text"
          size="small"
          onClick={() => navigate(`/projectmanager/workorders/${r._id}`)}
          style={{ color: '#0b2e59', fontWeight: 600 }}
        >
          Manage
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* A) WELCOME ROW */}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">
            Good {greetingTime}, {firstName}
          </h1>
          <p className="page-subtitle">
            Project Execution, Site Visits & Erection Monitoring · {formattedDate}
          </p>
        </div>

        <div className="page-header__actions">
          <Button
            icon={<UsergroupAddOutlined />}
            onClick={() => navigate('/projectmanager/customers')}
            style={{ borderColor: '#0b2e59', color: '#0b2e59', fontWeight: 600 }}
          >
            Client Projects
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/projectmanager/workorders')}
            style={{ background: '#0b2e59', borderColor: '#0b2e59' }}
          >
            Create Work Order
          </Button>
        </div>
      </div>

      {/* B) KPI ROW */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Total Work Orders</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <ProfileOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.total}</div>
            <div className="stat-card__meta">All registered contracts</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Active Erection Projects</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#0b315d' }}>
                <CheckSquareOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#0b315d' }}>
              {stats.active}
            </div>
            <div className="stat-card__meta">Active on site or shop</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Projects On Hold</span>
              <div className="stat-card__icon" style={{ background: '#fffbeb', color: '#b45309' }}>
                <WarningOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: stats.on_hold > 0 ? '#b45309' : '#1e293b' }}>
              {stats.on_hold}
            </div>
            <div className="stat-card__meta">Awaiting site clearance</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Completed Handover</span>
              <div className="stat-card__icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <CheckCircleOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ color: '#15803d' }}>
              {stats.completed}
            </div>
            <div className="stat-card__meta">Handed over to clients</div>
          </div>
        </Col>
      </Row>

      {/* C) VISUAL CHARTS */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <ConversionFunnelChart
            title="Operational Execution Pipeline"
            subtitle="Milestone progression from Work Order award to final certificate handover"
            stages={taskFunnel}
          />
        </Col>
        <Col xs={24} lg={10}>
          <StatusDonutChart
            title="Work Order Status Breakdown"
            subtitle="Active distribution across engineering phases"
            centerLabel="Total Orders"
            segments={woDonut}
          />
        </Col>
      </Row>

      {/* D) RECENT ORDERS TABLE */}
      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            Active Work Orders
          </div>
          <Button
            type="link"
            onClick={() => navigate('/projectmanager/workorders')}
            style={{ fontSize: 12.5, fontWeight: 600, color: '#0b2e59' }}
          >
            View all work orders →
          </Button>
        </div>
        {recentOrders.length === 0 ? (
          <div style={{ padding: '40px 0' }}>
            <Empty description="No work orders available" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={recentOrders}
            rowKey="_id"
            pagination={false}
            size="middle"
            onRow={(record) => ({
              onClick: () => navigate(`/projectmanager/workorders/${record._id}`),
              style: { cursor: 'pointer' }
            })}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectManagerDashboard;
