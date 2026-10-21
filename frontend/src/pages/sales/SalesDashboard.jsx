import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Empty } from 'antd';
import {
  FileTextOutlined,
  CalculatorOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const SalesDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    enquiriesCount: 0,
    estimatesCount: 0,
    pendingFollowup: 0
  });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Estimator';
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const [enqRes, estRes] = await Promise.all([
          api.get('/enquiries').catch(() => ({ data: { enquiries: [] } })),
          api.get('/estimates').catch(() => ({ data: { estimates: [] } }))
        ]);

        const enquiries = enqRes.data?.enquiries || [];
        const estimates = estRes.data?.estimates || [];

        const pending = enquiries.filter((e) => ['new', 'visited'].includes(e.status)).length;

        setStats({
          enquiriesCount: enquiries.length,
          estimatesCount: estimates.length,
          pendingFollowup: pending
        });

        const recent = enquiries.slice(0, 5).map((e) => ({
          key: e._id,
          ref: `ENQ-${e._id.slice(-4).toUpperCase()}`,
          customer: e.clientName,
          location: e.address || 'Site Location',
          status: e.status || 'new',
          date: e.enquiryDate ? new Date(e.enquiryDate).toLocaleDateString('en-IN') : '—'
        }));

        setRecentEnquiries(recent);
      } catch (err) {
        console.error('Error loading sales dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const columns = [
    {
      title: 'REF',
      dataIndex: 'ref',
      key: 'ref',
      width: 130,
      render: (text) => <span className="ref-badge">{text}</span>
    },
    {
      title: 'CUSTOMER',
      dataIndex: 'customer',
      key: 'customer',
      render: (name) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{name}</span>
    },
    {
      title: 'LOCATION',
      dataIndex: 'location',
      key: 'location',
      render: (loc) => <span style={{ color: '#64748b' }}>{loc}</span>
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 130,
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
      width: 120,
      render: (d) => <span style={{ color: '#64748b', fontSize: 12.5 }} className="tabular-nums">{d}</span>
    }
  ];

  return (
    <div>
      {/* A) WELCOME ROW */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>
          Good {greetingTime}, {firstName}
        </h1>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
          Commercial Sales & Estimation Console · {formattedDate}
        </div>
      </div>

      {/* B) KPI ROW */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">My Enquiries</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <FileTextOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.enquiriesCount}</div>
            <div className="stat-card__meta">Customer requests</div>
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
              <span className="stat-card__label">Pending Follow-up</span>
              <div className="stat-card__icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
                <ClockCircleOutlined />
              </div>
            </div>
            <div className="stat-card__value">{stats.pendingFollowup}</div>
            <div className="stat-card__meta">Awaiting site visit or estimate</div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-card__label">Win Rate</span>
              <div className="stat-card__icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                <TrophyOutlined />
              </div>
            </div>
            <div className="stat-card__value" style={{ fontSize: 24 }}>—</div>
            <div className="stat-card__meta">Phase 2 analytics</div>
          </div>
        </Col>
      </Row>

      {/* C) QUICK ACTIONS */}
      <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button
          icon={<PlusOutlined />}
          onClick={() => navigate('/sales/enquiries')}
          style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}
        >
          New Enquiry
        </Button>
        <Button
          icon={<CalculatorOutlined />}
          onClick={() => navigate('/sales/estimates/new')}
          style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}
        >
          New Estimate
        </Button>
        <Button
          icon={<FileTextOutlined />}
          onClick={() => navigate('/sales/enquiries')}
          style={{ borderColor: '#0b315d', color: '#0b315d', fontWeight: 500 }}
        >
          View Enquiries
        </Button>
      </div>

      {/* D) RECENT ACTIVITY TABLE */}
      <div className="content-card" style={{ marginTop: 20 }}>
        <div className="content-card__header">
          <div className="content-card__title">Recent Enquiries</div>
          <Button
            type="link"
            onClick={() => navigate('/sales/enquiries')}
            style={{ color: '#0b315d', padding: 0, fontSize: 13 }}
          >
            View all →
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={recentEnquiries}
          size="small"
          pagination={false}
          loading={loading}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No recent enquiries" /> }}
        />
      </div>
    </div>
  );
};

export default SalesDashboard;
